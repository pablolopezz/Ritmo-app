// A free session only shows exercises actually chosen, never the entire library.
export function sessionExerciseIds(session) {
  return [...new Set(session.exerciseIds.length?session.exerciseIds:session.sets.map(s=>s.exerciseId))];
}
export function selectedExerciseId(session,requested) {
  const ids=sessionExerciseIds(session);
  return ids.includes(requested)?requested:ids[0]||null;
}
export function nextExerciseId(session,current) {
  const ids=sessionExerciseIds(session),index=ids.indexOf(current);
  return index>=0&&index<ids.length-1?ids[index+1]:null;
}
export function routineDisplayName(routine) {
  const entry={push:['Push','Empuje'],pull:['Pull','Tirón'],legs:['Legs','Piernas']}[routine.id];
  return entry&&routine.name===entry[0]?entry[1]:routine.name;
}
