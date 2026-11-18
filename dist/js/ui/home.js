import { fmt,esc,dayKey,monday } from '../utils.js';
import { calculatePlan } from '../diet/calculations.js';
import { weeklySummary } from '../progress/summary.js';
import { button } from './helpers.js';
import { icon } from './icons.js';

export function homeView(state,profile) {
  const plan=profile?calculatePlan(profile).plan:null,today=dayKey();
  const logged=state.nutrition[today],summary=weeklySummary(state,monday());
  const planned=state.routines.find(r=>r.days.includes((new Date().getDay()+6)%7));
  const todayMenu=state.menu?.days.find(d=>d.date===today);
  return `<div class="page-heading"><p class="eyebrow">${esc(new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}))}</p><h1>Hoy</h1></div>`+
    (!plan?`<section class="panel setup-guide"><span class="icon-tile">${icon('user')}</span><div><h2>${profile?'Revisa tus datos':'Empieza por tus datos'}</h2><p>${profile?'Revisa los avisos de seguridad para calcular tu alimentación.':'Te servirán para calcular tus calorías y preparar el menú.'}</p></div>${button('edit-profile',profile?'Revisar datos':'Configurar alimentación','','primary')}</section>`:'')+
    `<div class="simple-home-grid"><section class="panel today-energy"><div class="day-title"><h2>Alimentación</h2>${icon('food')}</div><p class="simple-energy"><strong>${logged?fmt(logged.calories):'—'}</strong><span>${plan?'de '+fmt(plan.calories)+' kcal':'Sin objetivo calculado'}</span></p><p class="help">${logged?'Calorías registradas hoy.':'Aún no has registrado comidas hoy.'}</p>${plan?`<details class="quiet-details"><summary>Ver objetivo de nutrientes</summary><div class="simple-macros">${[['Proteínas',plan.protein],['Hidratos',plan.carbs],['Grasas',plan.fat]].map(([label,n])=>`<span>${label}<strong>${fmt(n)} g</strong></span>`).join('')}</div></details><div class="toolbar">${button('go-menu',todayMenu?'Ver mis comidas':'Preparar menú','','primary')}${button('quick-energy','Anotar calorías')}</div>`:button('edit-profile','Calcular mis calorías')}</section>
    <section class="panel today-workout"><div class="day-title"><h2>Entrenamiento</h2>${icon('train')}</div><h3>${esc(state.draft?.name||planned?.name||'Entrena a tu ritmo')}</h3><p class="help">${state.draft?`${state.draft.sets.length} series guardadas. Tu sesión sigue en curso.`:planned?`${planned.exerciseIds.length} ejercicios previstos para hoy.`:'Elige una rutina o empieza una sesión libre.'}</p>${button(state.draft?'go-train':planned?'choose-routine':'go-train',state.draft?'Continuar sesión':planned?'Preparar entrenamiento':'Empezar a entrenar',planned&&!state.draft?`data-id="${esc(planned.id)}"`:'','primary')}</section></div>
    <section class="panel simple-week"><div><h2>Esta semana</h2><p>${summary.workouts} entrenamientos terminados</p></div><div class="toolbar">${button('weight-entry','Anotar peso')}${button('go-progress','Ver progreso')}</div></section>`;
}
