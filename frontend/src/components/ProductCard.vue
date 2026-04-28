<template>
  <div
    class="group relative h-full bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-ink-black-400 focus-within:ring-2 focus-within:ring-ink-black-500 focus-within:ring-offset-2 hover:-translate-y-2"
  >
    <!-- Contenedor de Imagen con Overlay -->
    <div class="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 h-56 sm:h-48">
      <!-- Imagen con efecto zoom mejorado -->
      <img
        :src="product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />

      <!-- Overlay Gradient (aparece en hover) -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-ink-black-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      <!-- Badges contenedor -->
      <div class="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <!-- Badge de Stock -->
        <div
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-md transition-all duration-300 transform group-hover:scale-105 shadow-lg ring-1 ring-white/20',
            product.stock > 10
              ? 'bg-green-500/95'
              : product.stock > 0
                ? 'bg-amber-flame-500/95'
                : 'bg-brick-ember-500/95'
          ]"
        >
          {{ product.stock > 0 ? `${product.stock} en stock` : 'Agotado' }}
        </div>

        <!-- Badge de Descuento (si aplica) -->
        <div
          v-if="discountPercentage > 0"
          class="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-night-bordeaux-600/95 backdrop-blur-md shadow-lg ring-1 ring-white/20 animate-pulse"
        >
          -{{ discountPercentage }}%
        </div>
      </div>

      <!-- Botón Favoritos (mejorado) -->
      <button
        @click.stop="toggleFavorite"
        class="absolute top-4 left-4 p-2.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg hover:bg-white transition-all duration-300 transform group-hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brick-ember-500 focus:ring-offset-2"
        :aria-label="isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
      >
        <svg
          :class="[
            'w-5 h-5 transition-all duration-300',
            isFavorite ? 'fill-brick-ember-500 text-brick-ember-500' : 'text-slate-400'
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <!-- Overlay con acción "Ver detalles" -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-ink-black-900/50 to-ink-black-900/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20"
      >
        <button
          class="px-5 py-2.5 rounded-lg bg-white text-ink-black-700 font-semibold hover:bg-slate-50 transition-all duration-200 transform translate-y-4 group-hover:translate-y-0 flex items-center gap-2 text-sm shadow-lg hover:shadow-xl"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver detalles
        </button>
      </div>
    </div>

    <!-- Contenedor de Contenido -->
    <div class="p-5 sm:p-4 flex flex-col h-full">
      <!-- SKU con mejor visualización -->
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs font-bold text-ink-black-600 uppercase tracking-widest opacity-70 transition-opacity duration-300 group-hover:opacity-100">
          {{ product.sku }}
        </p>
      </div>

      <!-- Divider decorativo -->
      <div class="h-px bg-gradient-to-r from-slate-200 via-slate-300 to-transparent mb-3"></div>

      <!-- Nombre del Producto (jerarquía visual mejorada) -->
      <h3
        class="text-base sm:text-lg font-bold font-quicksand text-ink-black-900 mb-2 line-clamp-2 leading-snug transition-colors duration-300 group-hover:text-ink-black-700"
      >
        {{ product.name }}
      </h3>

      <!-- Descripción -->
      <p v-if="product.description" class="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed flex-grow">
        {{ product.description }}
      </p>

      <!-- Rating (si existe) -->
      <div v-if="product.rating" class="flex items-center gap-2 mb-4">
        <div class="flex gap-0.5">
          <svg
            v-for="i in 5"
            :key="i"
            :class="[
              'w-3.5 h-3.5 transition-all duration-300',
              i <= Math.round(product.rating)
                ? 'fill-amber-flame-400 text-amber-flame-400'
                : 'fill-slate-200 text-slate-200'
            ]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <span class="text-xs text-slate-500 font-semibold">{{ product.rating.toFixed(1) }}</span>
      </div>

      <!-- Sección de Precios (mejorada) -->
      <div class="mb-4 pt-3 border-t border-slate-100">
        <div class="flex items-baseline gap-3 mb-2">
          <span class="text-2xl sm:text-xl font-bold font-quicksand text-ink-black-800 transition-colors duration-300 group-hover:text-ink-black-700">
            {{ formatPrice(product.price) }}
          </span>
          <span
            v-if="product.originalPrice"
            class="text-xs sm:text-sm text-slate-500 line-through font-medium"
          >
            {{ formatPrice(product.originalPrice) }}
          </span>
        </div>
        <p v-if="product.originalPrice" class="text-xs text-green-600 font-bold">
          💰 Ahorras {{ formatPrice(product.originalPrice - product.price) }}
        </p>
      </div>

      <!-- Botón de Acción Principal -->
      <button
        :disabled="product.stock === 0"
        class="w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transform active:scale-95"
        :class="[
          product.stock > 0
            ? 'bg-gradient-to-r from-ink-black-600 to-ink-black-700 text-white hover:from-ink-black-700 hover:to-ink-black-800 hover:shadow-lg hover:scale-105 focus:ring-ink-black-500'
            : 'bg-slate-300 text-slate-600 cursor-not-allowed opacity-70'
        ]"
      >
        <svg v-if="product.stock > 0" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>{{ product.stock > 0 ? 'Agregar al carrito' : 'No disponible' }}</span>
      </button>

      <!-- Información adicional (beneficios) -->
      <div class="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
        <div class="flex items-center gap-2 text-xs text-slate-600 transition-colors duration-300 group-hover:text-slate-700">
          <svg class="w-3.5 h-3.5 text-amber-flame-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="font-medium">Envío express</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-600 transition-colors duration-300 group-hover:text-slate-700">
          <svg class="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          <span class="font-medium">Garantía 12 meses</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

/**
 * Product card model used by catalog presentation layer.
 */
interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  rating?: number;
}

/**
 * Component props contract.
 */
const props = defineProps<{
  product: Product;
}>();

/**
 * Client-side favorite toggle state.
 */
const isFavorite = ref(false);

/**
 * Computes discount percentage when original price exists.
 */
const discountPercentage = computed(() => {
  if (!props.product.originalPrice) return 0;
  const discount = ((props.product.originalPrice - props.product.price) / props.product.originalPrice) * 100;
  return Math.round(discount);
});

/**
 * Toggles favorite state for UI feedback.
 */
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value;
};

/**
 * Formats CLP prices using Chilean locale conventions.
 */
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0
  }).format(price);
};
</script>

<style scoped>
/* Animación pulse para descuentos */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Soporte para preferencia de movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .animate-pulse {
    animation: none;
    opacity: 1;
  }
}
</style>
