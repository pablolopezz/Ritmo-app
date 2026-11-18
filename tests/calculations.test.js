import test from 'node:test';
import { tests } from '../dist/tests/cases.js';

for (const [name, run] of tests) test(name, run);
