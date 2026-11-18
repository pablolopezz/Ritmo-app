import { addDays, inWeek } from '../utils.js';
export function weeklySummary(state,start) {
  const sessions=state.sessions.filter(s=>inWeek(s.date,start));
  const entries=Object.entries(state.nutrition).filter(([date])=>inWeek(date,start));
  return {workouts:sessions.length,records:sessions.reduce((sum,s)=>sum+s.sets.filter(x=>x.records?.length).length,0),logged:entries.length,compliant:entries.filter(([,e])=>e.target>0&&Math.abs(e.calories/e.target-1)<=.1).length,end:addDays(start,6)};
}
