## Proyecto: Counter Admin — Nuxt 4 + TypeScript + Vuex

Aplicación para administrar una lista de contadores con reglas de negocio, persistencia y una UI moderna sin frameworks de estilos. Basado en Nuxt 4, Vue 3, TypeScript y Vuex.

### Requerimiento funcional (resumen)

- Crear, listar, renombrar y eliminar contadores.
- Incrementar/decrementar valor por contador.
- Ordenar por nombre o valor (asc/desc).
- Filtros: mayores que x (gt) o menores que x (lt).
- Búsqueda por nombre integrada a filtros/orden.
- Footer con la suma total de todos los contadores (independiente de filtros).
- Límite: máx 20 contadores, valores en [0..20].
- Persistencia: counters → localStorage, prefs → sessionStorage.

### Tecnologías principales

- Nuxt 4 (`nuxt.config.ts`) con SSR deshabilitado para este proyecto (`ssr: false`).
- Vue 3 + TypeScript estricto.
- Vuex 4 como state management (`plugins/vuex.client.ts`).
- CSS nativo con design tokens (`styles/tokens.css`) y estilos globales (`styles/main.css`).

### Estructura relevante

- `nuxt.config.ts`: configuración base, CSS global, head/meta.
- `plugins/vuex.client.ts`: creación del store Vuex con reglas y getters.
- `plugins/z-persist.client.ts`: hidratación y persistencia en localStorage/sessionStorage.
- `utils/storage.ts`: helpers seguros para local/session y `throttle`.
- `composables/useStore.ts`: acceso tipado al store en componentes.
- `components/`:
  - `Header.vue`: título y acciones principales.
  - `SortCounters.vue`: orden por `name|value` y `asc|desc`.
  - `FilterCounters.vue`: filtros `gt|lt` con umbral y limpiar.
  - `CounterList.vue`: renderiza la lista filtrada/ordenada/buscada.
  - `Counter.vue`: item con nombre, valor, +1, -1, eliminar y renombrar inline.
  - `AddCounterModal.vue`: modal con input de nombre y confirmación/cancelar.
  - `FooterApp.vue`: pie de app.
  - `CounterSum.vue`: suma total de todos los contadores.
- `layouts/default.vue` y `pages/index.vue`: arman la pantalla principal y wiring de eventos.
- `styles/`: `tokens.css` (paleta, spacing, sombras) + `main.css` (layout, transiciones, componentes base).

### Estado, reglas de negocio y persistencia

- Reglas en `plugins/vuex.client.ts`:
  - Constantes: `MAX_COUNTERS = 20`, `MIN_VALUE = 0`, `MAX_VALUE = 20`.
  - `getters.totalSum`: suma total (no depende de filtros).
  - `getters.viewList`: aplica búsqueda, filtros y orden.
  - `getters.canAdd`: deshabilita “Nuevo” cuando hay 20 contadores.
  - Mutaciones: `HYDRATE`, `SET_PREFS`, `ADD_COUNTER`, `REMOVE_COUNTER`, `INCREMENT`, `DECREMENT`, `RENAME`.
  - Acciones: `setSort`, `setFilter`, `clearFilters`, `setSearch`.

- Persistencia en `plugins/z-persist.client.ts`:
  - Claves: `LS_KEY = 'counters:v1'` para contadores (localStorage), `SS_KEY = 'prefs:v1'` para preferencias (sessionStorage).
  - Hidrata estado al iniciar (`HYDRATE`).
  - Suscripción con `throttle` para persistir cambios.

### UI/UX y Accesibilidad

- Sin frameworks CSS. Se emplean variables de diseño y estilos propios.
- Transiciones definidas en `styles/main.css`: `fade`, `list`, `modal-scale`.
- Accesibilidad: labels en formularios, `role="dialog"` en modales y soporte de teclado (Enter/Esc) en componentes clave.

### Scripts disponibles

- `npm run dev`: entorno de desarrollo en http://localhost:3000.
- `npm run build`: build de producción.
- `npm run start`: arrancar el build en modo producción.
- `npm run lint`: ESLint para `.ts` y `.vue`.
- `npm run format`: Prettier (check).
- `npm run typecheck`: comprobación de tipos con `vue-tsc`.
- `npm run test`: Vitest con tests completos del store, componentes y persistencia.
- `npm run qa`: smoke QA + lint + typecheck + test + build.

### Cómo ejecutar en local

1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd counter-admin-nuxt4-typescript-vuex
npm install
```

2. Ejecutar en desarrollo

```bash
npm run dev
```

3. QA opcional antes de producir

```bash
npm run qa
```

4. Build y preview de producción

```bash
npm run build
npm run start   # o npm run preview
```

### Criterios de aceptación (verificados)

- Botón “Nuevo” se deshabilita con 20 contadores (`getters.canAdd`).
- Footer muestra la suma total de todos los contadores (`getters.totalSum`).
- Persistencia: `counters` en localStorage y `prefs` en sessionStorage, rehidratación al recargar.

### Despliegue

- Proyecto listo para Vercel/Netlify. Para Vercel, configurar proyecto como Nuxt 4 (build `npm run build`, start `npm run start`).
- URL de producción: [pendiente de publicar en Vercel].

### Notas técnicas

- SSR deshabilitado (`ssr: false`) para evitar desajustes de hidratación en este caso de uso con storage del navegador.
- El store Vuex se expone al contexto de Nuxt y se consume vía `useStore()` (`composables/useStore.ts`).
- Claves de storage versionadas (`counters:v1`, `prefs:v1`) para facilitar migraciones futuras.

### Licencia

MIT — Alcandev
