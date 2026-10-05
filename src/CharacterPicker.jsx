import React from 'react';
import { avatars } from './lib/adventure';
import Avatar from './Avatar';
export function CharacterPicker({selected,onSelect}) {
 return <div className="character-picker">{[['human','Caçadores e aprendizes'],['animal','Companheiros animais'],['robot','Robôs · inspirados em Transformers']].map(([group,title])=><section key={group}><h3>{title}</h3><div className="character-grid">{avatars.filter(a=>a.group===group).map(a=><button type="button" key={a.id} aria-pressed={selected===a.id} onClick={()=>onSelect(a.id)} className={selected===a.id?'chosen':''} style={{'--avatar-color':a.color}}><Avatar avatar={a.id}/><span>{a.name}</span><small>{a.description}</small></button>)}</div></section>)}</div>;
}
