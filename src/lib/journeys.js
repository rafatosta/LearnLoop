import { loadAdventure } from './adventure.js';
import { recoverForms } from './forms.js';
import { recoverCustomForms } from './customForms.js';
export const JOURNEYS_KEY='learnloop-journeys-v1';
export function activeJourney(collection){return collection.journeys.find(j=>j.id===collection.activeId)?.adventure||null;}
export function loadJourneys(storage,bank,now=Date.now()){
 let raw;
 try{raw=JSON.parse(storage.getItem(JOURNEYS_KEY));}catch{}
 if(raw?.version===1&&Array.isArray(raw.journeys)){
  const ids=new Set();const journeys=[];
  for(const j of raw.journeys){
   if(typeof j.id!=='string'||ids.has(j.id)||!Number.isFinite(j.createdAt)||!Number.isFinite(j.updatedAt))continue;
   const adventure=recoverCustomForms(recoverForms(loadAdventure({getItem:()=>JSON.stringify(j.adventure)},bank),bank,now),bank,now);
   if(!adventure)continue;
   ids.add(j.id);journeys.push({...j,adventure});
  }
  return {version:1,activeId:ids.has(raw.activeId)?raw.activeId:null,journeys};
 }
 const legacy=recoverCustomForms(recoverForms(loadAdventure(storage,bank),bank,now),bank,now);
 return {version:1,activeId:legacy?'legacy':null,journeys:legacy?[{id:'legacy',createdAt:now,updatedAt:now,adventure:legacy}]:[]};
}
export function addJourney(collection,adventure,id=crypto.randomUUID(),now=Date.now()){
 if(collection.journeys.some(j=>j.id===id))throw new Error('Identificador de jornada repetido');
 return {...collection,activeId:id,journeys:[...collection.journeys,{id,createdAt:now,updatedAt:now,adventure}]};
}
export function updateJourney(collection,update,now=Date.now()){
 const current=activeJourney(collection);if(!current)return collection;
 const next=typeof update==='function'?update(current):update;
 if(!next||next===current)return collection;
 return {...collection,journeys:collection.journeys.map(j=>j.id===collection.activeId?{...j,adventure:{...next,avatar:current.avatar},updatedAt:now}:j)};
}
export function selectJourney(collection,id,bank,now=Date.now()){
 if(!collection.journeys.some(j=>j.id===id))return collection;
 return {...collection,activeId:id,journeys:collection.journeys.map(j=>j.id===id?{...j,adventure:recoverCustomForms(recoverForms(j.adventure,bank,now),bank,now)}:j)};
}
export function saveJourneys(storage,collection){storage.setItem(JOURNEYS_KEY,JSON.stringify(collection));}
