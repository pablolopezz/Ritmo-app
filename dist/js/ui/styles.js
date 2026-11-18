import { defaultAppearance,normalizeAppearance } from './appearance.js';
export const stylePresets=[
  {id:'ritmo',name:'Ritmo',settings:{}},
  {id:'ocean',name:'Océano',settings:{background:'#10243d',backgroundMode:'gradient',gradientEnd:'#18545e',accent:'#8fddea',corners:'rounded'}},
  {id:'sunset',name:'Atardecer',settings:{theme:'light',background:'#f2cfbb',backgroundMode:'gradient',gradientEnd:'#e4b5d6',accent:'#9e3558',cardColor:'#fff8f2',corners:'pill'}},
  {id:'forest',name:'Bosque',settings:{background:'#102b22',accent:'#c2df9b',cardColor:'#1b332a',pattern:'dots'}},
  {id:'paper',name:'Papel',settings:{theme:'light',background:'#eee7d8',cardColor:'#fffdf5',accent:'#313f43',font:'serif',corners:'soft',shadow:'none',glass:'reduced'}},
  {id:'neon',name:'Neón',settings:{background:'#100f20',backgroundMode:'gradient',gradientEnd:'#272044',accent:'#c5fa77',cardColor:'#201c30',pattern:'grid',corners:'soft'}},
  {id:'minimal',name:'Minimal',settings:{theme:'light',background:'#f4f4f4',cardColor:'#ffffff',accent:'#202020',glass:'reduced',corners:'square',buttonShape:'square',shadow:'none'}},
  {id:'space',name:'Espacio',settings:{background:'#0c1328',accent:'#b9b5ff',pattern:'dots',font:'mono',corners:'soft',buttonStyle:'outline'}}
];
export function presetAppearance(id) {const preset=stylePresets.find(p=>p.id===id);if(!preset)throw new Error('No se encuentra ese estilo.');return normalizeAppearance({...defaultAppearance(),...preset.settings});}
function validSettings(raw) {
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('El estilo no tiene ajustes válidos.');
  const normalized=normalizeAppearance(raw);
  for(const [key,value] of Object.entries(raw))if(key in normalized&&(typeof normalized[key]==='number'?normalized[key]!==value:normalized[key]!==String(value).toLowerCase()))throw new Error('El estilo contiene ajustes no válidos.');
  return normalized;
}
export function parseAppearanceFile(text) {
  const file=JSON.parse(text);
  if(file?.format!=='ritmo-appearance'||file.version!==1)throw new Error('Selecciona un archivo de estilo de Ritmo.');
  return validSettings(file.preferences);
}
export const serializeAppearance=preferences=>JSON.stringify({format:'ritmo-appearance',version:1,preferences:validSettings(preferences)},null,2);
export function readSavedStyles(storage) {
  try {
    const saved=JSON.parse(storage.getItem('ritmo-saved-styles')||'[]');
    if(!Array.isArray(saved))return [];
    return saved.slice(0,12).filter(s=>s&&typeof s.id==='string'&&/^[\w-]{1,100}$/.test(s.id)&&typeof s.name==='string'&&s.name.trim()&&s.name.length<=40).flatMap(s=>{try{return [{id:s.id,name:s.name,preferences:validSettings(s.preferences)}];}catch{return [];}});
  } catch {return [];}
}
export function saveNamedStyle(storage,{id,name,preferences}) {
  name=String(name).trim();if(!name||name.length>40)throw new Error('Pon un nombre de entre 1 y 40 caracteres.');
  const saved=readSavedStyles(storage);if(saved.length>=12)throw new Error('Puedes guardar hasta 12 estilos. Elimina uno para añadir otro.');
  const next=[...saved,{id,name,preferences:validSettings(preferences)}];storage.setItem('ritmo-saved-styles',JSON.stringify(next));return next;
}
export function removeNamedStyle(storage,id) {const next=readSavedStyles(storage).filter(s=>s.id!==id);storage.setItem('ritmo-saved-styles',JSON.stringify(next));return next;}

export const appearanceGroups={
  background:['background','backgroundMode','gradientEnd','gradientAngle','pattern'],
  buttons:['accent','buttonStyle','buttonShape','buttonHeight'],
  logo:['logoMode','logoColor','logoTile','logoSize','logoShape'],
  cards:['cardColor','corners','shadow','glass','opacity','blur','borderWidth','glassIntensity','glassMotion'],
  text:['font','textSize','spacing','lineHeight','textWeight','contentWidth']
};
export function resetAppearanceGroup(preferences,group) {
  const keys=Object.hasOwn(appearanceGroups,group)?appearanceGroups[group]:null;if(!keys)throw new Error('Apartado de apariencia no válido.');
  const next=normalizeAppearance(preferences),defaults=defaultAppearance();
  for(const key of keys)next[key]=defaults[key];return next;
}
