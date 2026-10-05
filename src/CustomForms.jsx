import React, { useEffect, useState } from 'react';
import content from './content/adventure.json';
import { chapters } from './lib/adventure';
import { customProgress, canCreateForm, startCustomForm, answerCustomForm, customHint } from './lib/customForms';
import { TimedChallenge, ChallengeReview } from './TimedChallenge';
export default function CustomForms({state,setState,chapter,onBack}){
 const [name,setName]=useState('');const f=customProgress(state);const c=f.challenge;
 const created=f.created.find(r=>r.chapter===chapter);
 const current=c?.form===chapter?c:null;
 useEffect(()=>{window.scrollTo(0,0);},[current?.status,chapter]);
 return <main className="forms-view"><button className="text-button" onClick={onBack}>← Voltar ao mapa</button><section className="forms-heading"><p className="kicker">REVISÃO OPCIONAL DO CAPÍTULO</p><h1>Crie sua <em>própria forma.</em></h1><p>{chapters[chapter].name} · cinco acertos em um minuto, com questões dos mesmos níveis deste capítulo.</p></section>
 {current?.status==='running'?<TimedChallenge challenge={current} title={current.name} subtitle="SUA NOVA TÉCNICA" duration={60000} onAnswer={answer=>setState(s=>answerCustomForm(s,content.questions,answer))} onHint={()=>setState(s=>customHint(s))}/>:<>
 {created?<section className="form-result won"><span className="form-seal">✦</span><p className="kicker">SUA FORMA FOI CRIADA</p><h2>{created.name}</h2><p>Você revisou o conteúdo de {chapters[chapter].name} e criou uma técnica própria nesta jornada.</p><button className="adventure-primary" onClick={onBack}>Continuar a aventura →</button></section>:canCreateForm(state,chapter)?<section className="form-start">{current?.status==='lost'&&<p>O minuto terminou. Revise as explicações e tente novamente.</p>}<h2>Qual será o nome da sua forma?</h2><label className="answer-label" htmlFor="custom-form-name">Nome da nova técnica</label><input id="custom-form-name" maxLength={50} value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Dança das Lanternas"/><p>O desafio é opcional. Ele não bloqueia a próxima fase. Erros voltam à fila; dicas reduzem o acerto para 5 XP.</p><button className="adventure-primary" disabled={!name.trim()||f.challenge?.status==='running'} onClick={()=>setState(s=>startCustomForm(s,content.questions,chapter,name))}>Começar desafio de 1 minuto →</button><button className="text-button" onClick={onBack}>Deixar para depois</button>{f.challenge?.status==='running'&&<p>Conclua o desafio de outro capítulo que está em andamento antes de começar este.</p>}</section>:<p className="journeys-intro">Conclua as cinco fases deste capítulo para desbloquear esta revisão.</p>}
 {current&&<ChallengeReview challenge={current}/>}</>}
 </main>;
}
