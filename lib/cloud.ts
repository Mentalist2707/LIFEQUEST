import type {State} from './types';
import {safeState} from './engine';
let revision=0;
let queue:Promise<unknown>=Promise.resolve();
let lastSaved:State|null=null;
let lastEnqueued:State|null=null;
let generation=0;

type ApiError=Error&{status?:number};
async function request(url:string,method:'GET'|'PUT'|'POST',body?:unknown){
 const res=await fetch(url,{method,cache:'no-store',credentials:'same-origin',headers:{'content-type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 const value=await res.json().catch(()=>({error:'Server javobi noto‘g‘ri'}));
 if(!res.ok){const err=new Error(value.error||`Server xatosi (${res.status})`) as ApiError;err.status=res.status;(err as ApiError & {payload?:any}).payload=value;throw err;}
 return value;
}
import {mergeStates,stableEqual} from './merge';
export {mergeStates} from './merge';
const clone=(s:State):State=>structuredClone(s);
const eq=stableEqual;
export async function authenticate(mode:'login'|'register',email:string,password:string,name:string){await request(`/api/auth/${mode}`,'POST',{email,password,name});revision=0;lastSaved=null;lastEnqueued=null;generation++;queue=Promise.resolve();}
export async function getSession(){return request('/api/auth/me','GET') as Promise<{user:{id:string;name:string;email:string}}>}
export async function logout(){await queue.catch(()=>{});await request('/api/auth/logout','POST');revision=0;lastSaved=null;lastEnqueued=null;generation++;queue=Promise.resolve();}
export async function loadCloud():Promise<State>{await queue.catch(()=>{});const result=await request('/api/state','GET');revision=result.revision;const state=safeState(result.state);lastSaved=clone(state);lastEnqueued=clone(state);return state;}
/** Serialized, idempotent state persistence. Each request waits for the prior write.
 * The server remains the authority for revisions. A state that has already been
 * acknowledged is never written again merely because React re-rendered. */
export function saveCloud(state:State):Promise<State>{
 const snapshot=clone(safeState(state));
 const baseline=lastEnqueued?clone(lastEnqueued):lastSaved?clone(lastSaved):clone(snapshot);
 const myGeneration=generation;
 lastEnqueued=clone(snapshot);
 const perform=async():Promise<State>=>{
  if(myGeneration!==generation)throw new Error('Sessiya almashgan, saqlash bekor qilindi.');
  const desired=lastSaved?mergeStates(baseline,snapshot,lastSaved):snapshot;
  if(lastSaved&&eq(desired,lastSaved))return clone(lastSaved);
  // Server owns reconciliation and the compare-and-swap retry, using baseline
  // to distinguish local changes from remote changes.
  const response=await request('/api/state','PUT',{
   state:desired,
   baseState:lastSaved?clone(lastSaved):clone(baseline),
   revision,
  }) as {state:State;revision:number};
  if(myGeneration!==generation)throw new Error('Sessiya almashgan, saqlash bekor qilindi.');
  revision=Number(response.revision);
  const canonical=safeState(response.state);
  lastSaved=clone(canonical);
  return clone(canonical);
 };
 const operation=queue.catch(()=>{}).then(perform);
 queue=operation;
 return operation;
}

export const getLastSaved=()=>lastSaved;
