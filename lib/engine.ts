import { Category, Completion, Quest, State, Transaction, PrayerName, PrayerStatus, xpByDifficulty } from './types';
export const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const localDate=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const dayOffset=(date:string,n:number)=>{const [y,m,d]=date.split('-').map(Number);return localDate(new Date(y,m-1,d+n));};
export const weekStart=(date:string)=>{const [y,m,d]=date.split('-').map(Number);const day=new Date(y,m-1,d);return dayOffset(date,-((day.getDay()+6)%7));};
export const monthStart=(date:string)=>date.slice(0,7)+'-01';
// Level thresholds: level 1=0, level 2=100, level 3=250, level 4=450, level 5=700.
export const threshold=(level:number)=>Math.max(0,25*(level-1)*(level+2));
export const levelFromXP=(xp:number)=>{let lvl=1;while(threshold(lvl+1)<=xp&&lvl<10000)lvl++;return lvl;};
export const progress=(xp:number)=>{const level=levelFromXP(xp),start=threshold(level),next=threshold(level+1);return {level,current:xp-start,need:next-start,remaining:next-xp,percent:Math.min(100,((xp-start)/(next-start))*100)};};
export const totalXP=(s:State)=>Math.max(0,s.transactions.reduce((n,t)=>n+t.amount,0));
export const skillXP=(s:State,category:Category)=>Math.max(0,s.transactions.filter(t=>t.category===category).reduce((n,t)=>n+t.amount,0));
export const completionFor=(s:State,q:Quest,date=localDate())=>s.completions.some(c=>c.questId===q.id&&(q.repeat?c.date===date:true));
export const dueToday=(q:Quest,date=localDate())=>!q.archived&&((q.repeat&&(!q.due||q.due<=date))||q.due===date||(!q.due&&q.kind==='daily'));
export const activeDays=(s:State)=>new Set([...s.completions.map(c=>c.date),...s.rewards.map(r=>r.date),...(s.prayers||[]).filter(p=>p.status==='completed').map(p=>p.date)]);
export const streaks=(s:State,today=localDate())=>{const days=activeDays(s);let current=0;let d=days.has(today)?today:dayOffset(today,-1);while(days.has(d)){current++;d=dayOffset(d,-1);}const sorted=[...days].sort();let longest=0,run=0,prev='';for(const day of sorted){run=prev&&dayOffset(prev,1)===day?run+1:1;longest=Math.max(longest,run);prev=day;}return {current,longest};};
export const createInitial=():State=>({version:1,profile:{name:'Qahramon',avatar:'🧙',created:new Date().toISOString()},settings:{sound:false,animations:true,notifications:false,theme:'dark'},quests:[],completions:[],transactions:[],rewards:[],events:[],notifications:[],prayers:[],prayerHistory:[],prayerConfig:undefined});
export const countOn=(s:State,date:string)=>s.completions.filter(c=>c.date===date).length;
export const prayers: {id:PrayerName;label:string;xp:number;penalty:number}[] = [
 {id:'bomdod',label:'Bomdod',xp:220,penalty:440},
 {id:'peshin',label:'Peshin',xp:180,penalty:360},
 {id:'asr',label:'Asr',xp:180,penalty:360},
 {id:'shom',label:'Shom',xp:200,penalty:400},
 {id:'xufton',label:'Xufton',xp:200,penalty:400},
];
/**
 * Missing a prayer costs 2 × that prayer's regular reward.
 * Making it up later refunds HALF of the negative XP: a qazo can never
 * become a full on-time XP reward by changing its status.
 */
