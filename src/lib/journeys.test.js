import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { newAdventure, startBattle, answerBattle } from './adventure.js';
import { startForm } from './forms.js';
import { activeJourney, loadJourneys, addJourney, updateJourney, selectJourney, saveJourneys, JOURNEYS_KEY } from './journeys.js';
const bank=JSON.parse(fs.readFileSync(new URL('../content/adventure.json',import.meta.url))).questions;
function memory(){const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)}}
test('migrates existing adventure including pending feedback without wiping it',()=>{
 const storage=memory();let s=startBattle(newAdventure('Aki','water'),bank,()=>.1);
 const q=bank.find(q=>q.id===s.battle.queue[0].id);s=answerBattle(s,bank,q.answers[0]);
 storage.setItem('learnloop-adventure-v1',JSON.stringify(s));const c=loadJourneys(storage,bank,1000);
 assert.deepEqual(activeJourney(c),s);saveJourneys(storage,c);
 assert.deepEqual(loadJourneys(storage,bank,1001),c);
});
test('new journeys and switching retain independent XP, characters and progress',()=>{
 let c={version:1,activeId:null,journeys:[]};
 c=addJourney(c,{...newAdventure('Primeira','capybara'),xp:120,completed:2},'one',1000);
 const first=activeJourney(c);
 c={...c,activeId:null};c=addJourney(c,newAdventure('Segunda','robot-red'),'two',2000);
 c=updateJourney(c,s=>({...s,xp:30}),2500);
 assert.equal(activeJourney(c).xp,30);
 c=selectJourney(c,'one',bank,3000);assert.deepEqual(activeJourney(c),first);
 assert.equal(c.journeys.length,2);assert.equal(c.journeys[1].adventure.xp,30);
 const storage=memory();saveJourneys(storage,c);assert.deepEqual(loadJourneys(storage,bank,3001),c);
});
test('leaving active selection empty survives reload and never restores deleted legacy selection',()=>{
 const storage=memory();let c=addJourney({version:1,activeId:null,journeys:[]},newAdventure('Aki','water'),'one',1);
 c={...c,activeId:null};saveJourneys(storage,c);
 const restored=loadJourneys(storage,bank,2);assert.equal(activeJourney(restored),null);assert.equal(restored.journeys.length,1);
});
test('switching journeys cannot pause or reset a timed form',()=>{
 let c=addJourney({version:1,activeId:null,journeys:[]},startForm(newAdventure('Aki','water'),bank,1000,()=>.1),'one',1000);
 c=addJourney(c,newAdventure('Outra','dog'),'two',2000);
 c=selectJourney(c,'one',bank,32000);
 assert.equal(activeJourney(c).forms.challenge.status,'lost');assert.equal(activeJourney(c).forms.challenge.deadline,31000);
 assert.equal(c.journeys[1].adventure.name,'Outra');
});
test('invalid selections do not modify data and save failures surface to the caller',()=>{
 const c=addJourney({version:1,activeId:null,journeys:[]},newAdventure('Aki','water'),'one',1);
 assert.equal(selectJourney(c,'missing',bank),c);assert.equal(updateJourney(c,s=>s),c);
 assert.throws(()=>saveJourneys({setItem:()=>{throw new Error('quota')}},c));
 assert.equal(loadJourneys({getItem:()=>'{bad'},bank).journeys.length,0);
});
