import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const ts=require('typescript');
function load(path, dependencies={}){
 const input=fs.readFileSync(new URL(path,import.meta.url),'utf8');
 const transpiled=ts.transpileModule(input,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 assert.equal(transpiled.diagnostics?.length,0);
 const mod={exports:{}};vm.runInNewContext(transpiled.outputText,{module:mod,exports:mod.exports,require:(name)=>dependencies[name]||{},crypto:globalThis.crypto,structuredClone,Date,Math,Set,Map,Error,Number,String,Array,Object,JSON,Promise,fetch:globalThis.fetch});return mod.exports;
}
const e=load('../lib/engine.ts');const cloud=load('../lib/cloud.ts',{'./engine':e});
test('5 mahal har biri kuniga bittadan hisoblanadi',()=>{
 let s=e.createInitial();for(const p of e.prayers)s=e.setPrayer(s,e.localDate(),p.id,'completed');
 assert.equal(s.prayers.length,5);assert.equal(e.totalXP(s),980);
 assert.equal(e.checkAchievements(s).length,e.achievements.length);
 assert.equal(e.checkAchievements(s)[25],true);
 const again=e.setPrayer(s,e.localDate(),'bomdod','completed');assert.equal(again,s);
});
test('qazo 2x XP yechadi, keyin qazo o‘qilsa faqat yarmi qaytadi',()=>{
 let s=e.createInitial();s=e.setPrayer(s,e.localDate(),'bomdod','qazo');
 assert.equal(s.transactions.at(-1).amount,-440);assert.equal(s.transactions.reduce((v,t)=>v+t.amount,0),-440);
 s=e.setPrayer(s,e.localDate(),'bomdod','madeup');
 assert.equal(s.transactions.at(-1).amount,220);
 assert.equal(s.transactions.reduce((v,t)=>v+t.amount,0),-220);
 assert.equal(s.prayers[0].status,'madeup');
 assert.equal(e.setPrayer(s,e.localDate(),'bomdod','completed'),s);
 assert.equal(e.setPrayer(s,e.localDate(),'bomdod','pending'),s);
 assert.equal(s.prayerHistory.length,2);
});
test('avval o‘qilgan, keyin qazo deb tuzatilgan holatda sof −2x qoladi',()=>{
 let s=e.createInitial();s=e.setPrayer(s,e.localDate(),'peshin','completed');
 assert.equal(e.totalXP(s),180);
 s=e.setPrayer(s,e.localDate(),'peshin','qazo');
 assert.equal(s.transactions.at(-1).amount,-540);
 assert.equal(s.transactions.reduce((v,t)=>v+t.amount,0),-360);
 s=e.setPrayer(s,e.localDate(),'peshin','completed');
 assert.equal(s.prayers[0].status,'madeup');
 assert.equal(s.transactions.at(-1).amount,180);
 assert.equal(s.transactions.reduce((v,t)=>v+t.amount,0),-180);
 assert.equal(e.setPrayer(s,e.localDate(),'peshin','madeup'),s);
});
test('barcha besh mahal bo‘yicha 2x jarima va 50% qaytarish',()=>{
 let s=e.createInitial();for(const p of e.prayers)s=e.setPrayer(s,e.localDate(),p.id,'qazo');
 assert.equal(s.transactions.reduce((v,t)=>v+t.amount,0),-1960);
 for(const p of e.prayers)s=e.setPrayer(s,e.localDate(),p.id,'madeup');
 assert.equal(s.transactions.reduce((v,t)=>v+t.amount,0),-980);
 assert.equal(s.prayers.filter(p=>p.status==='completed').length,0);
});
test('eskirgan JSON backup namoz maydonlarisiz qabul qilinadi',()=>{
 const s=e.createInitial();delete s.prayers;delete s.prayerHistory;const recovered=e.safeState(s);assert.equal(recovered.prayers.length,0);
});
test('server va lokal o‘zgarishlar ustma-ust tushsa saqlab qoladi',()=>{
 const base=e.createInitial();const local={...base,quests:[{id:'local',title:'A',updated:'1'}]};const remote={...base,quests:[{id:'remote',title:'B',updated:'2'}]};
 const merged=cloud.mergeStates(base,local,remote);
 assert.deepEqual(new Set(merged.quests.map(q=>q.id)),new Set(['local','remote']));
});
test('ketma-ket ikki qurilmada bir vazifa yakunlansa XP ikki marta berilmaydi',()=>{
 const q={id:'quest',title:'Kitob',kind:'daily',category:'bilim',difficulty:'easy',priority:'normal',xp:10,due:e.localDate(),repeat:true,created:'',updated:''};
 const base={...e.createInitial(),quests:[q]};
 const a=e.completeQuest(base,'quest'),b=e.completeQuest(base,'quest');
 const merged=cloud.mergeStates(base,a,b);
 assert.equal(merged.completions.length,1);assert.equal(e.totalXP(merged),40);
});
