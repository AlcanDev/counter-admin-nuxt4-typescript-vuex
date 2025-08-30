<script setup lang="ts">
const props = defineProps<{ disabledCreate?: boolean }>();
const emit = defineEmits<{ (e: 'open-modal'): void; (e: 'export'): void; (e: 'import'): void }>();
</script>

<template>
  <div class="row">
    <div class="app-title">📊 Contadores</div>
    <div class="row" style="gap: 0.5rem">
      <button class="btn" @click="$emit('export')">Exportar</button>
      <button class="btn" @click="$emit('import')">Importar</button>
      <button class="btn btn-ghost" @click="$emit('open-modal')" :disabled="disabledCreate">
        Nuevo
      </button>
    </div>
  </div>
</template>
