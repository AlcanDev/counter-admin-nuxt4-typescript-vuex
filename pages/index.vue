<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useNuxtApp } from 'nuxt/app';
import type { StoreType } from '../types/counter';

const store = useNuxtApp().$store as StoreType;

const view = computed(() => store.getters.viewList);
const total = computed(() => store.getters.totalSum);
const canAdd = computed(() => store.getters.canAdd);
const prefs = computed(() => store.state.prefs);

const showModal = ref(false);

// Crear
function onConfirmAdd(name: string) {
  store.commit('ADD_COUNTER', name);
  showModal.value = false;
}

// Renombrar (extra)
function onRename(p: { id: string; name: string }) {
  store.commit('RENAME', p);
}

// EXTRAS — Exportar/Importar
const fileInput = ref<HTMLInputElement | null>(null);

function exportJson() {
  const data = JSON.stringify(store.state.counters, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'contadores.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJson() {
  if (!fileInput.value) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const arr = JSON.parse(text);
        if (!Array.isArray(arr)) throw new Error('Formato inválido');

        // Sanitiza y respeta límites de negocio
        const clean = arr
          .filter(
            (c) =>
              c &&
              typeof c.id === 'string' &&
              typeof c.name === 'string' &&
              typeof c.value === 'number'
          )
          .slice(0, 20)
          .map((c) => ({
            id: String(c.id),
            name: String(c.name).trim().slice(0, 20),
            value: Math.max(0, Math.min(20, Number(c.value))),
          }));

        store.commit('HYDRATE', { counters: clean }); // rehidrata solo counters
      } catch (e) {
        alert('No se pudo importar el JSON.');
      } finally {
        input.remove();
        fileInput.value = null;
      }
    });
    fileInput.value = input;
  }
  fileInput.value!.click();
}

// EXTRA — Atajo “n” abre modal (si se puede agregar y no estás escribiendo en un input)
function onKey(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  const typing =
    target &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
  if (!typing && e.key.toLowerCase() === 'n' && canAdd.value) {
    e.preventDefault();
    showModal.value = true;
  }
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <NuxtLayout>
    <template #header>
      <Header
        @open-modal="showModal = true"
        :disabled-create="!canAdd"
        @export="exportJson"
        @import="importJson"
      />
    </template>

    <div class="stack">
      <div class="row" style="gap: var(--s6); align-items: flex-start; flex-wrap: wrap">
        <SortCounters
          @change:sortBy="(v) => store.dispatch('setSort', { by: v, dir: prefs.sortDir })"
          @change:sortDir="(v) => store.dispatch('setSort', { by: prefs.sortBy, dir: v })"
        />
        <FilterCounters
          @change:filter="(p) => store.dispatch('setFilter', p)"
          @clear="() => store.dispatch('clearFilters')"
          @search="(q) => store.dispatch('setSearch', q)"
        />
      </div>

      <div v-if="view.length === 0" class="card section" style="text-align: center">
        <p style="margin: 0 0 0.5rem">No hay contadores aún.</p>
        <button class="btn btn-primary" @click="showModal = true" :disabled="!canAdd">
          Crear tu primer contador
        </button>
      </div>

      <CounterList
        v-else
        :items="view"
        @inc="(id) => store.commit('INCREMENT', id)"
        @dec="(id) => store.commit('DECREMENT', id)"
        @remove="(id) => store.commit('REMOVE_COUNTER', id)"
        @rename="onRename"
      />
    </div>

    <template #footer>
      <CounterSum :total="total" />
    </template>

    <AddCounterModal v-if="showModal" @confirm="onConfirmAdd" @cancel="showModal = false" />
  </NuxtLayout>
</template>
