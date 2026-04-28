<template>
  <RouterLink
    :to="to"
    :class="[
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
      active
        ? 'bg-ink-black-700 text-white shadow-sm'
        : 'text-ink-black-300 hover:bg-ink-black-800 hover:text-white'
    ]"
    @click="$emit('click')"
  >
    <i
      :class="[
        icon, 'w-4 text-center text-base flex-shrink-0 transition-colors',
        active ? 'text-brick-ember-400' : 'text-ink-black-400 group-hover:text-ink-black-200'
      ]"
    ></i>
    <span class="truncate">{{ label }}</span>
    <span
      v-if="badge"
      class="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-brick-ember-600 text-white"
    >{{ badge }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
/**
 * Primary sidebar navigation item contract.
 */
defineProps<{
  icon: string;
  label: string;
  to: string;
  active?: boolean;
  badge?: string | number;
}>();

/**
 * Emits click event so parent can close mobile sidebar.
 */
defineEmits<{ click: [] }>();
</script>
