import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { newAdventure, loadAdventure } from './adventure.js';
import { forms, startForm, answerForm, expireForm, recoverForms, formHint } from './forms.js';
const bank=JSON.parse(fs.readFileSync(new URL('../content/adventure.json',import.meta.url))).questions;
const fresh=()=>newAdventure('Aki','fire');
const now=100000;
test('five random unique questions use the form levels and a fixed 30 second deadline',()=>{
 const s=startForm(fresh(),bank,now,()=>.1);
 assert.equal(s.forms.challenge.deadline,now+30000);
 assert.equal(new Set(s.forms.challenge.selected).size,5);
 assert.deepEqual(s.forms.challenge.selected.map(id=>bank.find(q=>q.id===id).level),forms[0].levels);
 assert.equal(startForm(s,bank,now+5000),s);
});
test('five correct answers unlock exactly one form without changing forest progress',()=>{
 let s=startForm(fresh(),bank,now,()=>.2);
 for(let i=0;i<5;i++){const q=bank.find(q=>q.id===s.forms.challenge.queue[0].id);s=answerForm(s,bank,q.answers[0],now+i*1000);}
 assert.equal(s.forms.completed,1);assert.equal(s.forms.challenge.status,'won');assert.equal(s.completed,0);assert.equal(s.xp,50);
 assert.equal(answerForm(s,bank,'anything',now+6000),s);
 const next=startForm(s,bank,now+10000,()=>.3);assert.equal(next.forms.challenge.form,1);assert.equal(next.forms.challenge.deadline,now+40000);
});
test('deadline rejects answers even without a timer render; replay retains previous achievements',()=>{
 let s={...fresh(),forms:{completed:4,challenge:null}};
 s=startForm(s,bank,now,()=>.3);const q=bank.find(q=>q.id===s.forms.challenge.queue[0].id);
 assert.equal(expireForm(s,now+29999),s);
 s=answerForm(s,bank,q.answers[0],now+30000);
 assert.equal(s.forms.challenge.status,'lost');assert.equal(s.xp,0);assert.equal(s.forms.completed,4);
 const retry=startForm(s,bank,now+40000,()=>.8);
 assert.equal(retry.forms.challenge.form,4);assert.equal(retry.forms.completed,4);assert.equal(retry.forms.challenge.deadline,now+70000);
});
test('reload preserves deadline and expires a challenge missed while away',()=>{
 const s=startForm(fresh(),bank,now,()=>.4);
 const reloaded=loadAdventure({getItem:()=>JSON.stringify(s)},bank);
 assert.deepEqual(recoverForms(reloaded,bank,now+15000),s);
 assert.equal(recoverForms(reloaded,bank,now+31000).forms.challenge.status,'lost');
});
test('wrong answer switches format and all explanations remain available through log',()=>{
 let s=startForm(fresh(),bank,now,()=>.4);const item=s.forms.challenge.queue[0];
 s=answerForm(s,bank,'wrong',now+1);
 assert.equal(s.forms.challenge.queue.at(-1).id,item.id);
 assert.notEqual(s.forms.challenge.queue.at(-1).mode,item.mode);
 assert.equal(s.forms.challenge.log[0].correct,false);assert.equal(s.forms.completed,0);assert.equal(s.xp,0);
});
test('hint halves XP and survives persisted state',()=>{
 let s=startForm(fresh(),bank,now,()=>.4);s=formHint(s,now+1);
 const q=bank.find(q=>q.id===s.forms.challenge.queue[0].id);
 assert.deepEqual(recoverForms(JSON.parse(JSON.stringify(s)),bank,now+2),s);
 s=answerForm(s,bank,q.answers[0],now+3);assert.equal(s.xp,5);assert.equal(s.forms.challenge.log[0].earnedXp,5);
});
test('all thirteen forms can be earned, final challenge contains only level four',()=>{
 let s=fresh();
 for(let i=0;i<13;i++){
  s=startForm(s,bank,now,()=>.2);
  if(i===12)assert.ok(s.forms.challenge.selected.every(id=>bank.find(q=>q.id===id).level===4));
  for(let j=0;j<5;j++){const q=bank.find(q=>q.id===s.forms.challenge.queue[0].id);s=answerForm(s,bank,q.answers[0],now+j);}
  assert.equal(s.forms.completed,i+1);
  assert.deepEqual(recoverForms(s,bank,now+5),s);
 }
 assert.equal(startForm(s,bank,now),s);assert.equal(s.completed,0);
});
test('legacy progress is preserved and invalid forms do not wipe the adventure',()=>{
 const old={...fresh(),completed:5};assert.equal(recoverForms(old,bank,now),old);
 const recovered=recoverForms({...old,forms:{completed:99}},bank,now);
 assert.equal(recovered.completed,5);assert.equal(recovered.forms.completed,0);
 assert.equal(expireForm(null,now),null);
});
