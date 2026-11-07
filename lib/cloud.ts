import type {State} from './types';
import {safeState} from './engine';
let revision=0;
let queue:Promise<unknown>=Promise.resolve();
let lastSaved:State|null=null;
async function request(url:string,method:'GET'|'PUT'|'POST',body?:unknown){
 const res=await fetch(url,{method,cache:'no-store',credentials:'same-origin',headers:{'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const value=await res.json().catch(()=>({error:'Server javobi noto‘g‘ri'}));
 if(!res.ok){const err=new Error(value.error||`Server xatosi (${res.status})`);(err as Error&{status?:number}).status=res.status;throw err}
 return value;
}
export async function authenticate(mode:'login'|'register',email:string,password:string,name:string){await request(`/api/auth/${mode}`,'POST',{email,password,name});revision=0;lastSaved=null;}
export async function getSession(){return request('/api/auth/me','GET') as Promise<{user:{id:string;name:string;email:string}}>}
export async function logout(){await queue.catch(()=>{});await request('/api/auth/logout','POST');revision=0;lastSaved=null;}
export async function loadCloud():Promise<State>{await queue.catch(()=>{});const result=await request('/api/state','GET');revision=result.revision;const state=safeState(result.state);lastSaved=state;return state;}
export function saveCloud(state:State):Promise<void>{const snapshot=JSON.parse(JSON.stringify(safeState(state))) as State;
 const perform=async()=>{const result=await request('/api/state','PUT',{state:snapshot,revision});revision=result.revision;lastSaved=snapshot;};
 const operation=queue.catch(()=>{}).then(perform);queue=operation;return operation;
}
export const getLastSaved=()=>lastSaved;
