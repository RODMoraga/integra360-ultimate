<template>
  <RouterLink
    :to="to"
    :class="[
      'px-4 py-2 rounded-lg font-medium transition-all duration-200',
      mobile ? 'block hover:bg-slate-100 text-ink-black-600' : 'hover:text-ink-black-700 text-ink-black-600',
      isActive && !mobile ? 'text-ink-black-700 font-bold border-b-2 border-ink-black-600' : ''
    ]"
    @click="$emit('click')"
  >
    {{ label }}
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

/**
 * Navigation link contract for desktop/mobile modes.
 */
const props = defineProps({
  to: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  mobile: {
    type: Boolean,
    default: false
  }
});

defineEmits<{
  click: [];
}>();

const route = useRoute();

/**
 * True when current route exactly matches link target.
 */
const isActive = computed(() => route.path === props.to);
</script>
