export const uid = () => crypto.randomUUID?.() || '10000000-1000-4000-8000-100000000000'.replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
export const fmt = (n, digits = 0) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits }).format(n);
export const norm = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[-_]/g, ' ').trim();
export const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function validDate(key) { return typeof key === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(key) && dayKey(new Date(key+'T12:00:00')) === key; }
export function addDays(key, days) { const date = new Date(key+'T12:00:00'); date.setDate(date.getDate()+days); return dayKey(date); }
export function monday(key = dayKey()) { const date = new Date(key+'T12:00:00'); return addDays(key, -(date.getDay()+6)%7); }
export const dateLabel = key => new Date(key+'T12:00:00').toLocaleDateString('es-ES', { weekday:'short', day:'numeric', month:'short' });
export const inWeek = (date, start) => date >= start && date < addDays(start,7);
// Text is escaped at the single HTML rendering boundary, including imported data.
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const options = (items, selected) => items.map(([id,name]) => `<option value="${esc(id)}" ${id===selected?'selected':''}>${esc(name)}</option>`).join('');
export async function download(name, content, type='application/json') {
  if(window.Capacitor?.isNativePlatform?.()) {
    const fs=window.Capacitor.registerPlugin('Filesystem');
    const share=window.Capacitor.registerPlugin('Share');
    const file=await fs.writeFile({path:name,data:content,directory:'CACHE',encoding:'utf8'});
    await share.share({title:name,files:[file.uri],dialogTitle:'Guardar o compartir archivo'});
    return;
  }
  const url = URL.createObjectURL(new Blob([content], {type}));
  const link = document.createElement('a'); link.href=url; link.download=name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url),10000);
}
export function requireNumber(value, min, max, label, integer=false) {
  const n = value === '' || value === null ? NaN : Number(value);
  if (!Number.isFinite(n) || n<min || n>max || (integer && !Number.isInteger(n))) throw new Error(`${label}: introduce ${integer?'un entero':'un número'} entre ${min} y ${max}.`);
  return n;
}
