import { describe, it, expect, beforeEach } from 'vitest';
import * as Vuex from 'vuex';
import type { RootState, Prefs, Counter } from '../types/counter';

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

// Store factory function (same as in plugins/vuex.client.ts)
function createTestStore() {
  return Vuex.createStore<RootState>({
    state: () => ({ counters: [], prefs: defaultPrefs }),
    getters: {
      totalSum: (s: RootState) => s.counters.reduce((a, c) => a + c.value, 0),
      viewList: (s: RootState) => {
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
      setSort({ commit }: { commit: any }, p: { by: 'name' | 'value'; dir: 'asc' | 'desc' }) {
        commit('SET_PREFS', { sortBy: p.by, sortDir: p.dir });
      },
      setFilter({ commit }: { commit: any }, p: { mode: 'gt' | 'lt' | 'none'; x?: number }) {
        commit('SET_PREFS', {
          filterMode: p.mode,
          filterX: p.mode === 'none' ? null : (p.x ?? 0),
        });
      },
      clearFilters({ commit }: { commit: any }) {
        commit('SET_PREFS', { filterMode: 'none', filterX: null, search: '' });
      },
      setSearch({ commit }: { commit: any }, q: string) {
        commit('SET_PREFS', { search: q });
      },
    },
    strict: false,
  });
}

describe('Vuex Store', () => {
  let store: any;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('Initial State', () => {
    it('should have empty counters array', () => {
      expect(store.state.counters).toEqual([]);
    });

    it('should have default preferences', () => {
      expect(store.state.prefs).toEqual(defaultPrefs);
    });

    it('should allow adding counters initially', () => {
      expect(store.getters.canAdd).toBe(true);
    });

    it('should have zero total sum initially', () => {
      expect(store.getters.totalSum).toBe(0);
    });
  });

  describe('ADD_COUNTER mutation', () => {
    it('should add a valid counter', () => {
      store.commit('ADD_COUNTER', 'Test Counter');
      
      expect(store.state.counters).toHaveLength(1);
      expect(store.state.counters[0].name).toBe('Test Counter');
      expect(store.state.counters[0].value).toBe(0);
      expect(store.state.counters[0].id).toBeDefined();
    });

    it('should trim whitespace from counter name', () => {
      store.commit('ADD_COUNTER', '  Trimmed Name  ');
      
      expect(store.state.counters[0].name).toBe('Trimmed Name');
    });

    it('should reject empty names', () => {
      store.commit('ADD_COUNTER', '');
      store.commit('ADD_COUNTER', '   ');
      
      expect(store.state.counters).toHaveLength(0);
    });

    it('should reject names longer than 20 characters', () => {
      store.commit('ADD_COUNTER', 'This name is way too long for the counter limit');
      
      expect(store.state.counters).toHaveLength(0);
    });

    it('should respect maximum counter limit', () => {
      // Add 20 counters
      for (let i = 1; i <= 20; i++) {
        store.commit('ADD_COUNTER', `Counter ${i}`);
      }
      
      expect(store.state.counters).toHaveLength(20);
      expect(store.getters.canAdd).toBe(false);
      
      // Try to add 21st counter
      store.commit('ADD_COUNTER', 'Should not be added');
      
      expect(store.state.counters).toHaveLength(20);
    });
  });

  describe('INCREMENT/DECREMENT mutations', () => {
    beforeEach(() => {
      store.commit('ADD_COUNTER', 'Test Counter');
    });

    it('should increment counter value', () => {
      const id = store.state.counters[0].id;
      store.commit('INCREMENT', id);
      
      expect(store.state.counters[0].value).toBe(1);
    });

    it('should decrement counter value', () => {
      const id = store.state.counters[0].id;
      store.commit('INCREMENT', id);
      store.commit('DECREMENT', id);
      
      expect(store.state.counters[0].value).toBe(0);
    });

    it('should not increment beyond MAX_VALUE (20)', () => {
      const id = store.state.counters[0].id;
      
      // Set to max value
      for (let i = 0; i < 25; i++) {
        store.commit('INCREMENT', id);
      }
      
      expect(store.state.counters[0].value).toBe(MAX_VALUE);
    });

    it('should not decrement below MIN_VALUE (0)', () => {
      const id = store.state.counters[0].id;
      
      // Try to decrement below 0
      for (let i = 0; i < 5; i++) {
        store.commit('DECREMENT', id);
      }
      
      expect(store.state.counters[0].value).toBe(MIN_VALUE);
    });

    it('should ignore invalid counter IDs', () => {
      store.commit('INCREMENT', 'invalid-id');
      store.commit('DECREMENT', 'invalid-id');
      
      expect(store.state.counters[0].value).toBe(0);
    });
  });

  describe('RENAME mutation', () => {
    beforeEach(() => {
      store.commit('ADD_COUNTER', 'Original Name');
    });

    it('should rename counter with valid name', () => {
      const id = store.state.counters[0].id;
      store.commit('RENAME', { id, name: 'New Name' });
      
      expect(store.state.counters[0].name).toBe('New Name');
    });

    it('should trim whitespace when renaming', () => {
      const id = store.state.counters[0].id;
      store.commit('RENAME', { id, name: '  Trimmed New Name  ' });
      
      expect(store.state.counters[0].name).toBe('Trimmed New Name');
    });

    it('should reject empty names when renaming', () => {
      const id = store.state.counters[0].id;
      const originalName = store.state.counters[0].name;
      
      store.commit('RENAME', { id, name: '' });
      store.commit('RENAME', { id, name: '   ' });
      
      expect(store.state.counters[0].name).toBe(originalName);
    });

    it('should reject names longer than 20 characters when renaming', () => {
      const id = store.state.counters[0].id;
      const originalName = store.state.counters[0].name;
      
      store.commit('RENAME', { id, name: 'This name is way too long for the counter limit' });
      
      expect(store.state.counters[0].name).toBe(originalName);
    });

    it('should ignore invalid counter IDs when renaming', () => {
      const originalName = store.state.counters[0].name;
      
      store.commit('RENAME', { id: 'invalid-id', name: 'New Name' });
      
      expect(store.state.counters[0].name).toBe(originalName);
    });
  });

  describe('REMOVE_COUNTER mutation', () => {
    beforeEach(() => {
      store.commit('ADD_COUNTER', 'Counter 1');
      store.commit('ADD_COUNTER', 'Counter 2');
    });

    it('should remove counter by ID', () => {
      const id = store.state.counters[0].id;
      store.commit('REMOVE_COUNTER', id);
      
      expect(store.state.counters).toHaveLength(1);
      expect(store.state.counters[0].name).toBe('Counter 2');
    });

    it('should ignore invalid counter IDs', () => {
      store.commit('REMOVE_COUNTER', 'invalid-id');
      
      expect(store.state.counters).toHaveLength(2);
    });
  });

  describe('HYDRATE mutation', () => {
    it('should hydrate counters', () => {
      const counters: Counter[] = [
        { id: '1', name: 'Hydrated Counter', value: 5 }
      ];
      
      store.commit('HYDRATE', { counters });
      
      expect(store.state.counters).toEqual(counters);
    });

    it('should hydrate preferences', () => {
      const prefs: Partial<Prefs> = {
        sortBy: 'value',
        sortDir: 'desc',
        search: 'test'
      };
      
      store.commit('HYDRATE', { prefs });
      
      expect(store.state.prefs.sortBy).toBe('value');
      expect(store.state.prefs.sortDir).toBe('desc');
      expect(store.state.prefs.search).toBe('test');
      expect(store.state.prefs.filterMode).toBe('none'); // Should preserve existing
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      store.commit('ADD_COUNTER', 'Alpha');
      store.commit('ADD_COUNTER', 'Beta');
      store.commit('ADD_COUNTER', 'Gamma');
      
      // Set different values
      store.commit('INCREMENT', store.state.counters[0].id); // Alpha = 1
      store.commit('INCREMENT', store.state.counters[1].id); // Beta = 1
      store.commit('INCREMENT', store.state.counters[1].id); // Beta = 2
      store.commit('INCREMENT', store.state.counters[2].id); // Gamma = 1
      store.commit('INCREMENT', store.state.counters[2].id); // Gamma = 2
      store.commit('INCREMENT', store.state.counters[2].id); // Gamma = 3
    });

    describe('totalSum', () => {
      it('should calculate total sum correctly', () => {
        expect(store.getters.totalSum).toBe(6); // 1 + 2 + 3
      });

      it('should return 0 for empty counters', () => {
        store.state.counters = [];
        expect(store.getters.totalSum).toBe(0);
      });
    });

    describe('viewList', () => {
      it('should sort by name ascending by default', () => {
        const view = store.getters.viewList;
        expect(view.map((c: Counter) => c.name)).toEqual(['Alpha', 'Beta', 'Gamma']);
      });

      it('should sort by name descending', () => {
        store.commit('SET_PREFS', { sortBy: 'name', sortDir: 'desc' });
        const view = store.getters.viewList;
        expect(view.map((c: Counter) => c.name)).toEqual(['Gamma', 'Beta', 'Alpha']);
      });

      it('should sort by value ascending', () => {
        store.commit('SET_PREFS', { sortBy: 'value', sortDir: 'asc' });
        const view = store.getters.viewList;
        expect(view.map((c: Counter) => c.value)).toEqual([1, 2, 3]);
      });

      it('should sort by value descending', () => {
        store.commit('SET_PREFS', { sortBy: 'value', sortDir: 'desc' });
        const view = store.getters.viewList;
        expect(view.map((c: Counter) => c.value)).toEqual([3, 2, 1]);
      });

      it('should filter by greater than', () => {
        store.commit('SET_PREFS', { filterMode: 'gt', filterX: 1 });
        const view = store.getters.viewList;
        expect(view.map((c: Counter) => c.name)).toEqual(['Beta', 'Gamma']);
      });

      it('should filter by less than', () => {
        store.commit('SET_PREFS', { filterMode: 'lt', filterX: 3 });
        const view = store.getters.viewList;
        expect(view.map((c: Counter) => c.name)).toEqual(['Alpha', 'Beta']);
      });

      it('should search by name (case insensitive)', () => {
        store.commit('SET_PREFS', { search: 'bet' });
        const view = store.getters.viewList;
        expect(view.map((c: Counter) => c.name)).toEqual(['Beta']);
      });

      it('should combine search and filter', () => {
        store.commit('SET_PREFS', { search: 'a', filterMode: 'gt', filterX: 1 });
        const view = store.getters.viewList;
        expect(view.map((c: Counter) => c.name)).toEqual(['Beta', 'Gamma']); // Beta and Gamma have 'a' and value > 1
      });
    });

    describe('canAdd', () => {
      it('should return true when under limit', () => {
        expect(store.getters.canAdd).toBe(true);
      });

      it('should return false when at limit', () => {
        // Add 17 more counters (we already have 3)
        for (let i = 4; i <= 20; i++) {
          store.commit('ADD_COUNTER', `Counter ${i}`);
        }
        
        expect(store.state.counters).toHaveLength(20);
        expect(store.getters.canAdd).toBe(false);
      });
    });
  });

  describe('Actions', () => {
    it('should set sort preferences', async () => {
      await store.dispatch('setSort', { by: 'value', dir: 'desc' });
      
      expect(store.state.prefs.sortBy).toBe('value');
      expect(store.state.prefs.sortDir).toBe('desc');
    });

    it('should set filter preferences', async () => {
      await store.dispatch('setFilter', { mode: 'gt', x: 5 });
      
      expect(store.state.prefs.filterMode).toBe('gt');
      expect(store.state.prefs.filterX).toBe(5);
    });

    it('should clear filter preferences', async () => {
      // Set some filters first
      store.commit('SET_PREFS', { filterMode: 'gt', filterX: 5, search: 'test' });
      
      await store.dispatch('clearFilters');
      
      expect(store.state.prefs.filterMode).toBe('none');
      expect(store.state.prefs.filterX).toBe(null);
      expect(store.state.prefs.search).toBe('');
    });

    it('should set search query', async () => {
      await store.dispatch('setSearch', 'test query');
      
      expect(store.state.prefs.search).toBe('test query');
    });

    it('should handle filter mode none correctly', async () => {
      await store.dispatch('setFilter', { mode: 'none' });
      
      expect(store.state.prefs.filterMode).toBe('none');
      expect(store.state.prefs.filterX).toBe(null);
    });
  });
});
