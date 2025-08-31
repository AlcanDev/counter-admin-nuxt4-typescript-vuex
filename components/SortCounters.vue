<script setup lang="ts">
const emit = defineEmits<{
  (e: 'change:sortBy', v: 'name' | 'value'): void;
  (e: 'change:sortDir', v: 'asc' | 'desc'): void;
}>();

function handleSortByChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit('change:sortBy', target.value as 'name' | 'value');
}
</script>

<template>
  <div
    class="card section row"
    style="justify-content: space-between; align-items: center"
  >
    <div
      class="field"
      style="min-width: 200px"
    >
      <label>Ordenar por</label>
      <select
        class="select"
        @change="handleSortByChange"
      >
        <option value="name">
          Nombre
        </option>
        <option value="value">
          Valor
        </option>
      </select>
    </div>
    <div class="row">
      <button
        class="btn"
        @click="emit('change:sortDir', 'asc')"
      >
        Asc
      </button>
      <button
        class="btn"
        @click="emit('change:sortDir', 'desc')"
      >
        Desc
      </button>
    </div>
  </div>
</template>
