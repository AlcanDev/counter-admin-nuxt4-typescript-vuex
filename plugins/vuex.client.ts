import { createStore, Store } from 'vuex';
import { defineNuxtPlugin } from 'nuxt/app';
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
};

export default defineNuxtPlugin({
  name: 'vuex-store',
  setup(nuxtApp) {
    const store = createStore<RootState>({
      state: (): RootState => ({ counters: [], prefs: defaultPrefs }),
      getters: {
        totalSum: (s) => s.counters.reduce((a, c) => a + c.value, 0),
        viewList: (s) => {
          const { sortBy, sortDir, filterMode, filterX, search } = s.prefs;
          let arr = [...s.counters];

          if (search.trim()) {
            const q = search.trim().toLowerCase();
            arr = arr.filter((c) => c.name.toLowerCase().includes(q));
          }

          if (filterMode !== 'none' && typeof filterX === 'number') {
            arr = arr.filter((c) => (filterMode === 'gt' ? c.value > filterX : c.value < filterX));
          }

          arr.sort((a, b) => {
            const cmp =
              sortBy === 'name'
                ? a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
                : a.value - b.value;
            return sortDir === 'asc' ? cmp : -cmp;
          });

          return arr;
        },
        canAdd: (s) => s.counters.length < MAX_COUNTERS,
      },
      mutations: {
        HYDRATE(state, payload: Partial<RootState>) {
          if (payload.counters) state.counters = payload.counters;
          if (payload.prefs) state.prefs = { ...state.prefs, ...payload.prefs };
        },
        SET_PREFS(state, prefs: Partial<Prefs>) {
          state.prefs = { ...state.prefs, ...prefs };
        },
        ADD_COUNTER(state, name: string) {
          const clean = name.trim();
          if (!clean || clean.length > 20) return;
          if (state.counters.length >= MAX_COUNTERS) return;
          state.counters.push({ id: crypto.randomUUID(), name: clean, value: 0 });
        },
        REMOVE_COUNTER(state, id: string) {
          state.counters = state.counters.filter((c) => c.id !== id);
        },
        INCREMENT(state, id: string) {
          const c = state.counters.find((c) => c.id === id);
          if (!c) return;
          c.value = Math.min(MAX_VALUE, c.value + 1);
        },
        DECREMENT(state, id: string) {
          const c = state.counters.find((c) => c.id === id);
          if (!c) return;
          c.value = Math.max(MIN_VALUE, c.value - 1);
        },
        RENAME(state, payload: { id: string; name: string }) {
          const c = state.counters.find((c) => c.id === payload.id);
          if (!c) return;
          const clean = payload.name.trim();
          if (!clean || clean.length > 20) return;
          c.name = clean;
        },
      },
      actions: {
        setSort({ commit }, p: { by: 'name' | 'value'; dir: 'asc' | 'desc' }) {
          commit('SET_PREFS', { sortBy: p.by, sortDir: p.dir });
        },
        setFilter({ commit }, p: { mode: 'gt' | 'lt' | 'none'; x?: number }) {
          commit('SET_PREFS', { filterMode: p.mode, filterX: p.mode === 'none' ? null : (p.x ?? 0) });
        },
        clearFilters({ commit }) {
          commit('SET_PREFS', { filterMode: 'none', filterX: null, search: '' });
        },
        setSearch({ commit }, q: string) {
          commit('SET_PREFS', { search: q });
        },
      },
      strict: process.env.NODE_ENV !== 'production',
    });

    nuxtApp.vueApp.use(store as unknown as Store<RootState>);
    nuxtApp.provide('store', store);
  }
});
