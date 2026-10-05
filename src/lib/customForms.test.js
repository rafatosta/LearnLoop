import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { newAdventure, chapters } from './adventure.js';
import { startForm } from './forms.js';
import { startCustomForm, answerCustomForm, expireCustomForm, recoverCustomForms, customHint, canCreateForm } from './customForms.js';
import { addJourney, selectJourney, activeJourney, loadJourneys, saveJourneys } from './journeys.js';
const bank=JSON.parse(fs.readFileSync(new URL('../content/adventure.json',import.meta.url))).questions;
const now=1000;
const fresh=completed=>({...newAdventure('Aki','capybara'),completed});
test('review is optional, gated by chapter completion and uses the same level mix',()=>{
 const locked=fresh(4);assert.equal(startCustomForm(locked,bank,0,'Minha forma',now),locked);
 for(let chapter=0;chapter<4;chapter++){
  const s=startCustomForm(fresh((chapter+1)*5),bank,chapter,'Minha forma',now,()=>.1);
  assert.equal(s.customForms.challenge.deadline,now+60000);
  assert.deepEqual(s.customForms.challenge.selected.map(id=>bank.find(q=>q.id===id).level),chapters[chapter].levels);
  assert.equal(new Set(s.customForms.challenge.selected).size,5);
  assert.equal(s.completed,(chapter+1)*5);
 }
});
test('five acertos create the named technique once without changing solar forms or forest',()=>{
 let s=startForm(fresh(10),bank,now,()=>.2);const solar=s.forms;
 s=startCustomForm(s,bank,1,'Dança das Cinzas',now,()=>.2);
 for(let i=0;i<5;i++){const q=bank.find(q=>q.id===s.customForms.challenge.queue[0].id);s=answerCustomForm(s,bank,q.answers[0],now+i);}
 assert.equal(s.customForms.created.length,1);assert.equal(s.customForms.created[0].name,'Dança das Cinzas');assert.equal(s.customForms.created[0].chapter,1);
 assert.equal(s.completed,10);assert.deepEqual(s.forms,solar);assert.equal(canCreateForm(s,1),false);
 assert.equal(answerCustomForm(s,bank,'anything',now+10),s);assert.equal(startCustomForm(s,bank,1,'Outra',now+11),s);
 assert.deepEqual(recoverCustomForms(s,bank,now+20),s);
});
test('minute deadline rejects late answer and retry keeps same chapter',()=>{
 let s=startCustomForm(fresh(5),bank,0,'Lanternas',now,()=>.3);
 const q=bank.find(q=>q.id===s.customForms.challenge.queue[0].id);
 s=answerCustomForm(s,bank,q.answers[0],now+60000);
 assert.equal(s.customForms.challenge.status,'lost');assert.equal(s.customForms.created.length,0);assert.equal(s.xp,0);
 s=startCustomForm(s,bank,0,'Lanternas',now+70000,()=>.8);
 assert.equal(s.customForms.challenge.deadline,now+130000);assert.equal(s.completed,5);
});
test('hint halves XP and persisted journey keeps creations and deadlines',()=>{
 let s=startCustomForm(fresh(5),bank,0,'Lanternas',now,()=>.4);s=customHint(s,now+1);
 const q=bank.find(q=>q.id===s.customForms.challenge.queue[0].id);s=answerCustomForm(s,bank,q.answers[0],now+2);assert.equal(s.xp,5);
 const collection=addJourney({version:1,activeId:null,journeys:[]},s,'one',now);
 const storage={data:'',setItem(k,v){this.data=v},getItem(){return this.data}};saveJourneys(storage,collection);
 assert.deepEqual(activeJourney(loadJourneys(storage,bank,now+500)),s);
 const switched=selectJourney(collection,'one',bank,now+61000);assert.equal(activeJourney(switched).customForms.challenge.status,'lost');
});
test('each of four chapters permits one independent named technique, even out of order',()=>{
 let s=fresh(20);
 for(const chapter of [3,0,2,1]){
  s=startCustomForm(s,bank,chapter,'Forma '+chapter,now,()=>.2);
  for(let i=0;i<5;i++){const q=bank.find(q=>q.id===s.customForms.challenge.queue[0].id);s=answerCustomForm(s,bank,q.answers[0],now+i);}
  assert.deepEqual(recoverCustomForms(s,bank,now+5),s);
 }
 assert.equal(s.customForms.created.length,4);assert.equal(s.completed,20);assert.equal(s.customForms.completed,4);
 assert.equal(expireCustomForm(null,now),null);
});
