import test from 'node:test';
import assert from 'node:assert/strict';
import { motionAllowed,enterScreen,enterDialog,pulseSaved,stopLiquidMotion,installLiquidMotion } from '../dist/js/ui/liquid-motion.js';
import { normalizeAppearance,defaultAppearance } from '../dist/js/ui/appearance.js';
function environment() {
 const descriptors=new Map(),listeners=new Map(),animations=[],removed=[];
 const set=(key,value)=>{descriptors.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});};
 const animation=(frames,options)=>{const value={frames,options,cancelled:false,finished:new Promise(()=>{}),cancel(){this.cancelled=true;}};animations.push(value);return value;};
 const root={dataset:{glass:'full',motion:'system',glassMotion:'expressive',glassIntensity:'strong'}};
 set('document',{documentElement:root,visibilityState:'visible',querySelectorAll:()=>[],addEventListener:(name,fn)=>listeners.set(name,fn),createElement:()=>({style:{},setAttribute(){},animate:animation,remove(){removed.push(this);}})});
 set('window',{matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener:(name,fn)=>listeners.set(name,fn)});
 return {root,listeners,animations,removed,animation,restore(){stopLiquidMotion();for(const [key,descriptor] of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}};
}
test('Movimiento: respeta cristal desactivado, pestaña oculta y preferencias reducidas',()=>{
 const env=environment();try {assert.equal(motionAllowed(),true);env.root.dataset.motion='reduced';assert.equal(motionAllowed(),false);env.root.dataset.motion='system';window.matchMedia=()=>({matches:true});assert.equal(motionAllowed(),false);window.matchMedia=()=>({matches:false});document.visibilityState='hidden';assert.equal(motionAllowed(),false);document.visibilityState='visible';env.root.dataset.glass='reduced';assert.equal(motionAllowed(),false);}finally{env.restore();}
});
test('Entradas: máximo seis elementos, ventanas y confirmación sin alterar el contenido',()=>{
 const env=environment();try {const cards=Array.from({length:10},()=>({animate:env.animation}));enterScreen({querySelectorAll:()=>cards});assert.equal(env.animations.length,6);assert.equal(env.animations[1].options.delay,32);enterDialog({animate:env.animation});pulseSaved({animate:env.animation});assert.equal(env.animations.length,8);stopLiquidMotion();assert.ok(env.animations.every(a=>a.cancelled));env.root.dataset.motion='reduced';enterScreen({querySelectorAll:()=>cards});assert.equal(env.animations.length,8);}finally{env.restore();}
});
test('Pulsación: rebote y onda decorativa, sin bloquear el botón',()=>{
 const env=environment();try {
  installLiquidMotion();const appended=[];const button={disabled:false,animate:env.animation,getBoundingClientRect:()=>({left:0,top:0,width:100,height:50}),append:node=>appended.push(node),querySelectorAll:()=>[]};
  env.listeners.get('pointerdown')({target:{closest:selector=>selector==='button'?button:null},clientX:30,clientY:20});assert.equal(env.animations.length,2);assert.equal(appended.length,1);assert.equal(appended[0].className,'liquid-ripple');assert.equal(appended[0].style.width,'200px');
  button.disabled=true;env.listeners.get('pointerdown')({target:{closest:selector=>selector==='button'?button:null},clientX:0,clientY:0});assert.equal(env.animations.length,2);
 }finally{env.restore();}
});
test('Preferencias de cristal: intenso/expresivo por defecto y valores manipulados rechazados',()=>{
 const p=normalizeAppearance({glassIntensity:'url(evil)',glassMotion:'rapid'});assert.deepEqual(p,defaultAppearance());assert.equal(p.glassIntensity,'strong');assert.equal(p.glassMotion,'expressive');
});
