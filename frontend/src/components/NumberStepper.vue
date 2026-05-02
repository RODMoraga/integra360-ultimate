<template>
  <div class="number-stepper">
    <input
      v-bind="attrs"
      :value="modelValue"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      :class="resolvedInputClass"
      @input="onInput"
    />

    <div class="number-stepper-controls" aria-hidden="true">
      <button
        type="button"
        class="number-stepper-btn"
        :aria-label="incrementAriaLabel"
        :disabled="disabledControl"
        @click="adjust(1)"
      >
        <i class="fa-solid fa-chevron-up"></i>
      </button>
      <button
        type="button"
        class="number-stepper-btn"
        :aria-label="decrementAriaLabel"
        :disabled="disabledControl"
        @click="adjust(-1)"
      >
        <i class="fa-solid fa-chevron-down"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelValue: number | string | null | undefined;
    min?: number;
    max?: number;
    step?: number;
    inputClass?: string;
    incrementAriaLabel?: string;
    decrementAriaLabel?: string;
  }>(),
  {
    min: undefined,
    max: undefined,
    step: 1,
    inputClass: "form-control form-control-sm number-stepper-input",
    incrementAriaLabel: "Incrementar valor",
    decrementAriaLabel: "Disminuir valor"
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: number | string | null | undefined];
}>();

const attrs = useAttrs();

const resolvedInputClass = computed(() => {
  const extraClass = typeof attrs.class === "string" ? attrs.class : "";
  return [props.inputClass, extraClass].filter(Boolean).join(" ");
});

const disabledControl = computed(() => {
  return attrs.disabled !== undefined || attrs.readonly !== undefined;
});

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(value: number) {
  let next = value;

  if (typeof props.min === "number" && next < props.min) {
    next = props.min;
  }

  if (typeof props.max === "number" && next > props.max) {
    next = props.max;
  }

  const decimals = (String(props.step).split(".")[1] ?? "").length;
  return Number(next.toFixed(decimals));
}

function adjust(direction: 1 | -1) {
  const baseValue = toNumber(props.modelValue);
  const next = normalize(baseValue + direction * props.step);
  emit("update:modelValue", next);
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.value === "") {
    emit("update:modelValue", "");
    return;
  }

  const parsed = Number(target.value);
  emit("update:modelValue", Number.isFinite(parsed) ? parsed : target.value);
}
</script>
