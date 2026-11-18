import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { newState,validateState,parseBackup } from '../dist/js/state.js';
import { newIdentity,cleanIdentity,validAvatar,validateIdentity,profileCounts } from '../dist/js/profile/model.js';
import { profileView,identityForm,avatarMarkup } from '../dist/js/profile/view.js';
import { prepareAvatar } from '../dist/js/profile/photo.js';
import { sample } from '../dist/tests/cases.js';

const [foods,exercises]=await Promise.all(['foods','exercises'].map(n=>readFile(new URL('../dist/data/'+n+'.json',import.meta.url),'utf8').then(JSON.parse)));
const seed=()=>({...newState(),foods:structuredClone(foods),exercises:structuredClone(exercises)});
const pixel='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+y5yoAAAAASUVORK5CYII=';

test('Perfil personal: normaliza alias y conserva nombre y biografía',()=>{
  const p=cleanIdentity({displayName:' Alex ',handle:' @Mi.Ritmo_24 ',bio:' Entreno a mi ritmo. ',avatar:null});
  assert.deepEqual(p,{displayName:'Alex',handle:'mi.ritmo_24',bio:'Entreno a mi ritmo.',avatar:null});
});
test('Perfil personal: rechaza campos extremos y alias con contenido activo',()=>{
  for(const overrides of [{displayName:'x'.repeat(61)},{handle:'<script>'},{handle:'nombre con espacios'},{bio:'x'.repeat(161)},{avatar:'https://example.test/tracking.jpg'}])assert.equal(validateIdentity({...newIdentity(),...overrides}),false);
});
test('Avatar: solo imágenes raster locales con cabecera válida y tamaño acotado',()=>{
  assert.ok(validAvatar(pixel));assert.ok(validAvatar(null));
  for(const value of ['javascript:alert(1)','data:image/svg+xml;base64,PHN2Zz4=', 'data:image/png;base64,PGh0bWw+', 'data:image/jpeg;base64,abc', 'data:image/png;base64,'+'A'.repeat(200000)])assert.equal(validAvatar(value),false);
});
test('Foto: formatos no permitidos y archivos mayores de 8 MB se rechazan antes de decodificar',async()=>{
  await assert.rejects(prepareAvatar({type:'image/svg+xml',size:30}),/JPG/);
  await assert.rejects(prepareAvatar({type:'image/jpeg',size:9*1024*1024}),/8 MB/);
});
test('Copia: perfiles anteriores sin identidad siguen siendo compatibles',()=>{
  const state=seed();delete state.identity;
  const backup=parseBackup(JSON.stringify({format:'dieta-gym-backup',version:2,profile:{version:1,data:{...sample,displayName:'Alex'}},state}));
  assert.equal(backup.profile.data.displayName,'Alex');assert.equal(backup.state.identity,undefined);
});
test('Copia: nombre, foto, usuario y biografía sobreviven a exportar/restaurar',()=>{
  const state=seed();state.identity={displayName:'Alex',handle:'alex.ritmo',bio:'Paso a paso',avatar:pixel};
  const restored=parseBackup(JSON.stringify({format:'dieta-gym-backup',version:2,profile:null,state}));
  assert.deepEqual(restored.state.identity,state.identity);
  state.identity.avatar='https://example.test/avatar.png';assert.throws(()=>validateState(state),/perfil personal/);
});
test('Estadísticas del perfil: proceden de sesiones, series con récord y pesajes reales',()=>{
  const state=seed();state.sessions=[{id:'s1',name:'Push',date:'2026-11-16',startedAt:1,exerciseIds:['e1'],notes:'',sets:[{id:'set1',exerciseId:'e1',weight:60,reps:8,rpe:null,records:['Mayor peso','Mejor 1RM estimado']}]}];state.weights=[{date:'2026-11-16',weight:80,waist:null,hips:null,chest:null}];
  assert.deepEqual(profileCounts(state),{workouts:1,records:1,weighIns:1});
  assert.ok(profileView(state,sample).includes('data-action="view-session"'));
});
test('Perfil y editor: escapan textos personales y no insertan URLs de avatar externas',()=>{
  const state=seed();state.identity={...newIdentity(),displayName:'<img src=x onerror=x>',bio:'<script>alert(1)</script>'};
  const view=profileView(state,null),form=identityForm(state.identity);
  assert.ok(view.includes('&lt;script&gt;'));assert.ok(!view.includes('<img src=x'));assert.ok(!form.includes('<img src=x'));
  assert.ok(!avatarMarkup({...state.identity,avatar:'https://evil.test/a.png'}).includes('evil.test'));
  assert.ok(!view.includes('Seguidores')&&!view.includes('Siguiendo'));
});
