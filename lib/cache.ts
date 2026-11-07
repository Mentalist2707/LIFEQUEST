/** Private, account-scoped IndexedDB snapshot, never shared between logins.
 * This is a recovery/performance cache; Neon remains authoritative. */
import type {State} from './types';
import {safeState} from './engine';
export interface CachedSnapshot {
 state:State;
 base:State;
 pending:boolean;
 updatedAt:number;
}
const DB_NAME='lifequest-private-cache-v2';
const STORE='snapshots';
function open():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined'){reject(new Error('IndexedDB mavjud emas'));return;}
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE)};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('Kesh ochilmadi'));
 });
}
function key(id:string){return `user:${id}`}
export async function readCachedSnapshot(id:string):Promise<CachedSnapshot|null>{
 if(!id)return null;
 const db=await open();
 try{return await new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readonly');
  const r=tx.objectStore(STORE).get(key(id));
  r.onsuccess=()=>{try{const s=r.result as CachedSnapshot|undefined;resolve(s&&typeof s.pending==='boolean'?{...s,state:safeState(s.state),base:safeState(s.base)}:null)}catch(e){reject(e)}};
  r.onerror=()=>reject(r.error);
 })}finally{db.close()}
}
export async function writeCachedSnapshot(id:string,value:CachedSnapshot):Promise<void>{
 if(!id)return;
 const db=await open();
 try{await new Promise<void>((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite');
  tx.objectStore(STORE).put(value,key(id));
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
 })}finally{db.close()}
}
export async function deleteCachedSnapshot(id:string):Promise<void>{
 if(!id)return;
 const db=await open();
 try{await new Promise<void>((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(key(id));
  tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
 })}finally{db.close()}
}
