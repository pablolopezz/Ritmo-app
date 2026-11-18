import { calculatePlan } from '../js/diet/calculations.js';
import { sample } from './cases.js';
import { generateWeek,eligibleRecipes,dayTotals,mealTotals,replaceMeal,exclusionsFor } from '../js/meals/generator.js';
import { shoppingList } from '../js/meals/shopping.js';
import { estimated1RM,recordFlags,recomputeRecords,weeklyVolume,lastExercise } from '../js/training/metrics.js';
import { newState,validateState,parseBackup } from '../js/state.js';
import { weeklySummary } from '../js/progress/summary.js';
import { monday,addDays,validDate,esc } from '../js/utils.js';
const assert=(condition,message='Resultado inesperado')=>{if(!condition)throw new Error(message);};
const approx=(a,b)=>assert(Math.abs(a-b)<.00001,`${a} ≠ ${b}`);
const throws=fn=>{let thrown=false;try{fn();}catch{thrown=true;}assert(thrown,'Se esperaba rechazar la operación');};
export function featureTests(foods,recipes,exercises) {
  const targetFor=p=>{const plan=calculatePlan(p).plan;return {kcal:plan.calories,protein:plan.protein,carbs:plan.carbs,fat:plan.fat};};
  const make=(profile=sample,other={})=>generateWeek({profile,target:targetFor(profile),foods,recipes,start:'2026-11-16',random:()=>.5,...other});
  const seeded=()=>({...newState(),foods:structuredClone(foods),exercises:structuredClone(exercises)});
  const set=(weight,reps=8)=>({id:Math.random().toString(),exerciseId:'e1',weight,reps,rpe:null});
  const session=(id,date,sets)=>({id,name:'Sesión',date,startedAt:1,exerciseIds:['e1'],notes:'',sets});
  return [
    ['Catálogo: al menos 100 alimentos válidos y sin IDs repetidos',()=>{assert(foods.length>=100);validateState(seeded());}],
    ['Todas las recetas apuntan a alimentos existentes y cantidades positivas',()=>{assert(recipes.length>=40);for(const r of recipes)assert(r.ingredients.every(i=>foods.some(f=>f.id===i.foodId)&&i.grams>0));}],
    ['Menú: siete días y el número de comidas solicitado (2–6)',()=>{for(const meals of [2,3,4,5,6]){const menu=make({...sample,meals});assert(menu.days.length===7&&menu.days.every(d=>d.meals.length===meals));}}],
    ['Menús vegetarianos y veganos no incluyen alimentos incompatibles',()=>{for(const diet of ['vegetarian','vegan']){const menu=make({...sample,diet});for(const day of menu.days)for(const meal of day.meals)for(const i of meal.ingredients){const f=foods.find(f=>f.id===i.foodId);assert(diet==='vegan'?f.vegan:f.vegetarian);}}}],
    ['Exclusiones: gluten, lactosa, frutos secos y cacahuetes respetados',()=>{const profile={...sample,exclusions:'gluten, lactosa, frutos secos, cacahuetes'};const banned=exclusionsFor(profile.exclusions,foods).ids;for(const d of make(profile).days)for(const m of d.meals)assert(m.ingredients.every(i=>!banned.has(i.foodId)));}],
    ['Una exclusión desconocida bloquea la generación',()=>throws(()=>make({...sample,exclusions:'alérgeno inexistente'}))],
    ['Sin recetas compatibles, no se genera un menú vacío',()=>throws(()=>make(sample,{recipes:[]}))],
    ['Comidas bloqueadas conservan receta y gramos al regenerar',()=>{const old=make();old.days[0].meals[0].locked=true;const menu=make(sample,{previous:old,random:()=>.1});assert(JSON.stringify(menu.days[0].meals[0])===JSON.stringify(old.days[0].meals[0]));}],
    ['Un bloqueo incompatible con nuevas exclusiones no se conserva',()=>{const old=make();old.days[0].meals[0].locked=true;const id=old.days[0].meals[0].ingredients[0].foodId;throws(()=>make({...sample,exclusions:foods.find(f=>f.id===id).name},{previous:old}));}],
    ['Cambiar comida elige una receta distinta y mantiene el tipo',()=>{const menu=make(),meal=menu.days[0].meals[0];const replacement=replaceMeal({meal,kind:meal.kind,profile:sample,foods,recipes});assert(replacement.id!==meal.id&&replacement.kind===meal.kind);}],
    ['Sustituir una comida no reduce su energía por debajo del mínimo ya alcanzado',()=>{const meal=make().days[0].meals[0],replacement=replaceMeal({meal,kind:meal.kind,profile:sample,foods,recipes});assert(mealTotals(replacement,foods).kcal+1e-6>=mealTotals(meal,foods).kcal);}],
    ['Variedad: al menos diez recetas distintas en tres comidas diarias',()=>{assert(new Set(make().days.flatMap(d=>d.meals.map(m=>m.id))).size>=10);}],
    ['Menú nunca baja del mínimo calórico ni del 80 % del gasto estimado',()=>{for(const p of [{...sample,deficitPercent:20},{...sample,sex:'female',age:75,weight:48,height:150,activity:'sedentary',deficitPercent:20}]){const plan=calculatePlan(p).plan;for(const day of make(p).days)assert(dayTotals(day,foods).kcal+1e-6>=Math.max(plan.floor,plan.tdee*.8));}}],
    ['Cambiar el número de comidas no elimina bloqueos en silencio',()=>{const old=make();old.days[0].meals[0].locked=true;throws(()=>make({...sample,meals:4},{previous:old}));}],
    ['Energía diaria del perfil de referencia dentro de un 10 %',()=>{for(const day of make().days){const n=dayTotals(day,foods);assert(Math.abs(n.kcal/targetFor(sample).kcal-1)<=.1);for(const k of ['protein','carbs','fat'])assert(Number.isFinite(n[k])&&n[k]>=0);}}],
    ['Compra: suma cantidades del mismo alimento en comidas y días',()=>{const menu={days:[{meals:[{ingredients:[{foodId:'arroz',grams:75},{foodId:'aceite',grams:10}]},{ingredients:[{foodId:'arroz',grams:50}]}]},{meals:[{ingredients:[{foodId:'arroz',grams:100}]}]}]};const list=shoppingList(menu,foods);approx(list.find(i=>i.foodId==='arroz').grams,225);assert(list.length===2);}],
    ['Compra: no redondea cada ingrediente antes de sumar',()=>{const m={days:[{meals:[{ingredients:[{foodId:'arroz',grams:33.33},{foodId:'arroz',grams:33.33},{foodId:'arroz',grams:33.33}]}]}]};approx(shoppingList(m,foods)[0].grams,99.99);}],
    ['Compra: conserva secciones y separa IDs con nombre parecido',()=>{const m={days:[{meals:[{ingredients:[{foodId:'arroz',grams:50},{foodId:'arroz-integral',grams:50},{foodId:'pollo',grams:100}]}]}]};const list=shoppingList(m,foods);assert(list.length===3&&list.find(x=>x.foodId==='pollo').section==='Carnes');}],
    ['Compra: rechaza cantidades inválidas y alimentos ausentes',()=>{for(const item of [{foodId:'arroz',grams:-1},{foodId:'arroz',grams:NaN},{foodId:'ausente',grams:100}])throws(()=>shoppingList({days:[{meals:[{ingredients:[item]}]}]},foods));}],
    ['Compra: lista vacía sin menú',()=>assert(shoppingList(null,foods).length===0)],
    ['Compra semanal: el agregado equivale a todos los gramos del menú',()=>{const menu=make();const all=menu.days.flatMap(d=>d.meals.flatMap(m=>m.ingredients)).reduce((s,i)=>s+i.grams,0);approx(shoppingList(menu,foods).reduce((s,i)=>s+i.grams,0),all);}],
    ['1RM: una repetición real; Epley hasta 12; fuera del rango sin estimar',()=>{approx(estimated1RM(100,1),100);approx(estimated1RM(60,10),80);assert(estimated1RM(0,8)===null&&estimated1RM(60,13)===null);}],
    ['Récords: primer registro es base; empate no es récord',()=>{assert(recordFlags(set(50),[]).length===0);assert(recordFlags(set(50),[set(50)]).length===0);assert(recordFlags(set(60,10),[set(50,8)]).length===3);}],
    ['Historial: última sesión ordenada por fecha',()=>{const old=session('a','2026-11-10',[set(50)]),recent=session('b','2026-11-15',[set(60)]);assert(lastExercise([recent,old],'e1').sets[0].weight===60);}],
    ['Récords recalculados tras insertar una sesión antigua o borrarla',()=>{const s=seeded();s.sessions=[session('b','2026-11-15',[set(60)]),session('a','2026-11-10',[set(50)])];recomputeRecords(s);assert(s.sessions[0].sets[0].records.includes('Mayor peso'));s.sessions=s.sessions.slice(0,1);recomputeRecords(s);assert(s.sessions[0].sets[0].records.length===0);}],
    ['Volumen: fecha, grupo y peso × repeticiones; no incluye otras semanas',()=>{const sessions=[session('a','2026-11-16',[set(50,10),set(60,5)]),session('b','2026-11-23',[set(200)])];approx(weeklyVolume(sessions,exercises,'2026-11-16','2026-11-23').Pecho,800);}],
    ['Resumen: cumplimiento sobre días registrados y sesiones terminadas',()=>{const s=seeded();s.nutrition={'2026-11-16':{calories:2000,target:2000,source:'manual'},'2026-11-17':{calories:1700,target:2000,source:'menu'}};s.sessions=[session('a','2026-11-16',[{...set(60),records:['Mayor peso','Mejor 1RM estimado']}])];const w=weeklySummary(s,'2026-11-16');assert(w.workouts===1&&w.records===1&&w.compliant===1&&w.logged===2);}],
    ['Copia: valida estructura, perfil, menú y registros en un ciclo completo',()=>{const s=seeded();s.menu=make();const backup={format:'dieta-gym-backup',version:2,profile:{version:1,data:sample},state:s};assert(parseBackup(JSON.stringify(backup)).state.menu.days.length===7);}],
    ['Copia: rechaza objetivos manipulados y series con referencias rotas',()=>{const s=seeded();s.menu=make();s.menu.target.kcal=500;throws(()=>validateState(s));const other=seeded();other.sessions=[session('a','2026-11-16',[{...set(50),exerciseId:'desconocido'}])];throws(()=>validateState(other));}],
    ['Copia: rechaza formato desconocido y números no finitos',()=>{throws(()=>parseBackup('{}'));const s=seeded();s.foods[0].fat=Infinity;throws(()=>validateState(s));}],
    ['Fechas: lunes local y cambios de mes sin restar milisegundos',()=>{assert(monday('2026-11-22')==='2026-11-16');assert(addDays('2026-12-31',1)==='2027-01-01');assert(!validDate('2026-02-30'));}],
    ['Texto importado: se escapa antes de insertarse en la interfaz',()=>{assert(esc('<img src=x onerror="x">').startsWith('&lt;img'));}]
  ];
}
