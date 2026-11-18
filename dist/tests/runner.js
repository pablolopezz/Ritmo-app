import { tests } from './cases.js';
import { featureTests } from './features-cases.js';
const [foods,recipes,exercises]=await Promise.all(['foods','recipes','exercises'].map(n=>fetch('../data/'+n+'.json').then(r=>r.json())));
const all=[...tests,...featureTests(foods,recipes,exercises)];
let passed = 0;
for (const [name, run] of all) {
  const item = document.createElement('li');
  try { await run(); passed++; item.textContent = `✓ ${name}`; }
  catch (error) { item.textContent = `✗ ${name}: ${error.message}`; }
  document.querySelector('#results').append(item);
}
document.querySelector('#summary').textContent = `${passed} de ${all.length} pruebas correctas.`;
