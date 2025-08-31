import fs from 'fs';
import path from 'path';

const root = process.cwd();
const errs = [];
const warnings = [];
let checks = 0;
let passed = 0;

function p(...segs) {
  return path.join(root, ...segs);
}

function check(description, fn) {
  checks++;
  try {
    const result = fn();
    if (result !== false) {
      passed++;
      console.log(`✓ ${description}`);
      return true;
    } else {
      errs.push(`✗ ${description}`);
      return false;
    }
  } catch (error) {
    errs.push(`✗ ${description}: ${error.message}`);
    return false;
  }
}

function warn(message) {
  warnings.push(`⚠ ${message}`);
}

function exists(rel) {
  try {
    return fs.existsSync(p(rel));
  } catch {
    return false;
  }
}

function has(rel, patterns) {
  if (!exists(rel)) return false;
  try {
    const txt = fs.readFileSync(p(rel), 'utf8');
    for (const pat of patterns) {
      const re = pat instanceof RegExp ? pat : new RegExp(pat, 'm');
      if (!re.test(txt)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function hasValidJSON(rel) {
  if (!exists(rel)) return false;
  try {
    const content = fs.readFileSync(p(rel), 'utf8');
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

console.log('🔍 QA Smoke Test - Counter Admin Nuxt 4\n');

// 1) Archivos esenciales
console.log('📁 Verificando estructura de archivos...');
const requiredFiles = [
  'nuxt.config.ts',
  'types/counter.ts',
  'utils/storage.ts',
  'plugins/vuex.client.ts',
  'plugins/z-persist.client.ts',
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
  'components/CounterSum.vue',
  'composables/useStore.ts',
];

requiredFiles.forEach((file) => {
  check(`Archivo requerido: ${file}`, () => exists(file));
});

// 2) Configuración válida
console.log('\n⚙️ Verificando configuración...');
check('package.json es JSON válido', () => hasValidJSON('package.json'));
check('tsconfig.json existe', () => exists('tsconfig.json'));
check('Composable useStore existe', () => exists('composables/useStore.ts'));

// 3) Reglas de negocio en Vuex
console.log('\n🏪 Verificando store Vuex...');
check('MAX_COUNTERS = 20', () => has('plugins/vuex.client.ts', [/const\s+MAX_COUNTERS\s*=\s*20/]));
check('MIN_VALUE = 0', () => has('plugins/vuex.client.ts', [/const\s+MIN_VALUE\s*=\s*0/]));
check('MAX_VALUE = 20', () => has('plugins/vuex.client.ts', [/const\s+MAX_VALUE\s*=\s*20/]));
check('Mutations definidas', () =>
  has('plugins/vuex.client.ts', [
    /mutations:\s*\{/,
    /ADD_COUNTER\s*\(/,
    /INCREMENT\s*\(/,
    /DECREMENT\s*\(/,
    /RENAME\s*\(/,
  ])
);
check('Getters definidos', () =>
  has('plugins/vuex.client.ts', [/getters:\s*\{/, /totalSum\s*:/, /viewList\s*:/, /canAdd\s*:/])
);

// 4) Persistencia
console.log('\n💾 Verificando persistencia...');
check('Claves de storage definidas', () =>
  has('plugins/z-persist.client.ts', [
    /const\s+LS_KEY\s*=\s*['"]counters:v1['"]/,
    /const\s+SS_KEY\s*=\s*['"]prefs:v1['"]/,
  ])
);
check('Storage utils implementados', () =>
  has('utils/storage.ts', [
    /export\s+const\s+safeLocal/,
    /export\s+const\s+safeSession/,
    /export\s+const\s+throttle/,
  ])
);

// 5) Configuración Nuxt
console.log('\n🚀 Verificando configuración Nuxt...');
check('CSS global configurado', () =>
  has('nuxt.config.ts', [
    /css:\s*\[\s*['"]\.\/styles\/tokens\.css['"],\s*['"]\.\/styles\/main\.css['"]\s*\]/,
  ])
);
check('SSR deshabilitado', () => has('nuxt.config.ts', [/ssr:\s*false/]));
check('TypeScript estricto', () =>
  has('nuxt.config.ts', [/typescript:\s*\{\s*strict:\s*true\s*\}/])
);

// 6) Estructura Nuxt
console.log('\n🏠 Verificando estructura Nuxt...');
check('Layout default existe', () => exists('layouts/default.vue'));
check('Página index existe', () => exists('pages/index.vue'));
check('Composable useStore funcional', () =>
  has('composables/useStore.ts', [/export\s+const\s+useStore/])
);

// 7) Página principal
console.log('\n📄 Verificando página index...');
check('Eventos de filtros y orden', () =>
  has('pages/index.vue', [/@change:filter=/, /@change:sortBy=/, /@change:sortDir=/, /@search=/])
);
check('Componentes principales', () =>
  has('pages/index.vue', [/<CounterSum\b/, /<AddCounterModal\b/])
);

// 8) Componentes clave
console.log('\n🧩 Verificando componentes...');
check('Counter con funcionalidad de renombrar', () =>
  has('components/Counter.vue', [/Renombrar|Guardar/])
);
check('Modal con validación', () =>
  has('components/AddCounterModal.vue', [/role="dialog"/, /aria-modal="true"/])
);

// 9) Tipos TypeScript
console.log('\n📝 Verificando tipos...');
check('Tipos de Counter definidos', () =>
  has('types/counter.ts', [/interface\s+Counter/, /interface\s+RootState/, /interface\s+Prefs/])
);

// 10) Estilos
console.log('\n🎨 Verificando estilos...');
check('Tokens CSS definidos', () =>
  has('styles/tokens.css', [/:root\s*\{/, /--bg:/, /--text:/, /--brand:/])
);
check('Transiciones definidas', () =>
  has('styles/main.css', [
    /\.fade-enter-active/,
    /\.list-enter-active/,
    /\.modal-scale-enter-active/,
  ])
);

// 11) Tests (opcional)
console.log('\n🧪 Verificando tests...');
if (exists('tests/store.test.ts')) {
  check('Tests del store', () => has('tests/store.test.ts', [/describe.*Store/]));
} else {
  warn('No se encontraron tests del store');
}

if (exists('tests/components')) {
  check(
    'Tests de componentes',
    () =>
      exists('tests/components/Counter.test.ts') &&
      exists('tests/components/AddCounterModal.test.ts')
  );
} else {
  warn('No se encontraron tests de componentes');
}

// 12) Scripts de package.json
console.log('\n📦 Verificando scripts...');
check('Scripts npm definidos', () => {
  if (!exists('package.json')) return false;
  const pkg = JSON.parse(fs.readFileSync(p('package.json'), 'utf8'));
  const requiredScripts = ['dev', 'build', 'lint', 'typecheck', 'qa'];
  return requiredScripts.every((script) => pkg.scripts && pkg.scripts[script]);
});

// Reporte final
console.log('\n' + '='.repeat(50));
console.log(`📊 RESUMEN: ${passed}/${checks} checks pasaron`);

if (warnings.length > 0) {
  console.log('\n⚠️  ADVERTENCIAS:');
  warnings.forEach((w) => console.log(`   ${w}`));
}

if (errs.length > 0) {
  console.log('\n❌ ERRORES:');
  errs.forEach((e) => console.log(`   ${e}`));
  console.log('\n🔴 QA-SMOKE: FALLÓ');
  process.exit(1);
} else {
  console.log('\n✅ QA-SMOKE: TODOS LOS CHECKS PASARON');
  if (warnings.length > 0) {
    console.log('💡 Revisa las advertencias para mejorar el proyecto');
  }
}
