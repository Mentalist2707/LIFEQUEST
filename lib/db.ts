import {State} from './types';
import {createInitial,safeState} from './engine';
const DB='lifequest-db',STORE='app-state',KEY='main';
export const openDatabase=()=>new Promise<IDBDatabase>((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
export async function loadState():Promise<State>{const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).get(KEY);r.onsuccess=()=>{try{resolve(r.result?safeState(r.result):createInitial())}catch(err){reject(err)}finally{db.close()}};r.onerror=()=>{db.close();reject(r.error)}})}
export async function saveState(s:State):Promise<void>{const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(s,KEY);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
