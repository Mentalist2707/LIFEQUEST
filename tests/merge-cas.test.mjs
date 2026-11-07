import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
function load(file, dependencies={}){
 const source=fs.readFileSync(new URL(file,import.meta.url),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};
 vm.runInNewContext(js,{module:mod,exports:mod.exports,require:(path)=>dependencies[path]||{},crypto:globalThis.crypto,structuredClone,Date,Math,Set,Map,Error,Number,String,Array,Object,JSON,Promise});
 return mod.exports;
}
const engine=load('../lib/engine.ts');
const {mergeStates,stableEqual}=load('../lib/merge.ts',{'./engine':engine});
test('same JSON contents in different key order are equal (Neon JSONB)',()=>{
 assert.equal(stableEqual({b:1,a:{z:2,y:3}},{a:{y:3,z:2},b:1}),true);
 assert.equal(stableEqual([{b:1,a:2}],[{a:2,b:1}]),true);
 assert.equal(stableEqual({a:[1,2]},{a:[2,1]}),false);
});
test('concurrent edits in two clients preserve both tasks on server merge',()=>{
 const base=engine.createInitial();
 const a={...base,quests:[{id:'a',title:'A'}]};
 const b={...base,quests:[{id:'b',title:'B'}]};
 let remote=mergeStates(base,a,base);let revision=1;
 remote=mergeStates(base,b,remote);revision++;
 assert.deepEqual(new Set(remote.quests.map(q=>q.id)),new Set(['a','b']));
 assert.equal(revision,2);
 assert.equal(stableEqual(mergeStates(base,b,remote),remote),true);
});
test('concurrent completion does not duplicate XP when merged',()=>{
 const q={id:'q',title:'Kitob',kind:'daily',category:'bilim',difficulty:'easy',priority:'normal',xp:10,due:engine.localDate(),repeat:true,created:'',updated:''};
 const base={...engine.createInitial(),quests:[q]};
 const a=engine.completeQuest(base,'q');const b=engine.completeQuest(base,'q');
 const merged=mergeStates(base,b,a);
 assert.equal(merged.completions.length,1);
 assert.equal(merged.transactions.length,2);
});
