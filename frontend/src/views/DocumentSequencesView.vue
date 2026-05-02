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
              <li class="breadcrumb-item">Documentos</li>
              <li class="breadcrumb-item active" aria-current="page">Secuencias</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-hashtag me-2 text-brick-ember"></i>Gestión de Secuencias de Documentos
              </h1>
              <p class="text-secondary small mb-0">Administra correlativos por tipo de documento y año.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nueva Secuencia
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando secuencias...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar las secuencias de documentos. Intenta nuevamente.
            </div>

            <div v-else class="document-sequences-table-wrapper" ref="tableWrapperRef">
              <DataTable
                :key="tableRenderKey"
                :data="tableRows"
                :columns="tableColumns"
                :options="tableOptions"
                id="documentSequencesTable"
                class="table table-hover align-middle table-striped w-100"
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Año</th>
                    <th>Siguiente N°</th>
                    <th>Estado Tipo</th>
                    <th>Creado</th>
                    <th>Actualizado</th>
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

  <div class="modal fade" id="documentSequenceFormModal" tabindex="-1" aria-labelledby="documentSequenceFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="documentSequenceFormModalLabel">
            <i class="fa-solid fa-hashtag me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Secuencia' : 'Nueva Secuencia' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body pt-3 document-sequence-form-modal-body">
          <div class="row g-3 document-sequence-form-grid">
            <div class="col-md-12">
              <CustomSelect
                id="document-sequence-document-type"
                v-model="form.document_type_id"
                label="Tipo de Documento"
                placeholder="Seleccionar tipo"
                :options="documentTypeOptions"
                :searchable="true"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Año <span class="text-danger">*</span></label>
              <NumberStepper
                v-model="form.year_num"
                :min="2000"
                :max="9999"
                input-class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white number-stepper-input"
                placeholder="2026"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Siguiente N° <span class="text-danger">*</span></label>
              <NumberStepper
                v-model="form.next_number"
                :min="1"
                input-class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white number-stepper-input"
                placeholder="1"
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

  <div class="modal fade" id="documentSequenceViewModal" tabindex="-1" aria-labelledby="documentSequenceViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedSequence">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="documentSequenceViewModalLabel">
            <i class="fa-solid fa-hashtag me-2 text-info"></i>Detalle de Secuencia
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.1rem;">
              <i class="fa-solid fa-hashtag"></i>
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedSequence.document_type_name ?? 'Tipo no disponible' }}</p>
              <p class="text-secondary small mb-0">{{ selectedSequence.document_type_code ?? 'N/A' }} · Año {{ selectedSequence.year_num }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedSequence.document_type_is_active ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedSequence.document_type_is_active ? 'Tipo activo' : 'Tipo inactivo' }}
              </span>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-id-badge" label="ID" :value="selectedSequence.id" /></div>
            <div class="col-md-6"><DetailRow icon="fa-file-lines" label="Tipo de Documento" :value="selectedSequence.document_type_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-tag" label="Código Tipo" :value="selectedSequence.document_type_code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Año" :value="String(selectedSequence.year_num)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-arrow-up-1-9" label="Siguiente Número" :value="selectedSequence.next_number" /></div>
            <div class="col-md-6"><DetailRow icon="fa-toggle-on" label="Estado Tipo" :value="selectedSequence.document_type_is_active ? 'Activo' : 'Inactivo'" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar-plus" label="Creado" :value="formatDate(selectedSequence.created_at)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar-check" label="Actualizado" :value="formatDate(selectedSequence.updated_at)" /></div>
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
import NumberStepper from "../components/NumberStepper.vue";
import {
  useCreateDocumentSequence,
  useDeleteDocumentSequence,
  useDocumentSequences,
  useUpdateDocumentSequence
} from "../composables/useDocumentSequences";
import { useDocumentTypes } from "../composables/useDocumentTypes";
import type { DocumentSequenceItem } from "../services/document-sequence.service";
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

const { data, isLoading, isError } = useDocumentSequences();
const { data: documentTypesData } = useDocumentTypes();
const { mutateAsync: createDocumentSequence } = useCreateDocumentSequence();
const { mutateAsync: updateDocumentSequence } = useUpdateDocumentSequence();
const { mutateAsync: deleteDocumentSequence } = useDeleteDocumentSequence();

const sequences = computed(() => data.value ?? []);
const documentTypeOptions = computed<SelectOption[]>(() =>
  (documentTypesData.value ?? []).map((row) => ({
    value: row.id,
    label: `${row.code} - ${row.name}`
  }))
);

const sidebarOpen = ref(false);
const tableWrapperRef = ref<HTMLElement | null>(null);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;

const selectedSequence = ref<DocumentSequenceItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);

const currentYear = new Date().getUTCFullYear();

const emptyForm = () => ({
  document_type_id: "",
  year_num: currentYear,
  next_number: 1
});

const form = ref(emptyForm());

const tableRenderKey = computed(() =>
  sequences.value
    .map((item) => `${item.id}-${item.next_number}-${item.updated_at}`)
    .join("|")
);

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

const buildActionButtons = (item: DocumentSequenceItem) => `
  <div class="d-flex gap-1 justify-content-center">
    <button type="button" class="btn btn-sm btn-outline-info rounded-3 px-2" data-action="view" data-id="${item.id}" title="Ver detalle">
      <i class="fa-solid fa-eye"></i>
    </button>
    <button type="button" class="btn btn-sm btn-outline-warning rounded-3 px-2" data-action="edit" data-id="${item.id}" title="Editar secuencia">
      <i class="fa-solid fa-pen-to-square"></i>
    </button>
    <button type="button" class="btn btn-sm btn-outline-danger rounded-3 px-2" data-action="delete" data-id="${item.id}" title="Eliminar secuencia">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>
`;

