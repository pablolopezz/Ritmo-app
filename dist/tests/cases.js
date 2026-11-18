import { calculatePlan, mifflinStJeor } from '../js/diet/calculations.js';
import { assessProfile, ACTIVITIES } from '../js/diet/safety.js';

export const sample = { sex: 'male', age: 30, weight: 80, height: 180, activity: 'moderate', goal: 'lose', meals: 3, diet: 'omnivore', exclusions: '', supervision: false, proteinPerKg: 2, fatPercent: 30, deficitPercent: 15, surplusPercent: 10 };
const assert = (condition, message = 'El resultado no coincide con lo esperado') => { if (!condition) throw new Error(message); };
const approx = (a, b) => assert(Math.abs(a - b) < 0.000001, `${a} ≠ ${b}`);
const planFor = overrides => calculatePlan({ ...sample, ...overrides });
export const tests = [
  ['Mifflin masculino: 1.780 kcal', () => approx(mifflinStJeor(sample), 1780)],
  ['Mifflin femenino: 1.614 kcal', () => approx(mifflinStJeor({ ...sample, sex: 'female' }), 1614)],
  ['Gasto moderado 2.759 y objetivo −15 %: 2.346 kcal', () => { const { plan } = planFor({}); approx(plan.tdee, 2759); approx(plan.calories, 2346); }],
  ['Actividad: los cinco factores producen el gasto esperado', () => { for (const [activity, factor] of Object.entries(ACTIVITIES)) approx(planFor({ activity }).plan.tdee, 1780 * factor); }],
  ['Mantenimiento y superávit', () => { approx(planFor({ goal: 'maintain' }).plan.calories, 2759); approx(planFor({ goal: 'gain' }).plan.calories, 3035); }],
  ['Macros: 160 g proteína, 78,2 g grasas, 250,55 g hidratos', () => { const { plan } = planFor({}); approx(plan.protein, 160); approx(plan.fat, 78.2); approx(plan.carbs, 250.55); }],
  ['La energía de los macros coincide con el objetivo', () => { for (const proteinPerKg of [1.2, 1.8, 2.4]) for (const fatPercent of [20, 30, 35]) { const { plan } = planFor({ proteinPerKg, fatPercent }); approx(plan.protein * 4 + plan.fat * 9 + plan.carbs * 4, plan.calories); } }],
  ['Ajustar proteína o grasa recalcula los hidratos', () => { const base = planFor({}).plan; const changed = planFor({ proteinPerKg: 2.2, fatPercent: 35 }).plan; assert(changed.protein > base.protein && changed.fat > base.fat && changed.carbs < base.carbs); }],
  ['Nunca se supera un déficit del 20 %', () => { for (const weight of [60, 80, 100]) { const { plan } = planFor({ weight, deficitPercent: 20 }); assert(plan && plan.calories >= plan.tdee * .8); } }],
  ['Mínimo femenino de 1.200 kcal y aviso explícito', () => { const { plan } = planFor({ sex: 'female', age: 75, weight: 48, height: 150, activity: 'sedentary', deficitPercent: 20 }); assert(plan.calories === 1200 && plan.notices.length === 1); }],
  ['Mínimo masculino de 1.500 kcal', () => { const { plan } = planFor({ age: 75, weight: 50, height: 155, activity: 'sedentary', deficitPercent: 20, proteinPerKg: 1.8 }); assert(plan.calories === 1500); }],
  ['Datos vacíos, NaN, infinitos y extremos no generan plan', () => { for (const overrides of [{ age: NaN }, { weight: Infinity }, { height: 0 }, { weight: -1 }, { age: 30.5 }, { age: '' }, { meals: 7 }, { meals: 2.5 }, { height: 231 }]) assert(planFor(overrides).plan === null); }],
  ['Enums y perfil guardado manipulados se rechazan', () => { for (const overrides of [{ activity: 'toString' }, { sex: 'unknown' }, { goal: 'extreme' }, { diet: 'unknown' }, { supervision: null }, { exclusions: null }]) assert(planFor(overrides).errors.length > 0); assert(assessProfile(null).errors.length > 0); }],
  ['Límites de déficit, superávit y macros no se pueden eludir', () => { for (const overrides of [{ deficitPercent: 21 }, { surplusPercent: 16 }, { proteinPerKg: 2.5 }, { fatPercent: 19 }, { deficitPercent: -1 }]) assert(planFor(overrides).plan === null); }],
  ['Menores, supervisión y mayores de 80: bloqueados', () => { for (const overrides of [{ age: 17 }, { supervision: true }, { age: 81 }]) { const r = planFor(overrides); assert(!r.plan && r.warnings.length > 0); } }],
  ['IMC bajo bloquea incluso el objetivo de mantenimiento', () => { const r = planFor({ weight: 45, goal: 'maintain' }); assert(r.bmi < 18.5 && !r.plan && r.warnings.length); }],
  ['IMC igual o superior a 40 bloquea el plan', () => { const r = planFor({ weight: 140 }); assert(r.bmi >= 40 && !r.plan); }],
  ['Frontera IMC 18,5 aceptada; por debajo bloqueada', () => { assert(planFor({ height: 200, weight: 74 }).plan); assert(!planFor({ height: 200, weight: 73.9 }).plan); }],
  ['Reparto imposible: no se generan hidratos negativos', () => { const r = planFor({ sex: 'female', age: 80, height: 200, weight: 159, activity: 'sedentary', proteinPerKg: 2.4, fatPercent: 35, deficitPercent: 20 }); assert(!r.plan && r.errors.length > 0); }],
  ['Exclusiones preservadas sin intervenir en el cálculo energético', () => { approx(planFor({ exclusions: 'cacahuetes, marisco' }).plan.calories, planFor({}).plan.calories); }]
];
