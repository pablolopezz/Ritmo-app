import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root=new URL('../dist/',import.meta.url);
const worker=await readFile(new URL('sw.js',root),'utf8');
async function runtime(failPath=null) {
  const events={},stores=new Map();let online=true;
  const resolve=path=>new URL(typeof path==='string'?path:path.url,'https://example.test/').href;
  const caches={
    async open(name){if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return {async put(key,value){data.set(resolve(key),value.clone());},async match(key){return data.get(resolve(key))?.clone();}};},
    async keys(){return [...stores.keys()];},async delete(key){return stores.delete(key);}
  };
  const self={location:new URL('https://example.test/sw.js'),clients:{claim:async()=>{}},addEventListener:(name,fn)=>events[name]=fn,skipWaiting:()=>{self.skipped=true;}};
  class BrowserRequest{constructor(url){this.url=resolve(url);}}
  const fetch=async req=>{
    if(!online)throw new Error('offline');
    const url=new URL(resolve(req)),name=url.pathname==='/'?'index.html':url.pathname.slice(1);
    if(name===failPath)return new Response('sign-in gate',{headers:{'content-type':'text/html'}});
    const bytes=await readFile(new URL(name,root));
    const type=name.endsWith('.js')?'text/javascript':name.endsWith('.json')?'application/json':name.endsWith('.png')?'image/png':'text/html';
    return new Response(bytes,{headers:{'content-type':type}});
  };
  vm.runInNewContext(worker,{self,caches,fetch,Request:BrowserRequest,URL,console});
  return {events,stores,self,setOffline:()=>online=false};
}
test('PWA: después de instalar, navegación y módulos responden sin red',async()=>{
  const r=await runtime();let install;r.events.install({waitUntil:p=>install=p});await install;
  assert.equal(r.stores.size,1);r.setOffline();
  for(const path of ['/','/index.html','/js/features.js','/data/foods.json','/assets/icons/icon-192.png']) {
    let response;r.events.fetch({request:{method:'GET',url:'https://example.test'+path,mode:path==='/'?'navigate':'cors'},respondWith:p=>response=p});
    assert.ok((await response).ok);
  }
});
test('PWA: un HTML de acceso en lugar de JavaScript invalida la instalación',async()=>{
  const r=await runtime('js/features.js');let install;r.events.install({waitUntil:p=>install=p});await assert.rejects(install,/Unexpected response type/);assert.equal(r.stores.size,0);
});
test('PWA: actualización espera permiso y rutas de autenticación no se cachean',async()=>{
  const r=await runtime();assert.equal(r.self.skipped,undefined);r.events.message({data:{type:'SKIP_WAITING'}});assert.equal(r.self.skipped,true);
  let intercepted=false;r.events.fetch({request:{method:'GET',url:'https://example.test/signin-with-chatgpt',mode:'navigate'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
});
