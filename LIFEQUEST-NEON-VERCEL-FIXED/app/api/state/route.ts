import {NextRequest,NextResponse} from 'next/server';
import {neon} from '@neondatabase/serverless';
import {timingSafeEqual,createHash} from 'node:crypto';
import {createInitial,safeState} from '@/lib/engine';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const privateHeaders={'Cache-Control':'no-store, private'};

function authorized(req:NextRequest){
 const expected=process.env.LIFEQUEST_ACCESS_KEY;
 if(!expected||expected.length<12)return false;
 const supplied=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'')||'';
 const a=createHash('sha256').update(expected).digest();
 const b=createHash('sha256').update(supplied).digest();
 return timingSafeEqual(a,b);
}
function sqlClient(){
 const url=process.env.DATABASE_URL||process.env.NEON_DATABASE_URL;
 if(!url)throw new Error('DATABASE_URL sozlanmagan');
 return neon(url);
}
async function ensureTable(sql:ReturnType<typeof sqlClient>){
 await sql`CREATE TABLE IF NOT EXISTS lifequest_state (
    id text PRIMARY KEY,
    data jsonb NOT NULL,
    revision bigint NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
 )`;
}
function response(data:unknown,status=200){return NextResponse.json(data,{status,headers:privateHeaders})}
function serverError(error:unknown){console.error('Lifequest database operation:',error instanceof Error?error.message:'Unknown');return response({error:'Neon bazasiga ulanib bo‘lmadi. Vercel DATABASE_URL va Neon holatini tekshiring.'},503)}

export async function GET(req:NextRequest){
 if(!authorized(req))return response({error:'Kirish kaliti noto‘g‘ri yoki serverda sozlanmagan.'},401);
 try{
  const sql=sqlClient();await ensureTable(sql);
  const rows=await sql`SELECT data, revision FROM lifequest_state WHERE id='personal'`;
  if(!rows.length)return response({state:createInitial(),revision:0});
  return response({state:safeState(rows[0].data),revision:Number(rows[0].revision)});
 }catch(e){return serverError(e)}
}

export async function PUT(req:NextRequest){
 if(!authorized(req))return response({error:'Ruxsat berilmagan.'},401);
 try{
  const raw=await req.text();
  if(raw.length>2_000_000)return response({error:'Ma’lumot hajmi 2 MB dan oshdi.'},413);
  const payload=JSON.parse(raw);
  if(!Number.isSafeInteger(payload.revision)||payload.revision<0)return response({error:'Revision raqami noto‘g‘ri.'},400);
  const state=safeState(payload.state);
  const json=JSON.stringify(state);
  const sql=sqlClient();await ensureTable(sql);
  // Atomic optimistic concurrency check protects against lost multi-device updates.
  const rows=await sql`INSERT INTO lifequest_state (id,data,revision)
    SELECT 'personal', ${json}::jsonb, 1
    WHERE ${payload.revision} = 0
    ON CONFLICT (id) DO UPDATE SET data=EXCLUDED.data,
      revision=lifequest_state.revision+1,updated_at=now()
    WHERE lifequest_state.revision=${payload.revision}
    RETURNING revision`;
  if(!rows.length)return response({error:'Ma’lumot boshqa qurilmada yangilangan. Yangilashdan oldin zaxira oling, so‘ng sahifani qayta oching.'},409);
  return response({revision:Number(rows[0].revision)});
 }catch(e){if(e instanceof SyntaxError)return response({error:'JSON noto‘g‘ri.'},400);if(e instanceof Error&&(/Zaxira|Takroriy|Tarixdagi|XP ma’lumoti/.test(e.message)))return response({error:e.message},400);return serverError(e)}
}
