<template>
  <section class="bg-gradient-to-b from-ink-black-50 to-white py-8 border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-2xl font-bold font-quicksand text-ink-black-900 mb-6">Búsqueda Avanzada</h2>

      <form @submit.prevent="handleSearch" class="space-y-4 md:space-y-0 md:flex md:gap-4 md:items-end">
        <!-- Campo de Búsqueda -->
        <div class="flex-1">
          <label for="search" class="block text-sm font-medium text-ink-black-700 mb-2">
            Buscar por SKU, nombre o descripción
          </label>
          <div class="relative">
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="Ej: SKU-001, Laptop, Monitor..."
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all"
            />
            <svg class="absolute right-3 top-3 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Filtro Categoría -->
        <div class="flex-1">
          <CustomSelect
            id="category"
            v-model="selectedCategory"
            label="Categoría"
            placeholder="Todas las categorías"
            :options="categoryOptions"
            :searchable="true"
          />
        </div>

        <!-- Filtro Marca -->
        <div class="flex-1">
          <CustomSelect
            id="brand"
            v-model="selectedBrand"
            label="Marca"
            placeholder="Todas las marcas"
            :options="brandOptions"
            :searchable="true"
          />
        </div>

        <!-- Botones de Acción -->
        <div class="flex gap-2">
          <button
            type="submit"
            class="px-6 py-2.5 rounded-lg font-medium text-white bg-ink-black-600 hover:bg-ink-black-700 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar
          </button>

          <button
            type="button"
            @click="handleReset"
            class="px-6 py-2.5 rounded-lg font-medium text-ink-black-600 border border-ink-black-300 hover:bg-ink-black-50 transition-all duration-200 whitespace-nowrap"
          >
            Limpiar
          </button>
        </div>
      </form>

      <!-- Tags de Filtros Activos -->
      <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
        <div v-if="searchQuery" class="inline-flex items-center gap-2 px-3 py-1 bg-amber-flame-100 text-amber-flame-700 rounded-full text-sm font-medium">
          <span>Búsqueda: {{ searchQuery }}</span>
          <button @click="searchQuery = ''" class="hover:text-amber-flame-900 transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div v-if="selectedCategory" class="inline-flex items-center gap-2 px-3 py-1 bg-deep-saffron-100 text-deep-saffron-700 rounded-full text-sm font-medium">
          <span>Categoría: {{ getCategoryLabel(selectedCategory) }}</span>
          <button @click="selectedCategory = ''" class="hover:text-deep-saffron-900 transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div v-if="selectedBrand" class="inline-flex items-center gap-2 px-3 py-1 bg-cayenne-red-100 text-cayenne-red-700 rounded-full text-sm font-medium">
          <span>Marca: {{ getBrandLabel(selectedBrand) }}</span>
          <button @click="selectedBrand = ''" class="hover:text-cayenne-red-900 transition-colors">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import CustomSelect from "./CustomSelect.vue";
import type { SelectOption } from "./CustomSelect.vue";

const searchQuery = ref("");
const selectedCategory = ref("");
const selectedBrand = ref("");

const categoryOptions: SelectOption[] = [
  { label: "Todas las categorías", value: "" },
  { label: "Electrónica", value: "electronics" },
  { label: "Computadoras", value: "computers" },
  { label: "Accesorios", value: "accessories" },
  { label: "Periféricos", value: "peripherals" },
  { label: "Software", value: "software" }
];

const brandOptions: SelectOption[] = [
  { label: "Todas las marcas", value: "" },
  { label: "Apple", value: "apple" },
  { label: "Dell", value: "dell" },
  { label: "HP", value: "hp" },
  { label: "Lenovo", value: "lenovo" },
  { label: "Samsung", value: "samsung" },
  { label: "ASUS", value: "asus" }
];

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedCategory.value || selectedBrand.value;
});

const handleSearch = () => {
  const filters = {
    search: searchQuery.value,
    category: selectedCategory.value,
    brand: selectedBrand.value
  };
  console.log("Filtros aplicados:", filters);
  // Aquí se emitiría el evento con los filtros
};

const handleReset = () => {
  searchQuery.value = "";
  selectedCategory.value = "";
  selectedBrand.value = "";
};

const getCategoryLabel = (value: string) => {
  const option = categoryOptions.find(opt => opt.value === value);
  return option?.label || value;
};

const getBrandLabel = (value: string) => {
  const option = brandOptions.find(opt => opt.value === value);
  return option?.label || value;
};
</script>
