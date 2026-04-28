<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold text-slate-800">Actividad Reciente</h2>
        <p class="text-sm text-slate-500">Datos operacionales del sistema</p>
      </div>
    </div>

    <!-- Row 1: Sales table + Users table -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <DataTable
        title="Últimas Ventas"
        icon="fa-solid fa-receipt"
        :columns="salesColumns"
        :rows="salesRows"
      />
      <DataTable
        title="Usuarios Recientes"
        icon="fa-solid fa-user-plus"
        :columns="usersColumns"
        :rows="usersRows"
      />
    </div>

    <!-- Row 2: Trends table -->
    <TrendTable />
  </section>
</template>

<script setup lang="ts">
import DataTable from "./DataTable.vue";
import TrendTable from "./TrendTable.vue";

/**
 * Column definition for latest sales table.
 */
const salesColumns = ["ID", "Cliente", "Producto", "Monto", "Fecha", "Estado"];

/**
 * Mock data for latest sales table.
 */
const salesRows = [
  { ID: "#10821", Cliente: "María González", Producto: "Laptop Pro X1", Monto: "$1.299.990", Fecha: "27/04/2026", Estado: "Completado" },
  { ID: "#10820", Cliente: "Carlos Rodríguez", Producto: "Monitor 4K Ultra", Monto: "$489.990", Fecha: "27/04/2026", Estado: "En tránsito" },
  { ID: "#10819", Cliente: "Ana Martínez", Producto: "Teclado Mecánico", Monto: "$89.990", Fecha: "26/04/2026", Estado: "Pendiente" },
  { ID: "#10818", Cliente: "Luis Herrera", Producto: "Mouse Inalámbrico", Monto: "$45.990", Fecha: "26/04/2026", Estado: "Completado" },
  { ID: "#10817", Cliente: "Claudia Vega", Producto: "Webcam HD 1080p", Monto: "$65.990", Fecha: "25/04/2026", Estado: "Cancelado" },
  { ID: "#10816", Cliente: "Pedro Castillo", Producto: "Auriculares BT", Monto: "$129.990", Fecha: "25/04/2026", Estado: "Completado" },
  { ID: "#10815", Cliente: "Sofía Morales", Producto: "Tablet 10\" Pro", Monto: "$349.990", Fecha: "24/04/2026", Estado: "En tránsito" },
  { ID: "#10814", Cliente: "Diego Fuentes", Producto: "SSD 1TB NVMe", Monto: "$99.990", Fecha: "24/04/2026", Estado: "Completado" }
];

const usersColumns = ["Usuario", "Email", "Rol", "Última Conexión", "Estado"];

/**
 * Mock data for recently active users table.
 */
const usersRows = [
  { Usuario: "superadmin", Email: "superadmin@integra360.cl", Rol: "Super Admin", "Última Conexión": "Hace 5 min", Estado: "Activo" },
  { Usuario: "jgarcia", Email: "j.garcia@empresa.cl", Rol: "Vendedor", "Última Conexión": "Hace 1 hora", Estado: "Activo" },
  { Usuario: "mlopez", Email: "m.lopez@empresa.cl", Rol: "Bodeguero", "Última Conexión": "Hace 3 horas", Estado: "Activo" },
  { Usuario: "ptorres", Email: "p.torres@empresa.cl", Rol: "Supervisor", "Última Conexión": "Ayer", Estado: "Inactivo" },
  { Usuario: "cflores", Email: "c.flores@empresa.cl", Rol: "Vendedor", "Última Conexión": "Hace 2 días", Estado: "Activo" },
  { Usuario: "rcontreras", Email: "r.contreras@empresa.cl", Rol: "Contador", "Última Conexión": "Hace 4 días", Estado: "Suspendido" },
  { Usuario: "aminaya", Email: "a.minaya@empresa.cl", Rol: "Vendedor", "Última Conexión": "Hace 1 semana", Estado: "Activo" }
];
</script>
