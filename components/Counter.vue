<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';

const props = defineProps<{
  id: string;
  name: string;
  value: number;
  canInc: boolean;
  canDec: boolean;
}>();

const emit = defineEmits<{
  (e: 'inc', id: string): void;
  (e: 'dec', id: string): void;
  (e: 'remove', id: string): void;
  (e: 'rename', payload: { id: string; name: string }): void;
}>();

const editing = ref(false);
const tempName = ref(props.name);
const inputRef = ref<HTMLInputElement | null>(null);

function startRename() {
  editing.value = true;
}

watch(editing, async (on) => {
  if (on) {
    await nextTick();
    inputRef.value?.focus();
  }
});

function saveRename() {
  const n = tempName.value.trim();
  if (n && n.length <= 20) emit('rename', { id: props.id, name: n });
  editing.value = false;
}

function cancelRename() {
  tempName.value = props.name;
  editing.value = false;
}
</script>

<template>
  <div class="card counter">
    <div v-if="!editing">
      <!-- Header con nombre y acciones secundarias -->
      <div class="counter-header">
        <div class="name">{{ name }}</div>
        <div class="counter-actions">
          <button class="btn-icon" title="Renombrar" @click="startRename">✏️</button>
          <button class="btn-icon btn-danger" title="Eliminar" @click="$emit('remove', props.id)">🗑️</button>
        </div>
      </div>
      
      <!-- Valor principal -->
      <div class="value">{{ value }}</div>
      
      <!-- Controles principales -->
      <div class="counter-controls">
        <button class="btn btn-primary" title="Decrementar" :disabled="!canDec" @click="$emit('dec', props.id)">
          <span>−</span>
        </button>
        <button class="btn btn-primary" title="Incrementar" :disabled="!canInc" @click="$emit('inc', props.id)">
          <span>+</span>
        </button>
      </div>
    </div>

    <div v-else class="field">
      <label :for="`edit-${props.id}`">Nuevo nombre</label>
      <input
        ref="inputRef"
        :id="`edit-${props.id}`"
        v-model="tempName"
        class="input"
        maxlength="20"
        @keydown.enter="saveRename"
        @keydown.esc="cancelRename"
      />
      <div class="row" style="gap: var(--s2)">
        <button class="btn btn-primary" title="Guardar" @click="saveRename">Guardar</button>
        <button class="btn" title="Cancelar" @click="cancelRename">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.counter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--s3);
}

.counter-actions {
  display: flex;
  gap: var(--s1);
  opacity: 0.7;
  transition: opacity var(--t1);
}

.counter:hover .counter-actions {
  opacity: 1;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background var(--t1), transform var(--t1);
}

.btn-icon:hover {
  background: var(--surface);
  transform: scale(1.1);
}

.btn-icon.btn-danger:hover {
  background: color-mix(in oklab, var(--danger) 20%, transparent);
  color: var(--danger);
}

.counter-controls {
  display: flex;
  gap: var(--s2);
  margin-top: var(--s4);
}

.counter-controls .btn {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  padding: var(--s3) var(--s4);
}

.counter-controls .btn span {
  font-size: 20px;
}
</style>
