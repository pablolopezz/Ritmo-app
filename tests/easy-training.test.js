import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { newState } from '../dist/js/state.js';
import { trainingView } from '../dist/js/training/view.js';
import { sessionExerciseIds,selectedExerciseId,nextExerciseId,routineDisplayName } from '../dist/js/training/session.js';
import { exercisePickerRows } from '../dist/js/training/catalog.js';
const exercises=JSON.parse(await readFile(new URL('../dist/data/exercises.json',import.meta.url),'utf8'));
const draft={id:'s',name:'Sesión',date:'2026-11-18',startedAt:1,notes:'',sets:[],exerciseIds:[]};
test('Sesión libre: el primer ejercicio se elige explícitamente',()=>{
 const state={...newState(),exercises,draft};const html=trainingView(state,{});
 assert.match(html,/Elige tu primer ejercicio/);assert.ok(!html.includes('data-form="set"'));assert.equal(selectedExerciseId(draft,'e1'),null);
});
test('Sesiones anteriores libres: recuperar ejercicios de las series sin añadir toda la biblioteca',()=>{
 const old={...draft,sets:[{exerciseId:'e5'},{exerciseId:'e1'},{exerciseId:'e5'}]};
 assert.deepEqual(sessionExerciseIds(old),['e5','e1']);assert.equal(selectedExerciseId(old,'e2'),'e5');assert.equal(nextExerciseId(old,'e5'),'e1');assert.equal(nextExerciseId(old,'e1'),null);
});
test('Rutina: conservar orden y mostrar un único ejercicio con sus series',()=>{
 const state={...newState(),exercises,draft:{...draft,exerciseIds:['e9','e1'],sets:[{id:'a',exerciseId:'e1',weight:30,reps:8,rpe:null},{id:'b',exerciseId:'e9',weight:20,reps:10,rpe:null}]}};
 const html=trainingView(state,{exerciseId:'e9',restSeconds:90});assert.match(html,/Ejercicio 1 de 2/);assert.match(html,/data-action="next-exercise"/);assert.match(html,/20 kg × 10/);assert.ok(!html.includes('30 kg × 8'));assert.ok(!html.includes('id="session-exercise"'));assert.ok(!html.includes('training-tabs'));
});
test('Inicio: rutinas con inicio directo y nombres de ejemplo en español sin cambiar nombres propios',()=>{
 const state={...newState(),exercises,routines:[{id:'push',name:'Push',days:[],exerciseIds:['e1']}]};const html=trainingView(state,{});
 assert.match(html,/data-action="start-workout" data-id="push"/);assert.match(html,/>Empuje</);assert.equal(routineDisplayName({...state.routines[0],name:'Mi sesión'}),'Mi sesión');
});
test('Selector: acceso paginado y búsqueda de cualquier ejercicio',()=>{
 const initial=exercisePickerRows(exercises,'',['e26']);assert.ok((initial.match(/data-action="pick-exercise"/g)||[]).length<=40);assert.match(initial,/data-id="e26"/);
 const result=exercisePickerRows(exercises,'gemelos');assert.match(result,/Gemelos/);assert.ok(!result.includes('id="picker-equipment"'));
});
