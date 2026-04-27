<template>
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <article class="bg-white rounded-4 shadow-sm p-4">
      <h2 class="h5 mb-3">Ventas Mensuales</h2>
      <ApexChart type="line" height="280" :options="chartOptions" :series="series" />
    </article>

    <article class="bg-white rounded-4 shadow-sm p-4 d-flex flex-column justify-content-between">
      <div>
        <h2 class="h5 mb-2">Estado del Sistema</h2>
        <p class="text-secondary mb-0">Arquitectura lista con stack moderno y componentes desacoplados.</p>
      </div>

      <button class="btn btn-primary mt-4" @click="showConfirmation">
        Probar SweetAlert2
      </button>
    </article>
  </section>
</template>

<script setup lang="ts">
import Swal from "sweetalert2";

const series = [
  {
    name: "Ingresos",
    data: [12000, 18000, 15000, 21000, 25000, 28000]
  }
];

const chartOptions = {
  chart: {
    toolbar: { show: false }
  },
  stroke: { curve: "smooth" },
  xaxis: {
    categories: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
  },
  colors: ["#0d6efd"]
};

const showConfirmation = async () => {
  await Swal.fire({
    title: "Integracion exitosa",
    text: "SweetAlert2 esta funcionando correctamente.",
    icon: "success",
    confirmButtonText: "Continuar"
  });
};
</script>