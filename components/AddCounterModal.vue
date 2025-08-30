<script setup lang="ts">
import { ref, watch } from 'vue';
const emit = defineEmits<{ (e: 'confirm', name: string): void; (e: 'cancel'): void }>();
const name = ref('');
const valid = ref(false);
watch(name, (v) => {
  valid.value = v.trim().length >= 1 && v.trim().length <= 20;
});
function onConfirm() {
  if (valid.value) emit('confirm', name.value.trim());
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="modal-overlay" @click.self="$emit('cancel')">
        <Transition name="modal-scale">
          <div class="modal card" role="dialog" aria-modal="true" aria-labelledby="add-title">
            <div class="stack">
              <h2 id="add-title" style="margin: 0">Nuevo contador</h2>
              <div class="field">
                <label for="add-name">Nombre (1..20)</label>
                <input
                  id="add-name"
                  class="input"
                  v-model="name"
                  maxlength="20"
                  placeholder="Ej: Ventas Q3"
                  autofocus
                />
              </div>
              <div class="row" style="justify-content: flex-end; gap: 0.5rem">
                <button class="btn" @click="$emit('cancel')">Cancelar</button>
                <button class="btn btn-primary" :disabled="!valid" @click="onConfirm">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
