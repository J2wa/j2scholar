import content from '../public/content.json' with {type:'json'};
import {priorities,questionBank,freshState,validState} from '../public/core.mjs';
export const book=content;
export function source(c){return {chapter:c.id,title:c.title,printedPages:c.pages,pdfPages:c.pdfPages,edition:5,year:2016,kind:'Original curated study notes, not full textbook text'};}
export function getChapter(id){const c=book.chapters.find(c=>c.id===id);if(!c)return {error:'Unknown chapter. Valid IDs: 1–38.'};return {...c,source:source(c)};}
const terms=s=>String(s).toLowerCase().match(/[a-z0-9]+/g)?.filter(x=>x.length>2)??[];
export function searchChapters(query){const tokens=[...new Set(terms(query))];return book.chapters.map(c=>{const title=terms(c.title+' '+c.section).join(' ');const text=JSON.stringify(c).toLowerCase();return {chapter:c,score:tokens.reduce((n,t)=>n+(title.includes(t)?8:0)+(text.includes(t)?1:0),0)};}).filter(c=>c.score>0).sort((a,b)=>b.score-a.score).slice(0,5).map(({chapter:c,score})=>({source:source(c),focus:c.focus,score,points:c.points,rehab:c.rehab,trap:c.trap}));}
export function sessionPlan({day=1,minutes=45,progress=null}={}){
 const state=validState(progress)?progress:freshState();const daily=book.days.find(d=>d.id===day)||book.days[0];let remaining=Math.max(10,Math.min(240,minutes));const steps=[];
 // At least one short retrieval block is always included; do not silently drop new coverage.
 const recall=Math.min(10,Math.max(3,Math.round(remaining*.2)));remaining-=recall;steps.push({kind:'recall',minutes:recall,instruction:'Retrieve difficult due cards or explain the previous session without notes.'});
 const eligible=priorities(book,state,day).filter(x=>daily.chapters.includes(x.chapter.id)||x.mastery!==null&&x.mastery<75||state.completed.includes(x.chapter.id));
 for(const {chapter:c,reason} of eligible){if(remaining<7||steps.length>=5)break;const block=Math.min(c.minutes,remaining-3);if(block<4)break;steps.push({kind:'chapter',chapter:c.id,title:c.title,minutes:block,reason,instruction:'Read selected key points, compare mechanisms, then answer one retrieval question.',source:source(c)});remaining-=block;}
 steps.push({kind:'check',minutes:remaining,instruction:'Answer a stored practice question and explain the mechanism behind the answer. Revisit errors next.'});
 return {day,minutes:Math.max(10,Math.min(240,minutes)),steps,coverage:daily.chapters,unfinishedDailyChapters:daily.chapters.filter(id=>!state.completed.includes(id)),note:'Short sessions cover a portion of the daily workload. Continue the remaining daily modules to preserve all 38 chapters across the week.'};
}
export function practiceItems(ids){return questionBank(book,ids).map(q=>({id:q.id,question:q.question,options:q.options,source:source(book.chapters.find(c=>c.id===q.chapter))}));}
export function gradeChoice(questionId,answer){const match=/^(\d+)-q([01])$/.exec(questionId);if(!match)return {error:'Invalid question identifier.'};const c=book.chapters.find(c=>c.id===Number(match[1]));const q=c?.quiz[Number(match[2])];if(!q)return {error:'Question not found.'};return {questionId,correct:answer.trim().toLowerCase()===q.answer.toLowerCase(),expectedAnswer:q.answer,rationale:q.rationale,source:source(c),note:'Exact option-text grading. Ask for the full option text if the learner gives an ambiguous letter or free-form answer.'};}
