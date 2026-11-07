import {NextRequest} from 'next/server';
import {client,schema,userFromRequest,json,sameOrigin,serverFailure} from '@/lib/server/auth';
import {createInitial,safeState} from '@/lib/engine';
import {mergeStates,stableEqual} from '@/lib/merge';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 try{const sql=client();await schema(sql);const user=await userFromRequest(req,sql);if(!user)return json({error:'Tizimga qayta kiring.'},401);
 const id=`user:${user.id}`;const rows=await sql`SELECT data,revision FROM lifequest_state WHERE id=${id}`;
 if(!rows.length){const state=createInitial();state.profile.name=user.name;return json({state,revision:0})}
 return json({state:safeState(rows[0].data),revision:Number(rows[0].revision)});
 }catch(e){return serverFailure(e)}
}
/**
 * Single-row compare-and-swap with server-side three-way merge.
 * The client must supply its last acknowledged base snapshot. We only apply
 * differences introduced since that base, preserving unseen remote edits.
 * Neon HTTP queries are independent; compare-and-swap protects concurrent
 * writers without requiring a long-running database connection.
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
  const id=`user:${user.id}`;
  // Each loop re-reads the authoritative revision. Concurrency can invalidate
  // our CAS; retrying re-merges the same local delta into the latest data.
  for(let attempt=0;attempt<8;attempt++){
   const rows=await sql`SELECT data,revision FROM lifequest_state WHERE id=${id}`;
   let latest;
   let latestRevision;
   if(rows.length){latest=safeState(rows[0].data);latestRevision=Number(rows[0].revision)}
   else{latest=createInitial();latest.profile.name=user.name;latestRevision=0}
   const merged=mergeStates(baseline,proposed,latest);
   // Skip writes when our changes are already present; do not bump revision.
   if(stableEqual(merged,latest))return json({state:latest,revision:latestRevision,unchanged:true});
   if(!rows.length){
    const data=JSON.stringify(merged);
    const inserted=await sql`INSERT INTO lifequest_state(id,data,revision) VALUES (${id},${data}::jsonb,1) ON CONFLICT (id) DO NOTHING RETURNING revision`;
    if(inserted.length)return json({state:merged,revision:Number(inserted[0].revision)});
   }else{
    const data=JSON.stringify(merged);
    const updated=await sql`UPDATE lifequest_state SET data=${data}::jsonb,revision=revision+1,updated_at=now() WHERE id=${id} AND revision=${latestRevision} RETURNING revision`;
    if(updated.length)return json({state:merged,revision:Number(updated[0].revision)});
   }
  }
  return json({error:'Bir vaqtda ko‘p yozish sodir bo‘ldi. Saqlashni qayta urinib ko‘ring.'},409);
 }catch(e){
  if(e instanceof SyntaxError)return json({error:'JSON noto‘g‘ri.'},400);
  if(e instanceof Error&&/Zaxira|Takroriy|Tarixdagi|XP ma’lumoti|Namoz tarixi/.test(e.message))return json({error:e.message},400);
  return serverFailure(e);
 }
}
