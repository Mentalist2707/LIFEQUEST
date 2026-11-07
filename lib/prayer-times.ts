import type {PrayerName,State} from './types';
import {setPrayer} from './engine';

export const CITIES = {
 tashkent:{label:'Toshkent',lat:41.3111,lng:69.2797},
 samarkand:{label:'Samarqand',lat:39.6542,lng:66.9597},
 bukhara:{label:'Buxoro',lat:39.7681,lng:64.4556},
 andijan:{label:'Andijon',lat:40.7821,lng:72.3442},
 namangan:{label:'Namangan',lat:41.0011,lng:71.6726},
 fergana:{label:'Farg‘ona',lat:40.3864,lng:71.7864},
 qarshi:{label:'Qarshi',lat:38.8606,lng:65.7891},
 nukus:{label:'Nukus',lat:42.4619,lng:59.6166},
 urgench:{label:'Urganch',lat:41.5507,lng:60.6310},
 termiz:{label:'Termiz',lat:37.2242,lng:67.2783},
 jizzakh:{label:'Jizzax',lat:40.1158,lng:67.8422},
 navoi:{label:'Navoiy',lat:40.0844,lng:65.3792},
 gulistan:{label:'Guliston',lat:40.4897,lng:68.7842},
} as const;
export type CityKey=keyof typeof CITIES;
export type DayTimes={date:string;bomdod:string;sunrise:string;peshin:string;asr:string;shom:string;xufton:string};
export type Schedule=Record<string,DayTimes>;
export const prayerNames:PrayerName[]=['bomdod','peshin','asr','shom','xufton'];
export function uzDate(now=new Date()):string{
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tashkent',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=(x:string)=>parts.find(p=>p.type===x)?.value||'';
 return `${get('year')}-${get('month')}-${get('day')}`;
}
export function uzTimestamp(date:string,time:string):number{
 // Uzbekistan uses UTC+05:00 year-round. Explicit offset avoids depending on device TZ.
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return NaN;
 return Date.parse(`${date}T${time}:00+05:00`);
}
export function isoDayOffset(date:string,delta:number):string{
 return new Date(Date.parse(`${date}T00:00:00Z`)+delta*86400000).toISOString().slice(0,10);
}
export function prayerWindow(date:string,prayer:PrayerName,all:Schedule){
 const day=all[date];if(!day)return null;
 const start=uzTimestamp(date,day[prayer]);
 const next=prayer==='bomdod'?uzTimestamp(date,day.sunrise):prayer==='peshin'?uzTimestamp(date,day.asr):prayer==='asr'?uzTimestamp(date,day.shom):prayer==='shom'?uzTimestamp(date,day.xufton):all[isoDayOffset(date,1)]?uzTimestamp(isoDayOffset(date,1),all[isoDayOffset(date,1)].bomdod):NaN;
 return Number.isFinite(start)&&Number.isFinite(next)&&next>start?{start,end:next}:null;
}
export function timeLeft(target:number,now:number){const m=Math.max(0,Math.ceil((target-now)/60000));return `${Math.floor(m/60)} soat ${String(m%60).padStart(2,'0')} daqiqa`;}
export function currentPrayer(all:Schedule,now=Date.now()){
 const today=uzDate(new Date(now));
 const day=all[today];if(!day)return null;
 let active:PrayerName|null=null;
 const previous=isoDayOffset(today,-1);const yesterdayIsha=all[previous]&&prayerWindow(previous,'xufton',all);if(yesterdayIsha&&now>=yesterdayIsha.start&&now<yesterdayIsha.end)active='xufton';
 let following:{prayer:PrayerName;start:number}|null=null;
 for(const p of prayerNames){const w=prayerWindow(today,p,all);if(!w)continue;if(now>=w.start&&now<w.end)active=p;if(w.start>now&&!following)following={prayer:p,start:w.start};}
 if(!following){const next=all[isoDayOffset(today,1)];if(next)following={prayer:'bomdod',start:uzTimestamp(next.date,next.bomdod)};}
 return {active,following};
}
export function autoMarkMissed(state:State,all:Schedule,now=Date.now()):State{
 const config=state.prayerConfig;
 if(!config?.enabledAt||!all)return state;
 let out=state;
 const today=uzDate(new Date(now));
 // Catch up from activation, maximum 31 days at a time; older dates must be handled explicitly.
 const started=uzDate(new Date(config.enabledAt));const dates=Object.keys(all).filter(d=>d>=started&&d<=today).sort();
 for(const date of dates){
  for(const p of prayerNames){
   const w=prayerWindow(date,p,all);
   if(!w||w.end>now||w.end<=Date.parse(config.enabledAt))continue;
   if((out.prayers||[]).some(r=>r.date===date&&r.prayer===p))continue;
   out=setPrayer(out,date,p,'qazo');
  }
 }
 return out;
}
