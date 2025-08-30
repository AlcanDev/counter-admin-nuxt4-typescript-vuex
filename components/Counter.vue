<script setup lang="ts">
import { ref } from 'vue';
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
  (e: 'rename', p: { id: string; name: string }): void;
}>();

const editing = ref(false);
const draft = ref(props.name);

function startEdit() {
  draft.value = props.name;
  editing.value = true;
  requestAnimationFrame(() =>
    (document.getElementById('edit-' + props.id) as HTMLInputElement)?.focus()
  );
}
function cancel() {
  editing.value = false;
  draft.value = props.name;
}
function save() {
  const clean = draft.value.trim();
  if (clean.length >= 1 && clean.length <= 20) emit('rename', { id: props.id, name: clean });
  editing.value = false;
}
</script>

<template>
  <article class="card counter">
    <header class="row" style="justify-content: space-between; align-items: center">
      <div class="name">
        <template v-if="!editing">{{ name }}</template>
        <template v-else>
          <input
            :id="'edit-' + id"
            class="input"
            v-model="draft"
            @keydown.enter.prevent="save"
            @keydown.esc.prevent="cancel"
            maxlength="20"
          />
        </template>
      </div>
      <div class="row" style="gap: 0.4rem">
        <button class="btn" @click="editing ? save() : startEdit()">
          {{ editing ? 'Guardar' : 'Renombrar' }}
        </button>
        <button
          class="btn"
          title="Eliminar"
          @click="$emit('remove', id)"
          style="
            border-color: transparent;
            background: linear-gradient(180deg, var(--danger), #ff5c75);
            color: #21040a;
          "
        >
          Eliminar
        </button>
      </div>
    </header>

    <div class="value">{{ value }}</div>

    <div class="row">
      <button class="btn btn-primary" :disabled="!canInc" @click="$emit('inc', id)">+1</button>
      <button class="btn" :disabled="!canDec" @click="$emit('dec', id)">-1</button>
    </div>
  </article>
</template>
