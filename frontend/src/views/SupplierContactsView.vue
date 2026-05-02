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
              <li class="breadcrumb-item">
                <router-link to="/proveedores" class="text-decoration-none text-secondary">Proveedores</router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">Contactos</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-address-book me-2 text-brick-ember"></i>Contactos de Proveedores
              </h1>
              <p class="text-secondary small mb-0">Administra los contactos asociados a los proveedores de la empresa activa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Contacto
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando contactos...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los contactos. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 460px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por nombre, proveedor, email, teléfono o cargo"
                    aria-label="Buscar contactos de proveedores"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="small text-secondary">Mostrar</span>
                  <div style="width: 120px;">
                    <CustomSelect
                      id="supplier-contacts-page-size"
                      v-model="pageSize"
                      placeholder="Cantidad"
                      :options="pageSizeOptions"
                      :searchable="false"
                    />
                  </div>
                  <span class="small text-secondary">registros</span>
                </div>
              </div>

              <div class="table-responsive">
                <table id="supplierContactsTable" class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('full_name')">Nombre Completo <i :class="sortIcon('full_name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('supplier_legal_name')">Proveedor <i :class="sortIcon('supplier_legal_name')"></i></button></th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('role_name')">Cargo / Rol <i :class="sortIcon('role_name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_primary')">Principal <i :class="sortIcon('is_primary')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="contact in paginatedContacts" :key="contact.id">
                      <td class="text-secondary small">{{ contact.id }}</td>
                      <td class="fw-semibold">{{ contact.full_name }}</td>
                      <td>
                        <div class="d-flex flex-column">
                          <span class="fw-semibold small">{{ contact.supplier_legal_name ?? '—' }}</span>
                          <span v-if="contact.supplier_code" class="badge bg-secondary-subtle text-secondary fw-semibold mt-1" style="width:fit-content;">{{ contact.supplier_code }}</span>
                        </div>
                      </td>
                      <td class="small">{{ contact.email ?? '—' }}</td>
                      <td class="small">{{ contact.phone ?? '—' }}</td>
                      <td class="small">{{ contact.role_name ?? '—' }}</td>
                      <td>
                        <span class="badge rounded-pill" :class="contact.is_primary ? 'text-bg-warning' : 'text-bg-secondary'">
                          {{ contact.is_primary ? 'Principal' : 'Secundario' }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(contact.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="btn-group" role="group" aria-label="Acciones de fila">
                          <button class="btn btn-sm btn-outline-info" @click="openViewModal(contact)" title="Ver detalle" aria-label="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning" @click="openEditModal(contact)" title="Editar contacto" aria-label="Editar contacto">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger"
                            @click="confirmDelete(contact)"
                            title="Eliminar contacto" aria-label="Eliminar contacto"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedContacts.length === 0">
                      <td colspan="9" class="text-center text-secondary py-4">No se encontraron contactos para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredContacts.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación contactos proveedor">
                  <button type="button" class="btn btn-outline-secondary" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <button type="button" class="btn btn-outline-secondary" disabled>Página {{ currentPage }} / {{ totalPages }}</button>
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

  <!-- Form Modal -->
  <div :class="['modal fade', isEditMode ? 'modal-variant-edit' : 'modal-variant-create']" id="supplierContactFormModal" tabindex="-1" aria-labelledby="supplierContactFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="supplierContactFormModalLabel">
            <i class="fa-solid fa-address-book me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Contacto' : 'Nuevo Contacto' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3 contact-form-modal-body">
          <ul class="nav nav-tabs nav-tabs-bordered mb-4 contact-form-tabs" id="supplierContactFormTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="tab-sc-general" data-bs-toggle="tab" data-bs-target="#panel-sc-general" type="button" role="tab">
                <i class="fa-solid fa-circle-info me-1"></i>General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-sc-contacto" data-bs-toggle="tab" data-bs-target="#panel-sc-contacto" type="button" role="tab">
                <i class="fa-solid fa-phone me-1"></i>Contacto
              </button>
            </li>
          </ul>

          <div class="tab-content contact-form-tab-content">
            <!-- Tab General -->
            <div class="tab-pane fade show active" id="panel-sc-general" role="tabpanel">
              <div class="row g-3 contact-form-grid">
                <div class="col-12">
                  <CustomSelect
                    id="sc-supplier"
                    v-model="form.supplier_id"
                    label="Proveedor"
                    placeholder="Seleccionar proveedor"
                    :options="supplierOptions"
                    :searchable="true"
                    :disabled="isEditMode"
                    :error="formErrors.supplier_id"
                    helper-text="Proveedor al que pertenece este contacto."
                    @change="validateField('supplier_id')"
                  />
                </div>

                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="sc-full-name">
                    Nombre Completo <span class="text-danger">*</span>
                  </label>
                  <input
                    id="sc-full-name"
                    v-model="form.full_name"
                    type="text"
                    :class="inputClass(formErrors.full_name)"
                    placeholder="Nombre y apellido del contacto"
                    maxlength="140"
                    :aria-invalid="Boolean(formErrors.full_name)"
                    aria-describedby="sc-full-name-help sc-full-name-error"
                    @blur="validateField('full_name')"
                  />
                  <p id="sc-full-name-help" class="field-help">Nombre completo tal como se usará en comunicaciones.</p>
                  <p v-if="formErrors.full_name" id="sc-full-name-error" class="field-error">{{ formErrors.full_name }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="sc-role-name">Cargo / Rol</label>
                  <input
                    id="sc-role-name"
                    v-model="form.role_name"
                    type="text"
                    :class="inputClass(formErrors.role_name)"
                    placeholder="Ej: Encargado de Ventas, Contador..."
                    maxlength="80"
                    :aria-invalid="Boolean(formErrors.role_name)"
                    aria-describedby="sc-role-name-help sc-role-name-error"
                    @blur="validateField('role_name')"
                  />
                  <p id="sc-role-name-help" class="field-help">Cargo o función del contacto dentro del proveedor.</p>
                  <p v-if="formErrors.role_name" id="sc-role-name-error" class="field-error">{{ formErrors.role_name }}</p>
                </div>

                <div class="col-md-6 d-flex align-items-end pb-2">
                  <div>
                    <label class="block text-sm font-medium text-ink-black-700 mb-2">Tipo de Contacto</label>
                    <div class="form-check form-switch">
                      <input
                        v-model="form.is_primary"
                        class="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="switchSCPrimary"
                        style="width:2.5em;height:1.3em;"
                      />
                      <label class="form-check-label ms-2 fw-semibold" for="switchSCPrimary">
                        <span :class="form.is_primary ? 'text-warning' : 'text-secondary'">
                          {{ form.is_primary ? 'Contacto Principal' : 'Contacto Secundario' }}
                        </span>
                      </label>
                    </div>
                    <p class="field-help mt-2">El contacto principal recibe comunicaciones prioritarias.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab Contacto -->
            <div class="tab-pane fade" id="panel-sc-contacto" role="tabpanel">
              <div class="row g-3 contact-form-grid">
                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="sc-email">Email</label>
                  <input
                    id="sc-email"
                    v-model="form.email"
                    type="email"
                    :class="inputClass(formErrors.email)"
                    placeholder="contacto@proveedor.com"
                    maxlength="160"
                    :aria-invalid="Boolean(formErrors.email)"
                    aria-describedby="sc-email-help sc-email-error"
                    @blur="validateField('email')"
                  />
                  <p id="sc-email-help" class="field-help">Correo para envío de documentos y notificaciones.</p>
                  <p v-if="formErrors.email" id="sc-email-error" class="field-error">{{ formErrors.email }}</p>
                </div>

                <div class="col-md-6">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="sc-phone">Teléfono</label>
                  <input
                    id="sc-phone"
                    v-model="form.phone"
                    type="tel"
                    :class="inputClass(formErrors.phone)"
                    placeholder="+56 9 1234 5678"
                    maxlength="40"
                    :aria-invalid="Boolean(formErrors.phone)"
                    aria-describedby="sc-phone-help sc-phone-error"
                    @blur="validateField('phone')"
                  />
                  <p id="sc-phone-help" class="field-help">Formato internacional recomendado para contacto directo.</p>
                  <p v-if="formErrors.phone" id="sc-phone-error" class="field-error">{{ formErrors.phone }}</p>
                </div>
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

  <!-- View Modal -->
  <div class="modal fade" id="supplierContactViewModal" tabindex="-1" aria-labelledby="supplierContactViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow" v-if="selectedContact">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="supplierContactViewModalLabel">
            <i class="fa-solid fa-address-book me-2 text-info"></i>Detalle de Contacto
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedContact.full_name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedContact.full_name }}</p>
              <p class="text-secondary small mb-0">{{ selectedContact.role_name ?? 'Sin cargo' }}</p>
              <span class="badge rounded-pill mt-1" :class="selectedContact.is_primary ? 'text-bg-warning' : 'text-bg-secondary'">
                {{ selectedContact.is_primary ? 'Principal' : 'Secundario' }}
              </span>
            </div>
          </div>
          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-building" label="Proveedor" :value="selectedContact.supplier_legal_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="Cód. Proveedor" :value="selectedContact.supplier_code" /></div>
            <div class="col-md-6"><DetailRow icon="fa-envelope" label="Email" :value="selectedContact.email" /></div>
            <div class="col-md-6"><DetailRow icon="fa-phone" label="Teléfono" :value="selectedContact.phone" /></div>
            <div class="col-md-6"><DetailRow icon="fa-briefcase" label="Cargo / Rol" :value="selectedContact.role_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedContact.created_at)" /></div>
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
import { ref, computed, nextTick, onBeforeUnmount, onMounted, watch } from "vue";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";

import AppSidebar from "../components/dashboard/AppSidebar.vue";
import DashNavbar from "../components/dashboard/DashNavbar.vue";
import DashFooter from "../components/dashboard/DashFooter.vue";
import CustomSelect from "../components/CustomSelect.vue";
import {
  useSupplierContacts,
  useCreateSupplierContact,
  useUpdateSupplierContact,
  useDeleteSupplierContact
} from "../composables/useSupplierContacts";
import { useSuppliers } from "../composables/useSuppliers";
import type { SupplierContactItem } from "../services/supplier-contact.service";
import type { SelectOption } from "../components/CustomSelect.vue";
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

const { data, isLoading, isError } = useSupplierContacts();
const { data: suppliersData } = useSuppliers();
const { mutateAsync: createContact } = useCreateSupplierContact();
const { mutateAsync: updateContact } = useUpdateSupplierContact();
const { mutateAsync: deleteContact } = useDeleteSupplierContact();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const contacts = computed(() => data.value ?? []);
const selectedContact = ref<SupplierContactItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref<number | string>(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "full_name" | "supplier_legal_name" | "role_name" | "is_primary" | "created_at">("full_name");
const sortDirection = ref<"asc" | "desc">("asc");

const emptyForm = () => ({
  supplier_id: "" as string | number,
  full_name: "",
  email: "",
  phone: "",
  role_name: "",
  is_primary: false
});

type ContactFormField = keyof ReturnType<typeof emptyForm>;

const emptyFormErrors = () => ({
  supplier_id: "",
  full_name: "",
  email: "",
  phone: "",
  role_name: "",
  is_primary: ""
});

const form = ref(emptyForm());
const formErrors = ref(emptyFormErrors());

const pageSizeOptions: SelectOption[] = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 }
];

const supplierOptions = computed<SelectOption[]>(() => {
  const rows = suppliersData.value ?? [];
  return rows
    .filter((s) => s.is_active)
    .map((s) => ({
      value: Number(s.id),
      label: `[${s.code}] ${s.legal_name}`
    }));
});

const filteredContacts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return contacts.value;

  return contacts.value.filter((c) => {
    const searchable = [
      String(c.id),
      c.full_name,
      c.supplier_legal_name ?? "",
      c.supplier_code ?? "",
      c.email ?? "",
      c.phone ?? "",
      c.role_name ?? "",
      c.is_primary ? "principal" : "secundario"
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (c: SupplierContactItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id":
      return Number(c.id);
    case "created_at":
      return c.created_at ? new Date(c.created_at).getTime() : 0;
    case "is_primary":
      return c.is_primary ? 1 : 0;
    case "supplier_legal_name":
      return (c.supplier_legal_name ?? "").toLowerCase();
    default:
      return (c[key] ?? "").toString().toLowerCase();
  }
};

const sortedContacts = computed(() => {
  const list = [...filteredContacts.value];
  const direction = sortDirection.value === "asc" ? 1 : -1;

  list.sort((a, b) => {
    const left = getComparableValue(a, sortKey.value);
    const right = getComparableValue(b, sortKey.value);

    if (left === right) return 0;

    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * direction;
    }

    return String(left).localeCompare(String(right), "es") * direction;
  });

  return list;
});

const pageSizeNumber = computed(() => Number(pageSize.value) || 10);
const totalPages = computed(() => Math.max(1, Math.ceil(sortedContacts.value.length / pageSizeNumber.value)));
const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * pageSizeNumber.value;
  return sortedContacts.value.slice(start, start + pageSizeNumber.value);
});

