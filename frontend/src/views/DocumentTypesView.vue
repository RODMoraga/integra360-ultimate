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
              <li class="breadcrumb-item active" aria-current="page">Tipos de Documentos</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-file-lines me-2 text-brick-ember"></i>Gestión de Tipos de Documentos
              </h1>
              <p class="text-secondary small mb-0">Administra el catálogo de tipos de documentos operativos.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Tipo
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando tipos de documentos...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los tipos de documentos. Intenta nuevamente.
            </div>

            <div v-else class="document-types-table-wrapper" ref="tableWrapperRef">
              <DataTable
                :key="tableRenderKey"
                :data="tableRows"
                :columns="tableColumns"
                :options="tableOptions"
                id="documentTypesTable"
                class="table table-hover align-middle table-striped w-100"
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Contraparte</th>
                    <th>Inventario</th>
                    <th>Contabilidad</th>
                    <th>Dependencias</th>
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

  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="documentTypeFormModal" tabindex="-1" aria-labelledby="documentTypeFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="documentTypeFormModalLabel">
            <i class="fa-solid fa-file-lines me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body pt-3 document-type-form-modal-body">
          <div class="row g-3 document-type-form-grid">
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Código <span class="text-danger">*</span></label>
              <input
                v-model="form.code"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="EJ: GUIA_DESPACHO"
                :disabled="isEditMode"
                maxlength="30"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Nombre <span class="text-danger">*</span></label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="Nombre del tipo de documento"
                maxlength="120"
              />
            </div>

            <div class="col-12">
              <CustomSelect
                id="document-type-counterpart-scope"
                v-model="form.counterpart_scope"
                label="Ámbito de Contraparte"
                placeholder="Seleccionar ámbito"
                :options="counterpartScopeOptions"
                :searchable="false"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Afecta Inventario</label>
              <div class="form-check form-switch">
                <input
                  v-model="form.affects_inventory"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switchAffectsInventory"
                  style="width:2.5em;height:1.3em;"
                />
                <label class="form-check-label ms-2 fw-semibold" for="switchAffectsInventory">
                  <span :class="form.affects_inventory ? 'text-success' : 'text-secondary'">
                    {{ form.affects_inventory ? 'Sí' : 'No' }}
                  </span>
                </label>
              </div>
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Afecta Contabilidad</label>
              <div class="form-check form-switch">
                <input
                  v-model="form.affects_accounting"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switchAffectsAccounting"
                  style="width:2.5em;height:1.3em;"
                />
                <label class="form-check-label ms-2 fw-semibold" for="switchAffectsAccounting">
                  <span :class="form.affects_accounting ? 'text-success' : 'text-secondary'">
                    {{ form.affects_accounting ? 'Sí' : 'No' }}
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

  <div class="modal fade" id="documentTypeViewModal" tabindex="-1" aria-labelledby="documentTypeViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedDocumentType">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="documentTypeViewModalLabel">
            <i class="fa-solid fa-file-lines me-2 text-info"></i>Detalle de Tipo de Documento
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.1rem;">
              <i class="fa-solid fa-file-lines"></i>
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedDocumentType.name }}</p>
              <p class="text-secondary small mb-0">{{ selectedDocumentType.code }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedDocumentType.dependencies_count > 0 ? 'text-bg-dark' : 'text-bg-info'">
                {{ selectedDocumentType.dependencies_count > 0 ? 'Con uso operacional' : 'Disponible' }}
              </span>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Código" :value="selectedDocumentType.code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-tag" label="Nombre" :value="selectedDocumentType.name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-user-group" label="Contraparte" :value="selectedDocumentType.counterpart_scope_label" /></div>
            <div class="col-md-6"><DetailRow icon="fa-warehouse" label="Afecta Inventario" :value="selectedDocumentType.affects_inventory ? 'Sí' : 'No'" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calculator" label="Afecta Contabilidad" :value="selectedDocumentType.affects_accounting ? 'Sí' : 'No'" /></div>
            <div class="col-md-6"><DetailRow icon="fa-diagram-project" label="Dependencias" :value="String(selectedDocumentType.dependencies_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-file-invoice" label="Documentos" :value="String(selectedDocumentType.documents_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-list-ol" label="Secuencias" :value="String(selectedDocumentType.document_sequences_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedDocumentType.created_at)" /></div>
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
import CustomSelect from "../components/CustomSelect.vue";
import {
  useCreateDocumentType,
  useDeleteDocumentType,
  useDocumentTypes,
  useUpdateDocumentType
} from "../composables/useDocumentTypes";
import type { DocumentTypeItem } from "../services/document-type.service";
import type { SelectOption } from "../components/CustomSelect.vue";
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

const { data, isLoading, isError } = useDocumentTypes();
const { mutateAsync: createDocumentType } = useCreateDocumentType();
const { mutateAsync: updateDocumentType } = useUpdateDocumentType();
const { mutateAsync: deleteDocumentType } = useDeleteDocumentType();

const documentTypes = computed(() => data.value ?? []);

const sidebarOpen = ref(false);
const tableWrapperRef = ref<HTMLElement | null>(null);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;

const selectedDocumentType = ref<DocumentTypeItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);

