export const STORAGE_KEY = 'rehab-pharm-progress-v1';
export const freshState = () => ({version:1,started:new Date().toISOString().slice(0,10),completed:[],bookmarks:[],attempts:[],cards:{},notes:{},day:1});
export function validState(value) {
 if(!value||value.version!==1||!Array.isArray(value.completed)||!Array.isArray(value.bookmarks)||!Array.isArray(value.attempts)||!value.cards||typeof value.cards!=='object'||Array.isArray(value.cards)||!value.notes||typeof value.notes!=='object'||Array.isArray(value.notes)) return false;
 const ids=a=>a.every(n=>Number.isInteger(n)&&n>=1&&n<=38)&&new Set(a).size===a.length;
 return ids(value.completed)&&ids(value.bookmarks)&&Number.isInteger(value.day)&&value.day>=1&&value.day<=7&&typeof value.started==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value.started)&&value.attempts.length<=10000&&value.attempts.every(a=>a&&Number.isInteger(a.chapter)&&a.chapter>=1&&a.chapter<=38&&typeof a.correct==='boolean'&&typeof a.question==='string'&&a.question.length<1000&&Number.isFinite(a.at))&&Object.entries(value.cards).every(([k,c])=>/^([1-9]|[12]\d|3[0-8])-([0-2])$/.test(k)&&c&&Number.isInteger(c.box)&&c.box>=0&&c.box<=3&&Number.isFinite(c.due))&&Object.entries(value.notes).every(([k,v])=>/^([1-9]|[12]\d|3[0-8])$/.test(k)&&typeof v==='string'&&v.length<=10000);
}
export function loadState(storage) {try {const s=JSON.parse(storage.getItem(STORAGE_KEY));return validState(s)?s:freshState();}catch{return freshState();}}
export function mastery(state,id) {const a=state.attempts.filter(a=>a.chapter===id).slice(-8);return a.length?Math.round(a.filter(a=>a.correct).length/a.length*100):null;}
export function cardQueue(book,state,{scope='due',chapter=null,now=Date.now()}={}) {
 return book.chapters.flatMap(c=>c.flashcards.map((f,i)=>({...f,id:`${c.id}-${i}`,chapter:c.id,title:c.title,box:state.cards[`${c.id}-${i}`]?.box??0,due:state.cards[`${c.id}-${i}`]?.due??0}))).filter(c=>(chapter===null||c.chapter===chapter)&&(scope==='all'||c.due<=now)).sort((a,b)=>a.due-b.due||a.box-b.box||a.chapter-b.chapter);
}
export function rateCard(state,id,rating,now=Date.now()) {if(!['again','good','easy'].includes(rating))throw new Error('Invalid rating');const old=state.cards[id]??{box:0,due:0};const box=rating==='again'?0:Math.min(3,old.box+(rating==='easy'?2:1));const minutes=rating==='again'?10:[0,1440,4320,10080][box];return {...state,cards:{...state.cards,[id]:{box,due:now+minutes*60000}}};}
export function priorities(book,state,day=state.day) {
 const due=new Set(cardQueue(book,state).filter(c=>state.cards[c.id]&&c.box===0).map(c=>c.chapter));
 return book.chapters.map(c=>{const score=mastery(state,c.id);const done=state.completed.includes(c.id);return {chapter:c,mastery:score,reason:score!==null&&score<75?'Practice accuracy below 75%':due.has(c.id)?'Difficult flashcards need another pass':!done?'Ready for a first review':'Spaced review',weight:(score!==null&&score<75?200-score:0)+(due.has(c.id)?80:0)+(!done?40:0)+(c.day===day?30:0)};}).sort((a,b)=>b.weight-a.weight||a.chapter.id-b.chapter.id);
}
export function shuffle(items,rng=Math.random) {const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function questionBank(book,ids=book.chapters.map(c=>c.id)) {return book.chapters.filter(c=>ids.includes(c.id)).flatMap(c=>c.quiz.map((q,i)=>({...q,id:`${c.id}-q${i}`,chapter:c.id,chapterTitle:c.title,pages:c.pages,options:shuffle([q.answer,...q.distractors])})));}
export function mixedExam(book) {return shuffle(book.chapters.map(c=>shuffle(questionBank(book,[c.id]))[0]));}
