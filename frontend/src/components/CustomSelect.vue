<template>
  <div class="relative">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-ink-black-700 mb-2"
    >
      {{ label }}
    </label>

    <!-- Select Container -->
    <div class="relative">
      <!-- Input Display & Toggle -->
      <button
        :id="id"
        type="button"
        @click="toggleDropdown"
        @keydown.escape="closeDropdown"
        :disabled="disabled"
        :class="[
          'w-full px-4 py-2.5 rounded-lg border transition-all outline-none flex items-center justify-between gap-2',
          isOpen
            ? 'border-ink-black-500 ring-2 ring-ink-black-200'
            : 'border-slate-300 hover:border-slate-400',
          disabled ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-white cursor-pointer text-ink-black-700'
        ]"
      >
        <span :class="['text-left', !displayValue && 'text-slate-500']">
          {{ displayValue || placeholder }}
        </span>
        <svg
          :class="[
            'w-5 h-5 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          class="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg"
        >
          <!-- Search Input (si searchable) -->
          <div v-if="searchable" class="p-3 border-b border-slate-200 sticky top-0 bg-white rounded-t-lg">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Buscar..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all"
              @keydown.down="highlightNext"
              @keydown.up="highlightPrev"
              @keydown.enter="selectHighlighted"
            />
          </div>

          <!-- Options List -->
          <div class="max-h-64 overflow-y-auto">
            <div v-if="filteredOptions.length === 0" class="px-4 py-6 text-center text-slate-500">
              <p class="text-sm">{{ emptyLabel }}</p>
            </div>

            <button
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              type="button"
              @click="selectOption(option)"
              @mouseenter="highlightedIndex = index"
              :class="[
                'w-full text-left px-4 py-2.5 transition-all flex items-center gap-3',
                isOptionSelected(option)
                  ? 'bg-ink-black-50 text-ink-black-700 font-medium border-l-4 border-ink-black-600'
                  : highlightedIndex === index
                    ? 'bg-slate-100 text-ink-black-700'
                    : 'text-ink-black-700 hover:bg-slate-50'
              ]"
            >
              <!-- Checkbox para multiple -->
              <input
                v-if="multiple"
                type="checkbox"
                :checked="isOptionSelected(option)"
                class="w-4 h-4 rounded border-slate-300 text-ink-black-600 cursor-pointer"
                readonly
              />
              <span class="flex-1">{{ option.label }}</span>
              <svg
                v-if="isOptionSelected(option)"
                class="w-5 h-5 text-ink-black-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Helper Text -->
    <p v-if="helperText" class="mt-2 text-xs text-slate-500">
      {{ helperText }}
    </p>

    <!-- Error Message -->
    <p v-if="error" class="mt-2 text-xs text-brick-ember-600 font-medium flex items-center gap-1">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    id?: string;
    label?: string;
    placeholder?: string;
    options: SelectOption[];
    modelValue?: string | number | (string | number)[];
    searchable?: boolean;
    multiple?: boolean;
    disabled?: boolean;
    helperText?: string;
    error?: string;
    emptyLabel?: string;
  }>(),
  {
    id: () => `select-${Math.random().toString(36).substr(2, 9)}`,
    placeholder: "Seleccionar...",
    modelValue: () => [],
    searchable: true,
    multiple: false,
    disabled: false,
    emptyLabel: "No hay opciones disponibles"
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number | (string | number)[]];
  change: [value: string | number | (string | number)[]];
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const highlightedIndex = ref(0);
const searchInput = ref<HTMLInputElement>();

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options.filter(opt => !opt.disabled);
  }

  const query = searchQuery.value.toLowerCase();
  return props.options.filter(
    opt => !opt.disabled && (opt.label.toLowerCase().includes(query) || String(opt.value).toLowerCase().includes(query))
  );
});

const displayValue = computed(() => {
  if (!props.modelValue) return "";
  if (Array.isArray(props.modelValue)) {
    const selectedArray = props.modelValue as (string | number)[];
    return props.options
      .filter(opt => selectedArray.includes(opt.value))
      .map(opt => opt.label)
      .join(", ");
  }
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected?.label || "";
});

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
      searchQuery.value = "";
      highlightedIndex.value = 0;
      nextTick(() => searchInput.value?.focus());
    }
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};

const isOptionSelected = (option: SelectOption) => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(option.value);
  }
  return props.modelValue === option.value;
};

const selectOption = (option: SelectOption) => {
  if (props.multiple) {
    const newValue = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const index = newValue.indexOf(option.value);
    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      newValue.push(option.value);
    }
    emit("update:modelValue", newValue);
    emit("change", newValue);
  } else {
    emit("update:modelValue", option.value);
    emit("change", option.value);
    closeDropdown();
  }
};

const selectHighlighted = () => {
  if (filteredOptions.value[highlightedIndex.value]) {
    selectOption(filteredOptions.value[highlightedIndex.value]);
  }
};

const highlightNext = () => {
  if (highlightedIndex.value < filteredOptions.value.length - 1) {
    highlightedIndex.value++;
  }
};

const highlightPrev = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--;
  }
};

// Close dropdown cuando hace click afuera
const handleClickOutside = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest(`#${props.id}`)) {
    closeDropdown();
  }
};

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener("click", handleClickOutside);
  } else {
    document.removeEventListener("click", handleClickOutside);
  }
});

// Cleanup
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
/* Smooth animations */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
