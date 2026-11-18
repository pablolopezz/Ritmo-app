import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultAppearance,normalizeAppearance,readAppearance,currentAppearance,applyAppearance,appearancePalette,contrastText,contrastRatio,readableAccent,brandFavicon } from '../dist/js/ui/appearance.js';
import { personalizationView } from '../dist/js/ui/personalization.js';

test('Personalización: guarda y recupera colores, tamaño, movimiento y pantalla inicial',()=>{
 const p={...defaultAppearance(),theme:'light',background:'#ffeeaa',accent:'#b633cc',textSize:'large',motion:'reduced',start:'train'};
 const storage={getItem:key=>key==='ritmo-personalization'?JSON.stringify(p):null};assert.deepEqual(readAppearance(storage),p);
});
test('Personalización: valores manipulados y JSON roto vuelven a opciones seguras',()=>{
 const p=normalizeAppearance({background:'url(javascript:alert(1))',accent:'red;display:none',textSize:'huge',start:'https://x',motion:'fast'});assert.deepEqual(p,defaultAppearance());
 const storage={getItem:key=>key==='ritmo-personalization'?'{':key==='theme'?'light':null};assert.equal(readAppearance(storage).theme,'light');
});
test('Colores: contraste de botones y acentos de texto con ambos temas',()=>{
 for(const color of ['#000000','#ffffff','#ff0000','#0000ff','#ffff00','#00ff00','#888888','#a7edc5']) {
  assert.ok(contrastRatio(color,contrastText(color))>=4.5);
  for(const theme of ['dark','light']){const p=appearancePalette({...defaultAppearance(),theme,accent:color,background:'#ff00ff'});assert.ok(contrastRatio(p.accent,p.surface)>=4.5);assert.ok(contrastRatio(p.pageText,p.background)>=4.5);assert.ok(contrastRatio(p.pageAccent,p.background)>=4.5);}
 }
 assert.equal(readableAccent('#ffffff','#000000'),'#ffffff');
});
test('Pantalla de personalización: paletas, colores libres, texto grande, reinicio y pantalla de entrada',()=>{
 const html=personalizationView({...defaultAppearance(),background:'#ffeedd',start:'train'});
 for(const id of ['appearance-background','appearance-accent','appearance-text-size','appearance-start','glass-effects','appearance-reduce-motion'])assert.ok(html.includes(`id="${id}"`));
 assert.match(html,/data-action="reset-appearance"/);assert.match(html,/value="#ffeedd"/);assert.match(html,/value="train" selected/);
});
test('Aplicación de preferencias: estilos locales, persistencia y restablecer sin tocar datos de salud',()=>{
 const properties=new Map(),storage=new Map([['app-state','keep']]);let detail;
 const descriptors=new Map();const replace=(key,value)=>{descriptors.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});};
 replace('document',{documentElement:{dataset:{},style:{setProperty:(k,v)=>properties.set(k,v),removeProperty:k=>properties.delete(k)}},querySelector:()=>({content:''})});
 replace('localStorage',{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)||null});
 replace('window',{dispatchEvent:event=>{detail=event.detail;}});replace('CustomEvent',class {constructor(type,args){this.detail=args.detail;}});
 try {
  const p={...defaultAppearance(),background:'#112233',accent:'#ffcc00',textSize:'large',start:'menu'};
  assert.equal(applyAppearance(p),true);assert.equal(properties.get('--bg'),'#112233');assert.equal(properties.get('--logo-color'),'#ffcc00');assert.equal(properties.get('--logo-background'),'#000000');assert.equal(currentAppearance().textSize,'large');assert.deepEqual(readAppearance(localStorage),p);assert.equal(detail.persisted,true);
  assert.throws(()=>applyAppearance({...p,background:'bad'}),/no válida/);
  applyAppearance(defaultAppearance());assert.equal(document.documentElement.dataset.customBackground,'false');assert.match(properties.get('--glass-surface'),/^rgba\(/);assert.equal(storage.get('app-state'),'keep');
  localStorage.setItem=()=>{throw new Error('blocked');};assert.equal(applyAppearance(p),false);assert.equal(detail.persisted,false);assert.equal(properties.get('--bg'),'#112233');
 } finally {for(const [key,descriptor] of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});

test('Logo: favicon con el color elegido, contraste y rechazo de valores no seguros',()=>{
 for(const color of ['#ffcc00','#000000','#ffffff','#00aaff']){
  const uri=brandFavicon(color);assert.ok(uri.startsWith('data:image/svg+xml,'));const svg=decodeURIComponent(uri.split(',').slice(1).join(','));assert.ok(svg.includes(`stroke="${color}"`));assert.ok(svg.includes(`fill="${contrastText(color)}"`));
 }
 assert.throws(()=>brandFavicon('red;display:none'));
});