const paginationStart = computed(() =>
  filteredContacts.value.length === 0 ? 0 : (currentPage.value - 1) * pageSizeNumber.value + 1
);
const paginationEnd = computed(() =>
  filteredContacts.value.length === 0 ? 0 : Math.min(currentPage.value * pageSizeNumber.value, filteredContacts.value.length)
);

const toggleSort = (key: typeof sortKey.value) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDirection.value = "asc";
  }
};

const sortIcon = (key: typeof sortKey.value) => {
  if (sortKey.value !== key) return "fa-solid fa-sort text-secondary opacity-75 ms-1";
  return sortDirection.value === "asc" ? "fa-solid fa-sort-up ms-1" : "fa-solid fa-sort-down ms-1";
};

const goToPage = (page: number) => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
};

watch([searchQuery, pageSize], () => { currentPage.value = 1; });
watch(totalPages, (maxPages) => {
  if (currentPage.value > maxPages) currentPage.value = maxPages;
});

onMounted(() => {
  if (formModalRef.value) formModalInstance = new Modal(formModalRef.value);
  if (viewModalRef.value) viewModalInstance = new Modal(viewModalRef.value);
});

onBeforeUnmount(() => {
  isComponentActive = false;

  if (pendingEditTimeout) {
    clearTimeout(pendingEditTimeout);
    pendingEditTimeout = null;
  }

  formModalInstance?.hide();
  viewModalInstance?.hide();
  formModalInstance?.dispose();
  viewModalInstance?.dispose();
  formModalInstance = null;
  viewModalInstance = null;
});

