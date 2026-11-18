import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mergeExerciseCatalog,filterExercises,exerciseRows,exerciseDetail,routinePickerRows } from '../dist/js/training/catalog.js';
import { healthReady,healthStatus,requestHealthAccess,readHealthWorkouts,saveHealthWorkout,workoutPayload,sessionTiming } from '../dist/js/health/bridge.js';
import { healthView,healthWorkouts,healthExportForm } from '../dist/js/health/view.js';
import { trainingView,setEditForm } from '../dist/js/training/view.js';
import { newState,validateState,parseBackup } from '../dist/js/state.js';
import { recomputeRecords } from '../dist/js/training/metrics.js';
const exercises=JSON.parse(await readFile(new URL('../dist/data/exercises.json',import.meta.url),'utf8'));
const foods=JSON.parse(await readFile(new URL('../dist/data/foods.json',import.meta.url),'utf8'));
const fixture=()=>({...newState(),foods,exercises});
const set={id:'s1',exerciseId:'e1',weight:50,reps:8,rpe:null};
const session={id:'one',name:'Push',date:'2026-11-01',startedAt:new Date('2026-11-01T10:00:00').getTime(),endedAt:new Date('2026-11-01T11:00:00').getTime(),notes:'',exerciseIds:['e1'],sets:[set]};

