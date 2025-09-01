<script setup lang="ts">
import { ref } from 'vue';
const emit = defineEmits<{
  'change:filter': [v: { mode: 'gt' | 'lt' | 'none'; x?: number }];
  clear: [];
  search: [q: string];
}>();
const x = ref<number | ''>('');
const mode = ref<'gt' | 'lt' | 'none'>('none');
const q = ref('');
function apply() {
  emit('change:filter', { mode: mode.value, x: typeof x.value === 'number' ? x.value : undefined });
}
function clearAll() {
  x.value = '';
  mode.value = 'none';
  q.value = '';
  emit('clear');
}
</script>

<template>
  <div class="card section filter-container">
    <div class="filter-header">
      <h3>🔍 Filtros y Búsqueda</h3>
    </div>
    
    <div class="filter-controls">
      <div class="filter-section">
        <div class="field">
          <label for="filter-mode">Filtro por valor</label>
          <select
            id="filter-mode"
            v-model="mode"
            class="select"
            @change="apply()"
          >
            <option value="none">🚫 Sin filtro</option>
            <option value="gt">📈 Mayor a</option>
            <option value="lt">📉 Menor a</option>
          </select>
        </div>
        
        <div class="field value-field" v-if="mode !== 'none'">
          <label for="filter-value">Valor</label>
          <input
            id="filter-value"
            v-model.number="x"
            class="input"
            type="number"
            min="0"
            max="20"
            placeholder="0-20"
            @input="apply()"
          />
        </div>
      </div>
      
      <div class="search-section">
        <div class="field">
          <label for="search-input">🔎 Buscar por nombre</label>
          <input
            id="search-input"
            v-model="q"
            class="input"
            placeholder="Ej: Ventas 2025"
            @input="emit('search', q)"
          />
        </div>
      </div>
      
      <div class="actions-section">
        <button
          class="btn btn-ghost"
          @click="clearAll"
          :disabled="mode === 'none' && !q"
        >
          🗑️ Limpiar
        </button>
      </div>
    </div>
    
    <div v-if="mode !== 'none' || q" class="active-filters">
      <div class="filter-tags">
        <span v-if="mode === 'gt'" class="filter-tag">
          📈 Mayor a {{ x }}
        </span>
        <span v-if="mode === 'lt'" class="filter-tag">
          📉 Menor a {{ x }}
        </span>
        <span v-if="q" class="filter-tag">
          🔎 "{{ q }}"
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-container {
  width: 100%;
  flex: 1;
}

.filter-header {
  margin-bottom: var(--s4);
}

.filter-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--muted);
}

.filter-controls {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--s4);
  align-items: end;
  width: 100%;
}

.filter-section {
  display: flex;
  gap: var(--s3);
  align-items: end;
  min-width: 0;
}

.value-field {
  min-width: 80px;
}

.search-section {
  min-width: 0;
  flex: 1;
}

.search-section .field {
  width: 100%;
}

.search-section .input {
  width: 100%;
}

.actions-section {
  display: flex;
  align-items: end;
  flex-shrink: 0;
}

.active-filters {
  margin-top: var(--s4);
  padding-top: var(--s3);
  border-top: 1px solid var(--border);
}

.filter-tags {
  display: flex;
  gap: var(--s2);
  flex-wrap: wrap;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  padding: var(--s1) var(--s2);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--muted);
}

@media (max-width: 768px) {
  .filter-controls {
    grid-template-columns: 1fr;
    gap: var(--s3);
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: var(--s2);
  }
  
  .value-field {
    min-width: 0;
  }
  
  .actions-section {
    justify-content: stretch;
  }
  
  .actions-section .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .filter-header h3 {
    font-size: 0.9rem;
  }
  
  .actions-section .btn {
    padding: var(--s2);
    font-size: 0.85rem;
  }
}
</style>
