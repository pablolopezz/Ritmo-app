export const estimated1RM = (weight,reps) => weight>0 && reps>=1 && reps<=12 ? (reps===1?weight:weight*(1+reps/30)) : null;
export function recordFlags(set,history) {
  if(!history.length) return []; // The first set establishes a baseline, not three records.
  const max=key=>Math.max(...history.map(s=>s[key]));
  const result=[];
  if(set.weight>max('weight')) result.push('Mayor peso');
  if(set.reps>max('reps')) result.push('Más repeticiones');
  const estimate=estimated1RM(set.weight,set.reps),old=history.map(s=>estimated1RM(s.weight,s.reps)).filter(x=>x!==null);
  if(estimate!==null && old.length && estimate>Math.max(...old)+.00001) result.push('Mejor 1RM estimado');
  return result;
}
export function exerciseHistory(sessions,exerciseId) {
  return sessions.flatMap(session=>session.sets.filter(s=>s.exerciseId===exerciseId).map(s=>({...s,date:session.date,sessionId:session.id})));
}
export function lastExercise(sessions,exerciseId) {
  const previous=[...sessions].filter(s=>s.sets.some(x=>x.exerciseId===exerciseId)).sort((a,b)=>b.date.localeCompare(a.date)||b.startedAt-a.startedAt)[0];
  return previous?{date:previous.date,sets:previous.sets.filter(s=>s.exerciseId===exerciseId)}:null;
}
export function weeklyVolume(sessions,exercises,start,end) {
  const groups=Object.create(null);
  for(const session of sessions.filter(s=>s.date>=start&&s.date<end)) for(const set of session.sets) {
    const group=exercises.find(e=>e.id===set.exerciseId)?.group||'Otros';
    groups[group]=(groups[group]||0)+set.weight*set.reps;
  }
  return groups;
}
// Recompute records chronologically so backdated entries and deletions remain honest.
export function recomputeRecords(state) {
  const histories=Object.create(null);
  const sessions=[...state.sessions,...(state.draft?[state.draft]:[])].sort((a,b)=>a.date.localeCompare(b.date)||a.startedAt-b.startedAt);
  for(const session of sessions) for(const set of session.sets) {
    const old=histories[set.exerciseId]||[];
    set.records=recordFlags(set,old);old.push(set);histories[set.exerciseId]=old;
  }
}
