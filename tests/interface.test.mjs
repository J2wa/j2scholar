// Headless code-level rendering checks. This is not a substitute for browser/layout QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import * as core from '../public/core.mjs';
import {book} from '../lib/study.mjs';
async function interfaceHarness(){
 const elements=new Map();
 const element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',style:{},addEventListener(){},focus(){},click(){}});return elements.get(id);};
 const storage=new Map();
 const context=vm.createContext({...core,console,URL,Blob,Date,Math,JSON,Number,String,Set,Map,Promise,Error,
 document:{querySelector:element,title:'',activeElement:null},
 localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
 location:{hash:'#overview',reload(){}},window:{scrollTo(){},addEventListener(){},open(){},print(){}},
 fetch:async()=>({ok:true,json:async()=>book}),setTimeout:()=>0,clearTimeout(){},confirm:()=>true});
 let code=await readFile(new URL('../public/app.js',import.meta.url),'utf8');code=code.replace(/^import[^\n]+\n/,'');
 await vm.runInContext('(async()=>{'+code+'\nglobalThis.harness={route,startQuiz,answer,quizView,startCards,flashcards,overview,modules,chapterView,progress,settings,getState:()=>state,getQuiz:()=>quiz,html:()=>app.innerHTML};})()',context);
 return {context,h:context.harness,elements};
}
test('all 38 chapter routes and study views render without code-level errors',async()=>{const {h,context}=await interfaceHarness();for(const c of book.chapters){h.chapterView(c.id);assert(h.html().includes(c.title.replace(/&/g,'&amp;')));assert(h.html().includes('data-action="chapter-quiz"'));assert(h.html().includes('PDF pp.'));}for(const route of ['overview','modules','flashcards','practice','progress','settings']){context.location.hash='#'+route;h.route();assert(h.html().includes('<main'));assert(!h.html().includes('undefined'));}});
test('practice answers update scored history using answer text after randomized ordering',async()=>{const {h,context}=await interfaceHarness();h.startQuiz([1]);context.location.hash='#quiz';h.route();const q=h.getQuiz().questions[0];h.answer(q.options.indexOf(q.answer));assert.equal(h.getState().attempts.length,1);assert.equal(h.getState().attempts[0].correct,true);assert(h.html().includes('Correct.'));h.answer(0);assert.equal(h.getState().attempts.length,1);});
test('exam-style answers remain pending until final submission',async()=>{const {h,context}=await interfaceHarness();h.startQuiz([1],'38-chapter mixed exam');context.location.hash='#quiz';h.route();const q=h.getQuiz().questions[0];h.answer(q.options.indexOf(q.answer));assert.equal(h.getState().attempts.length,0);assert.equal(h.getQuiz().answers.length,1);assert(!h.html().includes(q.rationale));});
