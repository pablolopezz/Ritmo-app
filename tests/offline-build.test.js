import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rename, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('Modo offline: metadatos ocultos no bloquean la instalación y las rutas cambian la versión', async () => {
  const root=await mkdtemp(join(tmpdir(),'ritmo-offline-'));
  try {
    await mkdir(join(root,'scripts'));
    await mkdir(join(root,'dist'));
    await copyFile(new URL('../scripts/build-sw.mjs',import.meta.url),join(root,'scripts/build-sw.mjs'));
    await writeFile(join(root,'dist/index.html'),'<h1>Ritmo</h1>');
    await writeFile(join(root,'dist/.nojekyll'),'');
    const build=async()=>{
      execFileSync(process.execPath,[join(root,'scripts/build-sw.mjs')]);
      return readFile(join(root,'dist/sw.js'),'utf8');
    };
    const first=await build();
    assert.ok(first.includes('./index.html'));
    assert.ok(!first.includes('.nojekyll'));
    assert.equal(await build(),first,'Una reconstrucción sin cambios debe ser estable');
    await writeFile(join(root,'dist/empty.txt'),'');
    const second=await build();
    const version=worker=>worker.match(/const CACHE=(.*);/)[1];
    assert.notEqual(version(second),version(first),'Añadir archivos vacíos debe cambiar la caché');
    await rename(join(root,'dist/empty.txt'),join(root,'dist/renamed.txt'));
    const third=await build();
    assert.notEqual(version(third),version(second),'Renombrar archivos debe cambiar la caché');
  } finally {await rm(root,{recursive:true,force:true});}
});
