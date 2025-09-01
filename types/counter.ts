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
  sortBy: 'name' | 'value';
  sortDir: 'asc' | 'desc';
  filterMode: 'gt' | 'lt' | 'none';
  filterX: number | null;
  search: string;
  sortingEnabled: boolean;
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
  commit(_type: string, _payload?: unknown): void;
  dispatch(_type: string, _payload?: unknown): Promise<unknown>;
  subscribe(
    _callback: (_mutation: { type: string; payload: unknown }, _state: RootState) => void
  ): () => void;
}