async function openCreateModal() {
  if (!isComponentActive) return;
  isEditMode.value = false;
  editingId.value = null;
  form.value = emptyForm();
  formErrors.value = emptyFormErrors();

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-sc-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

async function openEditModal(contact: SupplierContactItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = contact.id;
  form.value = {
    supplier_id: Number(contact.supplier_id),
    full_name: contact.full_name,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    role_name: contact.role_name ?? "",
    is_primary: contact.is_primary
  };
  formErrors.value = emptyFormErrors();

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-sc-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

function openViewModal(contact: SupplierContactItem) {
  if (!isComponentActive) return;
  selectedContact.value = contact;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedContact.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedContact.value) return;
    void openEditModal(selectedContact.value);
  }, 350);
}

async function submitForm() {
  const hasErrors = validateForm();
  if (hasErrors) {
    return showValidationError("Revisa los campos resaltados para continuar.");
  }

  const f = form.value;

  isSaving.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateContact({
        id: editingId.value,
        payload: {
          full_name: f.full_name,
          email: f.email || undefined,
          phone: f.phone || undefined,
          role_name: f.role_name || undefined,
          is_primary: f.is_primary
        }
      });
      formModalInstance?.hide();
      await Swal.fire({
        icon: "success", title: "Contacto actualizado", toast: true,
        position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true
      });
    } else {
      await createContact({
        supplier_id: Number(f.supplier_id),
        full_name: f.full_name,
        email: f.email || undefined,
        phone: f.phone || undefined,
        role_name: f.role_name || undefined,
        is_primary: f.is_primary
      });
      formModalInstance?.hide();
      await Swal.fire({
        icon: "success", title: "Contacto creado", toast: true,
        position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true
      });
    }
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Ocurrió un error inesperado.";
    await Swal.fire({
      icon: "error", title: "Error", text: msg,
      confirmButtonText: "Entendido",
      customClass: { confirmButton: "btn btn-primary rounded-3 px-4" }
    });
  } finally {
    isSaving.value = false;
  }
}

