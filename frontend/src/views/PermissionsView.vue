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
              <li class="breadcrumb-item active" aria-current="page">Permisos</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-key me-2 text-brick-ember"></i>Gestión de Permisos
              </h1>
              <p class="text-secondary small mb-0">Administra el catálogo de permisos del sistema.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Permiso
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando permisos...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los permisos. Intenta nuevamente.
            </div>

            <div v-else class="permissions-table-wrapper" ref="tableWrapperRef">
              <DataTable
                :key="tableRenderKey"
                :data="tableRows"
                :columns="tableColumns"
                :options="tableOptions"
                id="permissionsTable"
                class="table table-hover align-middle table-striped w-100"
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Módulo</th>
                    <th>Descripción</th>
                    <th>Asignado en Roles</th>
                    <th>Creado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
              </DataTable>
            </div>
          </div>
        </div>
      </main>

      <DashFooter />
    </div>
  </div>

  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="permissionFormModal" tabindex="-1" aria-labelledby="permissionFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="permissionFormModalLabel">
            <i class="fa-solid fa-key me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Permiso' : 'Nuevo Permiso' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body pt-3 permission-form-modal-body">
          <div class="row g-3 permission-form-grid">
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Código <span class="text-danger">*</span></label>
              <input
                v-model="form.code"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="EJ: USERS.CREATE"
                :disabled="isEditMode"
                maxlength="80"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Módulo <span class="text-danger">*</span></label>
              <input
                v-model="form.module_name"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="EJ: users"
                maxlength="80"
              />
            </div>

            <div class="col-12">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Nombre <span class="text-danger">*</span></label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Nombre funcional del permiso"
                maxlength="120"
              />
            </div>

            <div class="col-12">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Descripción</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Descripción breve del alcance del permiso"
                maxlength="255"
              ></textarea>
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

  <div class="modal fade" id="permissionViewModal" tabindex="-1" aria-labelledby="permissionViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedPermission">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="permissionViewModalLabel">
            <i class="fa-solid fa-key me-2 text-info"></i>Detalle de Permiso
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.1rem;">
              <i class="fa-solid fa-key"></i>
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedPermission.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedPermission.code }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedPermission.roles_count > 0 ? 'text-bg-dark' : 'text-bg-info'">
                {{ selectedPermission.roles_count > 0 ? 'En uso' : 'Disponible' }}
              </span>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedPermission.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-layer-group" label="Módulo" :value="selectedPermission.module_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-users-gear" label="Roles asignados" :value="String(selectedPermission.roles_count)" /></div>
            <div class="col-12"><DetailRow icon="fa-align-left" label="Descripción" :value="selectedPermission.description" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedPermission.created_at)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-arrows-rotate" label="Actualizado" :value="formatDate(selectedPermission.updated_at)" /></div>
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { Modal } from "bootstrap";
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-bs5";
import type { Config } from "datatables.net";
import Swal from "sweetalert2";

import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";
import {
  useCreatePermission,
  useDeletePermission,
  usePermissions,
  useUpdatePermission
} from "../composables/usePermissions";
import type { PermissionItem } from "../services/permission.service";
import { formatDate } from "../utils/datetime";

DataTable.use(DataTablesCore);

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

const { data, isLoading, isError } = usePermissions();
const { mutateAsync: createPermission } = useCreatePermission();
const { mutateAsync: updatePermission } = useUpdatePermission();
const { mutateAsync: deletePermission } = useDeletePermission();

const permissions = computed(() => data.value ?? []);

const sidebarOpen = ref(false);
const tableWrapperRef = ref<HTMLElement | null>(null);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;

const selectedPermission = ref<PermissionItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);

const emptyForm = () => ({
  code: "",
  name: "",
  module_name: "",
  description: ""
});

const form = ref(emptyForm());

const tableRenderKey = computed(() => permissions.value.map((item) => `${item.id}-${item.updated_at}`).join("|"));

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

