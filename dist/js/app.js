import { icon } from './ui/icons.js';
import { readAppearance,currentAppearance,applyAppearance } from './ui/appearance.js';
import { calculatePlan } from './diet/calculations.js';
import { loadProfile, saveProfile } from './storage.js';

document.querySelectorAll('[data-icon]').forEach(node => { node.innerHTML = icon(node.dataset.icon); });
const form = document.querySelector('#profile');
const status = document.querySelector('#status');
const result = document.querySelector('#result');
const empty = document.querySelector('#empty');
const problems = document.querySelector('#problems');
const numberKeys = ['age', 'weight', 'height', 'meals', 'proteinPerKg', 'fatPercent', 'deficitPercent', 'surplusPercent'];
const format = (value, digits = 0) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits }).format(value);

function readProfile() {
  const profile = Object.fromEntries(new FormData(form));
  for (const key of numberKeys) profile[key] = profile[key] === '' ? NaN : Number(profile[key]);
  profile.supervision = profile.supervision === 'yes' ? true : profile.supervision === 'no' ? false : null;
  return profile;
}

function showMessages(items) {
  problems.replaceChildren();
  for (const message of items) {
    const p = document.createElement('p');
    p.textContent = message;
    problems.append(p);
  }
  problems.hidden = !items.length;
}

function render(profile) {
  const calculation = calculatePlan(profile);
  const { plan, errors, warnings, bmi } = calculation;
  showMessages([...errors, ...warnings]);
  result.hidden = !plan;
  empty.hidden = Boolean(plan);
  if (!plan) {
    document.querySelector('#empty-title').textContent = errors.length || warnings.length ? 'Revisa tu perfil' : 'Tu punto de partida';
    document.querySelector('#empty-copy').textContent = 'No hay una recomendación activa. Completa el perfil con datos válidos y revisa los avisos.';
    return false;
  }
  for (const key of ['bmr', 'tdee', 'calories']) document.querySelector(`[data-value="${key}"]`).textContent = format(plan[key]);
  for (const key of ['protein', 'carbs', 'fat']) {
    document.querySelector(`[data-value="${key}"]`).textContent = format(plan[key], 1);
    const percent = plan[key] * (key === 'fat' ? 9 : 4) / plan.calories * 100;
    document.querySelector(`[data-bar="${key}"]`).style.width = `${percent}%`;
    document.querySelector(`[data-percent="${key}"]`).textContent = `${format(percent, 1)} %`;
  }
  document.querySelector('#bmi').textContent = format(bmi, 1);
  document.querySelector('#energy-change').textContent = `${plan.actualChange >= 0 ? '+' : ''}${format(plan.actualChange, 1)} % respecto a tu gasto estimado`;
  document.querySelector('#plan-notice').textContent = plan.notices.join(' ');
  document.querySelector('#plan-notice').hidden = !plan.notices.length;
  return true;
}

function syncControls() {
  const goal = form.elements.goal.value;
  document.querySelector('#deficit-setting').hidden = goal !== 'lose';
  document.querySelector('#surplus-setting').hidden = goal !== 'gain';
  for (const name of ['proteinPerKg', 'fatPercent']) document.querySelector(`#${name}-value`).textContent = format(Number(form.elements[name].value), 1);
}

form.addEventListener('input', () => {
  syncControls();
  result.hidden = true;
  empty.hidden = false;
  document.querySelector('#empty-title').textContent = 'Cambios pendientes';
  document.querySelector('#empty-copy').textContent = 'Pulsa «Guardar datos y recalcular» para actualizar tu recomendación.';
  status.textContent = 'Tienes cambios sin guardar.';
  showMessages([]);
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const profile = readProfile();
  const allowed = render(profile);
  const assessment = calculatePlan(profile);
  if (assessment.errors.length) {
    status.textContent = 'Revisa los campos. No se han guardado los cambios.';
    problems.focus();
    return;
  }
  const button = document.querySelector('#save');
  button.disabled = true;
  status.textContent = 'Guardando…';
  try {
    await saveProfile(profile);
    status.textContent = allowed ? 'Perfil guardado en este dispositivo.' : 'Perfil guardado. Plan automático bloqueado por seguridad.';
  } catch {
    status.textContent = 'No se pudo guardar en este navegador. El cálculo es temporal; revisa los permisos de almacenamiento.';
  } finally { button.disabled = false; }
});

const themeButton = document.querySelector('#theme');
function syncThemeButton() {
  const {theme}=currentAppearance();
  themeButton.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon') + `<span>${theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>`;
  themeButton.setAttribute('aria-label', theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro');
  themeButton.removeAttribute('aria-pressed');
}
let initialAppearance={theme:'dark',glass:'full'};
try {initialAppearance=readAppearance(localStorage);} catch { /* Local preferences may be unavailable. */ }
applyAppearance(initialAppearance,{persist:false});
syncThemeButton();
window.addEventListener('appearance-changed',syncThemeButton);
themeButton.addEventListener('click',()=>{
  const current=currentAppearance();
  applyAppearance({...current,theme:current.theme==='dark'?'light':'dark'});
});

// Avoid overwriting edits while the asynchronous database opens.
const controls = document.querySelector('#profile-fields');
controls.disabled = true;
try {
  const stored = await loadProfile();
  if (stored) {
    if (stored.version !== 1 || !stored.data || calculatePlan(stored.data).errors.length) throw new Error('Perfil incompatible');
    for (const [key, value] of Object.entries(stored.data)) {
      const input = form.elements.namedItem(key);
      if (input) input.value = key === 'supervision' ? (value ? 'yes' : 'no') : value;
    }
    render(stored.data);
    status.textContent = 'Perfil recuperado de este dispositivo.';
  } else status.textContent = 'Completa tu perfil para empezar.';
} catch {
  status.textContent = 'No se pudo recuperar el perfil. Puedes calcular; se avisará si no es posible guardarlo.';
} finally {
  controls.disabled = false;
  syncControls();
}
