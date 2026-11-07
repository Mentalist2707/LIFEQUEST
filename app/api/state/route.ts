import {NextRequest} from 'next/server';
import {client,schema,userFromRequest,json,sameOrigin,serverFailure} from '@/lib/server/auth';
import {createInitial,safeState} from '@/lib/engine';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 try{const sql=client();await schema(sql);const user=await userFromRequest(req,sql);if(!user)return json({error:'Tizimga qayta kiring.'},401);
 const id=`user:${user.id}`;const rows=await sql`SELECT data,revision FROM lifequest_state WHERE id=${id}`;
 if(!rows.length){const state=createInitial();state.profile.name=user.name;return json({state,revision:0})}
 return json({state:safeState(rows[0].data),revision:Number(rows[0].revision)});
 }catch(e){return serverFailure(e)}
}
export async function PUT(req:NextRequest){
 if(!sameOrigin(req))return json({error:'So‘rov manbasi ruxsat etilmagan.'},403);
 try{const sql=client();await schema(sql);const user=await userFromRequest(req,sql);if(!user)return json({error:'Tizimga qayta kiring.'},401);
 const raw=await req.text();if(raw.length>2_000_000)return json({error:'Ma’lumot 2 MB dan oshdi.'},413);
 const payload=JSON.parse(raw);if(!Number.isSafeInteger(payload.revision)||payload.revision<0)return json({error:'Versiya raqami noto‘g‘ri.'},400);
 const state=safeState(payload.state);const data=JSON.stringify(state);const id=`user:${user.id}`;
 const rows=await sql`INSERT INTO lifequest_state (id,data,revision) VALUES (${id},${data}::jsonb,1) ON CONFLICT (id) DO UPDATE SET data=EXCLUDED.data,revision=lifequest_state.revision+1,updated_at=now() WHERE lifequest_state.revision=${payload.revision} RETURNING revision`;
 if(!rows.length)return json({error:'Boshqa qurilmada ma’lumot yangilangan. Sahifani qayta oching.'},409);
 return json({revision:Number(rows[0].revision)});
 }catch(e){if(e instanceof SyntaxError)return json({error:'JSON noto‘g‘ri.'},400);if(e instanceof Error&&/Zaxira|Takroriy|Tarixdagi|XP ma’lumoti/.test(e.message))return json({error:e.message},400);return serverFailure(e)}
}
