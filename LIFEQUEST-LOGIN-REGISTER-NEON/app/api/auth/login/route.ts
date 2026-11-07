import {NextRequest} from 'next/server';
import {client,schema,json,validateCredentials,verifyPassword,makeSession,sameOrigin,serverFailure} from '@/lib/server/auth';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(req:NextRequest){
 if(!sameOrigin(req))return json({error:'So‘rov manbasi ruxsat etilmagan.'},403);
 try{
 const raw=await req.text();if(raw.length>12000)return json({error:'So‘rov juda katta.'},413);
 const body=JSON.parse(raw);const c=validateCredentials(body.email,body.password);
 if(!c)return json({error:'Email yoki parol noto‘g‘ri.'},401);
 const sql=client();await schema(sql);
 const rows=await sql`SELECT id,password_hash,failed_attempts,locked_until FROM lifequest_users WHERE email=${c.email} LIMIT 1`;
 if(!rows.length)return json({error:'Email yoki parol noto‘g‘ri.'},401);
 const u=rows[0];if(u.locked_until&&new Date(String(u.locked_until)).getTime()>Date.now())return json({error:'Ko‘p noto‘g‘ri urinish. 15 daqiqadan keyin qayta urinib ko‘ring.'},429);
 const valid=await verifyPassword(c.password,String(u.password_hash));
 if(!valid){await sql`UPDATE lifequest_users SET failed_attempts=CASE WHEN failed_attempts>=4 THEN 0 ELSE failed_attempts+1 END,locked_until=CASE WHEN failed_attempts>=4 THEN now()+interval '15 minutes' ELSE NULL END WHERE id=${String(u.id)}::uuid`;return json({error:'Email yoki parol noto‘g‘ri.'},401)}
 await sql`UPDATE lifequest_users SET failed_attempts=0,locked_until=NULL WHERE id=${String(u.id)}::uuid`;
 return makeSession(sql,String(u.id));
 }catch(e){if(e instanceof SyntaxError)return json({error:'So‘rov formati noto‘g‘ri.'},400);return serverFailure(e)}
}
