import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultAppearance,normalizeAppearance,appearancePalette,contrastRatio,applyAppearance,currentAppearance } from '../dist/js/ui/appearance.js';
import { stylePresets,presetAppearance,parseAppearanceFile,serializeAppearance,readSavedStyles,saveNamedStyle,removeNamedStyle } from '../dist/js/ui/styles.js';
import { personalizationView } from '../dist/js/ui/personalization.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};};
test('Estilos: ocho temas completos, válidos y con texto legible en las tarjetas',()=>{
 assert.equal(stylePresets.length,8);for(const style of stylePresets){const p=presetAppearance(style.id);assert.deepEqual(normalizeAppearance(p),p);const palette=appearancePalette(p);assert.ok(contrastRatio(palette.text,palette.surface)>=4.5);}
 assert.throws(()=>presetAppearance('unknown'));
});
test('Estilos propios: guardar, aplicar preferencias, eliminar sin tocar los demás',()=>{
 const storage=memory(),p=presetAppearance('ocean');saveNamedStyle(storage,{id:'one',name:' Mi mar ',preferences:p});saveNamedStyle(storage,{id:'two',name:'Papel',preferences:presetAppearance('paper')});
 assert.equal(readSavedStyles(storage)[0].name,'Mi mar');assert.deepEqual(readSavedStyles(storage)[0].preferences,p);removeNamedStyle(storage,'one');assert.equal(readSavedStyles(storage)[0].id,'two');
});
test('Estilos propios: límite, nombres inválidos y datos manipulados se rechazan',()=>{
 const storage=memory();assert.throws(()=>saveNamedStyle(storage,{id:'one',name:' ',preferences:defaultAppearance()}));
 for(let i=0;i<12;i++)saveNamedStyle(storage,{id:'id'+i,name:'Estilo '+i,preferences:defaultAppearance()});assert.throws(()=>saveNamedStyle(storage,{id:'next',name:'Extra',preferences:defaultAppearance()}),/12/);
 storage.setItem('ritmo-saved-styles','[{"id":"<script>","name":"X"}]');assert.deepEqual(readSavedStyles(storage),[]);assert.deepEqual(readSavedStyles({getItem(){throw new Error();}}),[]);
});
test('Archivo de apariencia: ciclo completo y sin datos de salud ni propiedades ajenas',()=>{
 const p={...presetAppearance('neon'),opacity:80,blur:32,textSize:'extra'};const text=serializeAppearance(p);assert.deepEqual(parseAppearanceFile(text),p);assert.ok(!text.includes('sessions'));
 assert.throws(()=>parseAppearanceFile('{"format":"dieta-gym-backup","version":2}'));assert.throws(()=>parseAppearanceFile(JSON.stringify({format:'ritmo-appearance',version:1,preferences:{background:'url(evil)'}})));
 const clean=parseAppearanceFile(JSON.stringify({format:'ritmo-appearance',version:1,preferences:{...p,sessions:[{notes:'private'}]}}));assert.ok(!('sessions' in clean));
});
test('Preferencias ampliadas: rangos y valores seguros, sin CSS inyectado',()=>{
 const p=normalizeAppearance({gradientAngle:999,blur:-1,opacity:5,font:'url(evil)',cardColor:'red;display:none',corners:'999px',buttonStyle:'evil'});assert.deepEqual(p,defaultAppearance());
});
test('Panel ampliado: vista previa, controles plegados, nombre escapado e importación',()=>{
 const html=personalizationView(defaultAppearance(),[{id:'abc',name:'<img onerror=1>',preferences:defaultAppearance()}]);
 for(const key of ['gradientEnd','gradientAngle','pattern','cardColor','corners','shadow','spacing','font','buttonStyle','buttonShape','opacity','blur'])assert.ok(html.includes(`data-appearance-key="${key}"`));
 assert.ok(html.includes('Vista previa'));assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img onerror'));assert.ok(html.includes('id="import-appearance"'));assert.ok(html.includes('data-form="save-appearance"'));
});
test('Aplicación ampliada: valores numéricos y CSS seguro, incluyendo restablecimiento',()=>{
 const descriptors=new Map(),properties=new Map();const set=(key,value)=>{descriptors.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});};
 set('document',{documentElement:{dataset:{},style:{setProperty:(k,v)=>properties.set(k,v),removeProperty:k=>properties.delete(k)}},querySelector:()=>({content:''})});set('window',{dispatchEvent(){}});set('CustomEvent',class {constructor(t,a){this.detail=a.detail;}});
 try {const p={...presetAppearance('ocean'),opacity:80,blur:32,gradientAngle:225,buttonShape:'pill'};applyAppearance(p,{persist:false});assert.deepEqual(currentAppearance(),p);assert.match(properties.get('--personal-background'),/^linear-gradient\(225deg,/);assert.equal(properties.get('--personal-button-radius'),'999px');assert.equal(properties.get('--personal-blur'),'32px');applyAppearance(defaultAppearance(),{persist:false});assert.equal(properties.get('--personal-pattern'),'none');assert.equal(properties.get('--personal-font').startsWith('system-ui'),true);}
 finally {for(const [key,descriptor] of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
