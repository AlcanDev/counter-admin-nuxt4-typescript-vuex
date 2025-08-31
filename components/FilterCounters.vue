<script setup lang="ts">
import { ref } from 'vue';
const emit = defineEmits<{
  (e: 'change:filter', v: { mode: 'gt' | 'lt' | 'none'; x?: number }): void;
  (e: 'clear'): void;
  (e: 'search', q: string): void;
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
  <div
    class="card section row"
    style="align-items: end"
  >
    <div
      class="field"
      style="min-width: 180px"
    >
      <label>Filtro</label>
      <div
        class="row"
        style="gap: 0.5rem"
      >
        <select
          v-model="mode"
          class="select"
          @change="apply()"
        >
          <option value="none">
            Sin filtro
          </option>
          <option value="gt">
            Mayor a
          </option>
          <option value="lt">
            Menor a
          </option>
        </select>
        <input
          v-model.number="x"
          class="input"
          type="number"
          min="0"
          max="20"
          placeholder="x"
          :disabled="mode === 'none'"
          @input="apply()"
        >
      </div>
    </div>
    <div
      class="field"
      style="flex: 1"
    >
      <label>Buscar por nombre</label>
      <input
        v-model="q"
        class="input"
        placeholder="Ej: Ventas 2025"
        @input="emit('search', q)"
      >
    </div>
    <button
      class="btn"
      @click="clearAll"
    >
      Borrar filtros
    </button>
  </div>
</template>