const emptyForm = () => ({
  code: "",
  name: "",
  counterpart_scope: "NONE" as "CUSTOMER" | "SUPPLIER" | "NONE",
  affects_inventory: false,
  affects_accounting: false
});

const form = ref(emptyForm());

const counterpartScopeOptions: SelectOption[] = [
  { value: "NONE", label: "Ninguno" },
  { value: "CUSTOMER", label: "Cliente" },
  { value: "SUPPLIER", label: "Proveedor" }
];

const tableRenderKey = computed(() =>
  documentTypes.value
    .map((item) => `${item.id}-${item.name}-${item.dependencies_count}`)
    .join("|")
);

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

const buildActionButtons = (item: DocumentTypeItem) => {
  const hasDepend = item.dependencies_count > 0;
  const deleteTitle = hasDepend
    ? `Eliminar tipo (tiene ${item.dependencies_count} dependencia${item.dependencies_count !== 1 ? 's' : ''})`
    : "Eliminar tipo";

  return `
    <div class="btn-group" role="group" aria-label="Acciones de fila">
      <button type="button" class="btn btn-sm btn-outline-info" data-action="view" data-id="${item.id}" title="Ver detalle" aria-label="Ver detalle">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button type="button" class="btn btn-sm btn-outline-warning" data-action="edit" data-id="${item.id}" title="Editar tipo" aria-label="Editar tipo">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${item.id}" title="${deleteTitle}" aria-label="${deleteTitle}">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;
};

const tableRows = computed(() => documentTypes.value.map((item) => ({
  id: item.id,
  code: `<span class="badge bg-secondary-subtle text-secondary fw-semibold">${escapeHtml(item.code)}</span>`,
  name: `<span class="fw-semibold">${escapeHtml(item.name)}</span>`,
  counterpart_scope_label: item.counterpart_scope_label,
  affects_inventory: item.affects_inventory
    ? '<span class="badge text-bg-success">Sí</span>'
    : '<span class="badge text-bg-secondary">No</span>',
  affects_accounting: item.affects_accounting
    ? '<span class="badge text-bg-success">Sí</span>'
    : '<span class="badge text-bg-secondary">No</span>',
  dependencies_count: `<span class="badge bg-light text-dark border">${item.dependencies_count}</span>`,
  created_at: formatDate(item.created_at),
  actions: buildActionButtons(item)
})));

const tableColumns = [
  { title: "ID", data: "id" },
  { title: "Código", data: "code" },
  { title: "Nombre", data: "name" },
  { title: "Contraparte", data: "counterpart_scope_label" },
  { title: "Inventario", data: "affects_inventory" },
  { title: "Contabilidad", data: "affects_accounting" },
  { title: "Dependencias", data: "dependencies_count" },
  { title: "Creado", data: "created_at" },
  { title: "Acción", data: "actions", orderable: false, searchable: false, className: "text-center" }
];

const tableOptions: Config = {
  language: {
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros",
    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    infoEmpty: "Mostrando 0 a 0 de 0 registros",
    zeroRecords: "No se encontraron tipos de documentos",
    paginate: {
      first: "Primero",
      last: "Último",
      next: "Siguiente",
      previous: "Anterior"
    }
  },
  pageLength: 10,
  lengthMenu: [5, 10, 25, 50],
  order: [[1, "asc"]],
  autoWidth: false
};

const resetForm = () => {
  form.value = emptyForm();
  isEditMode.value = false;
  editingId.value = null;
};

const openCreateModal = async () => {
  if (!isComponentActive) return;
  resetForm();

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
};

const openEditModal = async (item: DocumentTypeItem) => {
  if (!isComponentActive) return;

  isEditMode.value = true;
  editingId.value = item.id;
  form.value = {
    code: item.code,
    name: item.name,
    counterpart_scope: item.counterpart_scope,
    affects_inventory: item.affects_inventory,
    affects_accounting: item.affects_accounting
  };

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
};

const openViewModal = async (item: DocumentTypeItem) => {
  if (!isComponentActive) return;
  selectedDocumentType.value = item;

  await nextTick();
  if (!isComponentActive) return;
  viewModalInstance?.show();
};

const openEditFromView = async () => {
  if (!isComponentActive || !selectedDocumentType.value) return;

  viewModalInstance?.hide();
  await nextTick();
  if (!isComponentActive || !selectedDocumentType.value) return;
  openEditModal(selectedDocumentType.value);
};

const validateForm = () => {
  if (!isEditMode.value && !form.value.code.trim()) {
    throw new Error("El código es obligatorio");
  }

  if (!form.value.name.trim()) {
    throw new Error("El nombre es obligatorio");
  }
};

const submitForm = async () => {
  try {
    validateForm();
    isSaving.value = true;

    const payload = {
      name: form.value.name.trim(),
      counterpart_scope: form.value.counterpart_scope,
      affects_inventory: form.value.affects_inventory,
      affects_accounting: form.value.affects_accounting
    };

    if (isEditMode.value && editingId.value) {
      await updateDocumentType({
        id: editingId.value,
        payload
      });

      await Swal.fire({
        icon: "success",
        title: "Tipo actualizado",
        text: "Los cambios fueron aplicados correctamente",
        timer: 1800,
        showConfirmButton: false
      });
    } else {
      await createDocumentType({
        code: form.value.code.trim(),
        ...payload
      });

      await Swal.fire({
        icon: "success",
        title: "Tipo creado",
        text: "El tipo de documento fue registrado exitosamente",
        timer: 1800,
        showConfirmButton: false
      });
    }

    formModalInstance?.hide();
    resetForm();
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "No fue posible guardar el tipo de documento";

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: message
    });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (item: DocumentTypeItem) => {
  const dependNote = item.dependencies_count > 0
    ? `\n\nEste tipo tiene ${item.dependencies_count} dependencia${item.dependencies_count !== 1 ? 's' : ''} (documentos o secuencias). Al eliminarlo quedará inactivo pero los registros asociados se mantendrán.`
    : "";

  const result = await Swal.fire({
    icon: "warning",
    title: "Eliminar tipo de documento",
    html: `¿Deseas eliminar el tipo <strong>${item.code}</strong>?${dependNote.replace(/\n/g, "<br>")}`,
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
    await deleteDocumentType(item.id);
    await Swal.fire({
      icon: "success",
      title: "Tipo eliminado",
      timer: 1600,
      showConfirmButton: false
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "No fue posible eliminar el tipo de documento";

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

  const item = documentTypes.value.find((row) => row.id === id);
  if (!item) {
    return;
  }

  if (action === "view") {
    void openViewModal(item);
    return;
  }

  if (action === "edit") {
    void openEditModal(item);
    return;
  }

  if (action === "delete") {
    void confirmDelete(item);
  }
};

onMounted(() => {
  if (formModalRef.value) {
    formModalInstance = new Modal(formModalRef.value);
  }
  if (viewModalRef.value) {
    viewModalInstance = new Modal(viewModalRef.value);
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
.text-brick-ember { color: #d44c2b; }

.document-types-table-wrapper :deep(.dataTables_filter input),
.document-types-table-wrapper :deep(.dataTables_length select) {
  border-radius: 0.5rem;
}

.document-types-table-wrapper :deep(table.dataTable tbody td) {
  vertical-align: middle;
}

.document-type-form-modal-body {
  overflow-x: hidden;
}

.document-type-form-grid {
  min-width: 0;
}

.document-type-form-grid .col-md-6,
.document-type-form-grid .col-12 {
  min-width: 0;
}

.document-type-form-grid :deep(.relative),
.document-type-form-grid :deep(button),
.document-type-form-grid :deep(input),
.document-type-form-grid :deep(select) {
  max-width: 100%;
}
</style>