function showValidationError(msg: string) {
  Swal.fire({
    icon: "warning", title: "Validación", text: msg,
    confirmButtonText: "Entendido",
    customClass: { confirmButton: "btn btn-warning rounded-3 px-4" }
  });
}

function inputClass(error: string) {
  return [
    "w-full px-4 py-2.5 rounded-lg border focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white",
    error ? "border-danger contact-form-input-error" : "border-slate-300"
  ];
}

function validateField(field: ContactFormField): string {
  const f = form.value;
  let error = "";

  if (field === "supplier_id") {
    if (!isEditMode.value && !f.supplier_id) {
      error = "El proveedor es obligatorio.";
    }
  }

  if (field === "full_name") {
    if (!String(f.full_name).trim()) {
      error = "El nombre completo es obligatorio.";
    } else if (String(f.full_name).length > 140) {
      error = "El nombre completo no puede superar 140 caracteres.";
    }
  }

  if (field === "email") {
    const email = String(f.email ?? "");
    if (email.length > 160) {
      error = "El email no puede superar 160 caracteres.";
    } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error = "El formato del email no es válido.";
    }
  }

  if (field === "phone" && String(f.phone ?? "").length > 40) {
    error = "El teléfono no puede superar 40 caracteres.";
  }

  if (field === "role_name" && String(f.role_name ?? "").length > 80) {
    error = "El cargo no puede superar 80 caracteres.";
  }

  formErrors.value[field] = error;
  return error;
}

