import type {State} from './types';
import {safeState} from './engine';
let revision=0;
let queue:Promise<unknown>=Promise.resolve();
let lastSaved:State|null=null;
let lastEnqueued:State|null=null;

type ApiError=Error&{status?:number};
async function request(url:string,method:'GET'|'PUT'|'POST',body?:unknown){
 const res=await fetch(url,{method,cache:'no-store',credentials:'same-origin',headers:{'content-type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 const value=await res.json().catch(()=>({error:'Server javobi noto‘g‘ri'}));
 if(!res.ok){const err=new Error(value.error||`Server xatosi (${res.status})`) as ApiError;err.status=res.status;throw err;}
 return value;
}
const clone=(s:State):State=>structuredClone(s);
const eq=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
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
export async function authenticate(mode:'login'|'register',email:string,password:string,name:string){await request(`/api/auth/${mode}`,'POST',{email,password,name});revision=0;lastSaved=null;lastEnqueued=null;queue=Promise.resolve();}
export async function getSession(){return request('/api/auth/me','GET') as Promise<{user:{id:string;name:string;email:string}}>}
export async function logout(){await queue.catch(()=>{});await request('/api/auth/logout','POST');revision=0;lastSaved=null;lastEnqueued=null;queue=Promise.resolve();}
export async function loadCloud():Promise<State>{await queue.catch(()=>{});const result=await request('/api/state','GET');revision=result.revision;const state=safeState(result.state);lastSaved=clone(state);lastEnqueued=clone(state);return state;}
export function saveCloud(state:State):Promise<State>{const snapshot=clone(safeState(state));
 const baseline=lastEnqueued?clone(lastEnqueued):lastSaved?clone(lastSaved):clone(snapshot);lastEnqueued=clone(snapshot);
 const perform=async()=>{
  let desired=lastSaved?mergeStates(baseline,snapshot,lastSaved):snapshot;
  for(let attempt=0;attempt<5;attempt++){
   try{const result=await request('/api/state','PUT',{state:desired,revision});revision=result.revision;lastSaved=clone(desired);return desired;}
   catch(e){if((e as ApiError).status!==409||attempt===4)throw e;
    const current=await request('/api/state','GET');const fresh=safeState(current.state);
    desired=mergeStates(lastSaved||fresh,desired,fresh);
    revision=current.revision; // Retry with latest server revision, without losing locally edited records.
   }
  }
  throw new Error('Saqlashdagi to‘qnashuvni hal qilib bo‘lmadi.');
 };
 const operation=queue.catch(()=>{}).then(perform);queue=operation;return operation;
}
export const getLastSaved=()=>lastSaved;