const tableRows = computed(() => sequences.value.map((item) => ({
  id: item.id,
  document_type: `<span class="fw-semibold">${escapeHtml(item.document_type_name ?? "Tipo no disponible")}</span><br><span class="small text-secondary">${escapeHtml(item.document_type_code ?? "N/A")}</span>`,
  year_num: item.year_num,
  next_number: `<span class="badge bg-light text-dark border">${item.next_number}</span>`,
  document_type_state: item.document_type_is_active
    ? '<span class="badge text-bg-success">Activo</span>'
    : '<span class="badge text-bg-secondary">Inactivo</span>',
  created_at: formatDate(item.created_at),
  updated_at: formatDate(item.updated_at),
  actions: buildActionButtons(item)
})));

const tableColumns = [
  { title: "ID", data: "id" },
  { title: "Tipo", data: "document_type" },
  { title: "Año", data: "year_num" },
  { title: "Siguiente N°", data: "next_number" },
  { title: "Estado Tipo", data: "document_type_state" },
  { title: "Creado", data: "created_at" },
  { title: "Actualizado", data: "updated_at" },
  { title: "Acción", data: "actions", orderable: false, searchable: false, className: "text-center" }
];

const tableOptions: Config = {
  language: {
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros",
    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    infoEmpty: "Mostrando 0 a 0 de 0 registros",
    zeroRecords: "No se encontraron secuencias de documentos",
    paginate: {
      first: "Primero",
      last: "Último",
      next: "Siguiente",
      previous: "Anterior"
    }
  },
  pageLength: 10,
  lengthMenu: [5, 10, 25, 50],
  order: [[2, "desc"], [0, "desc"]],
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

const openEditModal = async (item: DocumentSequenceItem) => {
  if (!isComponentActive) return;

  isEditMode.value = true;
  editingId.value = item.id;
  form.value = {
    document_type_id: item.document_type_id,
    year_num: item.year_num,
    next_number: Number(item.next_number)
  };

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
};

const openViewModal = async (item: DocumentSequenceItem) => {
  if (!isComponentActive) return;
  selectedSequence.value = item;

  await nextTick();
  if (!isComponentActive) return;
  viewModalInstance?.show();
};

const openEditFromView = async () => {
  if (!isComponentActive || !selectedSequence.value) return;

  viewModalInstance?.hide();
  await nextTick();
  if (!isComponentActive || !selectedSequence.value) return;
  openEditModal(selectedSequence.value);
};

const validateForm = () => {
  if (!form.value.document_type_id) {
    throw new Error("Debes seleccionar un tipo de documento");
  }

  if (!Number.isInteger(form.value.year_num) || form.value.year_num < 2000 || form.value.year_num > 9999) {
    throw new Error("El año debe ser un entero válido entre 2000 y 9999");
  }

  if (!Number.isInteger(form.value.next_number) || form.value.next_number < 1) {
    throw new Error("El siguiente número debe ser un entero mayor o igual a 1");
  }
};

const submitForm = async () => {
  try {
    validateForm();
    isSaving.value = true;

    const payload = {
      document_type_id: Number(form.value.document_type_id),
      year_num: Math.trunc(form.value.year_num),
      next_number: Math.trunc(form.value.next_number)
    };

    if (isEditMode.value && editingId.value) {
      await updateDocumentSequence({ id: editingId.value, payload });

      await Swal.fire({
        icon: "success",
        title: "Secuencia actualizada",
        text: "Los cambios fueron aplicados correctamente",
        timer: 1800,
        showConfirmButton: false
      });
    } else {
      await createDocumentSequence(payload);

      await Swal.fire({
        icon: "success",
        title: "Secuencia creada",
        text: "La secuencia de documento fue registrada exitosamente",
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
        ?? "No fue posible guardar la secuencia";

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: message
    });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (item: DocumentSequenceItem) => {
  const result = await Swal.fire({
    icon: "warning",
    title: "Eliminar secuencia",
    html: `¿Deseas eliminar la secuencia <strong>${escapeHtml(item.document_type_code ?? "N/A")}</strong> del año <strong>${item.year_num}</strong>?`,
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
    await deleteDocumentSequence(item.id);
    await Swal.fire({
      icon: "success",
      title: "Secuencia eliminada",
      timer: 1600,
      showConfirmButton: false
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "No fue posible eliminar la secuencia";

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

  const item = sequences.value.find((row) => row.id === id);
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

.document-sequences-table-wrapper :deep(.dataTables_filter input),
.document-sequences-table-wrapper :deep(.dataTables_length select) {
  border-radius: 0.5rem;
}

.document-sequences-table-wrapper :deep(table.dataTable tbody td) {
  vertical-align: middle;
}

.document-sequence-form-modal-body {
  overflow-x: hidden;
}

.document-sequence-form-grid {
  min-width: 0;
}

.document-sequence-form-grid .col-md-12,
.document-sequence-form-grid .col-md-6 {
  min-width: 0;
}

.document-sequence-form-grid :deep(.relative),
.document-sequence-form-grid :deep(button),
.document-sequence-form-grid :deep(input),
.document-sequence-form-grid :deep(select) {
  max-width: 100%;
}
</style>
