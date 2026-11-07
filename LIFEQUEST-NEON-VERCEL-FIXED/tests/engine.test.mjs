import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const input=fs.readFileSync(new URL('../lib/engine.ts',import.meta.url),'utf8');
const js=ts.transpileModule(input,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const mod={exports:{}};
vm.runInNewContext(js,{module:mod,exports:mod.exports,require:()=>({}),crypto:globalThis.crypto,Date,Math,Set,Error,Number,String,Array,Object});
const engine=mod.exports;
const {threshold,levelFromXP,progress,createInitial,totalXP,completeQuest,claimReward,localDate,dayOffset,dueToday,safeState,streaks}=engine;
function makeQuest(){return {id:'q1',title:'Kitob o‘qish',description:'',kind:'daily',category:'bilim',difficulty:'easy',priority:'normal',xp:10,due:localDate(),repeat:true,created:'',updated:''}}
test('darajalar promptdagi chegaralarga mos',()=>{
 assert.deepEqual([1,2,3,4,5,6].map(threshold),[0,100,250,450,700,1000]);
 assert.equal(levelFromXP(99),1);assert.equal(levelFromXP(100),2);assert.equal(levelFromXP(700),5);
 assert.equal(progress(100).current,0);
});
test('quest bir marta XP oladi va kunlik bonus ikki marta berilmaydi',()=>{
 const initial={...createInitial(),quests:[makeQuest()]};
 const completed=completeQuest(initial,'q1');
 assert.equal(completed.completions.length,1);
 assert.equal(totalXP(completed),40);
 assert.equal(completeQuest(completed,'q1'),completed);
 assert.equal(completeQuest(completed,'q1').transactions.length,2);
});
test('kunlik sovg‘a faqat shu kunda bir marta olinadi',()=>{
 const initial=createInitial();const a=claimReward(initial);assert.equal(totalXP(a),15);
 assert.equal(claimReward(a),a);
 assert.equal(claimReward(a,dayOffset(localDate(),1)),a);
});
test('takroriy vazifalar boshlanish sanasidan oldin ko‘rinmaydi',()=>{
 assert.equal(dueToday({...makeQuest(),due:dayOffset(localDate(),1)} ,localDate()),false);
 assert.equal(dueToday(makeQuest(),localDate()),true);
});
test('import takroriy yakunlash yozuvini qabul qilmaydi',()=>{
 const s=completeQuest({...createInitial(),quests:[makeQuest()]},'q1');
 const copy=structuredClone(s);copy.completions.push({...copy.completions[0],id:'different'});
 assert.throws(()=>safeState(copy));
 assert.equal(safeState(s),s);
});
test('kunlik faollik ketma-ketligi bir kunni ikki marta sanamaydi',()=>{
 let s=createInitial();s={...s,rewards:[{date:localDate(),xp:15,at:new Date().toISOString()}]};
 assert.equal(streaks(s).current,1);
});
