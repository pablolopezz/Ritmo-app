import { ACTIVITIES, assessProfile } from './safety.js';

export function mifflinStJeor({ sex, age, weight, height }) {
  if (!['female', 'male'].includes(sex) || ![age, weight, height].every(Number.isFinite)) throw new TypeError('Datos inválidos para Mifflin-St Jeor.');
  return 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161);
}

export function calculatePlan(profile) {
  const assessment = assessProfile(profile);
  if (assessment.errors.length || assessment.warnings.length) return { ...assessment, plan: null };
  const bmr = mifflinStJeor(profile);
  const tdee = bmr * ACTIVITIES[profile.activity];
  const factor = profile.goal === 'lose' ? 1 - profile.deficitPercent / 100 : profile.goal === 'gain' ? 1 + profile.surplusPercent / 100 : 1;
  const floor = profile.sex === 'female' ? 1200 : 1500;
  // Round upward so rounding cannot exceed the maximum allowed deficit.
  const calories = Math.ceil(Math.max(floor, tdee * factor, tdee * 0.8));
  const protein = profile.weight * profile.proteinPerKg;
  const fat = calories * profile.fatPercent / 100 / 9;
  const carbs = (calories - protein * 4 - fat * 9) / 4;
  if (carbs < 0) return { ...assessment, errors: ['La proteína y las grasas superan las calorías disponibles. Reduce la proteína o el porcentaje de grasas.'], plan: null };
  const notices = [];
  if (calories > Math.ceil(tdee * factor)) notices.push(`Se ha aplicado el mínimo orientativo de ${floor} kcal. Ese mínimo no garantiza que la ingesta sea adecuada para ti.`);
  return { ...assessment, plan: { bmr, tdee, calories, protein, fat, carbs, floor, notices, actualChange: (calories / tdee - 1) * 100 } };
}
