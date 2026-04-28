<template>
  <section class="bg-white rounded-4 shadow-sm p-4">
    <h2 class="h5 mb-3">Usuarios</h2>

    <p v-if="isLoading" class="text-secondary">Cargando usuarios...</p>
    <p v-else-if="isError" class="text-danger">No fue posible cargar usuarios.</p>

    <div v-else class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.fullName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span class="badge" :class="user.isActive ? 'text-bg-success' : 'text-bg-secondary'">
                {{ user.isActive ? "Activo" : "Inactivo" }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUsers } from "../composables/useUsers";

/**
 * Users query state sourced from Vue Query composable.
 */
const { data, isLoading, isError } = useUsers();

/**
 * Safe rows accessor with empty fallback for rendering.
 */
const users = computed(() => data.value ?? []);
</script>