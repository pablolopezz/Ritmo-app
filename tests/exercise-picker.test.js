import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { exercisePickerRows,filterExercises,mergeExerciseCatalog } from '../dist/js/training/catalog.js';
const exercises=JSON.parse(await readFile(new URL('../dist/data/exercises.json',import.meta.url),'utf8'));
const ids=html=>[...html.matchAll(/data-action="pick-exercise" data-id="([^"]+)"/g)].map(m=>m[1]);
test('Elegir ejercicio: todos los ejercicios pueden alcanzarse con Mostrar más',()=>{
 const reached=new Set();
 for(let limit=40;limit<exercises.length+40;limit+=40)for(const id of ids(exercisePickerRows(exercises,'',[],limit)))reached.add(id);
 assert.equal(reached.size,exercises.length);
 const end=exercisePickerRows(exercises,'',[],exercises.length+40);assert.ok(!end.includes('data-action="picker-more"'));assert.match(end,new RegExp(`Mostrando ${exercises.length} de ${exercises.length}`));
});
test('Elegir ejercicio: una búsqueda de más de 40 resultados no pierde el resto',()=>{
 const matches=filterExercises(exercises,{query:'mancuernas'});assert.ok(matches.length>40);
 const first=exercisePickerRows(exercises,'mancuernas');assert.equal(ids(first).length,40);assert.match(first,/data-action="picker-more"/);
 const all=exercisePickerRows(exercises,'mancuernas',[],matches.length);assert.equal(ids(all).length,matches.length);
});
test('Elegir ejercicio: variantes nuevas, ejercicios propios y prioridad de la sesión',()=>{
 for(const query of ['Press Z con mancuernas','Curl Zottman','Remo en anillas','Sentadilla high bar'])assert.ok(filterExercises(exercises,{query}).length>0);
 const own={id:'custom-1',name:'Mi ejercicio especial',group:'Pecho',equipment:'Banda'};const combined=mergeExerciseCatalog([...exercises.slice(0,26),own],exercises);
 assert.equal(ids(exercisePickerRows(combined,'',['custom-1']))[0],'custom-1');assert.deepEqual(ids(exercisePickerRows(combined,'Mi ejercicio especial')),['custom-1']);
 assert.equal(combined.length,exercises.length+1);
});
