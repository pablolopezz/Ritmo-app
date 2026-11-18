import { loadProfile,loadState,saveState,restoreBackup } from './storage.js';
import { newState,validateState,validateFood,parseBackup } from './state.js';
import { calculatePlan } from './diet/calculations.js';
import { uid,fmt,esc,norm,dayKey,monday,addDays,dateLabel,download,requireNumber,validDate } from './utils.js';
import { generateWeek,replaceMeal,mealSlots,mealTotals } from './meals/generator.js';
import { shoppingList } from './meals/shopping.js';
import { menuView,shoppingView,foodForm,foodRows } from './meals/view.js';
import { trainingView,exerciseForm,routineForm,weekDays,setEditForm } from './training/view.js';
import { recomputeRecords } from './training/metrics.js';
import { progressView,weightForm } from './progress/view.js';
import { weeklySummary } from './progress/summary.js';
import { heading,stats,button,empty } from './ui/helpers.js';
import { homeView as renderHome } from './ui/home.js';
import { settingsView } from './ui/settings.js';
import { currentAppearance,applyAppearance,defaultAppearance,preserveGlass } from './ui/appearance.js';
import { readSavedStyles,saveNamedStyle,removeNamedStyle,presetAppearance,parseAppearanceFile,serializeAppearance,resetAppearanceGroup } from './ui/styles.js';
import { installLiquidMotion,enterScreen,enterDialog,pulseSaved } from './ui/liquid-motion.js';
import { personalizationView } from './ui/personalization.js';
import { newIdentity,cleanIdentity } from './profile/model.js';
import { profileView,identityForm,avatarMarkup,sessionDetail } from './profile/view.js';
import { prepareAvatar } from './profile/photo.js';
import { mergeExerciseCatalog,exerciseRows,libraryFilters,exerciseDetail,exercisePickerRows } from './training/catalog.js';
import { sessionExerciseIds,selectedExerciseId,nextExerciseId } from './training/session.js';
import { healthReady,healthStatus,requestHealthAccess,readHealthWorkouts,saveHealthWorkout,workoutPayload } from './health/bridge.js';
import { healthView,healthExportForm } from './health/view.js';

