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
              <li class="breadcrumb-item active" aria-current="page">Roles</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-shield-halved me-2 text-brick-ember"></i>Gestión de Roles
              </h1>
              <p class="text-secondary small mb-0">Administra roles del sistema y sus permisos asociados.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Rol
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando roles...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los roles. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 360px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por código, nombre o permisos"
                    aria-label="Buscar roles"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <label for="rolesPageSize" class="small text-secondary mb-0">Mostrar</label>
                  <select id="rolesPageSize" v-model.number="pageSize" class="form-select form-select-sm" style="width: 88px;">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                  </select>
                  <span class="small text-secondary">registros</span>
                </div>
              </div>

              <div class="table-responsive">
                <table id="rolesTable" class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('code')">Código <i :class="sortIcon('code')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('name')">Nombre <i :class="sortIcon('name')"></i></button></th>
                      <th>Descripción</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('permissions_count')">Permisos <i :class="sortIcon('permissions_count')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('users_count')">Usuarios <i :class="sortIcon('users_count')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_system')">Tipo <i :class="sortIcon('is_system')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="role in paginatedRoles" :key="role.id">
                      <td class="text-secondary small">{{ role.id }}</td>
                      <td><span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ role.code }}</span></td>
                      <td class="fw-semibold">{{ role.name }}</td>
                      <td class="small" style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" :title="role.description ?? ''">
                        {{ role.description ?? '—' }}
                      </td>
                      <td class="small">{{ role.permission_codes.length ? role.permission_codes.join(', ') : 'Sin permisos' }}</td>
                      <td><span class="badge bg-light text-dark border">{{ role.users_count }}</span></td>
                      <td>
                        <span class="badge rounded-pill" :class="role.is_system ? 'text-bg-dark' : 'text-bg-info'">
                          {{ role.is_system ? 'Sistema' : 'Personalizado' }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(role.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="d-flex gap-1 justify-content-center">
                          <button class="btn btn-sm btn-outline-info rounded-3 px-2" @click="openViewModal(role)" title="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-warning rounded-3 px-2"
                            @click="openEditModal(role)"
                            :disabled="role.is_system"
                            title="Editar rol"
                          >
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger rounded-3 px-2"
                            @click="confirmDelete(role)"
                            :disabled="role.is_system || role.users_count > 0"
                            title="Eliminar rol"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedRoles.length === 0">
                      <td colspan="9" class="text-center text-secondary py-4">No se encontraron roles para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredRoles.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación roles">
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

  <div class="modal fade" id="roleFormModal" tabindex="-1" aria-labelledby="roleFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="roleFormModalLabel">
            <i class="fa-solid fa-shield-halved me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Rol' : 'Nuevo Rol' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3 role-form-modal-body">
          <div class="row g-3 role-form-grid">
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Código <span class="text-danger">*</span></label>
              <input
                v-model="form.code"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="EJ: ADMIN"
                :disabled="isEditMode"
                maxlength="50"
              />
            </div>
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Nombre <span class="text-danger">*</span></label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Nombre visible del rol"
                maxlength="100"
              />
            </div>
            <div class="col-12">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Descripción</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Descripción funcional del rol"
                maxlength="255"
              ></textarea>
            </div>
            <div class="col-12">
              <CustomSelect
                id="role-permissions"
                v-model="form.permission_ids"
                :options="permissionOptions"
                label="Permisos"
                placeholder="Seleccionar permisos"
                :searchable="true"
                :multiple="true"
              />
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

  <div class="modal fade" id="roleViewModal" tabindex="-1" aria-labelledby="roleViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedRole">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="roleViewModalLabel">
            <i class="fa-solid fa-shield-halved me-2 text-info"></i>Detalle de Rol
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.1rem;">
              <i class="fa-solid fa-shield"></i>
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedRole.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedRole.code }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedRole.is_system ? 'text-bg-dark' : 'text-bg-info'">
                {{ selectedRole.is_system ? 'Sistema' : 'Personalizado' }}
              </span>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedRole.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-users" label="Usuarios asignados" :value="String(selectedRole.users_count)" /></div>
            <div class="col-12"><DetailRow icon="fa-align-left" label="Descripción" :value="selectedRole.description" /></div>
            <div class="col-12"><DetailRow icon="fa-key" label="Permisos" :value="selectedRole.permission_codes.join(', ') || 'Sin permisos'" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedRole.created_at)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-arrows-rotate" label="Actualizado" :value="formatDate(selectedRole.updated_at)" /></div>
          </div>

          <div class="mt-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h6 class="fw-bold mb-0 text-dark">
                <i class="fa-solid fa-layer-group me-2 text-primary"></i>Permisos por Módulo
              </h6>

              <div class="d-flex align-items-center gap-2">
                <div class="btn-group btn-group-sm" role="group" aria-label="Modo de visualización de permisos">
                  <button
                    type="button"
                    class="btn"
                    :class="permissionsViewMode === 'grouped' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="permissionsViewMode = 'grouped'"
                  >
                    Agrupada
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="permissionsViewMode === 'flat' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="permissionsViewMode = 'flat'"
                  >
                    Lista plana
                  </button>
                </div>

                <span class="badge bg-light text-dark border">
                  {{ selectedRole.permissions.length }} permiso(s)
                </span>
              </div>
            </div>

            <div v-if="groupedPermissions.length === 0" class="alert alert-secondary mb-0" role="status">
              Este rol no tiene permisos asociados.
            </div>

            <div v-else-if="permissionsViewMode === 'grouped'" class="row g-3">
              <div v-for="group in groupedPermissions" :key="group.moduleName" class="col-12 col-lg-6">
                <div class="border rounded-3 p-3 h-100 bg-white shadow-sm">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <p class="mb-0 fw-semibold text-dark text-uppercase small">{{ group.moduleName }}</p>
                    <span class="badge text-bg-info">{{ group.permissions.length }}</span>
                  </div>

                  <div class="d-flex flex-wrap gap-2">
                    <span
                      v-for="permission in group.permissions"
                      :key="permission.id"
                      class="badge bg-secondary-subtle text-secondary border"
                    >
                      {{ permission.code }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="border rounded-3 p-3 bg-white shadow-sm">
              <div class="d-flex flex-wrap gap-2">
                <span
                  v-for="permission in flatPermissions"
                  :key="permission.id"
                  class="badge bg-secondary-subtle text-secondary border"
                  :title="`${permission.module_name} · ${permission.name}`"
                >
                  {{ permission.module_name }} · {{ permission.code }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button class="btn btn-light rounded-3" data-bs-dismiss="modal">Cerrar</button>
          <button class="btn btn-warning rounded-3" @click="openEditFromView" :disabled="selectedRole.is_system">
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
  useCreateRole,
  useDeleteRole,
  useRolePermissions,
  useRoles,
  useUpdateRole
} from "../composables/useRoles";
import type { RoleItem } from "../services/role.service";
import { formatDate } from "../utils/datetime";

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

const { data, isLoading, isError } = useRoles();
const { data: permissionData } = useRolePermissions();
const { mutateAsync: createRole } = useCreateRole();
const { mutateAsync: updateRole } = useUpdateRole();
const { mutateAsync: deleteRole } = useDeleteRole();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
const PERMISSIONS_VIEW_MODE_KEY = "roles_permissions_view_mode";

const roles = computed(() => data.value ?? []);
const selectedRole = ref<RoleItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const permissionsViewMode = ref<"grouped" | "flat">("grouped");
const searchQuery = ref("");
const pageSize = ref(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "code" | "name" | "permissions_count" | "users_count" | "is_system" | "created_at">("created_at");
const sortDirection = ref<"asc" | "desc">("desc");

const groupedPermissions = computed(() => {
  const role = selectedRole.value;
  if (!role) {
    return [] as Array<{ moduleName: string; permissions: RoleItem["permissions"] }>;
  }

  const grouped = new Map<string, RoleItem["permissions"]>();
  for (const permission of role.permissions) {
    const moduleName = permission.module_name || "Sin módulo";
    if (!grouped.has(moduleName)) {
      grouped.set(moduleName, []);
    }
    grouped.get(moduleName)?.push(permission);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0], "es"))
    .map(([moduleName, permissions]) => ({
      moduleName,
      permissions: [...permissions].sort((a, b) => a.code.localeCompare(b.code, "es"))
    }));
});

