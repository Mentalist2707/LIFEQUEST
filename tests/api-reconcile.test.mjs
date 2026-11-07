import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const ts=require('typescript');
function load(file,dependencies={}){
 const source=fs.readFileSync(new URL(file,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};
 vm.runInNewContext(js,{module:mod,exports:mod.exports,require:(name)=>dependencies[name]||{},process:{env:{DATABASE_URL:'postgresql://mock'}},console,crypto:globalThis.crypto,structuredClone,Date,Math,Set,Map,Error,Number,String,Array,Object,JSON,Promise});
 return mod.exports;
}
const engine=load('../lib/engine.ts');
const merge=load('../lib/merge.ts',{'./engine':engine});
let stored=null;
let locked=false;
let waiters=[];
let writes=0;
async function lock(){if(!locked){locked=true;return;}await new Promise(resolve=>waiters.push(resolve));}
function unlock(){const next=waiters.shift();if(next)next();else locked=false;}
class FakeClient{
 async connect(){}
 async end(){}
 async query(text,values=[]){
  if(text==='BEGIN'){await lock();return {rows:[]};}
  if(text==='COMMIT'||text==='ROLLBACK'){unlock();return {rows:[]};}
  if(text.startsWith('INSERT INTO lifequest_state')){
   if(!stored)stored={data:JSON.parse(values[1]),revision:0};return {rows:[]};
  }
  if(text.includes('FOR UPDATE'))return {rows:[structuredClone(stored)]};
  if(text.startsWith('UPDATE lifequest_state')){
   writes++;stored={data:JSON.parse(values[1]),revision:stored.revision+1};return {rows:[{revision:stored.revision}]};
  }
  throw new Error('Unexpected query '+text);
 }
}
const route=load('../app/api/state/route.ts',{
 '@neondatabase/serverless':{Client:FakeClient},
 '@/lib/server/auth':{
  client:()=>{},schema:async()=>{},userFromRequest:async()=>({id:'id',name:'Ali'}),
  json:(body,status=200)=>({body,status}),sameOrigin:()=>true,serverFailure:(error)=>{throw error},
 },
 '@/lib/engine':engine,'@/lib/merge':merge,
});
function req(body){return {text:async()=>JSON.stringify(body)};}
test('transaction serializes simultaneous writes, merges both, avoids 409',async()=>{
 stored=null;locked=false;waiters=[];writes=0;
 const base=engine.createInitial();base.profile.name='Ali';
 const a={...base,quests:[{id:'A',title:'Kitob'}]};
 const b={...base,quests:[{id:'B',title:'Sport'}]};
 const [first,second]=await Promise.all([
  route.PUT(req({state:a,baseState:base,revision:0})),
  route.PUT(req({state:b,baseState:base,revision:0})),
 ]);
 assert.equal(first.status,200);assert.equal(second.status,200);
 assert.equal(stored.revision,2);
 assert.deepEqual(new Set(stored.data.quests.map(q=>q.id)),new Set(['A','B']));
 const repeated=await route.PUT(req({state:b,baseState:base,revision:0}));
 assert.equal(repeated.status,200);
 assert.equal(repeated.body.unchanged,true);
 assert.equal(writes,2);
});
