import {NextRequest} from 'next/server';
import {client,digest,SESSION_COOKIE,clearSession,sameOrigin} from '@/lib/server/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return new Response('Forbidden',{status:403});
 const token=req.cookies.get(SESSION_COOKIE)?.value;
 if(token&&/^[a-f0-9]{64}$/.test(token))try{const sql=client();await sql`DELETE FROM lifequest_sessions WHERE token_hash=${digest(token)}`}catch(e){console.error('Logout cleanup failed:',e)}
 return clearSession();
}
