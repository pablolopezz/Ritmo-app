import { readdir,readFile,access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join,dirname } from 'node:path';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
async function walk(dir) {const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);files.push(...(e.isDirectory()?await walk(p):[p]));}return files;}
let count=0;
for(const path of await walk(root)) {
  const source=path.endsWith('.js')||path.endsWith('.html')?await readFile(path,'utf8'):null;
  if(path.endsWith('.js')) {
    execFileSync(process.execPath,['--check',path]);count++;
    for(const match of source.matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g))await access(join(dirname(path),match[1]));
  }
  if(path.endsWith('.html'))for(const match of source.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if(!/^(https?:|data:)/.test(match[1]))await access(join(dirname(path),match[1]));
  }
}
const manifest=JSON.parse(await readFile(root+'manifest.webmanifest','utf8'));
for(const icon of manifest.icons)await access(root+icon.src);
console.log(count,'módulos: sintaxis e importaciones correctas; HTML y manifest sin referencias rotas.');
