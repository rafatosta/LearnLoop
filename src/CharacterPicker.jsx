import React, { useEffect, useRef } from 'react';
import { avatars } from './lib/adventure';
import Avatar from './Avatar';
export function CharacterPicker({selected,onSelect}) {
 return <div className="character-picker">{[['human','Caçadores e aprendizes'],['animal','Companheiros animais'],['robot','Robôs · inspirados em Transformers']].map(([group,title])=><section key={group}><h3>{title}</h3><div className="character-grid">{avatars.filter(a=>a.group===group).map(a=><button type="button" key={a.id} aria-pressed={selected===a.id} onClick={()=>onSelect(a.id)} className={selected===a.id?'chosen':''} style={{'--avatar-color':a.color}}><Avatar avatar={a.id}/><span>{a.name}</span><small>{a.description}</small></button>)}</div></section>)}</div>;
}
export function CharacterDialog({selected,onSelect,onClose}) {
 const ref=useRef(null);
 useEffect(()=>{ref.current.showModal();},[]);
 return <dialog ref={ref} className="character-dialog" aria-labelledby="character-title" onCancel={onClose}><div className="character-dialog-title"><div><p className="kicker">SEU COMPANHEIRO DE AVENTURA</p><h2 id="character-title">Escolha seu personagem</h2></div><button className="text-button" onClick={onClose} aria-label="Fechar seleção de personagem">✕</button></div><p className="character-note">Troque a aparência quando quiser. Seu nome, XP, fases e formas continuam salvos.</p><CharacterPicker selected={selected} onSelect={onSelect}/><button className="adventure-primary" onClick={onClose}>Continuar minha aventura →</button></dialog>;
}
