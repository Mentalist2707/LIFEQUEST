import {neon} from '@neondatabase/serverless';
import {randomBytes,randomUUID,scrypt as scryptCallback,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
import {NextRequest,NextResponse} from 'next/server';

const scrypt=promisify(scryptCallback);
export const SESSION_COOKIE='lifequest_session';
const ttl=30*24*60*60;
const headers={'Cache-Control':'private, no-store'};
export function json(data:unknown,status=200){return NextResponse.json(data,{status,headers});}
export function client(){const url=process.env.DATABASE_URL||process.env.NEON_DATABASE_URL;if(!url)throw new Error('DATABASE_URL sozlanmagan');return neon(url);}
export type SQL=ReturnType<typeof client>;
export async function schema(sql:SQL){
 await sql`CREATE TABLE IF NOT EXISTS lifequest_users (
  id uuid PRIMARY KEY, email text NOT NULL UNIQUE, name text NOT NULL,
  password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  failed_attempts integer NOT NULL DEFAULT 0, locked_until timestamptz
 )`;
 await sql`CREATE TABLE IF NOT EXISTS lifequest_sessions (
  token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES lifequest_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
 )`;
 await sql`CREATE TABLE IF NOT EXISTS lifequest_state (
  id text PRIMARY KEY, data jsonb NOT NULL, revision bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
 )`;
}
export const digest=(v:string)=>createHash('sha256').update(v).digest('hex');
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const derived=await scrypt(password,salt,64) as Buffer;return `scrypt:${salt}:${derived.toString('hex')}`;}
export async function verifyPassword(password:string,encoded:string){const [algo,salt,hex]=encoded.split(':');if(algo!=='scrypt'||!salt||!hex||hex.length!==128)return false;const actual=await scrypt(password,salt,64) as Buffer;return timingSafeEqual(actual,Buffer.from(hex,'hex'));}
export function validateCredentials(email:unknown,password:unknown){
 if(typeof email!=='string'||typeof password!=='string')return null;
 const e=email.trim().toLowerCase();
 if(e.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)||password.length<10||password.length>128)return null;
 return {email:e,password};
}
export function sameOrigin(req:NextRequest){const origin=req.headers.get('origin');if(!origin)return true;try{return new URL(origin).host===req.headers.get('host')}catch{return false}}
export async function userFromRequest(req:NextRequest,sql:SQL){const token=req.cookies.get(SESSION_COOKIE)?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const rows=await sql`SELECT u.id,u.email,u.name FROM lifequest_sessions s JOIN lifequest_users u ON u.id=s.user_id WHERE s.token_hash=${digest(token)} AND s.expires_at>now() LIMIT 1`;
 return rows.length?{id:String(rows[0].id),email:String(rows[0].email),name:String(rows[0].name)}:null;
}
export async function makeSession(sql:SQL,userId:string){const token=randomBytes(32).toString('hex');await sql`INSERT INTO lifequest_sessions (token_hash,user_id,expires_at) VALUES (${digest(token)},${userId}::uuid,now()+interval '30 days')`;
 const res=json({ok:true});res.cookies.set(SESSION_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:ttl});return res;
}
export function clearSession(){const res=json({ok:true});res.cookies.set(SESSION_COOKIE,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0});return res}
export function newId(){return randomUUID()}
export function serverFailure(error:unknown){console.error('LIFEQUEST API:',error instanceof Error?error.message:'unknown');return json({error:'Server yoki Neon bazasi xatosi. DATABASE_URL sozlamasini tekshiring.'},503)}
