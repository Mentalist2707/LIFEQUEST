import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const input=fs.readFileSync(new URL('../lib/engine.ts',import.meta.url),'utf8');
const js=ts.transpileModule(input,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const mod={exports:{}};
vm.runInNewContext(js,{module:mod,exports:mod.exports,require:()=>({}),crypto:globalThis.crypto,Date,Math,Set,Error,Number,String,Array,Object});
const e=mod.exports;
const today='2026-11-07';
const q=(props={})=>({id:'habit',title:'30 daqiqa mashq',description:'',kind:'daily',category:'sogliq',difficulty:'medium',priority:'normal',xp:25,due:'2026-11-04',repeat:true,missPenalty:true,penaltyFrom:'2026-11-04',created:'2026-11-04T08:00:00.000Z',updated:'',...props});
const initial=(quest)=>({...e.createInitial(),quests:[quest]});
test('kunlik takroriy vazifa o‘tkazilgan har kun −XP, umumiy XP manfiy bo‘la oladi',()=>{
 const r=e.assessMissedDailyQuests(initial(q()),today);
 assert.equal(e.totalXP(r),-75);
 assert.equal(e.skillXP(r,'sogliq'),-75);
 assert.equal(r.transactions.length,3);
 assert.equal(e.progress(-75).level,1);
 assert.equal(e.progress(-75).percent,0);
});
test('bir kun uchun ikkinchi marta jarima olinmaydi',()=>{
 const r=e.assessMissedDailyQuests(initial(q()),today);
 assert.equal(e.assessMissedDailyQuests(r,today),r);
 assert.equal(e.assessMissedDailyQuests(r,today).transactions.length,3);
});
test('bajarilgan kun jarimasiz qoladi',()=>{
 const s=initial(q());s.completions.push({id:'habit:2026-11-05',questId:'habit',date:'2026-11-05',at:'2026-11-05T10:00:00.000Z',xp:25,category:'sogliq',difficulty:'medium',title:'30 daqiqa mashq'});
 const r=e.assessMissedDailyQuests(s,today);
 assert.equal(r.transactions.length,2);
 assert.ok(!r.transactions.some(t=>t.sourceId==='daily-missed:habit:2026-11-05'));
});
test('faqat kunlik checkbox yoqilgan vazifaga jarima qo‘llanadi',()=>{
 for(const quest of [q({missPenalty:false}),q({kind:'weekly'}),q({archived:true})]){
  const r=e.assessMissedDailyQuests(initial(quest),today);
  assert.equal(r.transactions.length,0);
 }
});
test('checkbox keyin yoqilsa oldingi kunlar jarimaga kirmaydi',()=>{
 const r=e.assessMissedDailyQuests(initial(q({penaltyFrom:'2026-11-06'})),today);
 assert.equal(r.transactions.length,1);
 assert.equal(r.transactions[0].sourceId,'daily-missed:habit:2026-11-06');
});
test('bir martalik kunlik vazifadan faqat bir marta yechiladi va qazo XP yo‘q',()=>{
 const s=initial(q({repeat:false,due:'2026-11-05',penaltyFrom:'2026-11-04'}));
 const r=e.assessMissedDailyQuests(s,today);
 assert.equal(r.transactions.length,1);
 assert.equal(e.totalXP(r),-25);
 assert.equal(e.completeQuest(r,'habit',e.localDate()),r);
});
test('vaqt hali tugamagan bugungi vazifaga jarima yo‘q',()=>{
 const s=initial(q({due:today,penaltyFrom:today}));
 assert.equal(e.assessMissedDailyQuests(s,today),s);
});
test('eski format va mavjud tranzaksiyalar uchun import ishlaydi',()=>{
 const s=e.createInitial();s.quests=[q({missPenalty:undefined,penaltyFrom:undefined})];
 assert.equal(e.safeState(s),s);
});
