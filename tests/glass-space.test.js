import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultAppearance,appearancePalette,applyAppearance,preserveGlass } from '../dist/js/ui/appearance.js';
import { presetAppearance } from '../dist/js/ui/styles.js';
test('Liquid Glass se conserva al aplicar estilos que antes lo apagaban',()=>{
 const current=defaultAppearance();assert.equal(preserveGlass(presetAppearance('paper'),current).glass,'full');assert.equal(preserveGlass({...current,glass:'reduced'},current).glass,'full');
 assert.equal(preserveGlass({...current,glass:'reduced'},{...current,glassBehavior:'free'}).glass,'reduced');
});
test('Mi espacio: cambiar el acento modifica ambiente y superficies automáticas',()=>{
 const first=appearancePalette({...defaultAppearance(),accent:'#4488ff'}),second=appearancePalette({...defaultAppearance(),accent:'#ff4488'});
 assert.notEqual(first.background,second.background);assert.notEqual(first.surface,second.surface);
 const neutralA=appearancePalette({...defaultAppearance(),spaceTint:'neutral',accent:'#4488ff'}),neutralB=appearancePalette({...defaultAppearance(),spaceTint:'neutral',accent:'#ff4488'});assert.equal(neutralA.background,neutralB.background);assert.equal(neutralA.surface,neutralB.surface);
});
test('Los colores explícitos de fondo y tarjeta se conservan',()=>{
 const palette=appearancePalette({...defaultAppearance(),accent:'#ff0000',background:'#112233',cardColor:'#334455'});assert.equal(palette.background,'#112233');assert.equal(palette.surface,'#334455');
});
test('Cristal personalizado translúcido y variables de perfil ligadas al color elegido',()=>{
 const descriptors=new Map(),styles=new Map();const set=(key,value)=>{descriptors.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});};
 set('document',{documentElement:{dataset:{},style:{setProperty:(k,v)=>styles.set(k,v),removeProperty:k=>styles.delete(k)}},querySelector:()=>({content:''})});set('window',{dispatchEvent(){}});set('CustomEvent',class {constructor(t,a){this.detail=a.detail;}});
 try {applyAppearance({...defaultAppearance(),background:'#112233',accent:'#ff66cc'},{persist:false});assert.ok(styles.get('--glass-surface').endsWith(',0.45)'));assert.ok(styles.get('--glass-header').endsWith(',0.68)'));assert.equal(styles.get('--space-color'),'#ff66cc');assert.ok(styles.get('--space-glow').includes('255,102,204'));const before=styles.get('--space-glass-surface');applyAppearance({...defaultAppearance(),accent:'#4488ff'},{persist:false});assert.notEqual(styles.get('--space-glass-surface'),before);}
 finally {for(const [key,descriptor] of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
