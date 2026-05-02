<template>
  <div class="flex h-screen bg-slate-100 overflow-hidden font-quicksand">
    <AppSidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <DashNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 overflow-y-auto">
        <div class="p-5 lg:p-6 max-w-screen-2xl mx-auto w-full space-y-5">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item">
                <router-link to="/dashboard" class="text-decoration-none text-secondary">
                  <i class="fa-solid fa-gauge-high me-1"></i>Dashboard
                </router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">Usuarios</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-users-gear me-2 text-brick-ember"></i>Gestión de Usuarios
              </h1>
              <p class="text-secondary small mb-0">Administra usuarios, roles y estado de acceso por empresa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Usuario
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando usuarios...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los usuarios. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 360px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por nombre, email, rol o estado"
                    aria-label="Buscar usuarios"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <label for="usersPageSize" class="small text-secondary mb-0">Mostrar</label>
                  <select id="usersPageSize" v-model.number="pageSize" class="form-select form-select-sm" style="width: 88px;">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                  </select>
                  <span class="small text-secondary">registros</span>
                </div>
              </div>

              <div class="table-responsive">
                <table id="usersTable" class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('full_name')">Nombre <i :class="sortIcon('full_name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('email')">Email <i :class="sortIcon('email')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('primary_role')">Rol Principal <i :class="sortIcon('primary_role')"></i></button></th>
                      <th>Roles</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('last_login_at')">Último Acceso <i :class="sortIcon('last_login_at')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_active')">Estado <i :class="sortIcon('is_active')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in paginatedUsers" :key="user.id">
                      <td class="text-secondary small">{{ user.id }}</td>
                      <td class="fw-semibold">{{ user.full_name }}</td>
                      <td>
                        <a :href="`mailto:${user.email}`" class="text-decoration-none text-primary small">{{ user.email }}</a>
                      </td>
                      <td>
                        <span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ user.primary_role }}</span>
                      </td>
                      <td class="small" style="max-width:220px;">
                        {{ user.role_names.length ? user.role_names.join(', ') : 'Sin rol' }}
                      </td>
                      <td class="small text-secondary">{{ formatDateTime(user.last_login_at) }}</td>
                      <td>
                        <span class="badge rounded-pill" :class="user.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                          <i class="fa-solid fa-circle me-1" style="font-size:.5rem;vertical-align:middle;"></i>
                          {{ user.is_active ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(user.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="btn-group" role="group" aria-label="Acciones de fila">
                          <button class="btn btn-sm btn-outline-info" @click="openViewModal(user)" title="Ver detalle" aria-label="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning" @click="openEditModal(user)" title="Editar usuario" aria-label="Editar usuario">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(user)" title="Eliminar usuario" aria-label="Eliminar usuario">
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedUsers.length === 0">
                      <td colspan="9" class="text-center text-secondary py-4">No se encontraron usuarios para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredUsers.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación usuarios">
                  <button type="button" class="btn btn-outline-secondary" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <button type="button" class="btn btn-outline-secondary" disabled>
                    Página {{ currentPage }} / {{ totalPages }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DashFooter />
    </div>
  </div>

  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="userFormModal" tabindex="-1" aria-labelledby="userFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="userFormModalLabel">
            <i class="fa-solid fa-users-gear me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3 user-form-modal-body">
          <div class="row g-3 user-form-grid">
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Nombre Completo <span class="text-danger">*</span></label>
              <input
                v-model="form.full_name"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Nombre y apellido"
                maxlength="160"
              />
            </div>
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Email <span class="text-danger">*</span></label>
              <input
                v-model="form.email"
                type="email"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="usuario@empresa.cl"
                maxlength="160"
              />
            </div>
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">
                {{ isEditMode ? 'Nueva Contraseña (opcional)' : 'Contraseña' }}
                <span v-if="!isEditMode" class="text-danger">*</span>
              </label>
              <input
                v-model="form.password"
                type="password"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Mínimo 8 caracteres"
                maxlength="64"
              />
            </div>
            <div class="col-md-6">
              <CustomSelect
                id="user-roles"
                v-model="form.role_ids"
                :options="roleOptions"
                label="Roles"
                placeholder="Seleccionar roles"
                :searchable="true"
                :multiple="true"
              />
            </div>
            <div class="col-12">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Estado</label>
              <div class="form-check form-switch">
                <input
                  v-model="form.is_active"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switchUserIsActive"
                  style="width:2.5em;height:1.3em;"
                />
                <label class="form-check-label ms-2 fw-semibold" for="switchUserIsActive">
                  <span :class="form.is_active ? 'text-success' : 'text-secondary'">
                    {{ form.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-light rounded-3" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary rounded-3 px-4" @click="submitForm" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i v-else class="fa-solid fa-floppy-disk me-2"></i>
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="userViewModal" tabindex="-1" aria-labelledby="userViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedUser">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="userViewModalLabel">
            <i class="fa-solid fa-circle-user me-2 text-info"></i>Detalle de Usuario
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedUser.full_name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedUser.full_name }}</p>
              <p class="text-secondary small mb-0">{{ selectedUser.email }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedUser.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedUser.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-envelope" label="Email" :value="selectedUser.email" /></div>
            <div class="col-md-6"><DetailRow icon="fa-user-tag" label="Rol Principal" :value="selectedUser.primary_role" /></div>
            <div class="col-md-6"><DetailRow icon="fa-users" label="Roles" :value="selectedUser.role_names.join(', ') || 'Sin rol'" /></div>
            <div class="col-md-6"><DetailRow icon="fa-clock" label="Último Acceso" :value="formatDateTime(selectedUser.last_login_at)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedUser.created_at)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-arrows-rotate" label="Actualizado" :value="formatDate(selectedUser.updated_at)" /></div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-light rounded-3" data-bs-dismiss="modal">Cerrar</button>
          <button class="btn btn-warning rounded-3" @click="openEditFromView">
            <i class="fa-solid fa-pen-to-square me-2"></i>Editar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";

import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";
import CustomSelect from "../components/CustomSelect.vue";
import type { SelectOption } from "../components/CustomSelect.vue";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUserRoles,
  useUsers
} from "../composables/useUsers";
import type { UserItem } from "../services/user.service";
import { formatDate, formatDateTime } from "../utils/datetime";

const DetailRow = {
  props: { icon: String, label: String, value: { default: null } },
  template: `
    <div class="d-flex align-items-start gap-2">
      <i :class="['fa-solid', icon, 'text-primary mt-1']" style="width:16px;"></i>
      <div>
        <p class="text-secondary small mb-0">{{ label }}</p>
        <p class="fw-semibold mb-0">{{ value ?? '—' }}</p>
      </div>
    </div>
  `
};

const { data, isLoading, isError } = useUsers();
const { data: roleData } = useUserRoles();
const { mutateAsync: createUser } = useCreateUser();
const { mutateAsync: updateUser } = useUpdateUser();
const { mutateAsync: deleteUser } = useDeleteUser();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;

const users = computed(() => data.value ?? []);
const selectedUser = ref<UserItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "full_name" | "email" | "primary_role" | "last_login_at" | "is_active" | "created_at">("created_at");
const sortDirection = ref<"asc" | "desc">("desc");

const emptyForm = () => ({
  full_name: "",
  email: "",
  password: "",
  role_ids: [] as (string | number)[],
  is_active: true
});

const form = ref(emptyForm());

const roleOptions = computed<SelectOption[]>(() =>
  (roleData.value ?? []).map((role) => ({
    label: `${role.name} (${role.code})`,
    value: role.id
  }))
);

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return users.value;
  }

  return users.value.filter((user) => {
    const roles = user.role_names.join(" ").toLowerCase();
    const searchable = [
      String(user.id),
      user.full_name,
      user.email,
      user.primary_role,
      roles,
      user.is_active ? "activo" : "inactivo"
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (user: UserItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(user.id);
    case "last_login_at":
      return user.last_login_at ? new Date(user.last_login_at).getTime() : 0;
    case "created_at":
      return user.created_at ? new Date(user.created_at).getTime() : 0;
    case "is_active":
      return user.is_active ? 1 : 0;
    default:
      return (user[key] ?? "").toString().toLowerCase();
  }
};

const sortedUsers = computed(() => {
  const list = [...filteredUsers.value];
  const direction = sortDirection.value === "asc" ? 1 : -1;

  list.sort((a, b) => {
    const left = getComparableValue(a, sortKey.value);
    const right = getComparableValue(b, sortKey.value);

    if (left === right) {
      return 0;
    }

    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * direction;
    }

    return String(left).localeCompare(String(right), "es") * direction;
  });

  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedUsers.value.length / pageSize.value)));

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedUsers.value.slice(start, start + pageSize.value);
});

const paginationStart = computed(() => {
  if (filteredUsers.value.length === 0) {
    return 0;
  }
  return (currentPage.value - 1) * pageSize.value + 1;
});

const paginationEnd = computed(() => {
  if (filteredUsers.value.length === 0) {
    return 0;
  }
  return Math.min(currentPage.value * pageSize.value, filteredUsers.value.length);
});

const toggleSort = (key: typeof sortKey.value) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDirection.value = "asc";
  }
};

