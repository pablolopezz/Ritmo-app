import test from 'node:test';
import assert from 'node:assert/strict';
import { readAppearance,defaultAppearance } from '../dist/js/ui/appearance.js';
import { settingsView } from '../dist/js/ui/settings.js';
import { calculatePlan } from '../dist/js/diet/calculations.js';
import { sample } from '../dist/tests/cases.js';

test('Apariencia: conserva el tema anterior y activa Glass por defecto',()=>{
  assert.deepEqual(readAppearance({getItem:key=>key==='theme'?'light':null}),{...defaultAppearance(),theme:'light'});
});
test('Apariencia: recupera transparencias reducidas y rechaza valores desconocidos',()=>{
  assert.deepEqual(readAppearance({getItem:key=>key==='ritmo-glass'?'reduced':'inventado'}),{...defaultAppearance(),glass:'reduced'});
});
test('Apariencia: almacenamiento bloqueado permite iniciar con valores válidos',()=>{
  assert.deepEqual(readAppearance({getItem:()=>{throw new Error('blocked')}}),defaultAppearance());
});
test('Perfil: un nombre opcional no altera las calorías ni rompe perfiles anteriores',()=>{
  const old=calculatePlan(sample),named=calculatePlan({...sample,displayName:'Alex'});
  assert.deepEqual(named.plan,old.plan);
  for(const displayName of [null,42,{},'x'.repeat(61)])assert.equal(calculatePlan({...sample,displayName}).plan,null);
});
test('Ajustes: muestra el perfil con texto escapado y un acceso explícito a edición',()=>{
  const html=settingsView({...sample,displayName:'<img src=x onerror=alert(1)>'},defaultAppearance());
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('data-action="edit-profile"'));
  assert.ok(html.includes('data-action="personalize"'));
});
