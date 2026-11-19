import test from 'node:test';
import assert from 'node:assert/strict';
import { startAnalytics } from '../dist/js/analytics.js';

function browser(overrides={}) {
  const scripts=[];
  const env={
    window:{location:new URL('https://ritmo-app-plum.vercel.app/?secret=private#profile')},
    navigator:{onLine:true},
    document:{
      querySelector:()=>scripts.find(s=>s.dataset.ritmoAnalytics)||null,
      createElement:()=>({dataset:{},addEventListener(){},remove(){}}),
      head:{append:script=>scripts.push(script)}
    },scripts
  };
  return Object.assign(env,overrides);
}

test('Analítica: una sola carga, URL sin datos privados y sin eventos de salud',()=>{
  const env=browser();
  assert.equal(startAnalytics(env),true);
  assert.equal(startAnalytics(env),false);
  assert.equal(env.scripts.length,1);
  assert.equal(env.scripts[0].src,'/_vercel/insights/script.js');
  const beforeSend=env.window.vaq[0][1];
  assert.deepEqual(beforeSend({type:'pageview',url:'https://host/?weight=75#profile',data:{weight:75}}),{
    type:'pageview',url:'https://ritmo-app-plum.vercel.app/'
  });
  assert.equal(beforeSend({type:'event',name:'health',data:{weight:75}}),null);
});

test('Analítica: no cargar en otros alojamientos, app nativa, offline o con privacidad activada',()=>{
  for(const url of ['http://localhost:4173/','https://pablolopezz.github.io/Ritmo-app/','https://preview.vercel.app/']){
    const env=browser();env.window.location=new URL(url);
    assert.equal(startAnalytics(env),false);assert.equal(env.scripts.length,0);
  }
  for(const settings of [{onLine:false},{doNotTrack:'1'},{globalPrivacyControl:true}]){
    const env=browser({navigator:settings});assert.equal(startAnalytics(env),false);
    assert.equal(env.scripts.length,0);
  }
  const env=browser();env.window.Capacitor={isNativePlatform:()=>true};
  assert.equal(startAnalytics(env),false);assert.equal(env.scripts.length,0);
});
