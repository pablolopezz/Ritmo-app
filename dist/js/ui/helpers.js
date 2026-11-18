import { esc, fmt } from '../utils.js';
import { icon } from './icons.js';
const actionIcons={'go-train':'train','go-menu':'food','go-shopping':'basket','go-progress':'progress','go-profile':'arrow','weight-entry':'scale','quick-energy':'plus','new-routine':'plus','new-exercise':'plus','add-food':'plus','edit-food':'edit','edit-routine':'edit','edit-notes':'edit','edit-profile':'edit','backup':'download','replace-meal':'shuffle','lock-meal':'lock','generate':'calendar','choose-routine':'play'};
export const button = (action,label,attrs='',kind='secondary') => `<button type="button" class="${kind}${/^(delete-|discard-)/.test(action)?' danger-action':''}" data-action="${action}" ${attrs}>${actionIcons[action]?icon(actionIcons[action]):''}<span>${label.replace(/[↗↻→]/g,'').trim()}</span></button>`;
export const empty = (title,copy,action='') => `<div class="blank-state"><span aria-hidden="true">◎</span><h3>${esc(title)}</h3><p>${esc(copy)}</p>${action}</div>`;
export const heading = (eyebrow,title,copy) => `<div class="page-heading">${eyebrow?`<p class="eyebrow">${esc(eyebrow)}</p>`:''}<h1>${esc(title)}</h1>${copy?`<p class="lead">${esc(copy)}</p>`:''}</div>`;
export const stats = items => `<div class="stat-grid">${items.map(([label,value,unit=''])=>`<div class="stat-card"><span>${esc(label)}</span><strong>${esc(value)} <small>${esc(unit)}</small></strong></div>`).join('')}</div>`;
export const macroLine = n => `<span>${fmt(n.kcal)} kcal</span><span>Proteínas ${fmt(n.protein)} g</span><span>Hidratos ${fmt(n.carbs)} g</span><span>Grasas ${fmt(n.fat)} g</span>`;
