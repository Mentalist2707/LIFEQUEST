import type {State} from './types';
import {safeState} from './engine';

const SESSION_KEY='lifequest-access-key';
let revision=0;
let writeQueue:Promise<unknown>=Promise.resolve();
let lastSaved:State|null=null;
export const readAccessKey=()=>typeof window==='undefined'?'':sessionStorage.getItem(SESSION_KEY)||'';
export const setAccessKey=(value:string)=>sessionStorage.setItem(SESSION_KEY,value);
export const clearAccessKey=()=>{sessionStorage.removeItem(SESSION_KEY);revision=0;lastSaved=null};

async function request(method:'GET'|'PUT',key:string,body?:unknown){
 const response=await fetch('/api/state',{
  method,cache:'no-store',headers:{'content-type':'application/json','authorization':`Bearer ${key}`},
  ...(body?{body:JSON.stringify(body)}:{})
 });
 const result=await response.json().catch(()=>({error:'Server javobi noto‘g‘ri'}));
 if(!response.ok){const error=new Error(result.error||`Server xatosi (${response.status})`);(error as Error&{status?:number}).status=response.status;throw error}
 return result;
}

export async function loadCloud(key:string):Promise<State>{
 // Wait for any in-progress save triggered by another app page.
 await writeQueue.catch(()=>undefined);
 const result=await request('GET',key);
 revision=result.revision;
 const state=safeState(result.state);
 lastSaved=state;
 return state;
}

export function saveCloud(state:State,key:string):Promise<void>{
 const snapshot=JSON.parse(JSON.stringify(safeState(state))) as State;
 // Each write reads the newly assigned revision after the preceding write.
 const perform=async()=>{
  const result=await request('PUT',key,{state:snapshot,revision});
  revision=result.revision;
  lastSaved=snapshot;
 };
 const operation=writeQueue.catch(()=>undefined).then(perform);
 writeQueue=operation;
 return operation;
}

export function getLastSaved(){return lastSaved}
