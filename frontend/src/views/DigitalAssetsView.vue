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
              <li class="breadcrumb-item active" aria-current="page">Activos Digitales</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-photo-film me-2 text-brick-ember"></i>Gestión de Activos Digitales
              </h1>
              <p class="text-secondary small mb-0">Administra archivos y recursos multimedia asociados a la operación.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Activo
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando activos digitales...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los activos digitales. Intenta nuevamente.
            </div>

            <div v-else class="digital-assets-table-wrapper" ref="tableWrapperRef">
              <DataTable
                :key="tableRenderKey"
                :data="tableRows"
                :columns="tableColumns"
                :options="tableOptions"
                id="digitalAssetsTable"
                class="table table-hover align-middle table-striped w-100"
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Archivo</th>
                    <th>MIME</th>
                    <th>Tamaño</th>
                    <th>Resolución</th>
                    <th>Disco</th>
                    <th>Clave</th>
                    <th>Uso</th>
                    <th>Estado</th>
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

  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="digitalAssetFormModal" tabindex="-1" aria-labelledby="digitalAssetFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="digitalAssetFormModalLabel">
            <i class="fa-solid fa-photo-film me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Activo Digital' : 'Nuevo Activo Digital' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body pt-3 digital-asset-form-modal-body">
          <div class="row g-3 digital-asset-form-grid">
            <div class="col-md-4">
              <CustomSelect
                id="digital-asset-storage-disk"
                v-model="form.storage_disk"
                label="Disco"
                placeholder="Seleccionar disco"
                :options="storageDiskOptions"
                :searchable="false"
              />
            </div>
            <div class="col-md-8">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Storage Key <span class="text-danger">*</span></label>
              <input
                v-model="form.storage_key"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="uploads/products/2026/imagen-001.jpg"
                maxlength="255"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Nombre Original</label>
              <input
                v-model="form.original_filename"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="catalogo.jpg"
                maxlength="255"
              />
            </div>
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">URL Pública</label>
              <input
                v-model="form.public_url"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="https://cdn.example.com/asset.jpg"
                maxlength="700"
              />
            </div>

            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">MIME Type <span class="text-danger">*</span></label>
              <input
                v-model="form.mime_type"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="image/jpeg"
                maxlength="120"
              />
            </div>
            <div class="col-md-3">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Extensión</label>
              <input
                v-model="form.extension"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white"
                placeholder="jpg"
                maxlength="20"
              />
            </div>
            <div class="col-md-3">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Tamaño (bytes) <span class="text-danger">*</span></label>
              <NumberStepper
                v-model="form.size_bytes"
                :min="0"
                input-class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white number-stepper-input"
                placeholder="0"
              />
            </div>

            <div class="col-md-3">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Ancho (px)</label>
              <NumberStepper
                v-model="form.width_px"
                :min="1"
                input-class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white number-stepper-input"
                placeholder="1920"
              />
            </div>
            <div class="col-md-3">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Alto (px)</label>
              <NumberStepper
                v-model="form.height_px"
                :min="1"
                input-class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white number-stepper-input"
                placeholder="1080"
              />
            </div>
            <div class="col-md-6">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">SHA256</label>
              <input
                v-model="form.sha256_hash"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white font-monospace"
                placeholder="64 caracteres hex"
                maxlength="64"
              />
            </div>

            <div class="col-12">
              <label class="block text-sm font-medium text-ink-black-700 mb-2">Metadata JSON</label>
              <textarea
                v-model="form.metadata_text"
                rows="4"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white font-monospace small"
                placeholder='{"alt":"Imagen principal","source":"import"}'
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
                  id="switchDigitalAssetIsActive"
                  style="width:2.5em;height:1.3em;"
                />
                <label class="form-check-label ms-2 fw-semibold" for="switchDigitalAssetIsActive">
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

  <div class="modal fade" id="digitalAssetViewModal" tabindex="-1" aria-labelledby="digitalAssetViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedDigitalAsset">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="digitalAssetViewModalLabel">
            <i class="fa-solid fa-photo-film me-2 text-info"></i>Detalle de Activo Digital
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.1rem;">
              <i class="fa-solid fa-file"></i>
            </div>
            <div class="text-break">
              <p class="fw-bold mb-0">{{ selectedDigitalAsset.original_filename ?? selectedDigitalAsset.storage_key }}</p>
              <p class="text-secondary small mb-0">{{ selectedDigitalAsset.mime_type }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedDigitalAsset.is_active ? 'text-bg-success' : 'text-bg-secondary'">
                {{ selectedDigitalAsset.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-hard-drive" label="Disco" :value="selectedDigitalAsset.storage_disk" /></div>
            <div class="col-md-6"><DetailRow icon="fa-key" label="Storage Key" :value="selectedDigitalAsset.storage_key" /></div>
            <div class="col-md-6"><DetailRow icon="fa-tag" label="Nombre Original" :value="selectedDigitalAsset.original_filename" /></div>
            <div class="col-md-6"><DetailRow icon="fa-link" label="URL Pública" :value="selectedDigitalAsset.public_url" /></div>
            <div class="col-md-6"><DetailRow icon="fa-file-lines" label="MIME Type" :value="selectedDigitalAsset.mime_type" /></div>
            <div class="col-md-6"><DetailRow icon="fa-file-code" label="Extensión" :value="selectedDigitalAsset.extension" /></div>
            <div class="col-md-6"><DetailRow icon="fa-weight-hanging" label="Tamaño" :value="formatBytes(selectedDigitalAsset.size_bytes)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-up-right-and-down-left-from-center" label="Resolución" :value="resolutionLabel(selectedDigitalAsset)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-diagram-project" label="Usos en Imágenes de Producto" :value="String(selectedDigitalAsset.product_images_count)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-hashtag" label="SHA256" :value="selectedDigitalAsset.sha256_hash" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedDigitalAsset.created_at)" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar-check" label="Actualizado" :value="formatDate(selectedDigitalAsset.updated_at)" /></div>
          </div>

          <div class="mt-3" v-if="selectedDigitalAsset.metadata_json">
            <p class="text-secondary small mb-1">Metadata JSON</p>
            <pre class="bg-light border rounded-3 p-3 small mb-0 text-break">{{ JSON.stringify(selectedDigitalAsset.metadata_json, null, 2) }}</pre>
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
  useCreateDigitalAsset,
  useDeleteDigitalAsset,
  useDigitalAssets,
  useUpdateDigitalAsset
} from "../composables/useDigitalAssets";
import type { DigitalAssetItem } from "../services/digital-asset.service";
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
        <p class="fw-semibold mb-0 text-break">{{ value ?? '—' }}</p>
      </div>
    </div>
  `
};

const { data, isLoading, isError } = useDigitalAssets();
const { mutateAsync: createDigitalAsset } = useCreateDigitalAsset();
const { mutateAsync: updateDigitalAsset } = useUpdateDigitalAsset();
const { mutateAsync: deleteDigitalAsset } = useDeleteDigitalAsset();

const digitalAssets = computed(() => data.value ?? []);

const sidebarOpen = ref(false);
const tableWrapperRef = ref<HTMLElement | null>(null);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;

const selectedDigitalAsset = ref<DigitalAssetItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);

const emptyForm = () => ({
  storage_disk: "local",
  storage_key: "",
  original_filename: "",
  public_url: "",
  mime_type: "",
  extension: "",
  size_bytes: 0,
  width_px: null as number | null,
  height_px: null as number | null,
  sha256_hash: "",
  metadata_text: "",
  is_active: true
});

const form = ref(emptyForm());

const storageDiskOptions: SelectOption[] = [
  { value: "local", label: "Local" },
  { value: "s3", label: "S3" },
  { value: "azure", label: "Azure" }
];

const tableRenderKey = computed(() =>
  digitalAssets.value
    .map((item) => `${item.id}-${item.updated_at}-${item.is_active}`)
    .join("|")
);

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#039;");

const formatBytes = (bytesValue: string | number) => {
  const bytes = typeof bytesValue === "string" ? Number(bytesValue) : bytesValue;
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const factor = Math.floor(Math.log(bytes) / Math.log(1024));
  const unitIndex = Math.min(factor, units.length - 1);
  const scaled = bytes / (1024 ** unitIndex);
  return `${scaled.toFixed(scaled >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

const resolutionLabel = (item: DigitalAssetItem) => {
  if (!item.width_px || !item.height_px) {
    return "—";
  }

  return `${item.width_px}x${item.height_px}px`;
};

const buildActionButtons = (item: DigitalAssetItem) => {
  const deleteTitle = item.dependencies_count > 0
    ? `Eliminar activo (en uso por ${item.dependencies_count} imagen${item.dependencies_count !== 1 ? "es" : ""})`
    : "Eliminar activo";

  return `
    <div class="btn-group" role="group" aria-label="Acciones de fila">
      <button type="button" class="btn btn-sm btn-outline-info" data-action="view" data-id="${item.id}" title="Ver detalle" aria-label="Ver detalle">
        <i class="fa-solid fa-eye"></i>
      </button>
      <button type="button" class="btn btn-sm btn-outline-warning" data-action="edit" data-id="${item.id}" title="Editar activo" aria-label="Editar activo">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${item.id}" title="${deleteTitle}" aria-label="${deleteTitle}">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;
};

const tableRows = computed(() => digitalAssets.value.map((item) => ({
  id: item.id,
  original_filename: `<span class="fw-semibold">${escapeHtml(item.original_filename ?? "(sin nombre)")}</span>`,
  mime_type: `<span class="small">${escapeHtml(item.mime_type)}</span>`,
  size_bytes: `<span class="badge bg-light text-dark border">${formatBytes(item.size_bytes)}</span>`,
  resolution: `<span class="small">${resolutionLabel(item)}</span>`,
  storage_disk: `<span class="badge bg-secondary-subtle text-secondary fw-semibold">${escapeHtml(item.storage_disk)}</span>`,
  storage_key: `<span class="small font-monospace">${escapeHtml(item.storage_key)}</span>`,
  dependencies_count: `<span class="badge bg-light text-dark border">${item.dependencies_count}</span>`,
  is_active: item.is_active
    ? '<span class="badge text-bg-success">Activo</span>'
    : '<span class="badge text-bg-secondary">Inactivo</span>',
  created_at: formatDate(item.created_at),
  actions: buildActionButtons(item)
})));

const tableColumns = [
  { title: "ID", data: "id" },
  { title: "Archivo", data: "original_filename" },
  { title: "MIME", data: "mime_type" },
  { title: "Tamaño", data: "size_bytes" },
  { title: "Resolución", data: "resolution" },
  { title: "Disco", data: "storage_disk" },
  { title: "Clave", data: "storage_key" },
  { title: "Uso", data: "dependencies_count" },
  { title: "Estado", data: "is_active" },
  { title: "Creado", data: "created_at" },
  { title: "Acción", data: "actions", orderable: false, searchable: false, className: "text-center" }
];

const tableOptions: Config = {
  language: {
    search: "Buscar:",
    lengthMenu: "Mostrar _MENU_ registros",
    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
    infoEmpty: "Mostrando 0 a 0 de 0 registros",
    zeroRecords: "No se encontraron activos digitales",
    paginate: {
      first: "Primero",
      last: "Último",
      next: "Siguiente",
      previous: "Anterior"
    }
  },
  pageLength: 10,
  lengthMenu: [5, 10, 25, 50],
  order: [[0, "desc"]],
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

const openEditModal = async (item: DigitalAssetItem) => {
  if (!isComponentActive) return;

  isEditMode.value = true;
  editingId.value = item.id;
  form.value = {
    storage_disk: item.storage_disk,
    storage_key: item.storage_key,
    original_filename: item.original_filename ?? "",
    public_url: item.public_url ?? "",
    mime_type: item.mime_type,
    extension: item.extension ?? "",
    size_bytes: Number(item.size_bytes),
    width_px: item.width_px,
    height_px: item.height_px,
    sha256_hash: item.sha256_hash ?? "",
    metadata_text: item.metadata_json ? JSON.stringify(item.metadata_json, null, 2) : "",
    is_active: item.is_active
  };

  await nextTick();
  if (!isComponentActive) return;
  formModalInstance?.show();
};

const openViewModal = async (item: DigitalAssetItem) => {
  if (!isComponentActive) return;
  selectedDigitalAsset.value = item;

  await nextTick();
  if (!isComponentActive) return;
  viewModalInstance?.show();
};

const openEditFromView = async () => {
  if (!isComponentActive || !selectedDigitalAsset.value) return;

  viewModalInstance?.hide();
  await nextTick();
  if (!isComponentActive || !selectedDigitalAsset.value) return;
  openEditModal(selectedDigitalAsset.value);
};

const parseMetadata = () => {
  const raw = form.value.metadata_text.trim();
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Metadata JSON no tiene formato válido");
  }
};

const validateForm = () => {
  if (!form.value.storage_key.trim()) {
    throw new Error("La storage key es obligatoria");
  }

  if (!form.value.mime_type.trim()) {
    throw new Error("El MIME type es obligatorio");
  }

  if (!Number.isFinite(form.value.size_bytes) || form.value.size_bytes < 0) {
    throw new Error("El tamaño en bytes debe ser un número mayor o igual a 0");
  }

  if (form.value.sha256_hash && !/^[a-fA-F0-9]{64}$/.test(form.value.sha256_hash.trim())) {
    throw new Error("El SHA256 debe tener exactamente 64 caracteres hexadecimales");
  }
};

const submitForm = async () => {
  try {
    validateForm();
    isSaving.value = true;

    const payload = {
      storage_disk: form.value.storage_disk,
      storage_key: form.value.storage_key.trim(),
      original_filename: form.value.original_filename.trim() || undefined,
      public_url: form.value.public_url.trim() || undefined,
      mime_type: form.value.mime_type.trim(),
      extension: form.value.extension.trim() || undefined,
      size_bytes: Math.trunc(form.value.size_bytes),
      width_px: form.value.width_px ?? undefined,
      height_px: form.value.height_px ?? undefined,
      sha256_hash: form.value.sha256_hash.trim() || undefined,
      metadata_json: parseMetadata(),
      is_active: form.value.is_active
    };

    if (isEditMode.value && editingId.value) {
      await updateDigitalAsset({
        id: editingId.value,
        payload
      });

      await Swal.fire({
        icon: "success",
        title: "Activo actualizado",
        text: "Los cambios fueron aplicados correctamente",
        timer: 1800,
        showConfirmButton: false
      });
    } else {
      await createDigitalAsset(payload);

      await Swal.fire({
        icon: "success",
        title: "Activo creado",
        text: "El activo digital fue registrado exitosamente",
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
        ?? "No fue posible guardar el activo digital";

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: message
    });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (item: DigitalAssetItem) => {
  const dependenceNote = item.dependencies_count > 0
    ? `\n\nEste activo está vinculado a ${item.dependencies_count} imagen${item.dependencies_count !== 1 ? "es" : ""} de producto. Al eliminarlo quedará inactivo y no se mostrará en listados activos.`
    : "";

  const result = await Swal.fire({
    icon: "warning",
    title: "Eliminar activo digital",
    html: `¿Deseas eliminar el activo <strong>${escapeHtml(item.original_filename ?? item.storage_key)}</strong>?${dependenceNote.replace(/\n/g, "<br>")}`,
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
    await deleteDigitalAsset(item.id);
    await Swal.fire({
      icon: "success",
      title: "Activo eliminado",
      timer: 1600,
      showConfirmButton: false
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "No fue posible eliminar el activo digital";

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

  const item = digitalAssets.value.find((row) => row.id === id);
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

.digital-assets-table-wrapper :deep(.dataTables_filter input),
.digital-assets-table-wrapper :deep(.dataTables_length select) {
  border-radius: 0.5rem;
}

.digital-assets-table-wrapper :deep(table.dataTable tbody td) {
  vertical-align: middle;
}

.digital-asset-form-modal-body {
  overflow-x: hidden;
}

.digital-asset-form-grid {
  min-width: 0;
}

.digital-asset-form-grid .col-md-8,
.digital-asset-form-grid .col-md-6,
.digital-asset-form-grid .col-md-4,
.digital-asset-form-grid .col-md-3,
.digital-asset-form-grid .col-12 {
  min-width: 0;
}

.digital-asset-form-grid :deep(.relative),
.digital-asset-form-grid :deep(button),
.digital-asset-form-grid :deep(input),
.digital-asset-form-grid :deep(select),
.digital-asset-form-grid :deep(textarea) {
  max-width: 100%;
}
</style>



