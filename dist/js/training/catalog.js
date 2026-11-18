import { norm,esc,options } from '../utils.js';
import { button,empty } from '../ui/helpers.js';

// Add new seed IDs without replacing user exercises or breaking routine references.
export function mergeExerciseCatalog(current,seed) {
  const byId=new Map(current.map(e=>[e.id,e]));
  for(const exercise of seed) {
    const old=byId.get(exercise.id);
    if(!old)byId.set(exercise.id,structuredClone(exercise));
    else if(!old.instructions&&old.name===exercise.name&&old.equipment===exercise.equipment)byId.set(exercise.id,{...exercise,...old});
  }
  return [...byId.values()];
}
export function filterExercises(exercises,{query='',group='all',equipment='all'}={}) {
  const words=norm(query).split(/\s+/).filter(Boolean);
  return exercises.filter(e=>(group==='all'||e.group===group)&&(equipment==='all'||e.equipment===equipment)&&words.every(w=>norm(`${e.name} ${e.group} ${e.equipment}`).includes(w))).sort((a,b)=>a.name.localeCompare(b.name,'es'));
}
export function exerciseRows(exercises,filters={},pick=false) {
  const matches=filterExercises(exercises,filters);
  return `<p class="help" role="status">${matches.length} ejercicios encontrados</p>`+(matches.length?`<div class="exercise-library-grid">${matches.map(e=>`<article class="exercise-library-card"><div><span class="exercise-muscle">${esc(e.group)}</span><h3>${esc(e.name)}</h3><p class="help">${esc(e.equipment)}</p></div><div class="toolbar">${button('exercise-detail','Técnica',`data-id="${esc(e.id)}"`)}${pick?button('pick-exercise','Elegir',`data-id="${esc(e.id)}"`,'primary'):''}</div></article>`).join('')}</div>`:empty('Sin coincidencias','Prueba otro nombre o cambia los filtros. Puedes añadir un ejercicio propio.'));
}
export function libraryFilters(exercises,filters={},prefix='library') {
  const values=key=>[...new Set(exercises.map(e=>e[key]))].sort((a,b)=>a.localeCompare(b,'es'));
  return `<div class="exercise-filters"><label>Buscar ejercicio<input type="search" id="${prefix}-search" value="${esc(filters.query||'')}" placeholder="Ej. press, bíceps, mancuernas…" autocomplete="off"></label><div class="fields"><label>Grupo muscular<select id="${prefix}-group">${options([['all','Todos los grupos'],...values('group').map(v=>[v,v])],filters.group||'all')}</select></label><label>Equipo<select id="${prefix}-equipment">${options([['all','Todo el equipo'],...values('equipment').map(v=>[v,v])],filters.equipment||'all')}</select></label></div></div>`;
}
export function exerciseDetail(exercise) {
  return `<div class="exercise-detail"><p class="eyebrow">${esc(exercise.group)} · ${esc(exercise.equipment)}</p><h2>${esc(exercise.name)}</h2><h3>Claves de ejecución</h3>${exercise.instructions?.length?`<ol>${exercise.instructions.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`:'<p class="help">Ajusta el equipo y usa un recorrido controlado que puedas realizar sin dolor.</p>'}<p class="notice">Estas indicaciones son generales. Aprende la técnica con un profesional, empieza con una carga controlable y detente si aparece dolor.</p><p class="help">Registro: peso total en barra o máquina; en mancuernas, mantén siempre el mismo criterio. En ejercicios sin carga externa, registra 0 kg. Anota las repeticiones por lado con el mismo criterio en cada sesión.</p></div>`;
}
export function routinePickerRows(state,routine) {
  return state.exercises.map(e=>`<label class="check" data-exercise-name="${esc(norm(`${e.name} ${e.group} ${e.equipment}`))}"><input type="checkbox" name="exercises" value="${esc(e.id)}" ${routine?.exerciseIds.includes(e.id)?'checked':''}><span>${esc(e.name)}<small>${esc(e.group)} · ${esc(e.equipment)}</small></span></label>`).join('');
}

// All matches remain reachable; render in small batches to keep the mobile dialog usable.
export function exercisePickerRows(exercises,query='',sessionIds=[],limit=40) {
  const matches=filterExercises(exercises,{query});
  const rank=new Map(sessionIds.map((id,index)=>[id,index]));
  if(!query.trim())matches.sort((a,b)=>(rank.get(a.id)??Infinity)-(rank.get(b.id)??Infinity)||a.name.localeCompare(b.name,'es'));
  const count=Number.isInteger(limit)&&limit>=40?Math.min(limit,50000):40;
  const shown=matches.slice(0,count);
  return `<p class="help" role="status">${matches.length?`Mostrando ${shown.length} de ${matches.length} ejercicios${query.trim()?' encontrados':''}`:'Sin resultados'}</p><div class="workout-choices">${shown.map(e=>`<button type="button" class="workout-choice" data-action="pick-exercise" data-id="${esc(e.id)}"><span><strong>${esc(e.name)}</strong><small>${esc(e.group)} · ${esc(e.equipment)}</small></span><span aria-hidden="true">+</span></button>`).join('')||'<p class="help">Prueba otro nombre, músculo o equipo.</p>'}</div>${shown.length<matches.length?button('picker-more','Mostrar más ejercicios',`aria-label="Mostrar los siguientes ejercicios; ${matches.length-shown.length} pendientes"`):''}`;
}
