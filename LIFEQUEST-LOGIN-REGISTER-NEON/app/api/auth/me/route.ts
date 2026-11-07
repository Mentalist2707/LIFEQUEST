import {NextRequest} from 'next/server';
import {client,schema,userFromRequest,json,serverFailure} from '@/lib/server/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){try{const sql=client();await schema(sql);const user=await userFromRequest(req,sql);return user?json({user}):json({error:'Tizimga kiring.'},401)}catch(e){return serverFailure(e)}}
