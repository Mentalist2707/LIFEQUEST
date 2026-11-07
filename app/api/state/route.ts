import {NextRequest} from 'next/server';
import {Client} from '@neondatabase/serverless';
import {client,schema,userFromRequest,json,sameOrigin,serverFailure} from '@/lib/server/auth';
import {createInitial,safeState} from '@/lib/engine';
import {mergeStates,stableEqual} from '@/lib/merge';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(req:NextRequest){
 try{
  const sql=client();await schema(sql);
  const user=await userFromRequest(req,sql);
  if(!user)return json({error:'Tizimga qayta kiring.'},401);
  const id=`user:${user.id}`;
  const rows=await sql`SELECT data,revision FROM lifequest_state WHERE id=${id}`;
  if(!rows.length){const state=createInitial();state.profile.name=user.name;return json({state,revision:0})}
  return json({state:safeState(rows[0].data),revision:Number(rows[0].revision)});
 }catch(e){return serverFailure(e)}
}

/**
 * Neon HTTP requests are independent connections. A read-then-CAS-write loop
 * can starve under parallel requests. Use ONE WebSocket-backed SQL transaction
 * with SELECT ... FOR UPDATE so all writes to the same account serialize.
 * Never bypasses reconciliation or discards unseen remote edits.
 * No user data is removed; the existing lifequest_state row is reused.
 */
export async function PUT(req:NextRequest){
 if(!sameOrigin(req))return json({error:'So‘rov manbasi ruxsat etilmagan.'},403);
 try{
  const sql=client();await schema(sql);
  const user=await userFromRequest(req,sql);
  if(!user)return json({error:'Tizimga qayta kiring.'},401);
  const raw=await req.text();
  if(raw.length>2_000_000)return json({error:'Ma’lumot 2 MB dan oshdi.'},413);
  const payload=JSON.parse(raw);
  if(!Number.isSafeInteger(payload.revision)||payload.revision<0)return json({error:'Versiya raqami noto‘g‘ri.'},400);
  if(!payload.baseState)return json({error:'Ilova yangilanishi kerak: sinxronlash bazasi yuborilmadi.'},428);
  const proposed=safeState(payload.state);
  const baseline=safeState(payload.baseState);
  const url=process.env.DATABASE_URL||process.env.NEON_DATABASE_URL;
  if(!url)throw new Error('DATABASE_URL sozlanmagan');
  const id=`user:${user.id}`;
  const connection=new Client({connectionString:url});
  // Node 22 (required by this project) includes global WebSocket.
  // The connection must be created and closed inside a single Vercel invocation.
  await connection.connect();
  let begun=false;
  try{
   await connection.query('BEGIN');begun=true;
   // Ensure the row exists *before* locking it, even when two first writes race.
   const initial=createInitial();initial.profile.name=user.name;
   await connection.query(
    'INSERT INTO lifequest_state(id,data,revision) VALUES ($1,$2::jsonb,0) ON CONFLICT (id) DO NOTHING',
    [id,JSON.stringify(initial)]
   );
   const locked=await connection.query('SELECT data,revision FROM lifequest_state WHERE id=$1 FOR UPDATE',[id]);
   if(locked.rows.length!==1)throw new Error('Foydalanuvchi holatini bloklab bo‘lmadi');
   const latest=safeState(locked.rows[0].data);
   const latestRevision=Number(locked.rows[0].revision);
   const merged=mergeStates(baseline,proposed,latest);
   if(stableEqual(merged,latest)){
    await connection.query('COMMIT');begun=false;
    return json({state:latest,revision:latestRevision,unchanged:true});
   }
   const written=await connection.query(
    'UPDATE lifequest_state SET data=$2::jsonb,revision=revision+1,updated_at=now() WHERE id=$1 RETURNING revision',
    [id,JSON.stringify(merged)]
   );
   if(written.rows.length!==1)throw new Error('Ma’lumotni saqlab bo‘lmadi');
   await connection.query('COMMIT');begun=false;
   return json({state:merged,revision:Number(written.rows[0].revision)});
  }catch(e){
   if(begun){try{await connection.query('ROLLBACK')}catch(rollbackError){console.error('Neon rollback:',rollbackError)}}
   throw e;
  }finally{await connection.end()}
 }catch(e){
  if(e instanceof SyntaxError)return json({error:'JSON noto‘g‘ri.'},400);
  if(e instanceof Error&&/Zaxira|Takroriy|Tarixdagi|XP ma’lumoti|Namoz tarixi/.test(e.message))return json({error:e.message},400);
  return serverFailure(e);
 }
}
