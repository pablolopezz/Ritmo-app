import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { defaultAppearance,normalizeAppearance,currentAppearance,applyAppearance } from '../dist/js/ui/appearance.js';
import { resetAppearanceGroup,parseAppearanceFile,serializeAppearance } from '../dist/js/ui/styles.js';
import { personalizationView } from '../dist/js/ui/personalization.js';
test('Identidad: sin subtítulo y nombre con color neutro y tipografía fija',async()=>{
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8'),css=await readFile(new URL('../dist/css/personalization.css',import.meta.url),'utf8');
 const header=html.slice(html.indexOf('<header'),html.indexOf('</header>'));assert.ok(!header.includes('brand-tagline'));assert.match(header,/class="brand-wordmark">ritmo<\/span>/);assert.match(css,/\.brand-wordmark,\.brand-name\{font-family:[^}]+!important;color:var\(--text\)!important/);assert.ok(!css.includes('.brand-wordmark{color:var(--accent)}'));
});
test('Personalización precisa: ángulos, desenfoque y opacidad intermedios válidos',()=>{
 const p=normalizeAppearance({...defaultAppearance(),gradientAngle:217,blur:13,opacity:83});assert.equal(p.gradientAngle,217);assert.equal(p.blur,13);assert.equal(p.opacity,83);assert.deepEqual(parseAppearanceFile(serializeAppearance(p)),p);
});
test('Controles nuevos: tamaños seguros y enumeraciones sin CSS libre',()=>{
 const invalid=normalizeAppearance({logoMode:'url(evil)',logoColor:'red;',logoTile:'bad',logoSize:999,buttonHeight:12,borderWidth:-1,contentWidth:100000,lineHeight:0,textWeight:9000});assert.deepEqual(invalid,defaultAppearance());
});
test('Restablecer un apartado conserva todos los demás ajustes',()=>{
 const p={...defaultAppearance(),accent:'#ff0000',buttonHeight:64,logoMode:'custom',logoColor:'#102030',font:'mono',blur:13};
 const next=resetAppearanceGroup(p,'buttons');assert.equal(next.accent,'#a7edc5');assert.equal(next.buttonHeight,50);assert.equal(next.logoColor,'#102030');assert.equal(next.font,'mono');assert.equal(next.blur,13);assert.throws(()=>resetAppearanceGroup(p,'unknown'));
});
test('Controles de identidad, deshacer, rangos y restablecer están disponibles',()=>{
 const html=personalizationView(defaultAppearance(),[],2);for(const key of ['logoMode','logoColor','logoSize','logoShape','logoTile','buttonHeight','borderWidth','contentWidth','lineHeight','textWeight'])assert.ok(html.includes(`data-appearance-key="${key}"`));assert.match(html,/data-action="undo-appearance"/);assert.match(html,/type="range" id="appearance-blur"/);assert.match(html,/data-action="reset-appearance-group"/);
});
test('Símbolo independiente y previsualización sin persistencia ni evento',()=>{
 const descriptors=new Map(),styles=new Map(),values=new Map();let events=0;
 const set=(key,value)=>{descriptors.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});};
 set('document',{documentElement:{dataset:{},style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)}},querySelector:()=>({content:''})});set('localStorage',{setItem:(k,v)=>values.set(k,v)});set('window',{dispatchEvent(){events++;}});set('CustomEvent',class {constructor(t,a){this.detail=a.detail;}});
 try {const p={...defaultAppearance(),logoMode:'custom',logoColor:'#123456',logoSize:52};applyAppearance(p);assert.equal(styles.get('--logo-color'),'#123456');assert.equal(styles.get('--logo-size'),'52px');const before=values.get('ritmo-personalization');applyAppearance({...p,accent:'#ff0000',blur:13},{persist:false,emit:false});assert.equal(events,1);assert.equal(values.get('ritmo-personalization'),before);assert.equal(styles.get('--logo-color'),'#123456');assert.equal(currentAppearance().blur,13);}
 finally {for(const [key,descriptor] of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
