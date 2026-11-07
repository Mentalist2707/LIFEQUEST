import {NextRequest} from 'next/server';
import {client,schema,json,validateCredentials,hashPassword,newId,makeSession,sameOrigin,serverFailure} from '@/lib/server/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return json({error:'So‘rov manbasi ruxsat etilmagan.'},403);
 try{
 const raw=await req.text();if(raw.length>12000)return json({error:'So‘rov juda katta.'},413);
 const body=JSON.parse(raw);const credentials=validateCredentials(body.email,body.password);
 if(!credentials)return json({error:'To‘g‘ri email va kamida 10 belgili parol kiriting.'},400);
 const name=typeof body.name==='string'?body.name.trim():'';
 if(name.length<2||name.length>60)return json({error:'Ism 2–60 belgidan iborat bo‘lsin.'},400);
 const sql=client();await schema(sql);
 const hash=await hashPassword(credentials.password);const id=newId();
 const rows=await sql`INSERT INTO lifequest_users (id,email,name,password_hash) VALUES (${id}::uuid,${credentials.email},${name},${hash}) ON CONFLICT (email) DO NOTHING RETURNING id`;
 if(!rows.length)return json({error:'Bu email ro‘yxatdan o‘tgan. Kirish sahifasidan foydalaning.'},409);
 return makeSession(sql,id);
 }catch(e){if(e instanceof SyntaxError)return json({error:'So‘rov formati noto‘g‘ri.'},400);return serverFailure(e)}
}
