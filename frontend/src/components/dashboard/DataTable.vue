<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <h3 class="font-semibold text-slate-800 flex items-center gap-2">
        <i :class="[icon, 'text-ink-black-600 text-sm']"></i>
        {{ title }}
      </h3>
      <div class="flex items-center gap-2">
        <div class="relative">
          <i class="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
          <input
            v-model="search"
            type="text"
            placeholder="Buscar..."
            class="pl-7 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ink-black-300 focus:border-transparent w-36"
          />
        </div>
        <select
          v-model="pageSize"
          class="text-sm bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-ink-black-300"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th
              v-for="col in columns"
              :key="col"
              class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
              @click="sortBy(col)"
            >
              <div class="flex items-center gap-1">
                {{ col }}
                <span class="flex flex-col gap-px">
                  <i
                    :class="['fa-solid fa-caret-up text-[9px]', sortCol === col && sortDir === 'asc' ? 'text-ink-black-600' : 'text-slate-300']"
                  ></i>
                  <i
                    :class="['fa-solid fa-caret-down text-[9px]', sortCol === col && sortDir === 'desc' ? 'text-ink-black-600' : 'text-slate-300']"
                  ></i>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr
            v-for="(row, idx) in paginatedRows"
            :key="idx"
            class="hover:bg-slate-50/70 transition-colors duration-100"
          >
            <td
              v-for="col in columns"
              :key="col"
              class="px-4 py-3 text-slate-700 whitespace-nowrap"
            >
              <template v-if="col === 'Estado'">
                <StatusBadge :value="String(row[col])" />
              </template>
              <template v-else-if="col === 'Rol'">
                <RoleBadge :value="String(row[col])" />
              </template>
              <template v-else>
                {{ row[col] }}
              </template>
            </td>
          </tr>
          <tr v-if="paginatedRows.length === 0">
            <td :colspan="columns.length" class="px-4 py-8 text-center text-slate-400">
              <i class="fa-solid fa-table-cells-large text-2xl mb-2 block"></i>
              No se encontraron resultados
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer / Pagination -->
    <div class="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
      <p class="text-xs text-slate-500">
        Mostrando <span class="font-semibold">{{ fromRow }}–{{ toRow }}</span> de <span class="font-semibold">{{ filteredRows.length }}</span> registros
      </p>
      <div class="flex items-center gap-1">
        <button
          class="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          :disabled="page === 1"
          @click="page--"
        >
          <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          :class="[
            'w-7 h-7 rounded-md text-xs font-medium transition-colors',
            p === page ? 'bg-ink-black-700 text-white' : 'text-slate-600 hover:bg-slate-200'
          ]"
          @click="page = p"
        >{{ p }}</button>
        <button
          class="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          :disabled="page === totalPages"
          @click="page++"
        >
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import StatusBadge from "./StatusBadge.vue";
import RoleBadge from "./RoleBadge.vue";

/**
 * Generic tabular component contract.
 */
const props = defineProps<{
  title: string;
  icon: string;
  columns: string[];
  rows: Record<string, string>[];
}>();

const search = ref("");
const sortCol = ref<string | null>(null);
const sortDir = ref<"asc" | "desc">("asc");
const page = ref(1);
const pageSize = ref<number>(5);

watch(search, () => { page.value = 1; });

const filteredRows = computed(() => {
  const q = search.value.toLowerCase();
  let result = props.rows;
  if (q) {
    result = result.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    );
  }
  if (sortCol.value) {
    const col = sortCol.value;
    result = [...result].sort((a, b) => {
      const av = String(a[col] ?? "");
      const bv = String(b[col] ?? "");
      return sortDir.value === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }
  return result;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)));
const fromRow = computed(() => filteredRows.value.length === 0 ? 0 : (page.value - 1) * pageSize.value + 1);
const toRow = computed(() => Math.min(page.value * pageSize.value, filteredRows.value.length));

const paginatedRows = computed(() =>
  filteredRows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
);

/**
 * Sorts rows by column, toggling between ascending and descending order.
 */
function sortBy(col: string) {
  if (sortCol.value === col) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortCol.value = col;
    sortDir.value = "asc";
  }
}
</script>
