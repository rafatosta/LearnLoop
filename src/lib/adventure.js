import { normalize } from './quiz.js';
export const avatars = [
  { id: 'water', name: 'Água', symbol: '波', color: '#62b9d7', motto: 'Calma para observar. Coragem para agir.' },
  { id: 'fire', name: 'Fogo', symbol: '炎', color: '#e99050', motto: 'Cada tentativa alimenta sua chama.' },
  { id: 'wind', name: 'Vento', symbol: '風', color: '#8dcaa0', motto: 'Aprenda, adapte-se e siga adiante.' },
  { id: 'mist', name: 'Névoa', symbol: '霧', color: '#b5a6e5', motto: 'A clareza chega com a prática.' },
];
export const chapters = [
  { name: 'A floresta das lanternas', subtitle: 'Encontre sua respiração', rank: 'Aprendiz', levels: [1,1,1,1,2], enemies: ['Sombra dos bambus', 'Espírito da trilha', 'Guardião da ponte', 'Eco da floresta', 'Sentinela das lanternas'] },
  { name: 'O vale das cinzas', subtitle: 'Transforme prática em força', rank: 'Iniciado', levels: [1,1,2,2,2], enemies: ['Máscara de cinzas', 'Vulto do vale', 'Espectro do rio', 'Vigia das ruínas', 'Guardião das brasas'] },
  { name: 'A montanha da névoa', subtitle: 'Domine sua técnica', rank: 'Caçador', levels: [2,2,3,3,3], enemies: ['Sombra da encosta', 'Demônio da neblina', 'Eco do penhasco', 'Vigia da tempestade', 'Senhor da névoa'] },
  { name: 'A fortaleza do eclipse', subtitle: 'Seu último grande desafio', rank: 'Elite', levels: [3,3,4,4,4], enemies: ['Sentinela do eclipse', 'Máscara da noite', 'Guardião do portão', 'Sombra da torre', 'Demônio do eclipse'] },
];
export const stages = chapters.flatMap((c, chapter)=>c.enemies.map((enemy,i)=>({id:chapter*5+i,chapter,enemy,boss:i===4,levels:i===4&&chapter===3?[4,4,4,4,4]:c.levels})));
export function newAdventure(name,avatar){return {version:1,name:name.trim().slice(0,30),avatar,completed:0,xp:0,attempts:0,mistakes:0,history:{},battle:null};}
export function shuffle(values,random=Math.random){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function variant(question,state,stage,random=Math.random){
  const h=state.history[question.id];
  // A prior choice attempt becomes writing, even when it was incorrect.
  const mode=h?.lastMode==='choice' || question.level>=3 ? 'write' : h?.lastMode==='write' ? 'choice' : random() < .65 ? 'choice' : 'write';
  const englishChance=[.15,.4,.7,.9][Math.floor(stage/5)];
  const language=question.level===4 || h?.lastLanguage==='pt' && h.correct>0 ? 'en' : random()<englishChance?'en':'pt';
  return {id:question.id,mode,language,retries:0};
}
export function startBattle(state,bank,random=Math.random){
  if(state.battle || state.completed>=20)return state;
  const stage=stages[state.completed];const chosen=[];
  for(const level of stage.levels){
    const pool=bank.filter(q=>q.level===level&&!chosen.includes(q.id));
    // Mix review of prior questions with new or less practiced questions.
    const reviews=pool.filter(q=>state.history[q.id]);
    const unseen=pool.filter(q=>!state.history[q.id]);
    const candidates=reviews.length&&random()<.4?reviews:unseen.length?unseen:pool;
    chosen.push(shuffle(candidates,random)[0].id);
  }
  return {...state,battle:{stage:stage.id,selected:chosen,queue:chosen.map(id=>variant(bank.find(q=>q.id===id),state,stage.id,random)),solved:[],feedback:null}};
}
export function optionsFor(question){
  // Stable order across reloads and retries; never expose an answer always at position one.
  const options=[question.answers[0],...question.distractors.filter(d=>!question.answers.some(a=>normalize(a)===normalize(d)))].slice(0,4);
  const offset=Array.from(question.id).reduce((n,c)=>n+c.charCodeAt(0),0)%options.length;
  return options.slice(offset).concat(options.slice(0,offset));
}
export function useHint(state){
  const b=state.battle;
  if(!b||b.feedback||!b.queue.length)return state;
  const id=b.queue[0].id;
  if(b.hintedIds?.includes(id))return state;
  return {...state,battle:{...b,hintedIds:[...(b.hintedIds||[]),id]}};
}
export function answerBattle(state,bank,answer){
  const b=state.battle;if(!b||b.feedback||!b.queue.length)return state;
  const item=b.queue[0];const q=bank.find(q=>q.id===item.id);
  const correct=q.answers.some(a=>normalize(a)===normalize(answer));
  const h=state.history[q.id]||{attempts:0,correct:0,choice:0,write:0};
  const history={...state.history,[q.id]:{...h,attempts:h.attempts+1,correct:h.correct+(correct?1:0),[item.mode]:h[item.mode]+(correct?1:0),lastMode:item.mode,lastLanguage:item.language}};
  return {...state,history,attempts:state.attempts+1,mistakes:state.mistakes+(correct?0:1),xp:state.xp+(correct?(b.hintedIds?.includes(q.id)?5:10):0),battle:{...b,feedback:{correct,answer,earnedXp:correct?(b.hintedIds?.includes(q.id)?5:10):0},solved:correct?[...b.solved,q.id]:b.solved}};
}
export function continueBattle(state){
  const b=state.battle;if(!b?.feedback)return state;
  const [item,...rest]=b.queue;
  const queue=b.feedback.correct?rest:[...rest,{...item,mode:item.mode==='choice'?'write':'choice',language:item.language==='pt'?'en':'pt',retries:item.retries+1}];
  // Persist victory before navigating away, so replaying cannot award another victory.
  return queue.length?{...state,battle:{...b,queue,feedback:null}}:{...state,completed:state.completed+1,battle:null,xp:state.xp+25};
}
export const STORAGE_KEY='learnloop-adventure-v1';
export function loadAdventure(storage,bank){
  try{
    const s=JSON.parse(storage.getItem(STORAGE_KEY));
    if(!s)return null;
    if(s.version!==1||typeof s.name!=='string'||!s.name.trim()||!avatars.some(a=>a.id===s.avatar)||!Number.isInteger(s.completed)||s.completed<0||s.completed>20)return null;
    if(![s.xp,s.attempts,s.mistakes].every(n=>Number.isInteger(n)&&n>=0)||!s.history||typeof s.history!=='object')return null;
    const ids=new Set(bank.map(q=>q.id));
    for(const [id,h] of Object.entries(s.history))if(!ids.has(id)||![h.attempts,h.correct,h.choice,h.write].every(n=>Number.isInteger(n)&&n>=0)||!['choice','write'].includes(h.lastMode)||!['pt','en'].includes(h.lastLanguage))return null;
    if(s.battle){const b=s.battle;
      if(b.stage!==s.completed||!Array.isArray(b.selected)||b.selected.length!==5||new Set(b.selected).size!==5||b.selected.some(id=>!ids.has(id))||!Array.isArray(b.queue)||!b.queue.length||!Array.isArray(b.solved))return null;
      if(b.queue.some(i=>!b.selected.includes(i.id)||!['write','choice'].includes(i.mode)||!['pt','en'].includes(i.language)||!Number.isInteger(i.retries)||i.retries<0))return null;
      const union=[...b.queue.map(i=>i.id),...b.solved.filter(id=>id!==(b.feedback?.correct?b.queue[0].id:null))];
      if(union.length!==5||new Set(union).size!==5||union.some(id=>!b.selected.includes(id)))return null;
      if(b.hintedIds && (!Array.isArray(b.hintedIds)||b.hintedIds.some(id=>!b.selected.includes(id))))return null;
      if(b.feedback&&(typeof b.feedback.correct!=='boolean'||typeof b.feedback.answer!=='string'))return null;
    }
    return s;
  }catch{return null;}
}
