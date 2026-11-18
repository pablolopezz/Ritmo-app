import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { newState } from '../dist/js/state.js';
import { sample } from '../dist/tests/cases.js';
import { homeView } from '../dist/js/ui/home.js';
import { menuView,shoppingView } from '../dist/js/meals/view.js';
import { trainingView } from '../dist/js/training/view.js';
import { settingsView } from '../dist/js/ui/settings.js';
import { profileView } from '../dist/js/profile/view.js';
import { healthView } from '../dist/js/health/view.js';
import { macroLine } from '../dist/js/ui/helpers.js';
const foods=JSON.parse(await readFile(new URL('../dist/data/foods.json',import.meta.url),'utf8'));
const exercises=JSON.parse(await readFile(new URL('../dist/data/exercises.json',import.meta.url),'utf8'));
const state={...newState(),foods,exercises};
const ui={menuTab:'plan',menuStart:'2026-11-18',menuDay:0};
test('Inicio: acceso directo a los datos necesarios y sin el panel semanal de métricas',()=>{
 const html=homeView(state,null);assert.match(html,/data-action="edit-profile"/);assert.ok(!html.includes('data-action="generate"'));assert.ok(!html.includes('macro-targets'));assert.ok(!html.includes('series con récord personal'));
});
test('Menú sin perfil: configurar primero en lugar de ofrecer una generación que fallará',()=>{
 const html=menuView(state,null,ui);assert.match(html,/Configurar alimentación/);assert.ok(!html.includes('data-action="generate"'));assert.match(menuView(state,sample,ui),/data-action="generate"/);assert.match(shoppingView(state),/data-action="go-menu"/);
});
test('Entrenamiento: cada pestaña muestra solo su tarea principal',()=>{
 const session=trainingView(state,{});assert.match(session,/data-form="start-session"/);assert.ok(!session.includes('id="library-search"'));assert.ok(!session.includes('<h2>Historial'));
 const library=trainingView(state,{trainTab:'library'});assert.match(library,/id="library-search"/);assert.ok(!library.includes('data-form="start-session"'));
});
test('Ajustes y perfil: herramientas secundarias desplegables y sin accesos repetidos',()=>{
 const html=settingsView(sample,{theme:'dark',glass:'full'});assert.match(html,/<details class="panel settings-group"><summary>Copias de seguridad/);assert.match(html,/Editar datos y preferencias/);
 assert.ok(!profileView(state,sample).includes('profile-highlights'));assert.match(healthView(),/^<details/);assert.ok(!healthView().includes('data-action="health-connect"'));
});
test('Nutrientes: etiquetas completas en lugar de P, HC y G',()=>{
 const html=macroLine({kcal:100,protein:10,carbs:12,fat:1});for(const label of ['Proteínas','Hidratos','Grasas'])assert.ok(html.includes(label));
});
