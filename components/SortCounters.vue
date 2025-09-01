<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  'change-sort-by': [v: 'name' | 'value' | 'none'];
  'change-sort-dir': [v: 'asc' | 'desc'];
}>();

const sortBy = ref<'name' | 'value' | 'none'>('none');
const sortDir = ref<'asc' | 'desc'>('asc');

function handleSortByChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const value = target.value as 'name' | 'value' | 'none';
  sortBy.value = value;
  emit('change-sort-by', value);
}

function changeSortDir(dir: 'asc' | 'desc') {
  sortDir.value = dir;
  emit('change-sort-dir', dir);
}
</script>

<template>
  <div class="card section sort-container">
    <div class="sort-header">
      <h3>🔄 Ordenar</h3>
    </div>

    <div class="sort-controls">
      <div class="field sort-field">
        <label for="sort-by">Ordenar por</label>
        <select id="sort-by" v-model="sortBy" class="select" @change="handleSortByChange">
          <option value="none">🚫 Sin ordenar</option>
          <option value="name">📝 Nombre</option>
          <option value="value">🔢 Valor</option>
        </select>
      </div>

      <div class="field direction-field">
        <label>Dirección</label>
        <div class="btn-group">
          <button
            class="btn"
            :class="{ 'btn-primary': sortDir === 'asc' }"
            :disabled="sortBy === 'none'"
            @click="changeSortDir('asc')"
          >
            ↑ Asc
          </button>
          <button
            class="btn"
            :class="{ 'btn-primary': sortDir === 'desc' }"
            :disabled="sortBy === 'none'"
            @click="changeSortDir('desc')"
          >
            ↓ Desc
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sort-container {
  width: 100%;
}

.sort-header {
  margin-bottom: var(--s4);
}

.sort-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--muted);
}

.sort-controls {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--s4);
  align-items: end;
  width: 100%;
}

.sort-field {
  min-width: 0; /* Permite que el select se encoja */
}

.direction-field {
  flex-shrink: 0;
}

.btn-group {
  display: flex;
  gap: var(--s1);
}

.btn-group .btn {
  padding: var(--s2) var(--s3);
  font-size: 0.9rem;
  min-width: 60px;
}

@media (max-width: 768px) {
  .sort-controls {
    grid-template-columns: 1fr;
    gap: var(--s3);
  }

  .btn-group {
    width: 100%;
  }

  .btn-group .btn {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .sort-header h3 {
    font-size: 0.9rem;
  }

  .btn-group .btn {
    padding: var(--s2);
    font-size: 0.85rem;
  }
}
</style>
