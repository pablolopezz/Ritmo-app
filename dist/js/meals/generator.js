import { norm, addDays } from '../utils.js';
import { calculatePlan } from '../diet/calculations.js';

const aliases = {
  gluten:['gluten','celiaco','celiaca','trigo','cebada','centeno'],
  leche:['leche','lactosa','lacteos','lacteo','proteina de leche'],
  huevo:['huevo','huevos'], pescado:['pescado','pescados'],
  crustaceos:['crustaceos','gamba','gambas','langostino'], moluscos:['moluscos','mejillones'],
  soja:['soja'], 'frutos-secos':['frutos secos','fruto seco','nueces de arbol'],
  cacahuete:['cacahuete','cacahuetes','mani'], sesamo:['sesamo','ajonjoli'],
  mostaza:['mostaza'], apio:['apio'], carne:['carne','carnes']
};
export function exclusionsFor(text, foods) {
  const terms = text.split(/[,;\n]+/).map(s=>norm(s).replace(/^(sin|alergia a(l)?|no como)\s+/, '')).filter(Boolean);
  const ids=new Set(), unknown=[];
  for (const term of terms) {
    const tags=Object.entries(aliases).filter(([,names])=>names.includes(term)).map(([tag])=>tag);
    if (term==='marisco' || term==='mariscos') tags.push('crustaceos','moluscos');
    const matches=foods.filter(f=> norm(f.name).includes(term) || norm(f.id)===term || norm(f.section)===term || f.allergens.some(t=>tags.includes(t)||norm(t)===term));
    if (!matches.length) unknown.push(term);
    matches.forEach(f=>ids.add(f.id));
  }
  return {ids,unknown};
}
export const emptyTotals = () => ({kcal:0,protein:0,carbs:0,fat:0});
export function sumNutrition(items) { return items.reduce((sum,item)=> { for(const k of Object.keys(sum)) sum[k]+=item[k]; return sum; },emptyTotals()); }
export function mealTotals(meal, foods) {
  return sumNutrition(meal.ingredients.map(i=>{
    const f=foods.find(f=>f.id===i.foodId); if(!f) throw new Error('Falta un alimento del menú. Restaura la base de alimentos o regenera el menú.');
    return Object.fromEntries(Object.keys(emptyTotals()).map(k=>[k,f[k]*i.grams/100]));
  }));
}
export const dayTotals = (day,foods) => sumNutrition(day.meals.map(m=>mealTotals(m,foods)));
export const mealSlots = count => {
  const weights={2:[.5,.5],3:[.25,.4,.35],4:[.22,.33,.3,.15],5:[.2,.3,.28,.11,.11],6:[.18,.27,.25,.1,.1,.1]};
  const labels=count===2?['Comida','Cena']:['Desayuno','Comida','Cena','Merienda','Tentempié','Recena'];
  return weights[count].map((weight,i)=>({weight,label:labels[i],kind:count===2?'main':i===0?'breakfast':i<3?'main':'snack'}));
};
export function eligibleRecipes(profile,foods,recipes) {
  const exclusion=exclusionsFor(profile.exclusions,foods);
  if(exclusion.unknown.length) throw new Error('No reconozco estas exclusiones: '+exclusion.unknown.join(', ')+'. Revisa los nombres o añade el alimento y sus alérgenos a la base.');
  return recipes.filter(r=>r.ingredients.every(i=>{
    const f=foods.find(f=>f.id===i.foodId);
    return f && !exclusion.ids.has(f.id) && (profile.diet==='omnivore'||(profile.diet==='vegan'?f.vegan:f.vegetarian));
  }));
}
const distance=(a,t)=>['kcal','protein','carbs','fat'].reduce((s,k)=>s+((a[k]-t[k])/Math.max(t[k],k==='kcal'?100:10))**2*(k==='kcal'?4:1),0);
// Coordinate descent adjusts edible raw grams within 0.4–3 portions. It is an
// approximation, and the UI explicitly reports actual totals and deviations.
export function fitRecipe(recipe,target,foods) {
  const base=mealTotals(recipe,foods);
  const scale=Math.max(.4,Math.min(3,target.kcal/Math.max(base.kcal,1)));
  const meal={...recipe,ingredients:recipe.ingredients.map(i=>({...i,grams:Math.round(i.grams*scale)})),locked:false};
  let score=distance(mealTotals(meal,foods),target);
  for(const step of [20,10,5,1]) for(let pass=0;pass<3;pass++) {
    let changed=false;
    for(let i=0;i<meal.ingredients.length;i++) {
      const part=meal.ingredients[i],old=part.grams;
      let best=old;
      for(const direction of [-1,1]) {
        const next=old+step*direction;
        if(next<Math.max(1,Math.round(recipe.ingredients[i].grams*.4)) || next>Math.round(recipe.ingredients[i].grams*3)) continue;
        part.grams=next;const value=distance(mealTotals(meal,foods),target);
        if(value<score) {score=value;best=next;changed=true;}
      }
      part.grams=best;
    }
    if(!changed) break;
  }
  return {meal,score};
}
export function generateWeek({profile,target,foods,recipes,start,previous=null,random=Math.random}) {
  const plan=calculatePlan(profile).plan;
  if(!plan || Math.abs(target.kcal-plan.calories)>.01 || ['protein','carbs','fat'].some(k=>Math.abs(target[k]-plan[k])>.01)) throw new Error('El menú necesita un perfil y un objetivo seguros.');
  if(previous?.start===start && previous.profile.meals!==profile.meals && previous.days.some(d=>d.meals.some(m=>m.locked))) throw new Error('Has cambiado el número de comidas. Mantén el número anterior o desbloquea las comidas antes de regenerar.');
  const pool=eligibleRecipes(profile,foods,recipes),slots=mealSlots(profile.meals),usage=Object.create(null);
  const days=[];
  for(let d=0;d<7;d++) {
    const old=previous?.start===start?previous.days?.[d]:null;
    const locked=slots.map((s,i)=>old?.meals?.length===slots.length && old.meals[i]?.locked?old.meals[i]:null);
    for(const m of locked.filter(Boolean)) {
      if(!pool.some(r=>r.id===m.id)) throw new Error('Una comida bloqueada contradice la dieta o las exclusiones actuales. Desbloquéala antes de regenerar.');
      usage[m.id]=(usage[m.id]||0)+1;
    }
    const lockedTotal=sumNutrition(locked.filter(Boolean).map(m=>mealTotals(m,foods)));
    const freeWeight=slots.reduce((sum,s,i)=>sum+(locked[i]?0:s.weight),0);
    const meals=slots.map((slot,i)=>{
      if(locked[i]) return structuredClone(locked[i]);
      const aim=Object.fromEntries(Object.keys(emptyTotals()).map(k=>[k,Math.max(0,target[k]-lockedTotal[k])*slot.weight/freeWeight]));
      const candidates=pool.filter(r=>r.kind===slot.kind).map(r=>{
        const fit=fitRecipe(r,aim,foods);return {...fit,rank:fit.score+(usage[r.id]||0)*.65+random()*.18};
      }).sort((a,b)=>a.rank-b.rank);
      if(!candidates.length) throw new Error(`No hay recetas compatibles para ${slot.label.toLowerCase()}. Revisa tu catálogo y exclusiones; no se ha cambiado el menú anterior.`);
      const meal={...candidates[0].meal,label:slot.label};usage[meal.id]=(usage[meal.id]||0)+1;return meal;
    });
    // Matching macros is approximate; the daily energy safety floor is not.
    // Add grams to unlocked meals, within their serving bounds, if fitting
    // undershot the calorie floor or the maximum moderate deficit.
    const required=Math.max(plan.floor,plan.tdee*.8);
    let actual=dayTotals({meals},foods).kcal;
    if(actual<required) {
      const adjustable=meals.filter(m=>!m.locked).flatMap(m=>m.ingredients.map(i=>{
        const base=recipes.find(r=>r.id===m.id).ingredients.find(x=>x.foodId===i.foodId);
        return {item:i,max:Math.round(base.grams*3),food:foods.find(f=>f.id===i.foodId)};
      })).filter(x=>x.food.kcal>0).sort((a,b)=>b.food.kcal-a.food.kcal);
      for(const x of adjustable) {
        const add=Math.min(x.max-x.item.grams,Math.ceil((required-actual)*100/x.food.kcal));
        if(add>0){x.item.grams+=add;actual+=add*x.food.kcal/100;}
        if(actual>=required)break;
      }
      if(actual+1e-6<required)throw new Error('Con estos bloqueos o exclusiones no se alcanza el mínimo seguro de calorías. Desbloquea comidas o revisa el perfil; no se ha generado el menú.');
    }
    days.push({date:addDays(start,d),meals});
  }
  return {start,days,profile:structuredClone(profile),target:structuredClone(target)};
}
export function replaceMeal({meal,kind,profile,foods,recipes,used=[]}) {
  const aim=mealTotals(meal,foods);
  const candidates=eligibleRecipes(profile,foods,recipes).filter(r=>r.kind===kind&&r.id!==meal.id).map(r=>{
    const fit=fitRecipe(r,aim,foods);
    let energy=mealTotals(fit.meal,foods).kcal;
    const parts=fit.meal.ingredients.map((item,i)=>({item,max:Math.round(r.ingredients[i].grams*3),food:foods.find(f=>f.id===item.foodId)})).sort((a,b)=>b.food.kcal-a.food.kcal);
    for(const x of parts) {
      if(energy>=aim.kcal)break;
      if(x.food.kcal<=0)continue;
      const add=Math.min(x.max-x.item.grams,Math.ceil((aim.kcal-energy)*100/x.food.kcal));
      if(add>0){x.item.grams+=add;energy+=add*x.food.kcal/100;}
    }
    return {...fit,energy,rank:distance(mealTotals(fit.meal,foods),aim)+used.filter(id=>id===r.id).length*.2};
  }).filter(c=>c.energy+1e-6>=aim.kcal&&c.energy<=aim.kcal*1.15).sort((a,b)=>a.rank-b.rank);
  if(!candidates.length) throw new Error('No hay otra receta compatible. Revisa las exclusiones o el tipo de dieta.');
  return {...candidates[0].meal,label:meal.label};
}
