import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as Vuex from 'vuex';
import type { RootState, Prefs } from '../../types/counter';
import { safeLocal, safeSession, throttle } from '../../utils/storage';

// Mock storage
const mockLocalStorage = new Map<string, string>();
const mockSessionStorage = new Map<string, string>();

const mockStorage = (storage: Map<string, string>) => ({
  getItem: vi.fn((key: string) => storage.get(key) || null),
  setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
  removeItem: vi.fn((key: string) => storage.delete(key)),
  clear: vi.fn(() => storage.clear()),
});

describe('Persistence Integration', () => {
  let store: Vuex.Store<RootState>;
  let mockLocal: ReturnType<typeof mockStorage>;
  let mockSession: ReturnType<typeof mockStorage>;

  const LS_KEY = 'counters:v1';
  const SS_KEY = 'prefs:v1';

  const defaultPrefs: Prefs = {
    sortBy: 'name',
    sortDir: 'asc',
    filterMode: 'none',
    filterX: null,
    search: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();

    mockLocal = mockStorage(mockLocalStorage);
    mockSession = mockStorage(mockSessionStorage);

    // Stub global storage objects
    vi.stubGlobal('localStorage', mockLocal);
    vi.stubGlobal('sessionStorage', mockSession);
    vi.stubGlobal('window', {
      localStorage: mockLocal,
      sessionStorage: mockSession,
    });

    // Create store similar to the plugin
    store = Vuex.createStore<RootState>({
      state: () => ({ counters: [], prefs: { ...defaultPrefs } }),
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
        canAdd: (s: RootState) => s.counters.length < 20,
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
          if (state.counters.length >= 20) return;
          state.counters.push({ id: crypto.randomUUID(), name: clean, value: 0 });
        },
        INCREMENT(state: RootState, id: string) {
          const c = state.counters.find((c) => c.id === id);
          if (!c) return;
          c.value = Math.min(20, c.value + 1);
        },
      },
      strict: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Storage Persistence', () => {
    it('should persist counters to localStorage', () => {
      store.commit('ADD_COUNTER', 'Test Counter');

      // Manually trigger persistence
      safeLocal.setJSON(LS_KEY, store.state.counters);

      expect(mockLocal.setItem).toHaveBeenCalledWith(LS_KEY, JSON.stringify(store.state.counters));
    });

    it('should persist preferences to sessionStorage', () => {
      store.commit('SET_PREFS', { sortBy: 'value', sortDir: 'desc' });

      // Manually trigger persistence
      safeSession.setJSON(SS_KEY, store.state.prefs);

      expect(mockSession.setItem).toHaveBeenCalledWith(SS_KEY, JSON.stringify(store.state.prefs));
    });

    it('should hydrate from localStorage on startup', () => {
      const persistedCounters = [{ id: '1', name: 'Persisted Counter', value: 5 }];

      // Set up mock data
      mockLocalStorage.set(LS_KEY, JSON.stringify(persistedCounters));

      // Simulate hydration
      const loadedCounters = safeLocal.getJSON(LS_KEY, []);
      store.commit('HYDRATE', { counters: loadedCounters });

      expect(store.state.counters).toEqual(persistedCounters);
    });

    it('should hydrate preferences from sessionStorage on startup', () => {
      const persistedPrefs = {
        sortBy: 'value' as const,
        sortDir: 'desc' as const,
        filterMode: 'gt' as const,
        filterX: 5,
        search: 'test',
      };

      // Set up mock data
      mockSessionStorage.set(SS_KEY, JSON.stringify(persistedPrefs));

      // Simulate hydration
      const loadedPrefs = safeSession.getJSON(SS_KEY, defaultPrefs);
      store.commit('HYDRATE', { prefs: loadedPrefs });

      expect(store.state.prefs).toEqual(persistedPrefs);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      mockLocalStorage.set(LS_KEY, 'invalid json');

      const loadedCounters = safeLocal.getJSON(LS_KEY, []);

      expect(loadedCounters).toEqual([]);
    });

    it('should handle corrupted sessionStorage data gracefully', () => {
      mockSessionStorage.set(SS_KEY, 'invalid json');

      const loadedPrefs = safeSession.getJSON(SS_KEY, defaultPrefs);

      expect(loadedPrefs).toEqual(defaultPrefs);
    });
  });

  describe('Full Persistence Workflow', () => {
    it('should complete full save/load cycle for counters', () => {
      // Add counters and modify values
      store.commit('ADD_COUNTER', 'Counter 1');
      store.commit('ADD_COUNTER', 'Counter 2');

      const counter1Id = store?.state?.counters?.[0]?.id;
      const counter2Id = store?.state?.counters?.[1]?.id;

      store.commit('INCREMENT', counter1Id);
      store.commit('INCREMENT', counter1Id);
      store.commit('INCREMENT', counter2Id);

      // Save to storage
      safeLocal.setJSON(LS_KEY, store.state.counters);

      // Create new store and hydrate
      const newStore = Vuex.createStore<RootState>({
        state: () => ({ counters: [], prefs: defaultPrefs }),
        mutations: {
          HYDRATE(state: RootState, payload: Partial<RootState>) {
            if (payload.counters) state.counters = payload.counters;
          },
        },
      });

      const loadedCounters = safeLocal.getJSON(LS_KEY, []);
      newStore.commit('HYDRATE', { counters: loadedCounters });

      expect(newStore.state.counters).toHaveLength(2);
      expect(newStore.state.counters[0]!.name).toBe('Counter 1');
      expect(newStore.state.counters[0]!.value).toBe(2);
      expect(newStore.state.counters[1]!.name).toBe('Counter 2');
      expect(newStore.state.counters[1]!.value).toBe(1);
    });

    it('should complete full save/load cycle for preferences', () => {
      // Modify preferences
      store.commit('SET_PREFS', {
        sortBy: 'value',
        sortDir: 'desc',
        filterMode: 'gt',
        filterX: 3,
        search: 'test query',
      });

      // Save to storage
      safeSession.setJSON(SS_KEY, store.state.prefs);

      // Create new store and hydrate
      const newStore = Vuex.createStore<RootState>({
        state: () => ({ counters: [], prefs: defaultPrefs }),
        mutations: {
          HYDRATE(state: RootState, payload: Partial<RootState>) {
            if (payload.prefs) state.prefs = { ...state.prefs, ...payload.prefs };
          },
        },
      });

      const loadedPrefs = safeSession.getJSON(SS_KEY, defaultPrefs);
      newStore.commit('HYDRATE', { prefs: loadedPrefs });

      expect(newStore.state.prefs.sortBy).toBe('value');
      expect(newStore.state.prefs.sortDir).toBe('desc');
      expect(newStore.state.prefs.filterMode).toBe('gt');
      expect(newStore.state.prefs.filterX).toBe(3);
      expect(newStore.state.prefs.search).toBe('test query');
    });
  });

  describe('Throttled Persistence', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should throttle rapid storage updates', () => {
      const throttledSave = throttle((state: RootState) => {
        safeLocal.setJSON(LS_KEY, state.counters);
        safeSession.setJSON(SS_KEY, state.prefs);
      }, 250);

      // Clear any previous calls
      mockLocal.setItem.mockClear();
      mockSession.setItem.mockClear();

      // Simulate rapid mutations
      store.commit('ADD_COUNTER', 'Counter 1');
      throttledSave(store.state);

      store.commit('ADD_COUNTER', 'Counter 2');
      throttledSave(store.state);

      store.commit('ADD_COUNTER', 'Counter 3');
      throttledSave(store.state);

      // Should only save once initially
      expect(mockLocal.setItem).toHaveBeenCalledTimes(1);
      expect(mockSession.setItem).toHaveBeenCalledTimes(1);

      // After throttle period, next call should save again
      vi.advanceTimersByTime(250);

      store.commit('ADD_COUNTER', 'Counter 4');
      throttledSave(store.state);

      expect(mockLocal.setItem).toHaveBeenCalledTimes(2);
      expect(mockSession.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('Storage Error Handling', () => {
    it('should handle localStorage quota exceeded error', () => {
      mockLocal.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      expect(() => {
        safeLocal.setJSON(LS_KEY, store.state.counters);
      }).not.toThrow();
    });

    it('should handle sessionStorage quota exceeded error', () => {
      mockSession.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      expect(() => {
        safeSession.setJSON(SS_KEY, store.state.prefs);
      }).not.toThrow();
    });

    it('should handle storage access denied error', () => {
      mockLocal.getItem.mockImplementation(() => {
        throw new DOMException('SecurityError');
      });

      const result = safeLocal.getJSON(LS_KEY, []);
      expect(result).toEqual([]);
    });
  });
});
