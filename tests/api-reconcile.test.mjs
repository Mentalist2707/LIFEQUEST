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
 vm.runInNewContext(js,{module:mod,exports:mod.exports,require:(name)=>dependencies[name]||{},crypto:globalThis.crypto,structuredClone,Date,Math,Set,Map,Error,Number,String,Array,Object,JSON,Promise});
 return mod.exports;
}
const engine=load('../lib/engine.ts');
const merge=load('../lib/merge.ts',{'./engine':engine});
let stored=null;
let attempts=0;
async function sql(parts,...values){
 const query=parts.join('?');
 if(query.startsWith('SELECT data,revision FROM lifequest_state'))return stored?[structuredClone(stored)]:[];
 if(query.startsWith('INSERT INTO lifequest_state')){
  if(stored)return [];
  stored={data:JSON.parse(values[1]),revision:1};
  return [{revision:1}];
 }
 if(query.startsWith('UPDATE lifequest_state')){
  attempts++;
  if(!stored||stored.revision!==values.at(-1))return [];
  stored={data:JSON.parse(values[0]),revision:stored.revision+1};
  return [{revision:stored.revision}];
 }
 throw new Error('Unknown query '+query);
}
const route=load('../app/api/state/route.ts',{
 '@/lib/server/auth':{
  client:()=>sql,schema:async()=>{},userFromRequest:async()=>({id:'id',name:'Ali'}),
  json:(body,status=200)=>({body,status}),sameOrigin:()=>true,
  serverFailure:(error)=>{throw error},
 },
 '@/lib/engine':engine,
 '@/lib/merge':merge,
});
function req(body){return {text:async()=>JSON.stringify(body)};}
test('API merges stale writes rather than returning repeated 409',async()=>{
 stored=null;attempts=0;
 const base=engine.createInitial();base.profile.name='Ali';
 const a={...base,quests:[{id:'A',title:'Kitob'}]};
 const b={...base,quests:[{id:'B',title:'Sport'}]};
 const first=await route.PUT(req({state:a,baseState:base,revision:0}));
 assert.equal(first.status,200);
 assert.equal(first.body.revision,1);
 const stale=await route.PUT(req({state:b,baseState:base,revision:0}));
 assert.equal(stale.status,200);
 assert.equal(stale.body.revision,2);
 assert.deepEqual(new Set(stale.body.state.quests.map(q=>q.id)),new Set(['A','B']));
 const repeat=await route.PUT(req({state:b,baseState:base,revision:0}));
 assert.equal(repeat.status,200);
 assert.equal(repeat.body.unchanged,true);
 assert.equal(repeat.body.revision,2);
});
