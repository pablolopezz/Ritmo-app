export const newIdentity = (displayName='') => ({displayName,handle:'',bio:'',avatar:null});
export function validAvatar(value) {
  if(value===null)return true;
  if(typeof value!=='string'||value.length>200000)return false;
  // Only local raster image data is accepted, never URLs, SVG or active content.
  const match=value.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if(!match||match[2].length%4!==0)return false;
  const header={jpeg:'/9j/',png:'iVBORw0KGgo',webp:'UklGR'}[match[1]];
  return match[2].startsWith(header);
}
export function validateIdentity(identity) {
  if(!identity||typeof identity!=='object'||Array.isArray(identity))return false;
  return typeof identity.displayName==='string'&&identity.displayName.length<=60&&
    typeof identity.handle==='string'&&/^[a-z0-9._]{0,30}$/.test(identity.handle)&&
    typeof identity.bio==='string'&&identity.bio.length<=160&&validAvatar(identity.avatar);
}
export function cleanIdentity(identity) {
  const next={displayName:String(identity.displayName||'').trim(),handle:String(identity.handle||'').trim().replace(/^@/,'').toLowerCase(),bio:String(identity.bio||'').trim(),avatar:identity.avatar??null};
  if(!validateIdentity(next))throw new Error('Revisa el perfil: nombre hasta 60 caracteres, usuario hasta 30 (letras, números, puntos o guion bajo) y biografía hasta 160.');
  return next;
}
export function profileCounts(state) {
  return {workouts:state.sessions.length,records:state.sessions.reduce((sum,s)=>sum+s.sets.filter(x=>x.records?.length).length,0),weighIns:state.weights.length};
}