function validateForm(): boolean {
  const fields: ContactFormField[] = ["supplier_id", "full_name", "email", "phone", "role_name"];

  let hasErrors = false;
  fields.forEach((field) => {
    if (validateField(field)) hasErrors = true;
  });

  if (formErrors.value.supplier_id || formErrors.value.full_name || formErrors.value.role_name) {
    const generalTab = document.getElementById("tab-sc-general");
    if (generalTab) (generalTab as HTMLElement).click();
  } else if (formErrors.value.email || formErrors.value.phone) {
    const contactTab = document.getElementById("tab-sc-contacto");
    if (contactTab) (contactTab as HTMLElement).click();
  }

  return hasErrors;
}

async function confirmDelete(contact: SupplierContactItem) {
  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar contacto?",
    html: `<p class="mb-0">Estás por eliminar a <strong>${contact.full_name}</strong>.<br>Esta acción no se puede deshacer.</p>`,
    showCancelButton: true,
    confirmButtonText: '<i class="fa-solid fa-trash me-2"></i>Sí, eliminar',
    cancelButtonText: "Cancelar",
    customClass: {
      confirmButton: "btn btn-danger rounded-3 px-4",
      cancelButton: "btn btn-light rounded-3 px-4 ms-2"
    },
    buttonsStyling: false
  });

  if (!result.isConfirmed) return;

  try {
    await deleteContact(contact.id);
    await Swal.fire({
      icon: "success", title: "Contacto eliminado", toast: true,
      position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true
    });
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "No fue posible eliminar el contacto.";
    await Swal.fire({
      icon: "error", title: "Error", text: msg,
      confirmButtonText: "Cerrar",
      customClass: { confirmButton: "btn btn-primary rounded-3 px-4" }
    });
  }
}
</script>

<style scoped>
.text-brick-ember { color: #d44c2b; }

.table-sort-btn {
  border: 0;
  background: transparent;
  color: inherit;
  font-weight: 600;
  padding: 0;
}

#supplierContactFormTabs .nav-link {
  font-size: .875rem;
  padding: .5rem .9rem;
}

.contact-form-modal-body {
  overflow-x: hidden;
}

.contact-form-tab-content {
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.contact-form-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.contact-form-tabs .nav-link {
  white-space: normal;
  word-break: break-word;
}

.contact-form-grid {
  min-width: 0;
}

.contact-form-grid .col-md-6,
.contact-form-grid .col-12 {
  min-width: 0;
}

.contact-form-grid :deep(.relative),
.contact-form-grid :deep(button),
.contact-form-grid :deep(input),
.contact-form-grid :deep(select) {
  max-width: 100%;
}

.field-help {
  margin-top: 0.45rem;
  font-size: 0.75rem;
  color: #64748b;
}

.field-error {
  margin-top: 0.35rem;
  margin-bottom: 0;
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 600;
}

.contact-form-input-error {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 0.12rem rgba(220, 38, 38, 0.2);
}
</style>



