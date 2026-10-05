import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, answerSession, advanceSession, loadProgress, normalize } from './quiz.js';
const questions=[{id:'a',answers:['went']},{id:'b',answers:["didn't go"]}];
test('errors return to queue and completion requires every correct answer',()=>{
 let s=createSession(questions);
 s=answerSession(s,questions[0],'go');assert.equal(s.mastered.length,0);assert.equal(s.mistakes,1);
 assert.deepEqual(advanceSession(s).queue,['b','a']);s=advanceSession(s);
 s=advanceSession(answerSession(s,questions[1],"DIDN’T go."));assert.deepEqual(s.queue,['a']);
 s=answerSession(s,questions[0],'went');assert.equal(s.score,20);assert.equal(s.attempts,3);
 assert.equal(answerSession(s,questions[0],'went'),s);s=advanceSession(s);assert.deepEqual(s.queue,[]);assert.equal(s.mastered.length,2);
});
test('reload preserves pending feedback without awarding duplicate points',()=>{
 const s=answerSession(createSession(questions),questions[0],'went');
 const storage={getItem:()=>JSON.stringify({version:1,sessions:{m:s}})};
 assert.deepEqual(loadProgress(storage,[{id:'m',questions}],1).m,s);
 assert.deepEqual(advanceSession(s).queue,['b']);
});
test('corrupt storage and changed content safely start fresh',()=>{
 assert.deepEqual(loadProgress({getItem:()=>'{bad'},[],1),{});
 assert.deepEqual(loadProgress({getItem:()=>JSON.stringify({version:0,sessions:{}})},[],1),{});
 assert.equal(normalize('  Yes, she WAS! '),'yes she was');
});