test('Biblioteca: más de 500 ejercicios únicos, con técnica y 26 IDs originales estables',()=>{
 assert.ok(exercises.length>=500);assert.equal(new Set(exercises.map(e=>e.id)).size,exercises.length);
 assert.equal(new Set(exercises.map(e=>e.name+'|'+e.equipment)).size,exercises.length);
 assert.equal(exercises.find(e=>e.id==='e1').name,'Press de banca');assert.equal(exercises.find(e=>e.id==='e26').name,'Elevación de piernas');
 assert.ok(exercises.every(e=>e.instructions?.length>=2));validateState(fixture());
});
test('Biblioteca: actualizar instalación existente conserva ejercicios propios, rutinas y referencias',()=>{
 const legacy=exercises.slice(0,26).map(({instructions,...e})=>e);
 const own={id:'own',name:'Mi variante',group:'Pecho',equipment:'Banda'};
 const merged=mergeExerciseCatalog([...legacy,own],exercises);
 assert.equal(merged.length,exercises.length+1);assert.deepEqual(merged.find(e=>e.id==='own'),own);assert.ok(merged[0].instructions);
 assert.deepEqual(mergeExerciseCatalog(merged,exercises),merged);
 const state={...fixture(),exercises:merged,routines:[{id:'push',name:'Push',days:[0],exerciseIds:['e1','own']}],sessions:[structuredClone(session)]};validateState(state);
});
test('Biblioteca: búsqueda sin tildes y filtros combinados',()=>{
 assert.ok(filterExercises(exercises,{query:'biceps'}).length>8);
 const found=filterExercises(exercises,{query:'press',group:'Pecho',equipment:'Mancuernas'});
 assert.ok(found.length>3);assert.ok(found.every(e=>e.group==='Pecho'&&e.equipment==='Mancuernas'));
 assert.equal(filterExercises(exercises,{query:'zz-noexiste'}).length,0);
});
test('Biblioteca: escapar contenido importado y conservar selección al buscar una rutina',()=>{
 const exercise={id:'x',name:'<img onerror=alert(1)>',group:'<script>',equipment:'"',instructions:['<script>alert(1)</script>']};
 const html=exerciseRows([exercise])+exerciseDetail(exercise);assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
 assert.match(routinePickerRows({exercises:[exercise]},{exerciseIds:['x']}),/checked/);
});
test('Entrenar: buscador, edición de series y paginación del historial',()=>{
 const state=fixture();state.draft=structuredClone(session);state.sessions=Array.from({length:25},(_,i)=>({...structuredClone(session),id:'session'+i}));
 const html=trainingView(state,{exerciseId:'e1',restSeconds:90,historyLimit:20});
 assert.match(html,/data-action="search-exercise"/);assert.match(html,/data-action="edit-set"/);const history=trainingView(state,{trainTab:'history',historyLimit:20});assert.match(history,/data-action="more-history"/);assert.equal((history.match(/class="history-entry"/g)||[]).length,20);assert.ok(!html.includes('class="history-entry"'));
 assert.match(setEditForm(set),/value="50"/);
});
test('Serie corregida: se recalculan récords y se valida duración opcional sin romper copias antiguas',()=>{
 const state=fixture();state.sessions=[structuredClone(session)];state.draft={...structuredClone(session),id:'two',startedAt:session.endedAt,endedAt:session.endedAt+60000,sets:[{...set,id:'s2',weight:60}]};
 recomputeRecords(state);assert.ok(state.draft.sets[0].records.includes('Mayor peso'));state.draft.sets[0].weight=40;recomputeRecords(state);assert.ok(!state.draft.sets[0].records.includes('Mayor peso'));validateState(state);
 state.sessions[0].endedAt=1;assert.throws(()=>validateState(state));delete state.sessions[0].endedAt;validateState(state);
 const backup={format:'dieta-gym-backup',version:2,profile:null,state};assert.ok(parseBackup(JSON.stringify(backup)));
});
test('HealthKit: web y Android no se presentan como conectados',()=>{
 assert.equal(healthReady(),false);assert.equal(healthReady({getPlatform:()=> 'android',registerPlugin(){}}),false);
 assert.match(healthView(),/Esta versión web no puede vincularse/);assert.ok(!healthView().includes('data-action="health-connect"'));
 assert.throws(()=>healthStatus(),/app nativa/);
});
test('HealthKit: puente nativo usa los métodos reales solo al invocarlos explícitamente',async()=>{
 const calls=[];const native={status:async()=>{calls.push('status');return {available:true,writeAuthorized:false};},requestAccess:async()=>{calls.push('request');return {available:true,writeAuthorized:true};},readWorkouts:async()=>{calls.push('read');return {workouts:[]};},saveWorkout:async p=>{calls.push(p);return {saved:true};}};
 globalThis.Capacitor={getPlatform:()=> 'ios',registerPlugin:name=>{assert.equal(name,'RitmoHealth');return native;}};
 try {assert.ok(healthReady());assert.equal(calls.length,0);assert.equal((await healthStatus()).writeAuthorized,false);await requestHealthAccess();await readHealthWorkouts();await saveHealthWorkout({sessionId:'one'});assert.equal(calls.length,4);assert.match(healthView({checked:true,available:true,writeAuthorized:false}),/sin autorización/);}
 finally {delete globalThis.Capacitor;}
});
test('Salud: horarios reales, rango de duración, fechas imposibles y futuro se validan',()=>{
 const payload=workoutPayload(session,'2026-11-01','10:00',60,new Date('2026-11-02').getTime());assert.equal(payload.end-payload.start,3600000);assert.ok(!('calories' in payload));
 for(const [date,time,min] of [['2026-02-31','10:00',60],['2026-11-01','25:00',60],['2026-11-01','10:00',0],['2026-11-01','10:00',361],['2026-11-01','10:00','']])assert.throws(()=>workoutPayload(session,date,time,min));
 assert.throws(()=>workoutPayload(session,'2026-11-01','10:00',60,0));assert.throws(()=>workoutPayload({...session,sets:[]},'2026-11-01','10:00',60));
});
test('Salud: sesiones antiguas sin duración piden revisión en vez de inventar minutos',()=>{
 assert.equal(sessionTiming(session).minutes,60);assert.equal(sessionTiming({...session,endedAt:undefined}).minutes,'');assert.equal(sessionTiming({...session,date:'2026-10-01'}).time,'');
 assert.match(healthExportForm(session),/Confirmar y guardar/);
});
test('Salud: filtro Apple Watch, texto escapado y consulta vacía sin afirmar que se autorizó leer',()=>{
 const workouts=[{id:'1',name:'<script>',start:session.startedAt,duration:1800,source:'<img>',isWatch:true},{id:'2',name:'Carrera',start:session.startedAt,duration:1200,source:'Otra app',isWatch:false}];
 const html=healthWorkouts(workouts,true);assert.match(html,/1 sesiones/);assert.match(html,/&lt;script&gt;/);assert.ok(!html.includes('Otra app'));assert.match(healthWorkouts([],false),/permisos/);
});
