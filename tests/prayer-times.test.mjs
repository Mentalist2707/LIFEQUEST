import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
// Compile isolated TS helper so no browser, Next.js or network access is required.
let ts;try{ts=require('typescript')}catch{ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript')}
const source=readFileSync(new URL('../lib/prayer-times.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const module={exports:{}};
const setPrayer=(s,date,prayer,status)=>({ ...s,prayers:[...(s.prayers||[]),{date,prayer,status}],changes:[...(s.changes||[]),`${date}:${prayer}:${status}`]});
new Function('require','module','exports',js)((name)=>name==='./engine'?{setPrayer}: {},module,module.exports);
const {uzTimestamp,prayerWindow,currentPrayer,autoMarkMissed,timeLeft,uzDate}=module.exports;
const day={date:'2026-11-07',bomdod:'05:45',sunrise:'07:15',peshin:'12:20',asr:'15:45',shom:'17:25',xufton:'18:45'};
const tomorrow={...day,date:'2026-11-08',bomdod:'05:46'};
const schedule={'2026-11-07':day,'2026-11-08':tomorrow};
const at=(d,t)=>uzTimestamp(d,t);
test('bomdod closes at sunrise, not midnight',()=>{assert.equal(prayerWindow(day.date,'bomdod',schedule).end,at(day.date,'07:15'));});
test('peshin glows until asr and other remaining times are computable',()=>{const p=currentPrayer(schedule,at(day.date,'13:10'));assert.equal(p.active,'peshin');assert.equal(p.following.prayer,'asr');assert.equal(timeLeft(at(day.date,'17:25'),at(day.date,'15:25')),'2 soat 00 daqiqa')});
test('xufton remains active beyond midnight until next fajr',()=>{const p=prayerWindow(day.date,'xufton',schedule);assert.equal(p.end,at(tomorrow.date,'05:46'));assert.ok(p.end>at(tomorrow.date,'00:00'));});
test('auto missed is not charged before enable timestamp',()=>{const state={prayers:[],prayerConfig:{enabledAt:new Date(at(day.date,'14:00')).toISOString(),city:'tashkent'}};const updated=autoMarkMissed(state,schedule,at(day.date,'16:00'));assert.deepEqual(updated.changes,['2026-11-07:peshin:qazo']);});
test('auto missed only once, skips completed prayer',()=>{const state={prayers:[{date:day.date,prayer:'peshin',status:'completed'}],prayerConfig:{enabledAt:new Date(at(day.date,'09:00')).toISOString(),city:'tashkent'}};const first=autoMarkMissed(state,schedule,at(day.date,'18:00'));assert.ok(!first.changes.includes(`${day.date}:peshin:qazo`));assert.deepEqual(first.changes,[`${day.date}:asr:qazo`]);assert.equal(autoMarkMissed(first,schedule,at(day.date,'18:05')),first);});