export const prayerScore=(prayer:PrayerName,status:'pending'|PrayerStatus)=>{
 const item=prayers.find(p=>p.id===prayer);
 return status==='completed'?(item?.xp||0):status==='qazo'?-(item?.penalty||0):status==='madeup'?-(item?.xp||0):0;
};
// All prior signed transactions are preserved; old qazo records keep their actual
// historical debits, so an old record gets half of its real deduction back.
export function setPrayer(s:State,date:string,prayer:PrayerName,to:'pending'|PrayerStatus):State{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>localDate()||!prayers.some(p=>p.id===prayer))return s;
 const current=(s.prayers||[]).find(p=>p.date===date&&p.prayer===prayer);
 const from=current?.status||'pending';
 if(from==='qazo'&&to==='completed')to='madeup';
 // Qazo history cannot be erased or converted to a full on-time reward.
 if((from==='qazo'&&to==='pending')||(from==='madeup'&&to!=='madeup'))return s;
 if(to==='madeup'&&from!=='qazo')return s;
 if(from===to)return s;
 const history=(s.prayerHistory||[]).filter(h=>h.date===date&&h.prayer===prayer);
 const previousNet=history.reduce((sum,h)=>sum+h.delta,0);
 // On old versions the historical amount may differ; only refund half of
 // the actual negative balance when an old qazo is made up.
 const delta=to==='madeup'?Math.floor(Math.abs(Math.min(0,previousNet))/2):prayerScore(prayer,to)-previousNet;
 // Stable id for first-time missed prayer: two devices cannot debit XP twice for the same auto-qazo.
 const event={id:from==='pending'&&to==='qazo'?`missed:${date}:${prayer}`:uid(),date,prayer,from,to,delta,at:new Date().toISOString()};
 const records=(s.prayers||[]).filter(p=>!(p.date===date&&p.prayer===prayer));
 if(to!=='pending')records.push({id:current?.id||uid(),date,prayer,status:to,updated:event.at});
 const next={...s,prayers:records,prayerHistory:[...(s.prayerHistory||[]),event]};
 return grant(next,delta,`Namoz: ${prayers.find(p=>p.id===prayer)?.label} (${from} → ${to})`,`prayer:${event.id}`,'rivojlanish');
}
export const achievements=[
 {name:'Birinchi qadam',desc:'Birinchi vazifani bajaring',icon:'🎯'},
 {name:'Besh marra',desc:'5 ta vazifani bajaring',icon:'🥉'},
 {name:'O‘n marra',desc:'10 ta vazifani bajaring',icon:'🥈'},
 {name:'Ellik marra',desc:'50 ta vazifani bajaring',icon:'🥇'},
 {name:'Yuzta g‘alaba',desc:'100 ta vazifani bajaring',icon:'🏅'},
 {name:'Tong qushi',desc:'09:00 dan oldin vazifa bajaring',icon:'🌅'},
 {name:'Bilim izlovchi',desc:'Bilim yo‘nalishida 10 ta vazifa',icon:'📖'},
 {name:'Bilim ustasi',desc:'Bilim yo‘nalishida 50 ta vazifa',icon:'📚'},
 {name:'Sog‘lom odat',desc:'Sog‘liq yo‘nalishida 10 ta vazifa',icon:'💪'},
 {name:'Moliya bilimdoni',desc:'Moliya yo‘nalishida 10 ta vazifa',icon:'💰'},
 {name:'Mehnatkash',desc:'Ish yo‘nalishida 20 ta vazifa',icon:'🛠️'},
 {name:'Ijtimoiy qahramon',desc:'Ijtimoiy yo‘nalishida 10 ta vazifa',icon:'🤝'},
 {name:'Qiyin vazifa',desc:'1 ta qiyin yoki epik vazifa',icon:'⚔️'},
 {name:'Jangchi',desc:'10 ta qiyin yoki epik vazifa',icon:'🛡️'},
 {name:'Epik qahramon',desc:'5 ta epik vazifa',icon:'🐉'},
 {name:'Uch kunlik seriya',desc:'3 kun ketma-ket faollik',icon:'🔥'},
 {name:'Barqaror',desc:'7 kun ketma-ket faollik',icon:'⭐'},
 {name:'Sadoqatli',desc:'30 kun ketma-ket faollik',icon:'💎'},
 {name:'Yuz kunlik odat',desc:'100 kunlik faollik seriyasi',icon:'🌟'},
 {name:'Izlanuvchi',desc:'5-darajaga chiqing',icon:'🧭'},
 {name:'Usta',desc:'10-darajaga chiqing',icon:'🏆'},
 {name:'Buyuk ustoz',desc:'25-darajaga chiqing',icon:'👑'},
 {name:'Afsona',desc:'50-darajaga chiqing',icon:'🌌'},
 {name:'Birinchi namoz',desc:'Bitta namozni ado etilgan deb belgilang',icon:'🕌'},
 {name:'Namozdagi davomiylik',desc:'20 ta namozni ado etilgan deb belgilang',icon:'🌙'},
 {name:'Bir kunlik besh mahal',desc:'Bir kunda besh mahal namozni ado etilgan deb belgilang',icon:'✨'},
 {name:'Yetti kunlik davomiylik',desc:'7 kun davomida besh mahal ado etilgan deb belgilang',icon:'🌠'},
 {name:'Xayrli qadam',desc:'7 ta kunlik mukofotni oling',icon:'🎁'},
 {name:'Faol o‘quvchi',desc:'30 kunlik mukofotni oling',icon:'🎀'},
];
export const checkAchievements=(s:State,today=localDate())=>{
 const completed=s.completions, xp=totalXP(s),level=levelFromXP(xp);
 const hard=completed.filter(c=>c.difficulty==='hard'||c.difficulty==='epic').length;
 const inCat=(cat:Category)=>completed.filter(c=>c.category===cat).length;
 const longest=streaks(s,today).longest;
 const prayerList=s.prayers||[];
 const prayersDone=prayerList.filter(r=>r.status==='completed');
 const fullDays=new Set(prayersDone.map(r=>r.date).filter(d=>prayersDone.filter(r=>r.date===d).length===5));
 let consecutive=false;for(const day of fullDays){let ok=true;for(let n=1;n<7;n++)if(!fullDays.has(dayOffset(day,n))){ok=false;break}if(ok){consecutive=true;break}}
 return [completed.length>=1,completed.length>=5,completed.length>=10,completed.length>=50,completed.length>=100,
 completed.some(c=>new Date(c.at).getHours()<9),inCat('bilim')>=10,inCat('bilim')>=50,inCat('sogliq')>=10,inCat('moliya')>=10,inCat('ish')>=20,inCat('ijtimoiy')>=10,
 hard>=1,hard>=10,completed.filter(c=>c.difficulty==='epic').length>=5,longest>=3,longest>=7,longest>=30,longest>=100,
 level>=5,level>=10,level>=25,level>=50,prayersDone.length>=1,prayersDone.length>=20,fullDays.size>=1,consecutive,s.rewards.length>=7,s.rewards.length>=30];
};
export function grant(s:State,amount:number,reason:string,sourceId:string,category?:Category):State{if(s.transactions.some(t=>t.sourceId===sourceId))return s;const t:Transaction={id:uid(),date:localDate(),at:new Date().toISOString(),amount,reason,sourceId,category};return {...s,transactions:[...s.transactions,t]};}
export function completeQuest(s:State,id:string,date=localDate()):State{const q=s.quests.find(q=>q.id===id);if(!q||q.archived||date!==localDate()||completionFor(s,q,date))return s;const completion:Completion={id:`${id}:${q.repeat?date:'once'}`,questId:id,date,at:new Date().toISOString(),xp:q.xp,category:q.category,difficulty:q.difficulty,title:q.title};let next={...s,completions:[...s.completions,completion]};next=grant(next,q.xp,`Vazifa: ${q.title}`,`completion:${completion.id}`,q.category);const todayQuests=next.quests.filter(q=>dueToday(q,date));if(date===localDate()&&todayQuests.length>0&&todayQuests.every(q=>completionFor(next,q,date)))next=grant(next,30,'Kunlik barcha vazifalar mukofoti',`daily-bonus:${date}`);return next;}
export function claimReward(s:State,date=localDate()):State{if(date!==localDate()||s.rewards.some(r=>r.date===date))return s;let next={...s,rewards:[...s.rewards,{date,xp:15,at:new Date().toISOString()}]};return grant(next,15,'Kunlik sovg‘a',`reward:${date}`);}
export function safeState(value:unknown):State{if(!value||typeof value!=='object')throw new Error('Zaxira fayli noto‘g‘ri');const v=value as Partial<State>;if(v.version!==1||!v.profile||!v.settings||!Array.isArray(v.quests)||!Array.isArray(v.completions)||!Array.isArray(v.transactions)||!Array.isArray(v.rewards)||!Array.isArray(v.events)||!Array.isArray(v.notifications))throw new Error('Zaxira formati mos emas');const unique=(arr:{id?:string;sourceId?:string;date?:string}[],key:'id'|'sourceId'|'date')=>{const keys=arr.map(v=>v[key]);return keys.every(k=>typeof k==='string'&&k.length>0)&&new Set(keys).size===keys.length};if(!unique(v.quests,'id')||!unique(v.completions,'id')||!unique(v.transactions,'id')||!unique(v.transactions,'sourceId')||!unique(v.rewards,'date'))throw new Error('Takroriy yozuv topildi');
 const completionKeys=v.completions.map(c=>`${c.questId}:${c.date}`);if(new Set(completionKeys).size!==completionKeys.length)throw new Error('Bajarilish tarixida takroriy yozuv bor');
 if(v.completions.some(c=>!c.questId||!c.date||!Number.isFinite(c.xp)||c.xp<0)||v.rewards.some(r=>!Number.isFinite(r.xp)||r.xp<0))throw new Error('Tarixdagi ma’lumotlar buzilgan');if(v.transactions.some(t=>!Number.isFinite(t.amount)))throw new Error('XP ma’lumoti buzilgan');
 const state=v as State;state.prayerConfig=v.prayerConfig&&typeof v.prayerConfig==='object'&&typeof (v.prayerConfig as any).city==='string'&&typeof (v.prayerConfig as any).enabledAt==='string'?v.prayerConfig as State['prayerConfig']:undefined;state.prayers=Array.isArray(v.prayers)?v.prayers:[];state.prayerHistory=Array.isArray(v.prayerHistory)?v.prayerHistory:[];
 if(!unique(state.prayers,'id')||!unique(state.prayerHistory,'id'))throw new Error('Takroriy namoz yozuvi');
 if(new Set(state.prayers.map(p=>`${p.date}:${p.prayer}`)).size!==state.prayers.length)throw new Error('Takroriy namoz holati');
 if(state.prayers.some(p=>!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!prayers.some(x=>x.id===p.prayer)||!['completed','qazo','madeup'].includes(p.status)))throw new Error('Namoz tarixi noto‘g‘ri');
 return state;}
