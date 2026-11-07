export type Category = 'bilim'|'sogliq'|'rivojlanish'|'moliya'|'ijtimoiy'|'ish';
export type QuestKind = 'daily'|'weekly'|'main';
export type Difficulty = 'easy'|'medium'|'hard'|'epic';
export type Priority = 'low'|'normal'|'high'|'critical';
export type Quest = {id:string;title:string;description:string;kind:QuestKind;category:Category;difficulty:Difficulty;priority:Priority;xp:number;due:string;repeat:boolean;missPenalty?:boolean;penaltyFrom?:string;created:string;updated:string;archived?:boolean};
export type Completion = {id:string;questId:string;date:string;at:string;xp:number;category:Category;difficulty:Difficulty;title:string};
export type Transaction = {id:string;date:string;at:string;amount:number;reason:string;sourceId:string;category?:Category};
export type PrayerName = 'bomdod'|'peshin'|'asr'|'shom'|'xufton';
export type PrayerStatus = 'completed'|'qazo'|'madeup';
export type PrayerRecord = {id:string;date:string;prayer:PrayerName;status:PrayerStatus;updated:string};
export type PrayerHistory = {id:string;date:string;prayer:PrayerName;from:'pending'|PrayerStatus;to:'pending'|PrayerStatus;delta:number;at:string};
export type Reward = {date:string;xp:number;at:string};
export type Profile = {name:string;avatar:string;created:string};
export type Settings = {sound:boolean;animations:boolean;notifications:boolean;theme:'dark'|'midnight'};
export type CalendarEvent = {id:string;date:string;title:string;details:string};
export type Notification = {id:string;at:string;message:string;read:boolean};
export type State = {version:1;profile:Profile;settings:Settings;quests:Quest[];completions:Completion[];transactions:Transaction[];rewards:Reward[];events:CalendarEvent[];notifications:Notification[];prayers?:PrayerRecord[];prayerHistory?:PrayerHistory[];prayerConfig?:{city:string;enabledAt:string}};
export const categories: {id:Category;label:string;skill:string;icon:string;color:string}[] = [
{id:'bilim',label:'Bilim',skill:'Aql-zakovat',icon:'book',color:'#00E5FF'},
{id:'sogliq',label:"Sog‘liq",skill:'Kuch',icon:'heart',color:'#22C55E'},
{id:'rivojlanish',label:'Rivojlanish',skill:'Intizom',icon:'sparkles',color:'#A855F7'},
{id:'moliya',label:'Moliya',skill:'Moliya',icon:'wallet',color:'#FBBF24'},
{id:'ijtimoiy',label:'Ijtimoiy',skill:'Muloqot',icon:'users',color:'#FB7185'},
{id:'ish',label:'Ish',skill:'Ijodkorlik',icon:'briefcase',color:'#60A5FA'}];
export const difficultyLabels:Record<Difficulty,string>={easy:'Oson',medium:"O‘rtacha",hard:'Qiyin',epic:'Epik'};
export const priorityLabels:Record<Priority,string>={low:'Past',normal:'Oddiy',high:'Yuqori',critical:'Juda muhim'};
export const kindLabels:Record<QuestKind,string>={daily:'Kunlik',weekly:'Haftalik',main:'Asosiy'};
export const xpByDifficulty:Record<Difficulty,number>={easy:10,medium:25,hard:50,epic:100};
export const titles=['Yangi Boshlovchi','Izlanuvchi','Intizomli','Tajribali','Usta','Afsonaviy'];
