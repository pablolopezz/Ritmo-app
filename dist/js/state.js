import { assessProfile } from './diet/safety.js';
import { calculatePlan } from './diet/calculations.js';
import { validDate,addDays } from './utils.js';
import { newIdentity,validateIdentity } from './profile/model.js';
export const newState = () => ({version:2,identity:newIdentity(),foods:[],exercises:[],routines:[],sessions:[],draft:null,menu:null,shoppingChecked:{},consumed:{},nutrition:{},weights:[],restEnd:null});
const text=(x,max=1000)=>typeof x==='string'&&x.length<=max;
const finite=(x,min=0,max=1e8)=>Number.isFinite(x)&&x>=min&&x<=max;
const fail=message=>{throw new Error(message);};
export function validateFood(f) {
  return f&&text(f.id,100)&&f.id.length>0&&text(f.name,100)&&f.name.trim().length>0&&text(f.section,80)&&f.section.trim().length>0&&['kcal','protein','carbs','fat'].every(k=>finite(f[k],0,k==='kcal'?1000:100))&&Array.isArray(f.allergens)&&f.allergens.length<=30&&f.allergens.every(x=>text(x,50))&&typeof f.vegan==='boolean'&&typeof f.vegetarian==='boolean'&&(!f.vegan||f.vegetarian);
}
export function validateState(s) {
  if(!s||s.version!==2) fail('Versión de datos incompatible.');
  // Optional for backward compatibility with backups before personal profiles.
  if(s.identity!==undefined&&!validateIdentity(s.identity)) fail('El perfil personal o su foto no son válidos.');
  for(const key of ['foods','exercises','routines','sessions','weights']) if(!Array.isArray(s[key])||s[key].length>50000) fail('La copia tiene una estructura inválida.');
  for(const key of ['routines','sessions']) if(new Set(s[key].map(x=>x?.id)).size!==s[key].length) fail('Hay identificadores repetidos en la copia.');
  if(new Set(s.weights.map(x=>x?.date)).size!==s.weights.length)fail('Hay fechas de medidas repetidas.');
  if(!s.foods.length||!s.foods.every(validateFood)||new Set(s.foods.map(f=>f.id)).size!==s.foods.length) fail('Catálogo de alimentos inválido.');
  if(!s.exercises.every(e=>e&&text(e.id,100)&&e.id&&text(e.name,100)&&e.name&&text(e.group,60)&&e.group&&text(e.equipment,100)&&(e.instructions===undefined||(Array.isArray(e.instructions)&&e.instructions.length<=10&&e.instructions.every(i=>text(i,500)))))||new Set(s.exercises.map(e=>e.id)).size!==s.exercises.length) fail('Ejercicios inválidos.');
  const hasExercise=id=>s.exercises.some(e=>e.id===id);
  if(!s.routines.every(r=>r&&text(r.id,100)&&text(r.name,100)&&r.name&&Array.isArray(r.exerciseIds)&&r.exerciseIds.length>0&&r.exerciseIds.length<=50&&r.exerciseIds.every(hasExercise)&&Array.isArray(r.days)&&r.days.every(d=>Number.isInteger(d)&&d>=0&&d<=6))) fail('Rutinas inválidas.');
  const setValid=x=>x&&text(x.id,100)&&hasExercise(x.exerciseId)&&finite(x.weight,0,1000)&&Number.isInteger(x.reps)&&finite(x.reps,1,100)&& (x.rpe===null||finite(x.rpe,1,10))&&(!x.records||(Array.isArray(x.records)&&x.records.every(t=>text(t,60))));
  const sessionValid=x=>x&&text(x.id,100)&&text(x.name,100)&&validDate(x.date)&&finite(x.startedAt,0,1e14)&&(x.endedAt===undefined||finite(x.endedAt,x.startedAt,1e14))&&text(x.notes,2000)&&Array.isArray(x.exerciseIds)&&x.exerciseIds.every(hasExercise)&&Array.isArray(x.sets)&&x.sets.length<=5000&&x.sets.every(setValid);
  if(!s.sessions.every(sessionValid)|| (s.draft!==null&&!sessionValid(s.draft))) fail('Sesión inválida.');
  if(!s.weights.every(w=>validDate(w.date)&&finite(w.weight,25,350)&&['waist','hips','chest'].every(k=>w[k]===null||finite(w[k],20,250)))) fail('Medidas inválidas.');
  if(s.menu!==null) {
    const m=s.menu;
    if(!m||!validDate(m.start)||!Array.isArray(m.days)||m.days.length!==7||assessProfile(m.profile).errors.length||!m.target||!['kcal','protein','carbs','fat'].every(k=>finite(m.target[k]))) fail('Menú inválido.');
    const reference=calculatePlan(m.profile).plan;
    if(!reference || Math.abs(reference.calories-m.target.kcal)>.01 || ['protein','carbs','fat'].some(k=>Math.abs(reference[k]-m.target[k])>.01)) fail('Los objetivos del menú no coinciden con un perfil seguro.');
    for(const [index,day] of m.days.entries()) {
      if(!validDate(day.date)||!Array.isArray(day.meals)||day.meals.length<2||day.meals.length>6) fail('Día de menú inválido.');
      if(day.date!==addDays(m.start,index)||day.meals.length!==m.profile.meals) fail('El calendario del menú no coincide con el perfil.');
      for(const meal of day.meals) if(!meal||!text(meal.id,100)||!text(meal.label,100)||!text(meal.name,200)||!text(meal.steps,3000)||!['main','breakfast','snack'].includes(meal.kind)||typeof meal.locked!=='boolean'||!Array.isArray(meal.ingredients)||!meal.ingredients.length||!meal.ingredients.every(i=>s.foods.some(f=>f.id===i.foodId)&&finite(i.grams,1,10000))) fail('Comida inválida.');
    }
  }
  for(const key of ['shoppingChecked','consumed','nutrition']) if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key])||Object.keys(s[key]).length>50000) fail('Registros inválidos.');
  if(!Object.values(s.shoppingChecked).every(x=>typeof x==='boolean')||!Object.values(s.consumed).every(x=>typeof x==='boolean')) fail('Casillas inválidas.');
  if(!Object.entries(s.nutrition).every(([date,e])=>validDate(date)&&e&&finite(e.calories,0,20000)&&finite(e.target,0,20000)&&['manual','menu'].includes(e.source))) fail('Registro nutricional inválido.');
  if(s.restEnd!==null&&!finite(s.restEnd,0,1e14)) fail('Temporizador inválido.');
  return s;
}
export function parseBackup(content) {
  const backup=JSON.parse(content);
  if(backup?.format!=='dieta-gym-backup'||backup.version!==2) fail('Este archivo no es una copia compatible de Ritmo.');
  if(backup.profile!==null && (!backup.profile||backup.profile.version!==1||assessProfile(backup.profile.data).errors.length)) fail('Perfil inválido en la copia.');
  validateState(backup.state);
  return backup;
}
