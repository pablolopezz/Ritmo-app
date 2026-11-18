import { esc,fmt } from '../utils.js';
// SVG coordinates are derived from finite data, never from user-authored markup.
export function lineChart(points,label,unit) {
  if(!points.length) return '<p class="chart-empty">Añade registros para ver la evolución.</p>';
  const values=points.map(p=>p.value),min=Math.min(...values),max=Math.max(...values),pad=Math.max((max-min)*.15,1);
  const low=min-pad,high=max+pad,W=320,H=200,L=47,R=12,T=22,B=40;
  const stamps=points.map(p=>new Date(p.date+'T12:00:00').getTime());
  const from=Math.min(...stamps),to=Math.max(...stamps),x=i=>L+(stamps[i]-from)/(to-from||1)*(W-L-R),y=v=>T+(high-v)/(high-low)*(H-T-B);
  const ticks=[low,(low+high)/2,high];
  const summary=points.map(p=>`${p.date}: ${fmt(p.value,1)} ${unit}`).join('; ');
  return `<svg class="line-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title><desc>${esc(summary)}</desc>${ticks.map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" class="gridline"/><text x="${L-9}" y="${y(v)+4}" text-anchor="end">${fmt(v,1)}</text>`).join('')}<polyline fill="none" points="${points.map((p,i)=>`${x(i)},${y(p.value)}`).join(' ')}"/>${points.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.value)}" r="4"><title>${esc(p.date)} · ${fmt(p.value,1)} ${esc(unit)}</title></circle>`).join('')}<text x="${L}" y="${H-10}">${esc(points[0].date.slice(5))}</text><text x="${W-R}" y="${H-10}" text-anchor="end">${esc(points.at(-1).date.slice(5))}</text><text x="${L}" y="12">${esc(unit)}</text></svg>`;
}
export function barChart(data) {
  const rows=Object.entries(data),max=Math.max(...rows.map(([,v])=>v),1);
  return rows.length?`<div class="bar-chart" role="img" aria-label="Volumen semanal en kilogramos por grupo muscular">${rows.map(([group,value])=>`<div class="bar-row"><span>${esc(group)}</span><div><i style="width:${value/max*100}%"></i></div><strong>${fmt(value)} kg</strong></div>`).join('')}</div>`:'<p class="chart-empty">Termina una sesión para ver el volumen semanal.</p>';
}
