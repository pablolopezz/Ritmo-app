import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { featureTests } from '../dist/tests/features-cases.js';
const load=async name=>JSON.parse(await readFile(new URL('../dist/data/'+name+'.json',import.meta.url),'utf8'));
const [foods,recipes,exercises]=await Promise.all(['foods','recipes','exercises'].map(load));
for(const [name,run] of featureTests(foods,recipes,exercises))test(name,run);