const flatPermissions = computed(() => {
  const role = selectedRole.value;
  if (!role) {
    return [] as RoleItem["permissions"];
  }

  return [...role.permissions].sort((a, b) => {
    const moduleCompare = a.module_name.localeCompare(b.module_name, "es");
    if (moduleCompare !== 0) {
      return moduleCompare;
    }
    return a.code.localeCompare(b.code, "es");
  });
});

const emptyForm = () => ({
  code: "",
  name: "",
  description: "",
  permission_ids: [] as (string | number)[]
});

const form = ref(emptyForm());

const permissionOptions = computed<SelectOption[]>(() =>
  (permissionData.value ?? []).map((permission) => ({
    label: `${permission.module_name} · ${permission.code} (${permission.name})`,
    value: permission.id
  }))
);

const filteredRoles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return roles.value;
  }

  return roles.value.filter((role) => {
    const searchable = [
      String(role.id),
      role.code,
      role.name,
      role.description ?? "",
      role.permission_codes.join(" "),
      role.is_system ? "sistema" : "personalizado"
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (role: RoleItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(role.id);
    case "permissions_count":
      return role.permission_codes.length;
    case "users_count":
      return role.users_count;
    case "is_system":
      return role.is_system ? 1 : 0;
    case "created_at":
      return role.created_at ? new Date(role.created_at).getTime() : 0;
    default:
      return (role[key] ?? "").toString().toLowerCase();
  }
};

const sortedRoles = computed(() => {
  const list = [...filteredRoles.value];
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

const totalPages = computed(() => Math.max(1, Math.ceil(sortedRoles.value.length / pageSize.value)));

const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedRoles.value.slice(start, start + pageSize.value);
});

const paginationStart = computed(() => {
  if (filteredRoles.value.length === 0) {
    return 0;
  }
  return (currentPage.value - 1) * pageSize.value + 1;
});

const paginationEnd = computed(() => {
  if (filteredRoles.value.length === 0) {
    return 0;
  }
  return Math.min(currentPage.value * pageSize.value, filteredRoles.value.length);
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

const openEditModal = async (role: RoleItem) => {
  if (!isComponentActive || role.is_system) {
    return;
  }

  isEditMode.value = true;
  editingId.value = role.id;
  form.value = {
    code: role.code,
    name: role.name,
    description: role.description ?? "",
    permission_ids: role.permission_ids
  };

  await nextTick();
  if (!isComponentActive) {
    return;
  }
  formModalInstance?.show();
};

const openViewModal = async (role: RoleItem) => {
  if (!isComponentActive) {
    return;
  }
  selectedRole.value = role;
  permissionsViewMode.value = "grouped";
  await nextTick();
  if (!isComponentActive) {
    return;
  }
  viewModalInstance?.show();
};

const openEditFromView = async () => {
  if (!isComponentActive || !selectedRole.value) {
    return;
  }

  viewModalInstance?.hide();
  await nextTick();
  if (!isComponentActive) {
    return;
  }
  openEditModal(selectedRole.value);
};

const validateForm = () => {
  if (!form.value.code.trim() && !isEditMode.value) {
    throw new Error("El código del rol es obligatorio");
  }

  if (!form.value.name.trim()) {
    throw new Error("El nombre del rol es obligatorio");
  }
};

const submitForm = async () => {
  try {
    validateForm();
    isSaving.value = true;

    const payload = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || undefined,
      permission_ids: (form.value.permission_ids ?? []).map((value) => Number(value))
    };

    if (isEditMode.value && editingId.value) {
      await updateRole({ id: editingId.value, payload });

      await Swal.fire({
        icon: "success",
        title: "Rol actualizado",
        text: "Los cambios fueron aplicados correctamente",
        timer: 1800,
        showConfirmButton: false
      });
    } else {
      await createRole({
        code: form.value.code.trim().toUpperCase(),
        ...payload
      });

      await Swal.fire({
        icon: "success",
        title: "Rol creado",
        text: "El rol fue registrado exitosamente",
        timer: 1800,
        showConfirmButton: false
      });
    }

    formModalInstance?.hide();
    resetForm();
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible guardar el rol";
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: message
    });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (role: RoleItem) => {
  if (role.is_system || role.users_count > 0) {
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "Eliminar rol",
    text: `¿Deseas eliminar el rol ${role.name}?`,
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
    await deleteRole(role.id);
    await Swal.fire({
      icon: "success",
      title: "Rol eliminado",
      timer: 1600,
      showConfirmButton: false
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible eliminar el rol";
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: message
    });
  }
};

watch(permissionsViewMode, (mode) => {
  localStorage.setItem(PERMISSIONS_VIEW_MODE_KEY, mode);
});

onMounted(() => {
  const persistedMode = localStorage.getItem(PERMISSIONS_VIEW_MODE_KEY);
  if (persistedMode === "grouped" || persistedMode === "flat") {
    permissionsViewMode.value = persistedMode;
  }

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
#rolesTable td,
#rolesTable th {
  vertical-align: middle;
}

.table-sort-btn {
  border: 0;
  background: transparent;
  color: inherit;
  font-weight: 600;
  padding: 0;
}

.role-form-modal-body {
  max-height: 70vh;
  overflow-x: hidden;
}

.role-form-grid {
  margin-left: 0;
  margin-right: 0;
}

@media (max-width: 767.98px) {
  .role-form-grid > [class*="col-"] {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
