<template>
  <section class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Encabezado -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold font-quicksand text-ink-black-900 mb-2">
          Nuestro Catálogo
        </h2>
        <p class="text-slate-600">
          Explora nuestra amplia variedad de productos de alta calidad
        </p>
      </div>

      <!-- Grid de Productos -->
      <div v-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>

      <!-- Estado Vacío -->
      <div v-else class="text-center py-16">
        <svg class="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m0 0L4 7m8 4v10l8-4v-10L12 11zm0 0L4 7v10l8 4z" />
        </svg>
        <h3 class="text-xl font-bold text-ink-black-900 mb-2">No hay productos disponibles</h3>
        <p class="text-slate-600 mb-6">Intenta ajustar los filtros de búsqueda</p>
        <button
          @click="resetFilters"
          class="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white bg-ink-black-600 hover:bg-ink-black-700 transition-all duration-200"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 4v6h6M23 20v-6h-6" />
          </svg>
          Limpiar filtros
        </button>
      </div>

      <!-- Información de Resultados -->
      <div v-if="products.length > 0" class="mt-8 text-center text-slate-600 text-sm">
        Mostrando {{ products.length }} producto{{ products.length !== 1 ? "s" : "" }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ProductCard from "./ProductCard.vue";

interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
  category?: string;
  brand?: string;
  rating?: number;
}

// Datos de ejemplo
const mockProducts = ref<Product[]>([
  {
    id: 1,
    sku: "SKU-001",
    name: "MacBook Pro 14\"",
    description: "Laptop profesional con procesador M3",
    price: 1299000,
    stock: 5,
    category: "computers",
    brand: "apple",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop"
  },
  {
    id: 2,
    sku: "SKU-002",
    name: "Monitor Dell 27\" 4K",
    description: "Monitor ultrawide con tecnología IPS",
    price: 459000,
    stock: 12,
    category: "peripherals",
    brand: "dell",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop"
  },
  {
    id: 3,
    sku: "SKU-003",
    name: "iPhone 15 Pro",
    description: "Smartphone premium con cámara avanzada",
    price: 999000,
    originalPrice: 1099000,
    stock: 8,
    category: "electronics",
    brand: "apple",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&h=500&fit=crop"
  },
  {
    id: 4,
    sku: "SKU-004",
    name: "Teclado Mecánico RGB",
    description: "Teclado gaming con switches mecánicos",
    price: 159000,
    stock: 25,
    category: "accessories",
    brand: "asus",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1587829191301-e8d4fbf1666c?w=500&h=500&fit=crop"
  },
  {
    id: 5,
    sku: "SKU-005",
    name: "Ratón Logitech MX Master",
    description: "Ratón inalámbrico profesional",
    price: 99000,
    stock: 18,
    category: "accessories",
    brand: "lenovo",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop"
  },
  {
    id: 6,
    sku: "SKU-006",
    name: "AMD Ryzen 9 7950X",
    description: "Procesador de alto rendimiento",
    price: 649000,
    stock: 0,
    category: "computers",
    brand: "asus",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1555707519-08d5742312d2?w=500&h=500&fit=crop"
  },
  {
    id: 7,
    sku: "SKU-007",
    name: "Samsung Galaxy S24",
    description: "Smartphone con IA integrada",
    price: 899000,
    stock: 15,
    category: "electronics",
    brand: "samsung",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop"
  },
  {
    id: 8,
    sku: "SKU-008",
    name: "Microsoft Surface Pro 9",
    description: "Tablet 2 en 1 con Windows 11",
    price: 1199000,
    stock: 6,
    category: "computers",
    brand: "dell",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1541523176867-e6efa2dd4890?w=500&h=500&fit=crop"
  }
]);

const products = computed(() => mockProducts.value);

const resetFilters = () => {
  console.log("Filtros reiniciados");
  // Aquí se emitiría el evento para reiniciar los filtros
};
</script>
