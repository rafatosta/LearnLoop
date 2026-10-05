import { normalize } from './quiz.js';
import { shuffle, variant } from './adventure.js';
const names=['Valsa','Céu Azul Claro','Espelho Vermelho Carmesim','Falso Arco-Íris','Carruagem de Fogo','Sol Ardente','Lança do Girassol','Névoa de Calor','Pôr do Sol','Resplendor Gracioso','Dança do Dragão Solar','Dança das Chamas','Ciclo do Sol'];
const distributions=[[1,1,1,1,1],[1,1,1,1,2],[1,1,1,2,2],[1,1,2,2,2],[1,2,2,2,2],[2,2,2,2,2],[2,2,2,2,3],[2,2,2,3,3],[2,2,3,3,3],[3,3,3,3,3],[3,3,3,4,4],[3,3,4,4,4],[4,4,4,4,4]];
export const forms=names.map((name,id)=>({id,name,levels:distributions[id]}));
export const FORM_DURATION=30000;
export function formsProgress(state,key='forms'){return state?.[key]||{completed:0,challenge:null};}
export function startForm(state,bank,now=Date.now(),random=Math.random){
 const f=formsProgress(state);
 if(f.completed>=forms.length||f.challenge?.status==='running')return state;
 const chosen=[];const form=forms[f.completed];
 for(const level of form.levels){
  const q=shuffle(bank.filter(q=>q.level===level&&!chosen.includes(q.id)),random)[0];chosen.push(q.id);
 }
 const stage=Math.min(19,Math.floor(f.completed/3)*5);
 return {...state,forms:{...f,challenge:{form:form.id,deadline:now+FORM_DURATION,status:'running',selected:chosen,queue:chosen.map(id=>variant(bank.find(q=>q.id===id),state,stage,random)),solved:[],hintedIds:[],log:[],earnedXp:0}}};
}
export function expireForm(state,now=Date.now(),key='forms'){
 const f=formsProgress(state,key);const c=f.challenge;
 if(c?.status!=='running'||now<c.deadline)return state;
 return {...state,[key]:{...f,challenge:{...c,status:'lost'}}};
}
export function formHint(state,now=Date.now(),key='forms'){
 const checked=expireForm(state,now,key);const f=formsProgress(checked,key);const c=f.challenge;
 if(c?.status!=='running'||!c.queue.length||c.hintedIds.includes(c.queue[0].id))return checked;
 return {...checked,[key]:{...f,challenge:{...c,hintedIds:[...c.hintedIds,c.queue[0].id]}}};
}
export function answerForm(state,bank,answer,now=Date.now(),key='forms'){
 const checked=expireForm(state,now,key);const f=formsProgress(checked,key);const c=f.challenge;
 if(c?.status!=='running'||!c.queue.length||!answer.trim())return checked;
 const [item,...rest]=c.queue;const q=bank.find(q=>q.id===item.id);
 const correct=q.answers.some(a=>normalize(a)===normalize(answer));
 const earnedXp=correct?(c.hintedIds.includes(q.id)?5:10):0;
 const h=checked.history[q.id]||{attempts:0,correct:0,choice:0,write:0};
 const history={...checked.history,[q.id]:{...h,attempts:h.attempts+1,correct:h.correct+(correct?1:0),[item.mode]:h[item.mode]+(correct?1:0),lastMode:item.mode,lastLanguage:item.language}};
 const queue=correct?rest:[...rest,{...item,mode:item.mode==='choice'?'write':'choice',language:item.language==='pt'?'en':'pt',retries:item.retries+1}];
 const won=queue.length===0;
 return {...checked,history,xp:checked.xp+earnedXp,attempts:checked.attempts+1,mistakes:checked.mistakes+(correct?0:1),[key]:{...f,completed:f.completed+(won?1:0),challenge:{...c,queue,solved:correct?[...c.solved,q.id]:c.solved,status:won?'won':'running',earnedXp:c.earnedXp+earnedXp,log:[...c.log,{id:q.id,answer,correct,mode:item.mode,language:item.language,earnedXp}]}}};
}
export function recoverForms(state,bank,now=Date.now(),key='forms',checkSequence=true){
 if(!state||!state[key])return state;
 const reset=()=>({...state,[key]:{completed:0,challenge:null}});
 const f=state[key];
 if(!Number.isInteger(f.completed)||f.completed<0||f.completed>13)return reset();
 const c=f.challenge;
 if(!c)return state;
 const ids=new Set(bank.map(q=>q.id));
 if(!Number.isInteger(c.form)||c.form<0||c.form>12||!['running','won','lost'].includes(c.status)||!Number.isFinite(c.deadline)||!Number.isInteger(c.earnedXp)||c.earnedXp<0)return reset();
 if(!Array.isArray(c.selected)||c.selected.length!==5||new Set(c.selected).size!==5||c.selected.some(id=>!ids.has(id)))return reset();
 if(!Array.isArray(c.queue)||!Array.isArray(c.solved)||!Array.isArray(c.hintedIds)||!Array.isArray(c.log))return reset();
 if(c.queue.some(i=>!c.selected.includes(i.id)||!['choice','write'].includes(i.mode)||!['pt','en'].includes(i.language)||!Number.isInteger(i.retries)||i.retries<0))return reset();
 const union=[...c.queue.map(i=>i.id),...c.solved];
 if(union.length!==5||new Set(union).size!==5||union.some(id=>!c.selected.includes(id))||c.hintedIds.some(id=>!c.selected.includes(id)))return reset();
 if(c.log.some(l=>!c.selected.includes(l.id)||typeof l.answer!=='string'||typeof l.correct!=='boolean'||![0,5,10].includes(l.earnedXp)))return reset();
 if(c.status==='won'&&(c.solved.length!==5||c.queue.length||(checkSequence&&f.completed!==c.form+1)))return reset();
 if(c.status!=='won'&&((checkSequence&&f.completed!==c.form)||!c.queue.length))return reset();
 return expireForm(state,now,key);
}
