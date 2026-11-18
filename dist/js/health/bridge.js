import { dayKey,validDate } from '../utils.js';
export function healthReady(cap=globalThis.Capacitor) {
  return cap?.getPlatform?.()==='ios'&&typeof cap.registerPlugin==='function';
}
function plugin() {
  if(!healthReady())throw new Error('Apple Salud requiere la app nativa de Ritmo en iPhone. Safari, la PWA y Android no pueden acceder a HealthKit.');
  return globalThis.Capacitor.registerPlugin('RitmoHealth');
}
export const healthStatus=()=>plugin().status();
export const requestHealthAccess=()=>plugin().requestAccess();
export const readHealthWorkouts=()=>plugin().readWorkouts();
export const saveHealthWorkout=payload=>plugin().saveWorkout(payload);
// The user reviews actual date/time and duration. No energy estimate is fabricated.
export function workoutPayload(session,date,time,minutes,now=Date.now()) {
  if(!session?.sets?.length||!session.id||typeof session.id!=='string'||session.id.length>100)throw new Error('Selecciona un entrenamiento terminado con series.');
  if(!validDate(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Revisa la fecha y la hora de inicio.');
  const duration=Number(minutes);
  if(!Number.isFinite(duration)||duration<1||duration>360)throw new Error('La duración debe estar entre 1 y 360 minutos.');
  const start=new Date(`${date}T${time}:00`);
  // Reject nonexistent local times during daylight-saving transitions.
  if(dayKey(start)!==date||`${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}`!==time)throw new Error('La hora no existe en tu zona horaria.');
  const end=start.getTime()+duration*60000;
  if(!Number.isFinite(end)||end>now)throw new Error('El entrenamiento debe haber terminado; revisa la hora y la duración.');
  return {sessionId:session.id,name:String(session.name).slice(0,100),start:start.getTime(),end};
}
export function sessionTiming(session) {
  const start=new Date(session.startedAt);
  const sameDate=dayKey(start)===session.date;
  const duration=session.endedAt?Math.round((session.endedAt-session.startedAt)/60000):null;
  return {date:session.date,time:sameDate?`${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}`:'',minutes:sameDate&&duration>=1&&duration<=360?duration:''};
}
