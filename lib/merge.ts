import type {State} from './types';
import {safeState} from './engine';

const clone=(s:State):State=>structuredClone(s);
/** JSONB normalizes object key order; comparisons must not depend on insertion order. */
export function stableEqual(a:unknown,b:unknown):boolean{
 const normalize=(value:any):any=>{
  if(Array.isArray(value))return value.map(normalize);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,normalize(value[k])]));
  return value;
 };
 return JSON.stringify(normalize(a))===JSON.stringify(normalize(b));
}
const eq=stableEqual;
function mergeArray<T extends Record<string,any>>(base:T[],local:T[],remote:T[],key:(v:T)=>string,mergeRecord=false):T[]{
 const b=new Map(base.map(v=>[key(v),v]));const l=new Map(local.map(v=>[key(v),v]));const r=new Map(remote.map(v=>[key(v),v]));
 const keys=new Set([...b.keys(),...l.keys(),...r.keys()]);const out:T[]=[];
 for(const k of keys){const bv=b.get(k),lv=l.get(k),rv=r.get(k);
  if(eq(bv,lv)){if(rv)out.push(rv);continue;}
  if(lv===undefined){continue;} // explicit local delete wins
  if(rv&&mergeRecord&&bv&&typeof lv==='object'&&typeof rv==='object'){
   const merged:any={...rv};for(const field of Object.keys(lv)){if(!eq((bv as any)[field],(lv as any)[field]))merged[field]=(lv as any)[field];}
   out.push(merged as T);
  }else out.push(lv);
 }
 return out;
}
/** Three-way reconciliation: retain unseen remote records and local edits; never discard signed XP transactions. */
export function mergeStates(base:State,local:State,remote:State):State{
 const b=safeState(clone(base)),l=safeState(clone(local)),r=safeState(clone(remote));
 const changed=(key:'profile'|'settings')=>({...(r[key] as any),...Object.fromEntries(Object.entries(l[key]).filter(([k,v])=>!eq((b[key] as any)[k],v)))});
 const merged:State={...r,
  profile:changed('profile'),settings:changed('settings'),prayerConfig:!eq(b.prayerConfig,l.prayerConfig)?l.prayerConfig:r.prayerConfig,
  quests:mergeArray(b.quests,l.quests,r.quests,x=>x.id,true),
  completions:mergeArray(b.completions,l.completions,r.completions,x=>x.id),
  transactions:mergeArray(b.transactions,l.transactions,r.transactions,x=>x.sourceId),
  rewards:mergeArray(b.rewards,l.rewards,r.rewards,x=>x.date),
  events:mergeArray(b.events,l.events,r.events,x=>x.id,true),
  notifications:mergeArray(b.notifications,l.notifications,r.notifications,x=>x.id,true),
  prayers:mergeArray(b.prayers||[],l.prayers||[],r.prayers||[],x=>`${x.date}:${x.prayer}`),
  prayerHistory:mergeArray(b.prayerHistory||[],l.prayerHistory||[],r.prayerHistory||[],x=>x.id),
 };
 // Same-date concurrent actions: preserve exactly one outcome, with each historical XP adjustment traceable.
 return safeState(merged);
}

