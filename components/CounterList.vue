<script setup lang="ts">
import Counter from './Counter.vue';
defineProps<{ items: Array<{ id: string; name: string; value: number }> }>();
const emit = defineEmits<{
  (e: 'inc', id: string): void;
  (e: 'dec', id: string): void;
  (e: 'remove', id: string): void;
  (e: 'rename', p: { id: string; name: string }): void;
}>();
</script>

<template>
  <TransitionGroup name="list" tag="div" class="grid">
    <Counter
      v-for="c in items"
      :key="c.id"
      :id="c.id"
      :name="c.name"
      :value="c.value"
      :canInc="c.value < 20"
      :canDec="c.value > 0"
      @inc="(id) => emit('inc', id)"
      @dec="(id) => emit('dec', id)"
      @remove="(id) => emit('remove', id)"
      @rename="(p) => emit('rename', p)"
    />
  </TransitionGroup>
</template>
