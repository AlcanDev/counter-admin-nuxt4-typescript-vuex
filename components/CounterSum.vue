<script setup lang="ts">
defineProps<{ total: number }>();
</script>

<template>
  <div
    class="card section"
    style="display: flex; align-items: center; justify-content: center; font-weight: 700"
  >
    Suma total:
    <span style="font-variant-numeric: tabular-nums; font-size: 1.2rem; margin-left: 0.5rem">{{
      total
    }}</span>
  </div>
</template>
