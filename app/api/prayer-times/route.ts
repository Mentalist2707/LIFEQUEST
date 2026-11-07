import {NextRequest,NextResponse} from 'next/server';
import {CITIES} from '@/lib/prayer-times';
export const runtime='nodejs';
const clean=(v:unknown)=>typeof v==='string'?v.match(/^\d{2}:\d{2}/)?.[0]||'':'';
export async function GET(req:NextRequest){
 const city=req.nextUrl.searchParams.get('city')||'tashkent';
 const month=req.nextUrl.searchParams.get('month')||'';
 if(!Object.prototype.hasOwnProperty.call(CITIES,city)||!/^20\d\d-(0[1-9]|1[0-2])$/.test(month))return NextResponse.json({error:'Shahar yoki sana noto‘g‘ri'}, {status:400});
 const cityData=CITIES[city as keyof typeof CITIES];
 const [year,m]=month.split('-');
 const url=`https://api.aladhan.com/v1/calendar/${year}/${Number(m)}?latitude=${cityData.lat}&longitude=${cityData.lng}&method=1&school=1&timezonestring=Asia%2FTashkent`;
 try{
  const result=await fetch(url,{next:{revalidate:21600},signal:AbortSignal.timeout(12000)});
  if(!result.ok)throw new Error('Vaqtlar manbasi javob bermadi');
  const json=await result.json();
  if(!Array.isArray(json.data))throw new Error('Vaqtlar shakli noto‘g‘ri');
  const days=json.data.map((item:{timings:Record<string,string>},i:number)=>({date:`${month}-${String(i+1).padStart(2,'0')}`,bomdod:clean(item.timings.Fajr),sunrise:clean(item.timings.Sunrise),peshin:clean(item.timings.Dhuhr),asr:clean(item.timings.Asr),shom:clean(item.timings.Maghrib),xufton:clean(item.timings.Isha)}));
  if(days.some((d:{[key:string]:string})=>['bomdod','sunrise','peshin','asr','shom','xufton'].some(k=>!d[k])))throw new Error('Ba’zi namoz vaqtlari olinmadi');
  return NextResponse.json({city,month,source:'AlAdhan (Karachi usuli, Hanafi asr)',days});
 }catch{return NextResponse.json({error:'Namoz vaqtlarini olib bo‘lmadi. Internetni tekshiring va qayta urinib ko‘ring.'},{status:503});}
}
