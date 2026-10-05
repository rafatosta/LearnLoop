import React, { useEffect } from 'react';
import content from './content/adventure.json';
import { TimedChallenge, ChallengeReview } from './TimedChallenge';
import { forms, formsProgress, startForm, answerForm, formHint } from './lib/forms';
const bank=content.questions;
export default function Forms({state,setState,onBack}){

 const f=formsProgress(state);const c=f.challenge;
 useEffect(()=>{window.scrollTo(0,0);},[c?.status,c?.form]);
 const item=c?.queue[0];const q=bank.find(q=>q.id===item?.id);
 function start(){setState(s=>startForm(s,bank));}
 function answer(value){if(value.trim())setState(s=>answerForm(s,bank,value));}
 return <main className="forms-view"><button className="text-button" onClick={onBack}>← Voltar ao mapa</button><section className="forms-heading"><p className="kicker">TREINAMENTO DA RESPIRAÇÃO DO SOL</p><h1>Conquiste suas <em>13 formas.</em></h1><p>Uma trilha independente do mapa. Cinco acertos em 30 segundos: as questões ficam mais difíceis, o tempo permanece.</p><div className="forms-count">✦ {f.completed}/13 formas conquistadas</div></section>
 {c?.status==='running'&&q?<TimedChallenge challenge={c} title={forms[c.form].name} subtitle={`${c.form+1}ª FORMA`} onAnswer={answer} onHint={()=>setState(s=>formHint(s))}/>:
 <>{c&&<section className={'form-result '+(c.status==='won'?'won':'lost')} role="status"><span className="form-seal">{c.status==='won'?'✦':'↻'}</span><p className="kicker">{c.status==='won'?'NOVA TÉCNICA CONQUISTADA':'O TEMPO TERMINOU'}</p><h2>{c.status==='won'?forms[c.form].name:'Sua técnica precisa de mais uma volta.'}</h2><p>{c.solved.length}/5 acertos · {c.earnedXp} XP conquistados</p><p>{c.status==='won'?f.completed===13?'Você conquistou as 13 formas! Continue sua aventura no mapa.':'A próxima forma está disponível.':'Revise as explicações abaixo e tente a mesma forma com um novo sorteio.'}</p></section>}{f.completed<13&&<section className="form-start"><h2>{f.completed+1}ª Forma · {forms[f.completed].name}</h2><p>Níveis {Math.min(...forms[f.completed].levels)}{Math.min(...forms[f.completed].levels)!==Math.max(...forms[f.completed].levels)?'–'+Math.max(...forms[f.completed].levels):''} · cinco questões · 30 segundos no total.</p><p>Erros retornam à fila. Para conquistar a forma, acerte as cinco antes que o tempo acabe. Tradução e leitura ficam disponíveis; o relógio não para.</p><button className="adventure-primary" onClick={start}>{c?.status==='lost'?'Tentar novamente':'Começar desafio de 30 segundos'} →</button></section>}{c&&<ChallengeReview challenge={c}/>}</>}
 <section className="forms-collection" aria-label="Suas 13 formas">{forms.map(form=><div key={form.id} className={'form-tile '+(form.id<f.completed?'earned':form.id===f.completed?'available':'locked')}><span>{form.id<f.completed?'✦':String(form.id+1).padStart(2,'0')}</span><h3>{form.name}</h3><small>{form.id<f.completed?'Conquistada':form.id===f.completed?'Próxima conquista':'Conquiste a forma anterior'}</small></div>)}</section></main>;
}
