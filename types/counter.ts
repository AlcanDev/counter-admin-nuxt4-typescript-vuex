export type CounterId = string;

export interface Counter {
  id: CounterId;
  name: string; // 1..20
  value: number; // 0..20
}

export type SortBy = 'name' | 'value';
export type SortDir = 'asc' | 'desc';
export type FilterMode = 'gt' | 'lt' | 'none';

export interface Prefs {
  sortBy: SortBy;
  sortDir: SortDir;
  filterMode: FilterMode;
  filterX: number | null;
  search: string;
}

export interface RootState {
  counters: Counter[]; // máx 20, inicia vacía
  prefs: Prefs; // persiste en sessionStorage
}

export interface RootGetters {
  totalSum: number;
  viewList: Counter[];
  canAdd: boolean;
}

export interface StoreType {
  state: RootState;
  getters: RootGetters;
  commit: (type: string, payload?: any) => void;
  dispatch: (type: string, payload?: any) => Promise<any>;
  subscribe: (callback: (mutation: any, state: RootState) => void) => () => void;
}
