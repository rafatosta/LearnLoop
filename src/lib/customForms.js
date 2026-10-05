import { chapters, shuffle, variant } from './adventure.js';
import { formsProgress, answerForm, expireForm, formHint, recoverForms } from './forms.js';
export const CUSTOM_DURATION=60000;
export const customProgress=s=>({...formsProgress(s,'customForms'),created:s?.customForms?.created||[]});
export const canCreateForm=(s,chapter)=>Number.isInteger(chapter)&&chapter>=0&&chapter<4&&s.completed>=(chapter+1)*5&&!customProgress(s).created.some(f=>f.chapter===chapter);
export function startCustomForm(state,bank,chapter,name,now=Date.now(),random=Math.random){
 const f=customProgress(state);
 if(!canCreateForm(state,chapter)||f.challenge?.status==='running'||!name.trim())return state;
 const selected=[];
 for(const level of chapters[chapter].levels){const q=shuffle(bank.filter(q=>q.level===level&&!selected.includes(q.id)),random)[0];selected.push(q.id);}
 return {...state,customForms:{...f,challenge:{form:chapter,name:name.trim().slice(0,50),duration:CUSTOM_DURATION,deadline:now+CUSTOM_DURATION,status:'running',selected,queue:selected.map(id=>variant(bank.find(q=>q.id===id),state,chapter*5,random)),solved:[],hintedIds:[],log:[],earnedXp:0}}};
}
export function answerCustomForm(state,bank,answer,now=Date.now()){
 const next=answerForm(state,bank,answer,now,'customForms');
 if(next===state)return state;
 const c=next.customForms.challenge;
 if(c.status!=='won'||state.customForms.challenge.status==='won')return next;
 return {...next,customForms:{...next.customForms,created:[...customProgress(state).created,{chapter:c.form,name:c.name,createdAt:now}]}};
}
export const expireCustomForm=(s,now=Date.now())=>expireForm(s,now,'customForms');
export const customHint=(s,now=Date.now())=>formHint(s,now,'customForms');
export function recoverCustomForms(state,bank,now=Date.now()){
 if(!state?.customForms)return state;
 const f=state.customForms;
 const reset=()=>({...state,customForms:{completed:0,created:[],challenge:null}});
 if(!Array.isArray(f.created)||f.created.some(r=>!Number.isInteger(r.chapter)||r.chapter<0||r.chapter>3||state.completed<(r.chapter+1)*5||typeof r.name!=='string'||!r.name.trim()||!Number.isFinite(r.createdAt))||new Set(f.created.map(r=>r.chapter)).size!==f.created.length||f.completed!==f.created.length)return reset();
 const c=f.challenge;
 if(c&&(c.form>3||state.completed<(c.form+1)*5||typeof c.name!=='string'||!c.name.trim()||c.duration!==CUSTOM_DURATION))return reset();
 return recoverForms(state,bank,now,'customForms',false);
}
