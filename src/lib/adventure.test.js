import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newAdventure,startBattle,answerBattle,continueBattle,loadAdventure,optionsFor,variant,stages,useHint} from './adventure.js';
const content=JSON.parse(fs.readFileSync(new URL('../content/adventure.json',import.meta.url),'utf8'));
const bank=content.questions;
function storage(s){return {getItem:()=>JSON.stringify(s)}}
test('120 unique bilingual questions, 30 per level and valid choices',()=>{
 assert.equal(bank.length,120);assert.equal(new Set(bank.map(q=>q.id)).size,120);
 for(let level=1;level<=4;level++)assert.equal(bank.filter(q=>q.level===level).length,30);
 for(const q of bank){assert.ok(q.promptPt&&q.promptEn&&q.explanation);assert.ok(optionsFor(q).includes(q.answers[0]));assert.equal(new Set(optionsFor(q)).size,4);}
});
test('stage draws five unique questions in prescribed levels and persists draw',()=>{
 const s=startBattle(newAdventure('Aki','water'),bank,()=>.1);
 assert.equal(new Set(s.battle.selected).size,5);
 assert.deepEqual(s.battle.selected.map(id=>bank.find(q=>q.id===id).level),stages[0].levels);
 assert.equal(startBattle(s,bank),s);
 assert.deepEqual(loadAdventure(storage(s),bank),s);
});
test('wrong choice returns as writing; feedback and attempts survive reload',()=>{
 let s=startBattle(newAdventure('Aki','water'),bank,()=>.1);
 const language=s.battle.queue[0].language;const id=s.battle.queue[0].id;assert.equal(s.battle.queue[0].mode,'choice');
 s=answerBattle(s,bank,'wrong');assert.equal(s.xp,0);assert.equal(s.completed,0);assert.equal(s.battle.solved.length,0);
 assert.deepEqual(loadAdventure(storage(s),bank),s);assert.equal(answerBattle(s,bank,'wrong'),s);
 s=continueBattle(s);assert.equal(s.battle.queue.at(-1).id,id);assert.equal(s.battle.queue.at(-1).mode,'write');assert.equal(s.battle.queue.at(-1).language,language==='pt'?'en':'pt');
 assert.equal(s.attempts,1);assert.equal(s.mistakes,1);
});
test('entire journey requires all five correct per stage and stops at twenty',()=>{
 let s=newAdventure('Aki','fire');
 for(let stage=0;stage<20;stage++){
  s=startBattle(s,bank,()=>.2);
  for(let i=0;i<5;i++){
   const q=bank.find(q=>q.id===s.battle.queue[0].id);
   s=answerBattle(s,bank,q.answers[0]);
   assert.equal(s.completed,stage);
   assert.deepEqual(loadAdventure(storage(s),bank),s);
   s=continueBattle(s);
  }
  assert.equal(s.completed,stage+1);assert.equal(s.battle,null);
 }
 assert.equal(s.xp,1500);assert.equal(s.attempts,100);assert.equal(startBattle(s,bank),s);
});
test('review after a prior choice is writing; high levels start written',()=>{
 const q=bank[0];const s=newAdventure('Aki','mist');
 s.history[q.id]={lastMode:'choice',lastLanguage:'pt',correct:1};
 assert.equal(variant(q,s,1,()=>.1).mode,'write');assert.equal(variant(q,s,1,()=>.1).language,'en');
 assert.equal(variant(bank.find(q=>q.level===4),newAdventure('Aki','mist'),16).mode,'write');
});
test('invalid or damaged local progress recovers without throwing',()=>{
 assert.equal(loadAdventure({getItem:()=>'{bad'},bank),null);
 assert.equal(loadAdventure(storage({...newAdventure('Aki','water'),completed:99}),bank),null);
 const s=startBattle(newAdventure('Aki','water'),bank,()=>.1);s.battle.queue[0].id='missing';assert.equal(loadAdventure(storage(s),bank),null);
});

test('hint halves XP, persists through reload and retries, and cannot change answered feedback',()=>{
 let s=startBattle(newAdventure('Aki','water'),bank,()=>.1);
 const q=bank.find(q=>q.id===s.battle.queue[0].id);
 s=useHint(s);assert.equal(useHint(s),s);
 assert.deepEqual(loadAdventure(storage(s),bank),s);
 s=answerBattle(s,bank,'wrong');assert.equal(s.xp,0);assert.equal(useHint(s),s);
 s=continueBattle(s);
 while(s.battle.queue[0].id!==q.id){const other=bank.find(q=>q.id===s.battle.queue[0].id);s=continueBattle(answerBattle(s,bank,other.answers[0]));}
 s=answerBattle(s,bank,q.answers[0]);assert.equal(s.battle.feedback.earnedXp,5);assert.equal(s.xp,45);
});
