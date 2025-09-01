import { defineNuxtPlugin } from 'nuxt/app';
import * as Vuex from 'vuex';
import type { RootState, Prefs } from '../types/counter';

const MAX_COUNTERS = 20;
const MIN_VALUE = 0;
const MAX_VALUE = 20;

const defaultPrefs: Prefs = {
  sortBy: 'name',
  sortDir: 'asc',
  filterMode: 'none',
  filterX: null,
  search: '',
  sortingEnabled: false,
};

// Global store instance
let globalStore: Vuex.Store<RootState> | null = null;

export default defineNuxtPlugin({
  name: 'vuex-store',
  setup(nuxtApp) {
    // Return existing store if already created
    if (globalStore) {
      nuxtApp.vueApp.use(globalStore);
      return {
        provide: {
          vuexStore: globalStore,
        },
      };
    }

    const store = Vuex.createStore<RootState>({
      state: () => ({ counters: [], prefs: defaultPrefs }),
      getters: {
        totalSum: (s: RootState) => s.counters.reduce((a, c) => a + c.value, 0),
        viewList: (s: RootState) => {
          const { sortBy, sortDir, filterMode, filterX, search, sortingEnabled } = s.prefs;
          let arr = [...s.counters];

          if (search.trim()) {
            const q = search.trim().toLowerCase();
            arr = arr.filter((c) => c.name.toLowerCase().includes(q));
          }

          if (filterMode !== 'none' && typeof filterX === 'number') {
            arr = arr.filter((c) => (filterMode === 'gt' ? c.value > filterX : c.value < filterX));
          }

          // Only sort if sorting is explicitly enabled
          if (sortingEnabled) {
            arr.sort((a, b) => {
              const cmp =
                sortBy === 'name'
                  ? a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
                  : a.value - b.value;
              return sortDir === 'asc' ? cmp : -cmp;
            });
          }

          return arr;
        },
        canAdd: (s: RootState) => s.counters.length < MAX_COUNTERS,
      },
      mutations: {
        HYDRATE(state: RootState, payload: Partial<RootState>) {
          if (payload.counters) state.counters = payload.counters;
          if (payload.prefs) state.prefs = { ...state.prefs, ...payload.prefs };
        },
        SET_PREFS(state: RootState, prefs: Partial<Prefs>) {
          state.prefs = { ...state.prefs, ...prefs };
        },
        ADD_COUNTER(state: RootState, name: string) {
          const clean = name.trim();
          if (!clean || clean.length > 20) return;
          if (state.counters.length >= MAX_COUNTERS) return;
          state.counters.push({ id: crypto.randomUUID(), name: clean, value: 0 });
        },
        REMOVE_COUNTER(state: RootState, id: string) {
          state.counters = state.counters.filter((c) => c.id !== id);
        },
        INCREMENT(state: RootState, id: string) {
          const c = state.counters.find((c) => c.id === id);
          if (!c) return;
          c.value = Math.min(MAX_VALUE, c.value + 1);
        },
        DECREMENT(state: RootState, id: string) {
          const c = state.counters.find((c) => c.id === id);
          if (!c) return;
          c.value = Math.max(MIN_VALUE, c.value - 1);
        },
        RENAME(state: RootState, payload: { id: string; name: string }) {
          const c = state.counters.find((c) => c.id === payload.id);
          if (!c) return;
          const clean = payload.name.trim();
          if (!clean || clean.length > 20) return;
          c.name = clean;
        },
      },
      actions: {
        setSort({ commit }: Vuex.ActionContext<RootState, RootState>, p: { by: 'name' | 'value'; dir: 'asc' | 'desc' }) {
          commit('SET_PREFS', { sortBy: p.by, sortDir: p.dir, sortingEnabled: true });
        },
        setFilter({ commit }: Vuex.ActionContext<RootState, RootState>, p: { mode: 'gt' | 'lt' | 'none'; x?: number }) {
          commit('SET_PREFS', {
            filterMode: p.mode,
            filterX: p.mode === 'none' ? null : (p.x ?? 0),
          });
        },
        clearFilters({ commit }: Vuex.ActionContext<RootState, RootState>) {
          commit('SET_PREFS', { filterMode: 'none', filterX: null, search: '' });
        },
        disableSorting({ commit }: Vuex.ActionContext<RootState, RootState>) {
          commit('SET_PREFS', { sortingEnabled: false });
        },
        setSearch({ commit }: Vuex.ActionContext<RootState, RootState>, q: string) {
          commit('SET_PREFS', { search: q });
        },
      },
      strict: process.env.NODE_ENV !== 'production',
    });

    // Store globally
    globalStore = store;

    // Install store in Vue app
    nuxtApp.vueApp.use(store);

    // Provide store to nuxtApp context
    nuxtApp.provide('store', store);
    nuxtApp.provide('$store', store);

    return {
      provide: {
        vuexStore: store,
      },
    };
  },
});