const sortIcon = (key: typeof sortKey.value) => {
  if (sortKey.value !== key) {
    return "fa-solid fa-sort text-secondary opacity-75 ms-1";
  }
  return sortDirection.value === "asc"
    ? "fa-solid fa-sort-up ms-1"
    : "fa-solid fa-sort-down ms-1";
};

const goToPage = (page: number) => {
  const safePage = Math.min(Math.max(page, 1), totalPages.value);
  currentPage.value = safePage;
};

watch([searchQuery, pageSize], () => {
  currentPage.value = 1;
});

watch(totalPages, (maxPages) => {
  if (currentPage.value > maxPages) {
    currentPage.value = maxPages;
  }
});

const resetForm = () => {
  form.value = emptyForm();
  isEditMode.value = false;
  editingId.value = null;
};

const openCreateModal = async () => {
  if (!isComponentActive) {
    return;
  }
  resetForm();
  await nextTick();
  if (!isComponentActive) {
    return;
  }
  formModalInstance?.show();
};

const openEditModal = async (user: UserItem) => {
  if (!isComponentActive) {
    return;
  }
  isEditMode.value = true;
  editingId.value = user.id;
  form.value = {
    full_name: user.full_name,
    email: user.email,
    password: "",
    role_ids: user.role_ids,
    is_active: user.is_active
  };

  await nextTick();
  if (!isComponentActive) {
    return;
  }
  formModalInstance?.show();
};

