#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const must = [];
const errs = [];

function p(...segs){ return path.join(root, ...segs); }
function exists(rel){
  const ok = fs.existsSync(p(rel));
  if(!ok) errs.push(`Falta archivo: ${rel}`);
  return ok;
}
function has(rel, patterns){
  if(!exists(rel)) return;
  const txt = fs.readFileSync(p(rel), 'utf8');
  for(const pat of patterns){
    const re = (pat instanceof RegExp) ? pat : new RegExp(pat, 'm');
    if(!re.test(txt)) errs.push(`No se encontró patrón en ${rel}: ${re}`);
  }
}

// 1) Archivos mínimos
[
  'app/app.vue',
  'nuxt.config.ts',
  'types/counter.ts',
  'utils/storage.ts',
  'plugins/vuex.client.ts',
  'plugins/persist.client.ts',
  'styles/tokens.css',
  'styles/main.css',
  'layouts/default.vue',
  'pages/index.vue',
  'components/Header.vue',
  'components/SortCounters.vue',
  'components/FilterCounters.vue',
  'components/CounterList.vue',
  'components/Counter.vue',
  'components/AddCounterModal.vue',
  'components/FooterApp.vue',
  'components/CounterSum.vue'
].forEach(exists);

// 2) Reglas de negocio en Vuex
has('plugins/vuex.client.ts', [
  /const\s+MAX_COUNTERS\s*=\s*20/,
  /const\s+MIN_VALUE\s*=\s*0/,
  /const\s+MAX_VALUE\s*=\s*20/,
  /mutations:\s*\{/,
  /ADD_COUNTER\s*\(/,
  /INCREMENT\s*\(/,
  /DECREMENT\s*\(/,
  /RENAME\s*\(/,
  /getters:\s*\{/,
  /totalSum\s*:/,
  /viewList\s*:/,
  /canAdd\s*:/
]);

// 3) Persistencia
has('plugins/persist.client.ts', [
  /const\s+LS_KEY\s*=\s*['"]counters:v1['"]/,
  /const\s+SS_KEY\s*=\s*['"]prefs:v1['"]/
]);

// 4) nuxt.config.ts: CSS global
has('nuxt.config.ts', [
  /css:\s*\[\s*['"]\.\/styles\/tokens\.css['"],\s*['"]\.\/styles\/main\.css['"]\s*\]/
]);

// 5) app.vue: no NuxtWelcome
if(exists('app/app.vue')){
  const txt = fs.readFileSync(p('app/app.vue'), 'utf8');
  if(/NuxtWelcome/.test(txt)) errs.push('app.vue aún contiene <NuxtWelcome />');
}

// 6) index.vue: wiring de eventos y suma
has('pages/index.vue', [
  /@change:filter=/,
  /@change:sortBy=/,
  /@change:sortDir=/,
  /@search=/,
  /<CounterSum\b/,
  /<AddCounterModal\b/
]);

// 7) Counter: rename inline (opcional, pero recomendado)
has('components/Counter.vue', [
  /Renombrar|Guardar/
]);

// Reporte
if(errs.length){
  console.log('❌ QA-SMOKE: FALLÓ\n');
  errs.forEach(e => console.log(' - ' + e));
  process.exit(1);
} else {
  console.log('✅ QA-SMOKE: OK');
}
