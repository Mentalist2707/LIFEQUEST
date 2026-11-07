import {NextRequest} from 'next/server';
import {client,schema,userFromRequest,json,serverFailure} from '@/lib/server/auth';
import {createInitial,safeState} from '@/lib/engine';
export const runtime='nodejs';
export const dynamic='force-dynamic';
/** One authenticated request returns both user and initial state. */
export async function GET(req:NextRequest){
 try{
  const sql=client();await schema(sql);
  const user=await userFromRequest(req,sql);
  if(!user)return json({error:'Tizimga qayta kiring.'},401);
  const id=`user:${user.id}`;
  const rows=await sql`SELECT data,revision FROM lifequest_state WHERE id=${id}`;
  if(!rows.length){const state=createInitial();state.profile.name=user.name;return json({user,state,revision:0});}
  return json({user,state:safeState(rows[0].data),revision:Number(rows[0].revision)});
 }catch(e){return serverFailure(e)}
}
