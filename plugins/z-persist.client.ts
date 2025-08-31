import { defineNuxtPlugin } from 'nuxt/app';
import type { RootState, Prefs, StoreType } from '../types/counter';
import { safeLocal, safeSession, throttle } from '../utils/storage';

const LS_KEY = 'counters:v1';
const SS_KEY = 'prefs:v1';

const defaultPrefs: Prefs = {
  sortBy: 'name',
  sortDir: 'asc',
  filterMode: 'none',
  filterX: null,
  search: '',
};

export default defineNuxtPlugin({
  name: 'persist-store',
  dependsOn: ['vuex-store'],
  setup(nuxtApp) {
    // Access the store from nuxtApp
    const store = nuxtApp.$vuexStore as StoreType;
    
    if (!store) {
      console.error('Store not available in persist plugin');
      return;
    }

    // Load persisted data
    const ls = safeLocal.getJSON<RootState['counters']>(LS_KEY, []);
    const ss = safeSession.getJSON<RootState['prefs']>(SS_KEY, defaultPrefs);
    
    // Hydrate store with persisted data
    store.commit('HYDRATE', { counters: ls, prefs: ss });

    // Subscribe to store changes and persist them
    store.subscribe(
      throttle((mutation: any, state: RootState) => {
        safeLocal.setJSON(LS_KEY, state.counters);
        safeSession.setJSON(SS_KEY, state.prefs);
      }, 250)
    );
  },
});
