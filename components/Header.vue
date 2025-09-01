<script setup lang="ts">
defineProps<{ disabledCreate?: boolean }>();
defineEmits<{ 'open-modal': []; export: []; import: [] }>();
</script>

<template>
  <div class="row">
    <div class="app-title">📊 Contadores</div>
    <div class="row" style="gap: 0.5rem">
      <button class="btn" @click="$emit('export')">Exportar</button>
      <button class="btn" @click="$emit('import')">Importar</button>
      <button class="btn btn-ghost" :disabled="disabledCreate" @click="$emit('open-modal')">
        ✨ Añadir contador
      </button>
    </div>
  </div>
</template>
