<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits<{ (e: 'confirm', name: string): void; (e: 'cancel'): void }>();
const name = ref('');

const isInvalid = computed(() => {
  const t = name.value.trim();
  return !t || t.length > 20;
});

function onConfirm() {
  if (!isInvalid.value) emit('confirm', name.value.trim());
}
</script>

<template>
  <Transition name="modal" appear>
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-title"
      class="modal-overlay"
      @click.self="$emit('cancel')"
    >
      <Transition name="modal-scale" appear>
        <div class="modal card">
          <div class="modal-header">
            <h2 id="add-title">✨ Nuevo contador</h2>
            <button class="btn-close" @click="$emit('cancel')" aria-label="Cerrar">
              ✕
            </button>
          </div>

          <div class="modal-body">
            <div class="field">
              <label for="add-name">Nombre del contador</label>
              <input 
                id="add-name" 
                v-model="name" 
                class="input"
                maxlength="20" 
                placeholder="Ej: Ventas Q3, Tareas completadas..." 
                autofocus 
                @keydown.enter="onConfirm"
                @keydown.esc="$emit('cancel')"
              />
              <small class="field-hint">
                {{ name.length }}/20 caracteres
                <span v-if="isInvalid && name.trim()" class="error">
                  - Nombre demasiado largo
                </span>
                <span v-if="!name.trim() && name.length > 0" class="error">
                  - El nombre no puede estar vacío
                </span>
              </small>
            </div>
          </div>

          <div class="modal-actions">
            <button 
              class="btn btn-primary" 
              :disabled="isInvalid" 
              @click="onConfirm"
            >
              ✅ Crear contador
            </button>
            <button 
              class="btn btn-ghost" 
              @click="$emit('cancel')"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--s5);
  padding-bottom: var(--s3);
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  color: var(--muted);
  transition: background var(--t1), color var(--t1);
}

.btn-close:hover {
  background: var(--surface);
  color: var(--text);
}

.modal-body {
  margin-bottom: var(--s5);
}

.field-hint {
  font-size: 0.85rem;
  color: var(--muted);
  margin-top: var(--s1);
}

.field-hint .error {
  color: var(--danger);
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: var(--s3);
  justify-content: flex-end;
  padding-top: var(--s3);
  border-top: 1px solid var(--border);
}

.modal-actions .btn {
  min-width: 120px;
}

@media (max-width: 480px) {
  .modal-actions {
    flex-direction: column-reverse;
  }
  
  .modal-actions .btn {
    width: 100%;
  }
}
</style>