const openViewModal = async (user: UserItem) => {
  if (!isComponentActive) {
    return;
  }
  selectedUser.value = user;
  await nextTick();
  if (!isComponentActive) {
    return;
  }
  viewModalInstance?.show();
};

const openEditFromView = async () => {
  if (!isComponentActive || !selectedUser.value) {
    return;
  }

  viewModalInstance?.hide();
  await nextTick();
  if (!isComponentActive) {
    return;
  }
  openEditModal(selectedUser.value);
};

const validateForm = () => {
  if (!form.value.full_name.trim()) {
    throw new Error("El nombre completo es obligatorio");
  }

  if (!form.value.email.trim()) {
    throw new Error("El email es obligatorio");
  }

  if (!isEditMode.value && form.value.password.trim().length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  if (isEditMode.value && form.value.password && form.value.password.trim().length > 0 && form.value.password.trim().length < 8) {
    throw new Error("La nueva contraseña debe tener al menos 8 caracteres");
  }
};

const submitForm = async () => {
  try {
    validateForm();
    isSaving.value = true;

    const payload = {
      full_name: form.value.full_name.trim(),
      email: form.value.email.trim().toLowerCase(),
      role_ids: (form.value.role_ids ?? []).map((value) => Number(value)),
      is_active: form.value.is_active
    };

    if (isEditMode.value && editingId.value) {
      await updateUser({
        id: editingId.value,
        payload: {
          ...payload,
          ...(form.value.password.trim() ? { password: form.value.password.trim() } : {})
        }
      });

      await Swal.fire({
        icon: "success",
        title: "Usuario actualizado",
        text: "Los cambios fueron aplicados correctamente",
        timer: 1800,
        showConfirmButton: false
      });
    } else {
      await createUser({
        ...payload,
        password: form.value.password.trim()
      });

      await Swal.fire({
        icon: "success",
        title: "Usuario creado",
        text: "El usuario fue registrado exitosamente",
        timer: 1800,
        showConfirmButton: false
      });
    }

    formModalInstance?.hide();
    resetForm();
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible guardar el usuario";
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: message
    });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (user: UserItem) => {
  const result = await Swal.fire({
    icon: "warning",
    title: "Eliminar usuario",
    text: `¿Deseas eliminar a ${user.full_name}? Esta acción es reversible solo desde base de datos.`,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    confirmButtonColor: "#b91c1c"
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await deleteUser(user.id);
    await Swal.fire({
      icon: "success",
      title: "Usuario eliminado",
      timer: 1600,
      showConfirmButton: false
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible eliminar el usuario";
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: message
    });
  }
};

onMounted(() => {
  if (formModalRef.value) {
    formModalInstance = Modal.getOrCreateInstance(formModalRef.value);
  }
  if (viewModalRef.value) {
    viewModalInstance = Modal.getOrCreateInstance(viewModalRef.value);
  }
});

onBeforeUnmount(() => {
  isComponentActive = false;

  formModalInstance?.hide();
  viewModalInstance?.hide();
  formModalInstance?.dispose();
  viewModalInstance?.dispose();
  formModalInstance = null;
  viewModalInstance = null;
});
</script>

<style scoped>
#usersTable td,
#usersTable th {
  vertical-align: middle;
}

.table-sort-btn {
  border: 0;
  background: transparent;
  color: inherit;
  font-weight: 600;
  padding: 0;
}

.user-form-modal-body {
  max-height: 70vh;
  overflow-x: hidden;
}

.user-form-grid {
  margin-left: 0;
  margin-right: 0;
}

@media (max-width: 767.98px) {
  .user-form-grid > [class*="col-"] {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>



