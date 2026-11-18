import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sample } from '../dist/tests/cases.js';
import { dayKey } from '../dist/js/utils.js';

// Execute the real event handlers and storage adapter with browser/IndexedDB doubles.
// This does not replace visual/device QA, but catches disconnected controls.
test('Flujos: configurar, generar menú, comprar, entrenar, corregir serie y terminar',async()=>{
 const fixtures=Object.fromEntries(await Promise.all(['foods','exercises','recipes'].map(async n=>[n,JSON.parse(await readFile(new URL(`../dist/data/${n}.json`,import.meta.url),'utf8'))])));
 const nodes=new Map(),events=new Map(),windowEvents=new Map(),records=new Map();let writes=0;
 const node=selector=>{
  if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',textContent:'',value:'',hidden:false,dataset:{},attrs:new Map(),classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelectorAll(){return [];},setAttribute(k,v){this.attrs.set(k,v);},hasAttribute(k){return this.attrs.has(k);},removeAttribute(k){this.attrs.delete(k);},showModal(){this.setAttribute('open','');},close(){this.removeAttribute('open');},focus(){},insertAdjacentHTML(_,s){this.innerHTML=s+this.innerHTML;}});
  return nodes.get(selector);
 };
 const originals=new Map();
 const replace=(key,value)=>{originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});};
 const realTimeout=globalThis.setTimeout;
 replace('setTimeout',(fn,ms)=>ms>100?0:realTimeout(fn,ms));replace('setInterval',()=>0);
 replace('document',{querySelector:node,querySelectorAll:()=>[],addEventListener:(name,fn)=>events.set(name,fn),body:{classList:{add(){},remove(){}},dataset:{}},documentElement:{dataset:{theme:'dark',glass:'full'},style:{setProperty(){},removeProperty(){}}}});
 replace('window',{addEventListener:(name,fn)=>windowEvents.set(name,fn),dispatchEvent:e=>windowEvents.get(e.type)?.(e),scrollTo(){}});
 const preferences=new Map();replace('localStorage',{setItem:(k,v)=>preferences.set(k,v),getItem:k=>preferences.get(k)||null});
 replace('location',{hash:'#home'});replace('history',{replaceState:(_,__,url)=>{location.hash=url;}});replace('navigator',{});replace('confirm',()=>true);
 replace('FormData',class {constructor(form){this.values=form.values;}get(k){return this.values[k]??'';}getAll(k){const v=this.values[k];return v===undefined?[]:Array.isArray(v)?v:[v];}has(k){return k in this.values;}});
 replace('fetch',async url=>({ok:true,json:async()=>structuredClone(fixtures[String(url).match(/data\/(\w+)\.json/)[1]])}));
 replace('indexedDB',{open(){const req={};queueMicrotask(()=>{
  req.result={close(){},transaction(){const tx={objectStore(){return {
   get(key){const request={result:structuredClone(records.get(key))};queueMicrotask(()=>tx.oncomplete?.());return request;},
   put(value,key){const request={result:key};writes++;records.set(key,structuredClone(value));queueMicrotask(()=>tx.oncomplete?.());return request;}
  };}};return tx;}};req.onsuccess();
 });return req;}});
 const click=async(action,data={})=>events.get('click')({target:{closest:sel=>sel==='[data-action]'?{dataset:{action,...data},disabled:false}:null}});
 const submit=async(form,values,data={})=>{const f={dataset:{form,...data},values};await events.get('submit')({preventDefault(){},target:{closest:()=>f}});};
 try {
  await import('../dist/js/features.js?flow');
  assert.equal(node('#boot-status').hidden,true,node('#boot-status').textContent);
  assert.match(node('#home-screen').innerHTML,/Configurar alimentación/);
  assert.ok(!node('#menu-screen').innerHTML.includes('data-action="generate"'));
  await click('edit-profile');assert.equal(location.hash,'#edit-profile');
  windowEvents.get('profile-saved')({detail:sample});node('#menu-start').value=dayKey();
  const before=writes;await Promise.all([click('generate'),click('generate')]);assert.equal(writes-before,1);assert.equal(records.get('app-state').menu.days.length,7);
  await click('go-shopping');assert.equal(node('#menu-screen').dataset.nutritionView,'shopping');
  const food=records.get('app-state').menu.days[0].meals[0].ingredients[0].foodId;
  await events.get('change')({target:{id:'',dataset:{shop:food},checked:true,matches:s=>s==='[data-shop]'}});
  assert.equal(records.get('app-state').shoppingChecked[food],true);
  await click('training-tab',{tab:'routines'});assert.match(node('#train-screen').innerHTML,/Mis rutinas/);
  await click('choose-routine',{id:'push'});assert.match(node('#train-screen').innerHTML,/data-form="start-session"/);
  await submit('start-session',{routine:'push',date:dayKey()});assert.ok(records.get('app-state').draft);
  await submit('set',{weight:'40',reps:'8',rpe:'',rest:'90'},{exercise:'e1'});
  const set=records.get('app-state').draft.sets[0];assert.equal(set.weight,40);
  await submit('edit-set',{weight:'42.5',reps:'9',rpe:'8'},{id:set.id});assert.equal(records.get('app-state').draft.sets[0].weight,42.5);
  await submit('finish-session',{notes:'Buen entrenamiento'});assert.equal(records.get('app-state').draft,null);assert.equal(records.get('app-state').sessions.length,1);
  await click('training-tab',{tab:'history'});assert.match(node('#train-screen').innerHTML,/Buen entrenamiento/);
  await click('training-tab',{tab:'library'});assert.match(node('#train-screen').innerHTML,/id="library-search"/);
  await click('start-workout',{id:'free'});assert.match(node('#train-screen').innerHTML,/Elige tu primer ejercicio/);assert.ok(!node('#train-screen').innerHTML.includes('data-form="set"'));
  await click('search-exercise');assert.match(node('#dialog-content').innerHTML,/535 ejercicios disponibles/);await click('picker-more');assert.match(node('#picker-results').innerHTML,/Mostrando 80 de 535/);
  await events.get('input')({target:{id:'picker-search',value:'Curl Zottman'}});assert.match(node('#picker-results').innerHTML,/Curl Zottman/);
  await click('pick-exercise',{id:'e26'});assert.deepEqual(records.get('app-state').draft.exerciseIds,['e26']);
  await submit('set',{weight:'0',reps:'10',rpe:'',rest:'90'},{exercise:'e26'});
  await click('pick-exercise',{id:'e5'});assert.deepEqual(records.get('app-state').draft.exerciseIds,['e26','e5']);
  await click('pick-exercise',{id:'e26'});await click('next-exercise');assert.match(node('#train-screen').innerHTML,/data-exercise="e5"/);
  await submit('finish-session',{notes:''});assert.equal(records.get('app-state').sessions.length,2);
  const startsBefore=writes;await Promise.all([click('start-workout',{id:'push'}),click('start-workout',{id:'push'})]);assert.equal(writes-startsBefore,1);
  await click('next-exercise');assert.match(node('#train-screen').innerHTML,/data-exercise="e9"/);
  await click('discard-session');assert.equal(records.get('app-state').draft,null);
  await click('personalize');assert.equal(location.hash,'#personalize');assert.match(node('#personalize-screen').innerHTML,/id="appearance-background"/);
  await click('appearance-color',{key:'background',color:'#ffeedd'});assert.equal(document.documentElement.dataset.background,'#ffeedd');
  await events.get('change')({target:{id:'appearance-text-size',value:'large'}});assert.equal(document.documentElement.dataset.textSize,'large');
  assert.equal(JSON.parse(preferences.get('ritmo-personalization')).background,'#ffeedd');
  await click('appearance-preset',{id:'ocean'});assert.equal(document.documentElement.dataset.backgroundMode,'gradient');assert.equal(document.documentElement.dataset.textSize,'large');
  await events.get('change')({target:{id:'appearance-gradientAngle',dataset:{appearanceKey:'gradientAngle'},value:'225'}});assert.equal(Number(document.documentElement.dataset.gradientAngle),225);
  await submit('save-appearance',{styleName:'Mi océano'});const saved=JSON.parse(preferences.get('ritmo-saved-styles'));assert.equal(saved.length,1);
  await click('appearance-preset',{id:'paper'});assert.equal(document.documentElement.dataset.font,'serif');assert.equal(document.documentElement.dataset.glass,'full');
  await click('apply-saved-style',{id:saved[0].id});assert.equal(document.documentElement.dataset.backgroundMode,'gradient');assert.equal(Number(document.documentElement.dataset.gradientAngle),225);
  const imported={format:'ritmo-appearance',version:1,preferences:{...saved[0].preferences,font:'mono',corners:'square'}};
  await events.get('change')({target:{id:'import-appearance',files:[{size:500,text:async()=>JSON.stringify(imported)}]}});assert.equal(document.documentElement.dataset.font,'mono');assert.equal(document.documentElement.dataset.corners,'square');
  await click('remove-saved-style',{id:saved[0].id});assert.deepEqual(JSON.parse(preferences.get('ritmo-saved-styles')),[]);
  const priorBlur=Number(document.documentElement.dataset.blur),storedBlur=JSON.parse(preferences.get('ritmo-personalization')).blur;
  const slider={id:'appearance-blur',type:'range',value:'13',dataset:{appearanceKey:'blur',unit:' px'}};
  events.get('input')({target:slider});assert.equal(Number(document.documentElement.dataset.blur),13);assert.equal(JSON.parse(preferences.get('ritmo-personalization')).blur,storedBlur);
  await events.get('change')({target:slider});assert.equal(JSON.parse(preferences.get('ritmo-personalization')).blur,13);
  await click('undo-appearance');assert.equal(Number(document.documentElement.dataset.blur),priorBlur);
  await events.get('change')({target:{id:'appearance-logoMode',dataset:{appearanceKey:'logoMode'},value:'custom'}});
  await events.get('change')({target:{id:'appearance-logoColor',dataset:{appearanceKey:'logoColor'},value:'#123456'}});assert.equal(document.documentElement.dataset.logoColor,'#123456');
  await click('reset-appearance-group',{group:'buttons'});assert.equal(document.documentElement.dataset.accent,'#a7edc5');assert.equal(document.documentElement.dataset.logoColor,'#123456');
  await events.get('change')({target:{id:'glass-effects',checked:false}});assert.equal(document.documentElement.dataset.glassBehavior,'free');assert.equal(document.documentElement.dataset.glass,'reduced');
  await events.get('change')({target:{id:'appearance-glassBehavior',dataset:{appearanceKey:'glassBehavior'},value:'keep'}});assert.equal(document.documentElement.dataset.glass,'full');
  await click('appearance-color',{key:'accent',color:'#ff66cc'});assert.equal(document.documentElement.dataset.spaceTint,'linked');assert.equal(document.documentElement.dataset.glass,'full');


  await click('reset-appearance');assert.equal(document.documentElement.dataset.background,'default');assert.equal(records.get('app-state').sessions.length,2);


 } finally {
  for(const [key,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
 }
});