const buildActionButtons = (permission: PermissionItem) => {
  const disabledDelete = permission.roles_count > 0;
  const deleteTitle = disabledDelete ? "No se puede eliminar: asignado a roles" : "Eliminar permiso";

  return `
    <div class="btn-group" role="group" aria-label="Acciones de fila">
      <button type="button" class="btn btn-sm btn-outline-info" data-action="view" data-id="${permission.id}" title="Ver detalle" aria-label="Ver detalle">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button type="button" class="btn btn-sm btn-outline-warning" data-action="edit" data-id="${permission.id}" title="Editar permiso" aria-label="Editar permiso">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${permission.id}" title="${deleteTitle}" aria-label="${deleteTitle}" ${disabledDelete ? "disabled" : ""}>
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;
};

const tableRows = computed(() => permissions.value.map((permission) => ({
  id: permission.id,
  code: `<span class="badge bg-secondary-subtle text-secondary fw-semibold">${escapeHtml(permission.code)}</span>`,
  name: `<span class="fw-semibold">${escapeHtml(permission.name)}</span>`,
  module_name: escapeHtml(permission.module_name),
  description: permission.description ? escapeHtml(permission.description) : "—",
  roles_count: `<span class="badge bg-light text-dark border">${permission.roles_count}</span>`,
  created_at: formatDate(permission.created_at),
  actions: buildActionButtons(permission)
})));

const tableColumns = [
  { title: "ID", data: "id" },
  { title: "Código", data: "code" },
  { title: "Nombre", data: "name" },
  { title: "Módulo", data: "module_name" },
  { title: "Descripción", data: "description" },
  { title: "Asignado en Roles", data: "roles_count" },
  { title: "Creado", data: "created_at" },
  { title: "Acción", data: "actions", orderable: false, searchable: false, className: "text-center" }
];

const tableOptions: Config = {
  language: {
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros",
    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    infoEmpty: "Mostrando 0 a 0 de 0 registros",
    zeroRecords: "No se encontraron permisos",
    paginate: {
      first: "Primero",
      last: "Último",
      next: "Siguiente",
      previous: "Anterior"
    }
  },
  pageLength: 10,
  lengthMenu: [5, 10, 25, 50],
  order: [[6, "desc"]],
  autoWidth: false
};

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

const openEditModal = async (permission: PermissionItem) => {
  if (!isComponentActive) {
    return;
  }

  isEditMode.value = true;
  editingId.value = permission.id;
  form.value = {
    code: permission.code,
    name: permission.name,
    module_name: permission.module_name,
    description: permission.description ?? ""
  };

  await nextTick();
  if (!isComponentActive) {
    return;
  }
  formModalInstance?.show();
};

const openViewModal = async (permission: PermissionItem) => {
  if (!isComponentActive) {
    return;
  }
  selectedPermission.value = permission;
  await nextTick();
  if (!isComponentActive) {
    return;
  }
  viewModalInstance?.show();
};

const openEditFromView = async () => {
  if (!isComponentActive || !selectedPermission.value) {
    return;
  }

  viewModalInstance?.hide();
  await nextTick();
  if (!isComponentActive || !selectedPermission.value) {
    return;
  }
  openEditModal(selectedPermission.value);
};

const validateForm = () => {
  if (!isEditMode.value && !form.value.code.trim()) {
    throw new Error("El código del permiso es obligatorio");
  }

  if (!form.value.name.trim()) {
    throw new Error("El nombre del permiso es obligatorio");
  }

  if (!form.value.module_name.trim()) {
    throw new Error("El módulo del permiso es obligatorio");
  }
};

const submitForm = async () => {
  try {
    validateForm();
    isSaving.value = true;

    const payload = {
      name: form.value.name.trim(),
      module_name: form.value.module_name.trim(),
      description: form.value.description.trim() || undefined
    };

    if (isEditMode.value && editingId.value) {
      await updatePermission({
        id: editingId.value,
        payload
      });

      await Swal.fire({
        icon: "success",
        title: "Permiso actualizado",
        text: "Los cambios fueron aplicados correctamente",
        timer: 1800,
        showConfirmButton: false
      });
    } else {
      await createPermission({
        code: form.value.code.trim(),
        ...payload
      });

      await Swal.fire({
        icon: "success",
        title: "Permiso creado",
        text: "El permiso fue registrado exitosamente",
        timer: 1800,
        showConfirmButton: false
      });
    }

    formModalInstance?.hide();
    resetForm();
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible guardar el permiso";
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: message
    });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (permission: PermissionItem) => {
  if (permission.roles_count > 0) {
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "Eliminar permiso",
    text: `¿Deseas eliminar el permiso ${permission.code}?`,
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
    await deletePermission(permission.id);
    await Swal.fire({
      icon: "success",
      title: "Permiso eliminado",
      timer: 1600,
      showConfirmButton: false
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible eliminar el permiso";
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: message
    });
  }
};

const onTableClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const button = target.closest("button[data-action][data-id]") as HTMLButtonElement | null;
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!action || !id) {
    return;
  }

  const permission = permissions.value.find((item) => item.id === id);
  if (!permission) {
    return;
  }

  if (action === "view") {
    void openViewModal(permission);
    return;
  }

  if (action === "edit") {
    void openEditModal(permission);
    return;
  }

  if (action === "delete") {
    void confirmDelete(permission);
  }
};

onMounted(() => {
  if (formModalRef.value) {
    formModalInstance = Modal.getOrCreateInstance(formModalRef.value);
  }

  if (viewModalRef.value) {
    viewModalInstance = Modal.getOrCreateInstance(viewModalRef.value);
  }

  tableWrapperRef.value?.addEventListener("click", onTableClick);
});

onBeforeUnmount(() => {
  isComponentActive = false;

  tableWrapperRef.value?.removeEventListener("click", onTableClick);

  formModalInstance?.hide();
  viewModalInstance?.hide();
  formModalInstance?.dispose();
  viewModalInstance?.dispose();
  formModalInstance = null;
  viewModalInstance = null;
});
</script>

<style scoped>
#permissionsTable td,
#permissionsTable th {
  vertical-align: middle;
}

.permission-form-modal-body {
  max-height: 70vh;
  overflow-x: hidden;
}

.permission-form-grid {
  margin-left: 0;
  margin-right: 0;
}

.permissions-table-wrapper :deep(.dataTables_filter input),
.permissions-table-wrapper :deep(.dataTables_length select) {
  border-radius: 0.5rem;
}

.permissions-table-wrapper :deep(table.dataTable tbody td) {
  vertical-align: middle;
}

@media (max-width: 767.98px) {
  .permission-form-grid > [class*="col-"] {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>



