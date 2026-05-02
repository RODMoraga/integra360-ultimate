<template>
  <RouterLink
    :to="to"
    class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-ink-black-300 hover:text-ink-black-50 hover:bg-ink-black-800 transition-all duration-150"
    @click="$emit('click')"
  >
    <i class="fa-solid fa-circle-dot text-[8px] text-ink-black-400"></i>
    <span>{{ label }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
/**
 * Secondary sidebar navigation item contract.
 */
defineProps<{ label: string; to: string }>();

/**
 * Emits click event so parent can close mobile sidebar.
 */
defineEmits<{ click: [] }>();
</script>