let state,profile=null,recipes=[],busy=false,route='home';
const ui={menuDay:0,menuStart:monday(),foodSearch:'',week:monday(),exerciseId:null,progressExercise:null,restSeconds:90,exerciseGroup:'all',routineId:'free',menuTab:'plan',profileTab:'activity',trainTab:'session',historyLimit:20,exerciseFilters:{query:'',group:'all',equipment:'all'},pickerFilters:{query:'',group:'all',equipment:'all'},health:{loading:false,workouts:null,watchOnly:false}};
const $=selector=>document.querySelector(selector);
const dialog=$('#edit-dialog'),dialogContent=$('#dialog-content');
installLiquidMotion();
const appearanceHistory=[];
let undoingAppearance=false,appearanceDragStart=null;
let toastTimer,pendingAvatar=null,photoLoading=false,photoTask=0,generating=false;
function notify(message,error=false) {
  const node=$('#toast');node.textContent=message;node.hidden=false;node.classList.toggle('error',error);
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.hidden=true,error?15000:6000);
}
function openDialog(content) {photoTask++;photoLoading=false;dialogContent.innerHTML=content;$('#dialog-error').textContent='';if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');enterDialog(dialog);}
const closeDialog=()=>{photoTask++;photoLoading=false;if(dialog.close)dialog.close();else dialog.removeAttribute('open');};
const currentPlan=()=>profile?calculatePlan(profile).plan:null;
function assertPlan() { const p=currentPlan();if(!p)throw new Error('Guarda un perfil que permita generar un plan seguro antes de continuar.');return p; }
function targetFrom(p) {return {kcal:p.calories,protein:p.protein,carbs:p.carbs,fat:p.fat};}
function profileChanged() {
  if(!state.menu)return false;
  const {displayName:oldName,...oldDiet}=state.menu.profile;
  const {displayName:newName,...newDiet}=profile||{};
  return JSON.stringify(oldDiet)!==JSON.stringify(newDiet);
}

// Mutate a clone, validate it and persist before changing the visible state.
// A failed write never pretends the operation was saved.
async function commit(change) {
  if(busy) throw new Error('Espera a que termine el guardado.');
  busy=true;document.body.classList.add('saving');
  try {
    const next=structuredClone(state);change(next);recomputeRecords(next);validateState(next);
    await saveState(next);state=next;render();
  } finally {busy=false;document.body.classList.remove('saving');}
}
function savedAppearanceStyles() {try{return readSavedStyles(localStorage);}catch{return [];}}
function homeView() { return renderHome(state,profile); }

function replaceView(selector,html) {
  const node=$(selector);
  const detailStates=new Map([...node.querySelectorAll('details[data-view-key]')].map(d=>[d.dataset.viewKey,d.open]));
  node.innerHTML=html;
  node.querySelectorAll('details[data-view-key]').forEach(d=>{if(detailStates.has(d.dataset.viewKey))d.open=detailStates.get(d.dataset.viewKey);});
}
function render() {
  replaceView('#home-screen',homeView());
  replaceView('#menu-screen',menuView(state,profile,ui)+`<section id="shopping-section" class="panel" data-nutrition-panel="shopping">${shoppingView(state)}</section>`);
  $('#menu-screen').dataset.nutritionView=ui.menuTab;
  replaceView('#train-screen',trainingView(state,ui));
  replaceView('#progress-screen',progressView(state,ui));
  replaceView('#settings-screen',settingsView(profile,currentAppearance(),$('#offline-status').textContent,Boolean(window.Capacitor?.isNativePlatform?.()),state.identity)+healthView(ui.health));
  replaceView('#personalize-screen',personalizationView(currentAppearance(),savedAppearanceStyles(),appearanceHistory.length));
  replaceView('#profile-screen',profileView(state,profile,ui.profileTab));
  if(profileChanged()) $('#menu-screen').insertAdjacentHTML('afterbegin','<p class="notice">El perfil ha cambiado. El menú conserva su objetivo anterior hasta que lo regeneres; revisa sus calorías y exclusiones.</p>');
  updateRest();
}
function navigate(next,scroll=true) {
  const previousRoute=route;
  const allowed=['home','menu','train','progress','profile','edit-profile','settings','personalize'];route=allowed.includes(next)?next:'home';
  for(const name of allowed) $(`#${name}-screen`).hidden=name!==route;
  document.querySelectorAll('[data-route]').forEach(b=>{b.setAttribute('aria-current',(b.dataset.route===route||(route==='personalize'&&b.dataset.route==='settings')||(route==='edit-profile'&&b.dataset.route==='profile'))?'page':'false');});
  document.title=`Ritmo · ${{home:'Hoy',menu:'Menú',train:'Entrenar',progress:'Progreso',profile:'Mi perfil','edit-profile':'Datos y objetivos',settings:'Ajustes',personalize:'Personalización'}[route]}`;
  $('#page-context').textContent={home:'Hoy',menu:'Comidas',train:'Entrenamiento',progress:'Progreso',profile:'Mi perfil','edit-profile':'Datos y objetivos',settings:'Ajustes',personalize:'Personalización'}[route];
  if(location.hash!=='#'+route) history.replaceState(null,'','#'+route);
  if(scroll) window.scrollTo({top:0,behavior:'instant'});
  if(previousRoute!==route||!scroll)enterScreen($(`#${route}-screen`));
}
function updateRest() {
  const node=$('#rest-status');if(!node)return;
  const left=state?.restEnd?Math.max(0,Math.ceil((state.restEnd-Date.now())/1000)):null;
  node.textContent=left===null?'Listo':left===0?'¡Descanso terminado!':`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;
}
setInterval(updateRest,1000);document.addEventListener('visibilitychange',updateRest);
function trackMenuDay(next,date) {
  if(next.nutrition[date]?.source==='manual') return;
  const day=next.menu?.days.find(d=>d.date===date);if(!day)return;
  const selected=day.meals.filter((m,i)=>next.consumed[date+':'+i]);
  if(!selected.length) {delete next.nutrition[date];return;}
  next.nutrition[date]={calories:selected.reduce((sum,m)=>sum+mealTotals(m,next.foods).kcal,0),target:next.menu.target.kcal,source:'menu'};
}
async function exportBackup() {
  const backup={format:'dieta-gym-backup',version:2,exportedAt:new Date().toISOString(),profile:profile?{version:1,data:profile}:null,state};
  await download(`ritmo-copia-${dayKey()}.json`,JSON.stringify(backup,null,2));
  notify('Copia exportada. Contiene datos personales: guárdala en un lugar protegido.');
}
const csvCell=value=>'"'+String(value).replaceAll('"','""')+'"';
function print(area) {
  document.body.dataset.print=area;
  const opened=[...document.querySelectorAll('#menu-screen .meal-card details:not([open])')];opened.forEach(d=>d.open=true);
  const cleanup=()=>{delete document.body.dataset.print;opened.forEach(d=>d.open=false);window.removeEventListener('afterprint',cleanup);};
  window.addEventListener('afterprint',cleanup);window.print();
}

const actions={
  'go-home':()=>navigate('home'),'go-menu':()=>{ui.menuTab='plan';const i=state.menu?.days.findIndex(d=>d.date===dayKey());if(i>=0)ui.menuDay=i;render();navigate('menu');},'go-train':()=>{ui.trainTab='session';render();navigate('train');},'go-profile':()=>navigate(!profile||!calculatePlan(profile).plan?'edit-profile':'profile'),'go-progress':()=>navigate('progress'),
  'go-shopping':()=>{ui.menuTab='shopping';render();navigate('menu');},
  'training-tab':b=>{ui.trainTab=b.dataset.tab;replaceView('#train-screen',trainingView(state,ui));updateRest();enterScreen($('#train-screen'));},
  'nutrition-tab':b=>{ui.menuTab=b.dataset.tab;render();enterScreen($('#menu-screen'));},
  'quick-energy':()=>{assertPlan();openDialog(`<form data-form="nutrition"><h2>Registrar calorías</h2><p class="help">Añade el total de tu día. Sustituye el cálculo de comidas marcadas para esta fecha.</p><div class="fields"><label>Fecha<input type="date" name="date" value="${dayKey()}" max="${dayKey()}" required></label><label>Calorías consumidas<input type="number" name="calories" min="0" max="20000" step="1" required inputmode="numeric" value="${state.nutrition[dayKey()]?.calories??''}"></label></div><button class="primary">Guardar total diario</button></form>`);},
  'menu-day':b=>{ui.menuDay=Number(b.dataset.index);render();enterScreen($('#menu-screen'));},
  generate:async b=>{
    if(generating)return;
    generating=true;if(b)b.disabled=true;
    try {
    const p=assertPlan(),start=$('#menu-start').value;if(!validDate(start))throw new Error('Elige una fecha válida para el inicio de semana.');
    const previous=state.menu;
    if(previous && previous.start!==start && !confirm('Esta semana reemplazará el menú actual y sus bloqueos. Los registros de calorías se conservan. ¿Continuar?'))return;
    if(previous?.days.some(d=>d.meals.some((m,i)=>state.consumed[d.date+':'+i]))) {
      if(!confirm('Al regenerar se conservan los totales de calorías ya registrados, pero se desmarcan las comidas consumidas. ¿Continuar?'))return;
    }
    ui.menuStart=start;
    notify('Preparando siete días de menú…');await new Promise(resolve=>setTimeout(resolve,30));
    const menu=generateWeek({profile,target:targetFrom(p),foods:state.foods,recipes,start,previous});
    await commit(n=>{n.menu=menu;n.shoppingChecked={};n.consumed={};});notify('Menú preparado. Revisa los totales y las raciones de cada día.');
    } finally {generating=false;if(b)b.disabled=false;}
  },
  'lock-meal':async b=>commit(n=>{const m=n.menu.days[Number(b.dataset.day)].meals[Number(b.dataset.meal)];m.locked=!m.locked;}),
  'replace-meal':async b=>{
    const d=Number(b.dataset.day),m=Number(b.dataset.meal),old=state.menu.days[d].meals[m];
    if(old.locked)throw new Error('Quita Fijar plato antes de cambiarlo.');
    if(state.consumed[state.menu.days[d].date+':'+m])throw new Error('Desmarca la comida consumida antes de sustituirla.');
    if(profileChanged())throw new Error('El perfil ha cambiado. Regenera el menú para aplicar la dieta y las exclusiones actuales.');
    const replacement=replaceMeal({meal:old,kind:mealSlots(state.menu.profile.meals)[m].kind,profile:state.menu.profile,foods:state.foods,recipes,used:state.menu.days.flatMap(d=>d.meals.map(m=>m.id))});
    await commit(n=>{n.menu.days[d].meals[m]=replacement;n.shoppingChecked={};});
  },
  'print-menu':()=>print('menu'),'print-shopping':()=>print('shopping'),
  'export-menu':()=>download(`menu-${state.menu.start}.json`,JSON.stringify(state.menu,null,2)),
  'export-shopping':()=>download(`compra-${state.menu.start}.csv`,'\ufeff'+[['Sección','Alimento','Gramos','Comprado'],...shoppingList(state.menu,state.foods).map(i=>[i.section,i.name,i.grams,state.shoppingChecked[i.foodId]?'Sí':'No'])].map(row=>row.map(csvCell).join(';')).join('\n'),'text/csv;charset=utf-8'),
  'add-food':()=>openDialog(foodForm()),'edit-food':b=>openDialog(foodForm(state.foods.find(f=>f.id===b.dataset.id))),
  'export-foods':()=>download('alimentos.json',JSON.stringify(state.foods,null,2)),
  'health-connect':async()=>healthOperation(async()=>{const status=await requestHealthAccess();Object.assign(ui.health,status,{checked:true});notify('Solicitud completada. Los permisos efectivos dependen de tu elección en Salud.');}),
  'health-read':async()=>healthOperation(async()=>{const status=await healthStatus();Object.assign(ui.health,status,{checked:true});if(!status.available)throw new Error('Salud no está disponible en este dispositivo.');const result=await readHealthWorkouts();ui.health.workouts=result.workouts;notify('Consulta completada. Revisa las sesiones y los permisos si no aparecen resultados.');}),
  'health-clear':()=>{ui.health.workouts=null;ui.health.error=null;renderHealth();notify('Datos de Salud ocultos. Los permisos se gestionan desde la app Salud.');},
  'health-export':b=>{const session=state.sessions.find(s=>s.id===b.dataset.id);if(!session)throw new Error('No se encuentra la sesión.');openDialog(healthExportForm(session));},
  'start-workout':async b=>startSession(b.dataset.id,dayKey()),
  'next-exercise':()=>{if(!state.draft)return;const current=selectedExerciseId(state.draft,ui.exerciseId),next=nextExerciseId(state.draft,current);if(next){ui.exerciseId=next;replaceView('#train-screen',trainingView(state,ui));updateRest();$('#train-screen').scrollIntoView?.({block:'start'});}},
  'picker-more':()=>{ui.pickerLimit=(ui.pickerLimit||40)+40;const position=dialog.scrollTop;$('#picker-results').innerHTML=exercisePickerRows(state.exercises,ui.pickerFilters.query,state.draft?sessionExerciseIds(state.draft):[],ui.pickerLimit);dialog.scrollTop=position;},
  'search-exercise':()=>{ui.pickerLimit=40;ui.pickerFilters={query:'',group:'all',equipment:'all'};openDialog(`<h2>Elige un ejercicio</h2><p class="help">${state.exercises.length} ejercicios disponibles. Busca por nombre, músculo o equipo.</p><label>Buscar<input type="search" id="picker-search" placeholder="Nombre, músculo o equipo…" autocomplete="off"></label><div id="picker-results">${exercisePickerRows(state.exercises,'',sessionExerciseIds(state.draft))}</div>`);},
  'exercise-detail':b=>{const exercise=state.exercises.find(e=>e.id===b.dataset.id);if(exercise)openDialog(exerciseDetail(exercise));},
  'pick-exercise':async b=>{const id=b.dataset.id;if(!state.draft||!state.exercises.some(e=>e.id===id))throw new Error('Inicia una sesión para elegir un ejercicio.');const ids=sessionExerciseIds(state.draft);if(!ids.includes(id)){ui.exerciseId=id;await commit(n=>{n.draft.exerciseIds=[...sessionExerciseIds(n.draft),id];});}else ui.exerciseId=id;replaceView('#train-screen',trainingView(state,ui));updateRest();closeDialog();},
  'new-exercise':()=>openDialog(exerciseForm()),'new-routine':()=>openDialog(routineForm(state)),
  'edit-routine':b=>openDialog(routineForm(state,state.routines.find(r=>r.id===b.dataset.id))),
  'delete-routine':async b=>{if(confirm('¿Eliminar esta rutina? Las sesiones del historial se conservan.'))await commit(n=>{n.routines=n.routines.filter(r=>r.id!==b.dataset.id);});},
  'choose-routine':b=>{ui.routineId=b.dataset.id;ui.trainTab='session';render();navigate('train');},
  'more-history':()=>{ui.historyLimit+=20;replaceView('#train-screen',trainingView(state,ui));updateRest();},
  'edit-set':b=>{const set=state.draft?.sets.find(s=>s.id===b.dataset.id);if(set)openDialog(setEditForm(set));},
  'delete-set':async b=>{await commit(n=>{n.draft.sets=n.draft.sets.filter(s=>s.id!==b.dataset.id);});closeDialog();notify('Serie eliminada.');},
  'discard-session':async()=>{if(confirm('¿Descartar la sesión en curso y sus series?'))await commit(n=>{n.draft=null;n.restEnd=null;});},
  'delete-session':async b=>{if(confirm('¿Eliminar esta sesión y sus series del historial?'))await commit(n=>{n.sessions=n.sessions.filter(s=>s.id!==b.dataset.id);});},
  'restart-rest':()=>commit(n=>{if(n.draft)n.restEnd=Date.now()+ui.restSeconds*1000;}),
  'stop-rest':()=>commit(n=>{n.restEnd=null;}),
  'edit-notes':b=>{const s=state.sessions.find(s=>s.id===b.dataset.id);openDialog(`<form data-form="notes" data-id="${esc(s.id)}"><h2>Notas del entrenamiento</h2><label>Notas<textarea name="notes" maxlength="2000">${esc(s.notes)}</textarea></label><button class="primary">Guardar notas</button></form>`);},
  'weight-entry':b=>openDialog(weightForm(state.weights.find(w=>w.date===b.dataset.date))),
  'delete-weight':async b=>{if(confirm('¿Eliminar este registro de peso y medidas?')){await commit(n=>{n.weights=n.weights.filter(w=>w.date!==b.dataset.date);});closeDialog();}},
  'delete-nutrition':async b=>commit(n=>{delete n.nutrition[b.dataset.date];if(n.menu?.days.some(d=>d.date===b.dataset.date))n.menu.days.find(d=>d.date===b.dataset.date).meals.forEach((m,i)=>delete n.consumed[b.dataset.date+':'+i]);}),
  backup:exportBackup,
  settings:()=>navigate('settings'),
  personalize:()=>{replaceView('#personalize-screen',personalizationView(currentAppearance(),savedAppearanceStyles(),appearanceHistory.length));navigate('personalize');},
  'appearance-color':b=>{if(!['background','accent'].includes(b.dataset.key))return;applyAppearance(preserveGlass({...currentAppearance(),[b.dataset.key]:b.dataset.color},currentAppearance()));},
  'appearance-preset':b=>{const current=currentAppearance();applyAppearance(preserveGlass({...presetAppearance(b.dataset.id),textSize:current.textSize,motion:current.motion,start:current.start,logoMode:current.logoMode,logoColor:current.logoColor,logoTile:current.logoTile,logoSize:current.logoSize,logoShape:current.logoShape,opacity:current.opacity,blur:current.blur,spaceTint:current.spaceTint,glassIntensity:current.glassIntensity,glassMotion:current.glassMotion},current));},
  'appearance-auto-cards':()=>applyAppearance({...currentAppearance(),cardColor:'auto'}),
  'apply-saved-style':b=>{const style=savedAppearanceStyles().find(s=>s.id===b.dataset.id);if(!style)throw new Error('Ese estilo ya no está guardado.');applyAppearance(preserveGlass(style.preferences,currentAppearance()));},
  'remove-saved-style':b=>{try{removeNamedStyle(localStorage,b.dataset.id);}catch{throw new Error('No se pudo eliminar el estilo en este navegador.');}replaceView('#personalize-screen',personalizationView(currentAppearance(),savedAppearanceStyles(),appearanceHistory.length));notify('Estilo eliminado. La apariencia actual se conserva.');},
  'export-appearance':()=>download('ritmo-estilo.json',serializeAppearance(currentAppearance())),
  'undo-appearance':()=>{const previous=appearanceHistory.pop();if(!previous)return;undoingAppearance=true;appearanceDragStart=null;try{applyAppearance(previous);}finally{undoingAppearance=false;}},
  'reset-appearance-group':b=>applyAppearance(resetAppearanceGroup(currentAppearance(),b.dataset.group)),
  'toggle-appearance-sections':()=>{const sections=[...$('#personalize-screen').querySelectorAll('details[data-view-key]')];const open=sections.some(d=>!d.open);sections.forEach(d=>d.open=open);},
  'reset-appearance':()=>{applyAppearance(defaultAppearance());notify('Apariencia restablecida. Tus registros se conservan.');},
  'edit-profile':()=>{navigate('edit-profile');$('#profile-heading').focus({preventScroll:true});},
  'edit-identity':()=>{photoTask++;photoLoading=false;pendingAvatar=state.identity.avatar;openDialog(identityForm(state.identity));},
  'remove-avatar':()=>{photoTask++;photoLoading=false;pendingAvatar=null;updateAvatarPreview();const save=$('#identity-save');if(save)save.disabled=false;const status=$('#photo-status');if(status)status.textContent='Foto quitada de la vista previa. Guarda el perfil para confirmar.';},
  'profile-tab':b=>{ui.profileTab=b.dataset.tab;replaceView('#profile-screen',profileView(state,profile,ui.profileTab));enterScreen($('#profile-screen'));},
  'profile-meal':b=>{ui.menuTab='plan';ui.menuDay=Number(b.dataset.day);render();navigate('menu');},
  'view-session':b=>{const session=state.sessions.find(s=>s.id===b.dataset.id);if(session)openDialog(sessionDetail(state,session));},
  'request-persistence':async()=>{const kept=await navigator.storage?.persist?.();notify(kept?'El navegador ha concedido almacenamiento persistente.':'El navegador no lo ha concedido. Conserva una copia exportada.');},
  'check-update':async()=>{const reg=await navigator.serviceWorker?.getRegistration();if(!reg)throw new Error('Esta instalación no tiene un service worker web activo.');await reg.update();notify(reg.waiting?'Hay una actualización disponible; usa el botón Actualizar.':'Comprobación terminada. Si aparece una nueva versión, verás un aviso.');},
  install:async()=>{if(!installPrompt){notify('Usa el menú del navegador → Instalar app o Añadir a pantalla de inicio.');return;}await installPrompt.prompt();installPrompt=null;},
};

const forms={
  identity:async(form,data)=>{
    if(photoLoading)throw new Error('Espera a que termine de prepararse la foto.');
    const personal=cleanIdentity({displayName:data.get('displayName'),handle:data.get('handle'),bio:data.get('bio'),avatar:pendingAvatar});
    await commit(n=>{n.identity=personal;});notify('Perfil actualizado.');
  },
  food:async(form,data)=>{
    const food={id:form.dataset.id||uid(),name:String(data.get('name')).trim(),section:String(data.get('section')).trim(),allergens:String(data.get('allergens')).split(',').map(t=>t.trim()).filter(Boolean),vegan:data.has('vegan'),vegetarian:data.has('vegetarian')};
    for(const key of ['kcal','protein','carbs','fat'])food[key]=requireNumber(data.get(key),0,key==='kcal'?1000:100,key);
    if(!validateFood(food))throw new Error('Revisa los campos y la compatibilidad vegetariana/vegana.');
    await commit(n=>{const i=n.foods.findIndex(f=>f.id===food.id);if(i<0)n.foods.push(food);else n.foods[i]=food;});
  },
  'save-appearance':async(form,data)=>{
    try {saveNamedStyle(localStorage,{id:uid(),name:data.get('styleName'),preferences:currentAppearance()});}
    catch(error){throw new Error(error.name==='QuotaExceededError'||error.name==='SecurityError'?'No se pudo guardar el estilo en este navegador.':error.message);}
    replaceView('#personalize-screen',personalizationView(currentAppearance(),savedAppearanceStyles(),appearanceHistory.length));notify('Estilo guardado en Mis estilos.');
  },
  'edit-set':async(form,data)=>{
    const weight=requireNumber(data.get('weight'),0,1000,'Peso'),reps=requireNumber(data.get('reps'),1,100,'Repeticiones',true),rpe=data.get('rpe')===''?null:requireNumber(data.get('rpe'),1,10,'RPE');
    await commit(n=>{const set=n.draft?.sets.find(s=>s.id===form.dataset.id);if(!set)throw new Error('La serie ya no está disponible.');Object.assign(set,{weight,reps,rpe});});notify('Serie corregida y récords recalculados.');
  },
  'health-export':async(form,data)=>{
    if(ui.health.loading)throw new Error('Espera a que termine la operación de Salud.');
    const session=state.sessions.find(s=>s.id===form.dataset.id);
    const payload=workoutPayload(session,String(data.get('date')),String(data.get('time')),data.get('minutes'));
    ui.health.loading=true;const save=form.querySelector('button.primary');save.disabled=true;
    try {await saveHealthWorkout(payload);notify('Entrenamiento guardado en Salud. Puedes consultarlo en Salud/Fitness.');}
    finally {ui.health.loading=false;save.disabled=false;renderHealth();}
  },
  exercise:async(form,data)=>{const e={id:uid(),name:String(data.get('name')).trim(),group:String(data.get('group')).trim(),equipment:String(data.get('equipment')).trim()};if(!e.name||!e.group||!e.equipment)throw new Error('Completa nombre, grupo y equipo.');await commit(n=>n.exercises.push(e));},
  routine:async(form,data)=>{const ids=data.getAll('exercises');if(!ids.length||ids.length>50)throw new Error('Selecciona entre 1 y 50 ejercicios.');const routine={id:form.dataset.id||uid(),name:String(data.get('name')).trim(),exerciseIds:ids,days:data.getAll('days').map(Number)};await commit(n=>{const i=n.routines.findIndex(r=>r.id===routine.id);if(i<0)n.routines.push(routine);else n.routines[i]=routine;});},
  'start-session':async(form,data)=>startSession(String(data.get('routine')),String(data.get('date'))),
  set:async(form,data)=>{
    const set={id:uid(),exerciseId:form.dataset.exercise,weight:requireNumber(data.get('weight'),0,1000,'Peso'),reps:requireNumber(data.get('reps'),1,100,'Repeticiones',true),rpe:data.get('rpe')===''?null:requireNumber(data.get('rpe'),1,10,'RPE')};
    ui.restSeconds=requireNumber(data.get('rest'),10,600,'Descanso',true);
    await commit(n=>{if(!n.draft)throw new Error('No hay una sesión en curso.');n.draft.sets.push(set);n.restEnd=Date.now()+ui.restSeconds*1000;});
    const added=state.draft.sets.find(x=>x.id===set.id);pulseSaved($('.easy-saved .saved-series:last-child'));notify(added.records?.length?'🏅 '+added.records.join(' · '):'Serie guardada. Descanso iniciado.');
  },
  'finish-session':async(form,data)=>{await commit(n=>{if(!n.draft?.sets.length)throw new Error('Registra al menos una serie.');n.draft.notes=String(data.get('notes'));n.draft.endedAt=Date.now();n.sessions.push(n.draft);n.draft=null;n.restEnd=null;});notify('Entrenamiento terminado. Ya aparece en tu progreso.');},
  notes:async(form,data)=>commit(n=>{n.sessions.find(s=>s.id===form.dataset.id).notes=String(data.get('notes'));}),
  weight:async(form,data)=>{
    const date=String(data.get('date'));if(!validDate(date)||date>dayKey())throw new Error('La fecha debe ser válida y no futura.');
    const entry={date,weight:requireNumber(data.get('weight'),25,350,'Peso')};for(const k of ['waist','hips','chest'])entry[k]=data.get(k)===''?null:requireNumber(data.get(k),20,250,k);
    await commit(n=>{n.weights=n.weights.filter(w=>w.date!==date);n.weights.push(entry);});notify('Medidas guardadas.');
  },
  nutrition:async(form,data)=>{
    const p=assertPlan(),date=String(data.get('date'));if(!validDate(date)||date>dayKey())throw new Error('Selecciona una fecha válida hasta hoy.');
    const calories=requireNumber(data.get('calories'),0,20000,'Calorías');await commit(n=>{n.nutrition[date]={calories,target:p.calories,source:'manual'};});notify('Total diario guardado.');
  }
};

document.addEventListener('click',async event=>{
  const nav=event.target.closest('[data-route]');if(nav){navigate(nav.dataset.route);return;}
  const b=event.target.closest('[data-action]');if(!b||b.disabled)return;
  try {if(!state)throw new Error('Espera a que termine la carga.');await actions[b.dataset.action]?.(b);}
  catch(error){notify(error.message,true);if(dialog.hasAttribute('open'))$('#dialog-error').textContent=error.message;}
});
document.addEventListener('submit',async event=>{
  const form=event.target.closest('form[data-form]');if(!form)return;event.preventDefault();
  try {const data=new FormData(form);await forms[form.dataset.form](form,data);if(dialog.hasAttribute('open'))closeDialog();}
  catch(error){notify(error.message,true);if(dialog.hasAttribute('open'))$('#dialog-error').textContent=error.message;}
});
document.addEventListener('input',event=>{
  const control=event.target;
  if(['range','color'].includes(control.type)&&control.dataset?.appearanceKey){
    try {
      const key=control.dataset.appearanceKey,numeric=['gradientAngle','blur','opacity'];
      if(!['background','accent','gradientEnd','cardColor','logoColor',...numeric].includes(key))return;
      if(!appearanceDragStart)appearanceDragStart=currentAppearance();
      const value=numeric.includes(key)?Number(control.value):control.value;
      const next={...currentAppearance(),[key]:value};
      applyAppearance(['background','accent','gradientEnd','cardColor'].includes(key)?preserveGlass(next,currentAppearance()):next,{persist:false,emit:false});
      const output=$('#'+control.id+'-output');if(output)output.textContent=String(value)+(control.dataset.unit||'');
    } catch(error){notify(error.message,true);}
    return;
  }

  if(event.target.name==='notes'&&event.target.closest('[data-form=finish-session]')&&state?.draft)ui.draftNotes={id:state.draft.id,value:event.target.value};
  if(event.target.id==='routine-search'){
    const words=norm(event.target.value).split(/\s+/).filter(Boolean);
    document.querySelectorAll('.exercise-picker [data-exercise-name]').forEach(row=>row.hidden=!words.every(w=>row.dataset.exerciseName.includes(w)));
  }
  if(['library-search','picker-search'].includes(event.target.id)){
    const pick=event.target.id==='picker-search',filters=pick?ui.pickerFilters:ui.exerciseFilters;
    filters.query=event.target.value;if(pick)ui.pickerLimit=40;$(pick?'#picker-results':'#library-results').innerHTML=pick?exercisePickerRows(state.exercises,filters.query,state.draft?sessionExerciseIds(state.draft):[],ui.pickerLimit||40):exerciseRows(state.exercises,filters);
  }
  if(event.target.name==='displayName'&&event.target.closest('[data-form=identity]'))updateAvatarPreview();
  if(event.target.id==='food-search'){ui.foodSearch=event.target.value;$('#food-list').innerHTML=foodRows(state.foods,ui.foodSearch);}
});
document.addEventListener('change',async event=>{
  const input=event.target;
  try {
    if(input.id==='health-watch-only'){ui.health.watchOnly=input.checked;renderHealth();return;}
    if(/^(library|picker)-(group|equipment)$/.test(input.id)){
      const [prefix,key]=input.id.split('-'),pick=prefix==='picker',filters=pick?ui.pickerFilters:ui.exerciseFilters;
      filters[key]=input.value;$(pick?'#picker-results':'#library-results').innerHTML=pick?exercisePickerRows(state.exercises,filters.query,state.draft?sessionExerciseIds(state.draft):[],ui.pickerLimit||40):exerciseRows(state.exercises,filters);return;
    }
    if(input.id==='import-appearance'){
      const file=input.files[0];if(!file)return;if(file.size>128*1024)throw new Error('El archivo de estilo supera 128 KB.');
      const preferences=parseAppearanceFile(await file.text());if(applyAppearance(preserveGlass(preferences,currentAppearance())))notify('Estilo importado. Puedes guardarlo con un nombre en Mis estilos.');return;
    }
    const extendedKeys=['backgroundMode','gradientEnd','gradientAngle','pattern','cardColor','corners','shadow','spacing','font','buttonStyle','buttonShape','opacity','blur','background','accent','logoMode','logoColor','logoTile','logoSize','logoShape','buttonHeight','borderWidth','contentWidth','lineHeight','textWeight','glassBehavior','spaceTint','glassIntensity','glassMotion'];
    if(extendedKeys.includes(input.dataset?.appearanceKey)){
      const key=input.dataset.appearanceKey;let value=input.value;
      if(['gradientAngle','blur','logoSize','buttonHeight','borderWidth','contentWidth','lineHeight','textWeight'].includes(key)||(key==='opacity'&&value!=='auto'))value=Number(value);
      const next={...currentAppearance(),[key]:value};if(key==='glassBehavior'&&value==='keep')next.glass='full';applyAppearance(['background','accent','gradientEnd','cardColor','backgroundMode'].includes(key)?preserveGlass(next,currentAppearance()):next);return;
    }
    if(input.id==='identity-photo'){await handleAvatarFile(input);return;}
    const appearanceControls={'appearance-background':'background','appearance-accent':'accent','appearance-text-size':'textSize','appearance-start':'start'};
    if(appearanceControls[input.id]){const next={...currentAppearance(),[appearanceControls[input.id]]:input.value};applyAppearance(['background','accent'].includes(appearanceControls[input.id])?preserveGlass(next,currentAppearance()):next);return;}
    if(input.id==='appearance-auto-opacity'){applyAppearance({...currentAppearance(),opacity:input.checked?'auto':94});return;}
    if(input.id==='appearance-reduce-motion'){applyAppearance({...currentAppearance(),motion:input.checked?'reduced':'system'});return;}
    if(input.id==='appearance-theme'){applyAppearance({...currentAppearance(),theme:input.value});return;}
    if(input.id==='glass-effects'){applyAppearance({...currentAppearance(),glass:input.checked?'full':'reduced',glassBehavior:input.checked?'keep':'free'});return;}
    if(input.matches('[data-shop]')) {await commit(n=>{n.shoppingChecked[input.dataset.shop]=input.checked;});return;}
    if(input.matches('[data-consume]')) {
      const [date]=input.dataset.consume.split(':');if(date>dayKey())throw new Error('No puedes registrar como consumida una comida de una fecha futura.');
      await commit(n=>{n.consumed[input.dataset.consume]=input.checked;trackMenuDay(n,date);});
      if(state.nutrition[date]?.source==='manual')notify('Se conserva tu total manual para esta fecha; las casillas no lo sustituyen.');return;
    }
    if(input.id==='session-exercise'){ui.exerciseId=input.value;replaceView('#train-screen',trainingView(state,ui));updateRest();}
    if(input.id==='exercise-group'){ui.exerciseGroup=input.value;replaceView('#train-screen',trainingView(state,ui));}
    if(input.id==='progress-exercise'){ui.progressExercise=input.value;replaceView('#progress-screen',progressView(state,ui));}
    if(input.id==='progress-week'){if(!validDate(input.value))return;ui.week=monday(input.value);replaceView('#progress-screen',progressView(state,ui));}
    if(input.id==='menu-start')ui.menuStart=input.value;
    if(input.id==='restore-backup') {
      const file=input.files[0];if(!file)return;if(file.size>10*1024*1024)throw new Error('La copia supera 10 MB.');
      const backup=parseBackup(await file.text());
      if(!confirm(`Restaurar reemplazará todos los registros locales por los de esta copia (${backup.state.sessions.length} sesiones). Exporta antes tu copia actual. ¿Continuar?`))return;
      recomputeRecords(backup.state);await restoreBackup(backup);location.reload();
    }
    if(input.id==='import-foods') {
      const file=input.files[0];if(!file)return;if(file.size>2*1024*1024)throw new Error('El catálogo supera 2 MB.');
      const foods=JSON.parse(await file.text());if(!Array.isArray(foods)||!foods.length||foods.length>3000||!foods.every(validateFood)||new Set(foods.map(f=>f.id)).size!==foods.length)throw new Error('Catálogo inválido. Usa el formato del JSON exportado.');
      await commit(n=>{const byId=new Map(n.foods.map(f=>[f.id,f]));foods.forEach(f=>byId.set(f.id,f));n.foods=[...byId.values()];});notify('Catálogo combinado. Revisa y regenera el menú para ajustar raciones.');
    }
  } catch(error){notify(error.message,true);if(input.type==='checkbox')input.checked=!input.checked;}
});
window.addEventListener('hashchange',()=>{if(location.hash!=='#main')navigate(location.hash.slice(1));});
window.addEventListener('profile-saved',event=>{profile=event.detail;if(state)render();});
window.addEventListener('appearance-changed',event=>{
  const previous=appearanceDragStart||event.detail.previous;appearanceDragStart=null;
  if(!undoingAppearance&&previous&&JSON.stringify(previous)!==JSON.stringify(currentAppearance())){appearanceHistory.push(previous);if(appearanceHistory.length>10)appearanceHistory.shift();}

  const focusId=document.activeElement?.id,draftName=$('[name=styleName]')?.value||'';
  replaceView('#personalize-screen',personalizationView(currentAppearance(),savedAppearanceStyles(),appearanceHistory.length));
  const nameInput=$('[name=styleName]');if(nameInput)nameInput.value=draftName;
  if(focusId&&(focusId.startsWith('appearance-')||focusId==='glass-effects'))$('#'+focusId)?.focus({preventScroll:true});
  const status=$('#appearance-save-status');
  if(!event.detail.persisted){if(status)status.textContent='Cambio aplicado para esta sesión. El navegador no ha permitido guardarlo.';notify('El cambio se ve ahora, pero no se ha podido guardar en este navegador.',true);}
});
$('#close-dialog').addEventListener('click',closeDialog);
dialog.addEventListener('close',()=>{photoTask++;photoLoading=false;});

let installPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install-banner').hidden=false;});
$('#install-app').addEventListener('click',()=>actions.install());
window.addEventListener('appinstalled',()=>{$('#install-banner').hidden=true;notify('App instalada.');});

try {
  const [catalog,exerciseSeed,recipeSeed,saved,storedProfile]=await Promise.all([
    fetch('data/foods.json').then(r=>{if(!r.ok)throw new Error('No se pudo cargar el catálogo.');return r.json();}),
    fetch('data/exercises.json').then(r=>{if(!r.ok)throw new Error('No se pudo cargar la biblioteca.');return r.json();}),
    fetch('data/recipes.json').then(r=>{if(!r.ok)throw new Error('No se pudieron cargar las recetas.');return r.json();}),loadState(),loadProfile()
  ]);
  recipes=recipeSeed;profile=storedProfile?.version===1&& !calculatePlan(storedProfile.data).errors.length?storedProfile.data:null;
  state=saved||newState();
  if(!saved) {
    state.foods=catalog;state.exercises=exerciseSeed;
    const find=name=>exerciseSeed.find(e=>e.name===name).id;
    state.routines=[{id:'push',name:'Push',days:[0],exerciseIds:['Press de banca','Press militar','Elevaciones laterales','Extensión de tríceps'].map(find)},{id:'pull',name:'Pull',days:[2],exerciseIds:['Jalón al pecho','Remo con barra','Curl de bíceps'].map(find)},{id:'legs',name:'Legs',days:[4],exerciseIds:['Sentadilla','Peso muerto rumano','Elevación de gemelos'].map(find)}];
  }
  if(!saved||state.identity===undefined)state.identity=newIdentity(profile?.displayName||'');
  validateState(state);
  const oldExercises=JSON.stringify(state.exercises);
  state.exercises=mergeExerciseCatalog(state.exercises,exerciseSeed);
  const catalogChanged=oldExercises!==JSON.stringify(state.exercises);
  validateState(state);recomputeRecords(state);
  if(state.menu)ui.menuStart=state.menu.start;
  render();navigate(location.hash.slice(1)||currentAppearance().start,false);$('#boot-status').hidden=true;
  // Persist seed data on first use; a failed write must be visible.
  if(!saved||catalogChanged)await saveState(state);
} catch(error) {
  $('#boot-status').hidden=false;$('#boot-status').textContent='No se pudo iniciar el registro local: '+error.message+'. No se han borrado tus datos. Recarga o recupera una copia.';
  if(!state){state=newState();}
  notify(error.message,true);
}

// Only web installs use a service worker; native builds carry all assets locally.
const native=Boolean(window.Capacitor?.isNativePlatform?.());
document.documentElement.dataset.native=String(native);
if('serviceWorker' in navigator && !native) {
  const wasControlled=Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    const announce=()=>{if(reg.waiting){$('#update-banner').hidden=false;}};
    announce();reg.addEventListener('updatefound',()=>{reg.installing?.addEventListener('statechange',announce);});
    $('#apply-update').addEventListener('click',()=>{
      if(confirm('¿Recargar para actualizar? Los registros guardados se conservan; guarda antes cualquier formulario pendiente.'))reg.waiting?.postMessage({type:'SKIP_WAITING'});
    });
    let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(wasControlled&&!refreshing){refreshing=true;location.reload();}});
    navigator.serviceWorker.ready.then(()=>{setOfflineStatus('Lista para usar sin conexión');});
  }).catch(()=>{setOfflineStatus('Sin conexión aún no disponible');});
} else if(native) setOfflineStatus('Archivos incluidos en la app');

function setOfflineStatus(text) {
  $('#offline-status').textContent=text;
  const node=$('#settings-offline-status');if(node)node.textContent=text;
}

function updateAvatarPreview() {
  const preview=$('#identity-photo-preview');if(!preview)return;
  const name=dialog.querySelector('[name=displayName]')?.value||'';
  preview.innerHTML=avatarMarkup({...state.identity,displayName:name,avatar:pendingAvatar},{decorative:true});
}
async function handleAvatarFile(input) {
  const file=input.files[0];if(!file)return;
  const task=++photoTask;photoLoading=true;
  const save=$('#identity-save');if(save)save.disabled=true;
  $('#photo-status').textContent='Preparando tu foto…';
  try {
    const avatar=await prepareAvatar(file);
    if(task!==photoTask||!dialog.hasAttribute('open'))return;
    pendingAvatar=avatar;updateAvatarPreview();
    $('#photo-status').textContent='Foto preparada. Pulsa Guardar perfil para conservarla.';
    $('#dialog-error').textContent='';
  } catch(error) {
    if(task!==photoTask)return;
    notify(error.message,true);$('#dialog-error').textContent=error.message;
    const label=$('#photo-status');if(label)label.textContent='La foto anterior se conserva. Prueba con otra imagen.';
  } finally {
    if(task===photoTask){photoLoading=false;const button=$('#identity-save');if(button)button.disabled=false;input.value='';}
  }
}

function renderHealth() {
  const node=$('#health-section');if(node)node.outerHTML=healthView(ui.health);
}
async function healthOperation(work) {
  if(ui.health.loading)return;
  ui.health.loading=true;ui.health.error=null;renderHealth();
  try {if(!healthReady())throw new Error('Abre la app nativa de iPhone para vincular Salud.');await work();}
  catch(error){ui.health.error=error.message;notify(error.message,true);}
  finally {ui.health.loading=false;renderHealth();}
}

let startingSession=false;
async function startSession(routineId,date) {
  if(startingSession)return;
  if(!validDate(date)||date>dayKey())throw new Error('Selecciona una fecha válida hasta hoy.');
  if(state.draft)throw new Error('Ya tienes una sesión en curso.');
  const routine=state.routines.find(r=>r.id===routineId);
  if(routineId!=='free'&&!routine)throw new Error('Esta rutina ya no está disponible.');
  startingSession=true;
  try {
    ui.routineId=routine?.id||'free';ui.exerciseId=routine?.exerciseIds[0]||null;ui.trainTab='session';ui.draftNotes=null;
    await commit(n=>{if(n.draft)throw new Error('Ya hay una sesión en curso.');n.draft={id:uid(),date,startedAt:Date.now(),name:routine?.name||'Entrenamiento libre',exerciseIds:[...(routine?.exerciseIds||[])],sets:[],notes:''};n.restEnd=null;});
    navigate('train');notify(routine?'Entrenamiento iniciado. Anota tu primera serie.':'Elige tu primer ejercicio.');
  } finally {startingSession=false;}
}
