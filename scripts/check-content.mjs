import assert from 'node:assert/strict';
import {book} from '../lib/study.mjs';
assert.equal(book.chapters.length,38);
assert.deepEqual(book.chapters.map(c=>c.id),Array.from({length:38},(_,i)=>i+1));
assert.deepEqual(book.days.flatMap(d=>d.chapters),book.chapters.map(c=>c.id));
for(const c of book.chapters){
 assert(c.title&&c.focus&&c.trap&&c.case.scenario&&c.case.question&&c.case.answer,`Incomplete chapter ${c.id}`);
 assert(c.points.length>=6&&c.rehab.length>=3&&c.drugs.length>=2,`Insufficient coverage ${c.id}`);
 assert.equal(c.flashcards.length,3);assert.equal(c.quiz.length,2);
 assert.equal(c.pdfPages[0],c.pages[0]+30);assert.equal(c.pdfPages[1],c.pages[1]+30);
 for(const q of c.quiz){assert(q.question&&q.rationale);assert.equal(q.distractors.length,3);assert.equal(new Set([q.answer,...q.distractors]).size,4);}
 assert(book.days[c.day-1].chapters.includes(c.id));
}
assert.equal(book.appendices.length,3);
console.log('Content verified: 38 chapters, 7 complete days, 114 flashcards, 76 unique-option questions, 3 appendix orientations.');
