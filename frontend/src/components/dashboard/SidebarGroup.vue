<template>
  <div>
    <button
      type="button"
      class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-black-300 hover:bg-ink-black-800 hover:text-white transition-all duration-150 group"
      @click="$emit('toggle')"
    >
      <i :class="[icon, 'w-4 text-center text-base flex-shrink-0 text-ink-black-400 group-hover:text-ink-black-200']"></i>
      <span class="flex-1 text-left truncate">{{ label }}</span>
      <i
        :class="[
          'fa-solid fa-chevron-right text-xs text-ink-black-500 transition-transform duration-200',
          open ? 'rotate-90' : ''
        ]"
      ></i>
    </button>

    <Transition name="submenu">
      <div v-if="open" class="mt-1 ml-6 pl-2 border-l border-ink-black-700 space-y-0.5">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/**
 * Sidebar group visual contract.
 */
defineProps<{ icon: string; label: string; open: boolean }>();

/**
 * Emits toggle to parent sidebar state manager.
 */
defineEmits<{ toggle: [] }>();
</script>

<style scoped>
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.submenu-enter-from,
.submenu-leave-to {
  max-height: 0;
  opacity: 0;
}
.submenu-enter-to,
.submenu-leave-from {
  max-height: 200px;
  opacity: 1;
}
</style>
