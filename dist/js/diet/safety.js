export const ACTIVITIES = Object.freeze({ sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725, veryHigh: 1.9 });
export const GOALS = ['lose', 'maintain', 'gain'];

// These are product guardrails, not a medical assessment or a guarantee of adequacy.
export function assessProfile(p) {
  const errors = [];
  const warnings = [];
  if (!p || typeof p !== 'object') return { errors: ['El perfil no es válido.'], warnings, bmi: null };
  const range = (key, min, max, label, integer = false) => {
    if (!Number.isFinite(p[key]) || p[key] < min || p[key] > max || (integer && !Number.isInteger(p[key]))) errors.push(`${label}: introduce un valor entre ${min} y ${max}${integer ? ', sin decimales' : ''}.`);
  };
  range('age', 12, 100, 'Edad', true);
  range('weight', 25, 350, 'Peso');
  range('height', 120, 230, 'Altura');
  range('meals', 2, 6, 'Comidas', true);
  range('proteinPerKg', 1.2, 2.4, 'Proteína en g/kg');
  range('fatPercent', 20, 35, 'Porcentaje de grasas');
  range('deficitPercent', 0, 20, 'Déficit');
  range('surplusPercent', 0, 15, 'Superávit');
  if(p.displayName!==undefined && (typeof p.displayName!=='string'||p.displayName.length>60)) errors.push('El nombre debe ser texto de hasta 60 caracteres.');
  if (!['female', 'male'].includes(p.sex)) errors.push('Selecciona la fórmula de sexo.');
  if (!Object.hasOwn(ACTIVITIES, p.activity)) errors.push('Selecciona un nivel de actividad válido.');
  if (!GOALS.includes(p.goal)) errors.push('Selecciona un objetivo válido.');
  if (!['omnivore', 'vegetarian', 'vegan'].includes(p.diet)) errors.push('Selecciona un tipo de dieta válido.');
  if (typeof p.exclusions !== 'string' || p.exclusions.length > 1000) errors.push('Las exclusiones deben tener como máximo 1.000 caracteres.');
  if (typeof p.supervision !== 'boolean') errors.push('Indica si necesitas supervisión profesional.');
  if (errors.length) return { errors, warnings, bmi: null };
  const bmi = p.weight / ((p.height / 100) ** 2);
  if (p.age < 18) warnings.push('No se generan planes automáticos para menores de 18 años. Consulta con un profesional.');
  if (p.supervision) warnings.push('En embarazo, lactancia, enfermedades o situaciones que requieren supervisión, el plan debe individualizarlo un médico o dietista.');
  if (bmi < 18.5) warnings.push('El IMC está por debajo de 18,5. Se bloquea el plan automático para evitar una recomendación inadecuada.');
  if (bmi >= 40) warnings.push('El IMC es igual o superior a 40. Solicita una valoración profesional antes de establecer calorías.');
  if (p.age > 80) warnings.push('Por encima de 80 años, esta app requiere una valoración profesional para generar un plan.');
  return { errors, warnings, bmi };
}
