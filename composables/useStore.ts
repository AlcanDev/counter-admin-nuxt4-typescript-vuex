import { useNuxtApp } from 'nuxt/app';
import type { StoreType } from '~/types/counter';

export const useStore = (): StoreType => {
  const nuxtApp = useNuxtApp();

  const store = nuxtApp.$vuexStore || nuxtApp.vueApp?.config?.globalProperties?.$store;

  if (!store) {
    throw new Error(
      'Vuex store is not available. Make sure the store plugin is properly configured.'
    );
  }

  return store as StoreType;
};
