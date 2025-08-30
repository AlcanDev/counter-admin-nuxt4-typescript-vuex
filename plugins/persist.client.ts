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
    const store = nuxtApp.$store as StoreType;

    const ls = safeLocal.getJSON<RootState['counters']>(LS_KEY, []);
    const ss = safeSession.getJSON<RootState['prefs']>(SS_KEY, defaultPrefs);
    store.commit('HYDRATE', { counters: ls, prefs: ss });

    store.subscribe(
      throttle((mutation: any, state: RootState) => {
        safeLocal.setJSON(LS_KEY, state.counters);
        safeSession.setJSON(SS_KEY, state.prefs);
      }, 250)
    );
  }
});
