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
              <li class="breadcrumb-item active" aria-current="page">Productos</li>
            </ol>
          </nav>

          <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 class="h4 fw-bold mb-1 text-dark">
                <i class="fa-solid fa-box me-2 text-brick-ember"></i>Gestión de Productos
              </h1>
              <p class="text-secondary small mb-0">Administra el catálogo de productos de la empresa activa.</p>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" @click="openCreateModal">
              <i class="fa-solid fa-plus"></i>
              Nuevo Producto
            </button>
          </div>

          <div class="bg-white rounded-4 shadow-sm p-4">
            <div v-if="isLoading" class="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
              <div class="spinner-border text-primary" role="status" style="width:3rem;height:3rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="text-secondary small">Cargando productos...</p>
            </div>

            <div v-else-if="isError" class="alert alert-danger rounded-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              No fue posible cargar los productos. Intenta nuevamente.
            </div>

            <div v-else>
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div class="input-group" style="max-width: 460px;">
                  <span class="input-group-text bg-white"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input
                    v-model="searchQuery"
                    type="search"
                    class="form-control"
                    placeholder="Buscar por SKU, código barras, nombre, marca..."
                    aria-label="Buscar productos"
                  />
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="small text-secondary">Mostrar</span>
                  <div style="width: 120px;">
                    <CustomSelect
                      id="products-page-size"
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
                <table id="productsTable" class="table table-hover align-middle table-striped w-100">
                  <thead class="table-dark">
                    <tr>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('id')">ID <i :class="sortIcon('id')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('sku')">SKU <i :class="sortIcon('sku')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('name')">Nombre <i :class="sortIcon('name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('category_name')">Categoría <i :class="sortIcon('category_name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('brand_name')">Marca <i :class="sortIcon('brand_name')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('sale_price')">P. Venta <i :class="sortIcon('sale_price')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('is_active')">Estado <i :class="sortIcon('is_active')"></i></button></th>
                      <th><button type="button" class="table-sort-btn" @click="toggleSort('created_at')">Creado <i :class="sortIcon('created_at')"></i></button></th>
                      <th class="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in paginatedProducts" :key="product.id">
                      <td class="text-secondary small">{{ product.id }}</td>
                      <td>
                        <span class="badge bg-secondary-subtle text-secondary fw-semibold">{{ product.sku }}</span>
                        <span v-if="product.is_service" class="badge bg-info-subtle text-info fw-semibold ms-1">Servicio</span>
                      </td>
                      <td class="fw-semibold">
                        {{ product.name }}
                        <span v-if="product.is_featured" class="badge bg-warning-subtle text-warning fw-semibold ms-1"><i class="fa-solid fa-star" style="font-size:.7rem;"></i></span>
                      </td>
                      <td>
                        <div class="d-flex flex-column gap-1">
                          <span v-if="product.category_name" class="badge bg-primary-subtle text-primary fw-semibold" style="width:fit-content;">{{ product.category_name }}</span>
                          <span v-if="product.subcategory_name" class="badge bg-secondary-subtle text-secondary fw-normal" style="width:fit-content;font-size:.72rem;">{{ product.subcategory_name }}</span>
                          <span v-if="!product.category_name" class="text-secondary small">—</span>
                        </div>
                      </td>
                      <td>
                        <div v-if="product.brand_name" class="d-flex flex-column">
                          <span class="fw-semibold small">{{ product.brand_name }}</span>
                          <span v-if="product.model_name" class="text-secondary" style="font-size:.72rem;">{{ product.model_name }}</span>
                        </div>
                        <span v-else class="text-secondary small">—</span>
                      </td>
                      <td class="fw-semibold small">{{ formatPrice(product.sale_price) }}</td>
                      <td>
                        <span :class="product.is_active ? 'badge bg-success-subtle text-success' : 'badge bg-danger-subtle text-danger'">
                          {{ product.is_active ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td class="small text-secondary">{{ formatDate(product.created_at) }}</td>
                      <td class="text-center" style="white-space:nowrap;">
                        <div class="d-flex gap-1 justify-content-center">
                          <button class="btn btn-sm btn-outline-info rounded-3 px-2" @click="openViewModal(product)" title="Ver detalle">
                            <i class="fa-solid fa-eye"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning rounded-3 px-2" @click="openEditModal(product)" title="Editar producto">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            class="btn btn-sm btn-outline-danger rounded-3 px-2"
                            @click="confirmDelete(product)"
                            title="Eliminar producto"
                          >
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="paginatedProducts.length === 0">
                      <td colspan="9" class="text-center text-secondary py-4">No se encontraron productos para el filtro actual.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                <p class="small text-secondary mb-0">
                  Mostrando {{ paginationStart }} a {{ paginationEnd }} de {{ filteredProducts.length }} registros
                </p>

                <div class="btn-group btn-group-sm" role="group" aria-label="Paginación productos">
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
  <div class="modal fade" id="productFormModal" tabindex="-1" aria-labelledby="productFormModalLabel" aria-hidden="true" ref="formModalRef">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold" id="productFormModalLabel">
            <i class="fa-solid fa-box me-2 text-primary"></i>
            {{ isEditMode ? 'Editar Producto' : 'Nuevo Producto' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body pt-3 product-form-modal-body">
          <ul class="nav nav-tabs nav-tabs-bordered mb-4 product-form-tabs" id="productFormTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="tab-product-general" data-bs-toggle="tab" data-bs-target="#panel-product-general" type="button" role="tab">
                <i class="fa-solid fa-circle-info me-1"></i>General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-product-clasificacion" data-bs-toggle="tab" data-bs-target="#panel-product-clasificacion" type="button" role="tab">
                <i class="fa-solid fa-sitemap me-1"></i>Clasificación
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-product-precios" data-bs-toggle="tab" data-bs-target="#panel-product-precios" type="button" role="tab">
                <i class="fa-solid fa-tag me-1"></i>Precios
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="tab-product-config" data-bs-toggle="tab" data-bs-target="#panel-product-config" type="button" role="tab">
                <i class="fa-solid fa-sliders me-1"></i>Configuración
              </button>
            </li>
          </ul>

          <div class="tab-content product-form-tab-content">
            <!-- Tab General -->
            <div class="tab-pane fade show active" id="panel-product-general" role="tabpanel">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="product-sku">SKU <span class="text-danger">*</span></label>
                  <input
                    id="product-sku"
                    v-model="form.sku"
                    type="text"
                    :class="inputClass(formErrors.sku)"
                    placeholder="SKU-001"
                    :disabled="isEditMode"
                    maxlength="60"
                    :aria-invalid="Boolean(formErrors.sku)"
                    aria-describedby="product-sku-help product-sku-error"
                    @blur="validateField('sku')"
                  />
                  <p id="product-sku-help" class="field-help">Identificador único del producto. Inmutable tras la creación.</p>
                  <p v-if="formErrors.sku" id="product-sku-error" class="field-error">{{ formErrors.sku }}</p>
                </div>

                <div class="col-md-4">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="product-barcode">Código de Barras</label>
                  <input
                    id="product-barcode"
                    v-model="form.barcode"
                    type="text"
                    :class="inputClass(formErrors.barcode)"
                    placeholder="7800000000000"
                    maxlength="80"
                    :aria-invalid="Boolean(formErrors.barcode)"
                    @blur="validateField('barcode')"
                  />
                  <p class="field-help">EAN-13, UPC u otro código de barras.</p>
                  <p v-if="formErrors.barcode" class="field-error">{{ formErrors.barcode }}</p>
                </div>

                <div class="col-md-4">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="product-name">Nombre <span class="text-danger">*</span></label>
                  <input
                    id="product-name"
                    v-model="form.name"
                    type="text"
                    :class="inputClass(formErrors.name)"
                    placeholder="Nombre del producto"
                    maxlength="180"
                    :aria-invalid="Boolean(formErrors.name)"
                    aria-describedby="product-name-help product-name-error"
                    @blur="validateField('name')"
                  />
                  <p id="product-name-help" class="field-help">Nombre visible en catálogo y comprobantes.</p>
                  <p v-if="formErrors.name" id="product-name-error" class="field-error">{{ formErrors.name }}</p>
                </div>

                <div class="col-12">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="product-description">Descripción</label>
                  <textarea
                    id="product-description"
                    v-model="form.description"
                    :class="inputClass('')"
                    placeholder="Descripción detallada del producto..."
                    rows="3"
                    style="resize: vertical;"
                  ></textarea>
                  <p class="field-help">Descripción visible al cliente.</p>
                </div>
              </div>
            </div>

            <!-- Tab Clasificación -->
            <div class="tab-pane fade" id="panel-product-clasificacion" role="tabpanel">
              <div class="row g-3">
                <div class="col-md-6">
                  <CustomSelect
                    id="product-category"
                    v-model="form.category_id"
                    label="Categoría"
                    placeholder="Sin categoría"
                    :options="categoryOptions"
                    :searchable="true"
                    :clearable="true"
                    @change="onCategoryChange"
                  />
                  <p class="field-help mt-2">Agrupa el producto en una categoría principal.</p>
                </div>

                <div class="col-md-6">
                  <CustomSelect
                    id="product-subcategory"
                    v-model="form.subcategory_id"
                    label="Subcategoría"
                    placeholder="Sin subcategoría"
                    :options="filteredSubcategoryOptions"
                    :searchable="true"
                    :clearable="true"
                  />
                  <p class="field-help mt-2">
                    <span v-if="!form.category_id">Selecciona primero una categoría para filtrar.</span>
                    <span v-else>Subcategoría dentro de la categoría seleccionada.</span>
                  </p>
                </div>

                <div class="col-md-6">
                  <CustomSelect
                    id="product-brand"
                    v-model="form.brand_id"
                    label="Marca"
                    placeholder="Sin marca"
                    :options="brandOptions"
                    :searchable="true"
                    :clearable="true"
                    @change="onBrandChange"
                  />
                  <p class="field-help mt-2">Marca comercial del fabricante.</p>
                </div>

                <div class="col-md-6">
                  <CustomSelect
                    id="product-model"
                    v-model="form.model_id"
                    label="Modelo"
                    placeholder="Sin modelo"
                    :options="filteredModelOptions"
                    :searchable="true"
                    :clearable="true"
                  />
                  <p class="field-help mt-2">
                    <span v-if="!form.brand_id">Selecciona primero una marca para filtrar.</span>
                    <span v-else>Modelo dentro de la marca seleccionada.</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Tab Precios -->
            <div class="tab-pane fade" id="panel-product-precios" role="tabpanel">
              <div class="row g-3">
                <div class="col-12">
                  <CustomSelect
                    id="product-uom"
                    v-model="form.base_uom_id"
                    label="Unidad de Medida"
                    placeholder="Seleccionar unidad"
                    :options="uomOptions"
                    :searchable="true"
                    :error="formErrors.base_uom_id"
                    helper-text="Unidad base de compra/venta del producto."
                    @change="validateField('base_uom_id')"
                  />
                </div>

                <div class="col-md-3">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="product-cost">Precio Costo</label>
                  <input
                    id="product-cost"
                    v-model.number="form.cost_price"
                    type="number"
                    min="0"
                    step="0.01"
                    :class="inputClass(formErrors.cost_price)"
                    placeholder="0.00"
                    :aria-invalid="Boolean(formErrors.cost_price)"
                    @blur="validateField('cost_price')"
                  />
                  <p v-if="formErrors.cost_price" class="field-error">{{ formErrors.cost_price }}</p>
                </div>

                <div class="col-md-3">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="product-sale">Precio Venta <span class="text-danger">*</span></label>
                  <input
                    id="product-sale"
                    v-model.number="form.sale_price"
                    type="number"
                    min="0"
                    step="0.01"
                    :class="inputClass(formErrors.sale_price)"
                    placeholder="0.00"
                    :aria-invalid="Boolean(formErrors.sale_price)"
                    aria-describedby="product-sale-error"
                    @blur="validateField('sale_price')"
                  />
                  <p v-if="formErrors.sale_price" id="product-sale-error" class="field-error">{{ formErrors.sale_price }}</p>
                </div>

                <div class="col-md-3">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="product-minprice">Precio Mínimo</label>
                  <input
                    id="product-minprice"
                    v-model="form.min_price"
                    type="number"
                    min="0"
                    step="0.01"
                    :class="inputClass('')"
                    placeholder="Opcional"
                  />
                  <p class="field-help">Precio mínimo permitido en descuentos.</p>
                </div>

                <div class="col-md-3">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="product-tax">Tasa de Impuesto</label>
                  <input
                    id="product-tax"
                    v-model.number="form.tax_rate"
                    type="number"
                    min="0"
                    step="0.0001"
                    :class="inputClass('')"
                    placeholder="0.0000"
                  />
                  <p class="field-help">Ejemplo: 0.19 para IVA 19%.</p>
                </div>
              </div>
            </div>

            <!-- Tab Configuración -->
            <div class="tab-pane fade" id="panel-product-config" role="tabpanel">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="block text-sm font-medium text-ink-black-700 mb-2" for="product-minstock">Stock Mínimo</label>
                  <input
                    id="product-minstock"
                    v-model.number="form.min_stock"
                    type="number"
                    min="0"
                    step="0.01"
                    :class="inputClass('')"
                    placeholder="0"
                  />
                  <p class="field-help">Nivel de alerta de reposición.</p>
                </div>

                <div class="col-md-9 d-flex flex-wrap align-items-start gap-4 pt-1">
                  <div class="d-flex flex-column gap-3 mt-3">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" id="product-is-active" v-model="form.is_active" />
                      <label class="form-check-label fw-semibold" for="product-is-active">Activo</label>
                      <p class="field-help mb-0">Disponible en catálogo y ventas.</p>
                    </div>

                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" id="product-is-service" v-model="form.is_service" />
                      <label class="form-check-label fw-semibold" for="product-is-service">Es Servicio</label>
                      <p class="field-help mb-0">No requiere gestión de stock físico.</p>
                    </div>
                  </div>

                  <div class="d-flex flex-column gap-3 mt-3">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" id="product-track-inv" v-model="form.track_inventory" />
                      <label class="form-check-label fw-semibold" for="product-track-inv">Controlar Inventario</label>
                      <p class="field-help mb-0">Registrar movimientos de stock.</p>
                    </div>

                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch" id="product-featured" v-model="form.is_featured" />
                      <label class="form-check-label fw-semibold" for="product-featured">Destacado</label>
                      <p class="field-help mb-0">Aparece en sección de productos destacados.</p>
                    </div>
                  </div>
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
  <div class="modal fade" id="productViewModal" tabindex="-1" aria-labelledby="productViewModalLabel" aria-hidden="true" ref="viewModalRef">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 shadow" v-if="selectedProduct">
        <div class="modal-header border-0">
          <h5 class="modal-title fw-bold" id="productViewModalLabel">
            <i class="fa-solid fa-box me-2 text-info"></i>Detalle de Producto
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body pt-0">
          <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-3 bg-light">
            <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style="width:52px;height:52px;font-size:1.3rem;">
              {{ selectedProduct.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="fw-bold mb-0">{{ selectedProduct.name }}</p>
              <p class="text-secondary small mb-0">
                <span class="badge bg-secondary-subtle text-secondary me-1">{{ selectedProduct.sku }}</span>
                <span v-if="selectedProduct.is_service" class="badge bg-info-subtle text-info me-1">Servicio</span>
                <span :class="selectedProduct.is_active ? 'badge bg-success-subtle text-success' : 'badge bg-danger-subtle text-danger'">
                  {{ selectedProduct.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </p>
            </div>
          </div>

          <div class="row g-3">
            <div class="col-md-6"><DetailRow icon="fa-barcode" label="SKU" :value="selectedProduct.sku" /></div>
            <div class="col-md-6"><DetailRow icon="fa-qrcode" label="Cód. Barras" :value="selectedProduct.barcode" /></div>
            <div class="col-md-6"><DetailRow icon="fa-layer-group" label="Categoría" :value="selectedProduct.category_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-sitemap" label="Subcategoría" :value="selectedProduct.subcategory_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-copyright" label="Marca" :value="selectedProduct.brand_name" /></div>
            <div class="col-md-6"><DetailRow icon="fa-cubes" label="Modelo" :value="selectedProduct.model_name" /></div>
            <div class="col-md-4"><DetailRow icon="fa-scale-balanced" label="Unidad" :value="selectedProduct.uom_name ? `${selectedProduct.uom_name} (${selectedProduct.uom_symbol})` : null" /></div>
            <div class="col-md-4"><DetailRow icon="fa-coins" label="P. Costo" :value="formatPrice(selectedProduct.cost_price)" /></div>
            <div class="col-md-4"><DetailRow icon="fa-tag" label="P. Venta" :value="formatPrice(selectedProduct.sale_price)" /></div>
            <div class="col-md-4"><DetailRow icon="fa-percent" label="Impuesto" :value="selectedProduct.tax_rate ? `${(selectedProduct.tax_rate * 100).toFixed(1)}%` : '0%'" /></div>
            <div class="col-md-4"><DetailRow icon="fa-boxes-stacked" label="Stock Mínimo" :value="selectedProduct.min_stock" /></div>
            <div class="col-md-4"><DetailRow icon="fa-calendar" label="Creado" :value="formatDate(selectedProduct.created_at)" /></div>
            <div v-if="selectedProduct.description" class="col-12">
              <p class="text-secondary small mb-1">Descripción</p>
              <p class="mb-0">{{ selectedProduct.description }}</p>
            </div>
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
import { useProducts, useProductUnits, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../composables/useProducts";
import { useCategories } from "../composables/useCategories";
import { useSubcategories } from "../composables/useSubcategories";
import { useBrands } from "../composables/useBrands";
import { useModels } from "../composables/useModels";
import type { SelectOption } from "../components/CustomSelect.vue";
import type { ProductItem } from "../services/product.service";
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

const { data, isLoading, isError } = useProducts();
const { data: unitsData } = useProductUnits();
const { data: categoriesData } = useCategories();
const { data: subcategoriesData } = useSubcategories();
const { data: brandsData } = useBrands();
const { data: modelsData } = useModels();
const { mutateAsync: createProduct } = useCreateProduct();
const { mutateAsync: updateProduct } = useUpdateProduct();
const { mutateAsync: deleteProduct } = useDeleteProduct();

const sidebarOpen = ref(false);
const formModalRef = ref<HTMLElement | null>(null);
const viewModalRef = ref<HTMLElement | null>(null);

let formModalInstance: Modal | null = null;
let viewModalInstance: Modal | null = null;
let isComponentActive = true;
let pendingEditTimeout: ReturnType<typeof setTimeout> | null = null;

const products = computed(() => data.value ?? []);
const selectedProduct = ref<ProductItem | null>(null);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const searchQuery = ref("");
const pageSize = ref<number | string>(10);
const currentPage = ref(1);
const sortKey = ref<"id" | "sku" | "name" | "category_name" | "brand_name" | "sale_price" | "is_active" | "created_at">("name");
const sortDirection = ref<"asc" | "desc">("asc");

const emptyForm = () => ({
  sku: "",
  barcode: "",
  name: "",
  description: "",
  category_id: "" as string | number,
  subcategory_id: "" as string | number,
  brand_id: "" as string | number,
  model_id: "" as string | number,
  base_uom_id: "" as string | number,
  tax_rate: 0,
  cost_price: 0,
  sale_price: 0,
  min_price: "" as string | number,
  is_featured: false,
  track_inventory: true,
  min_stock: 0,
  is_service: false,
  is_active: true
});

type ProductFormField = keyof ReturnType<typeof emptyForm>;

const emptyFormErrors = () => ({
  sku: "",
  barcode: "",
  name: "",
  base_uom_id: "",
  sale_price: "",
  cost_price: ""
});

const form = ref(emptyForm());
const formErrors = ref(emptyFormErrors());

const pageSizeOptions: SelectOption[] = [
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 }
];

// ── Selector options ────────────────────────────────────────────────────────

const uomOptions = computed<SelectOption[]>(() =>
  (unitsData.value ?? []).map((u) => ({
    value: Number(u.id),
    label: `[${u.code}] ${u.name} (${u.symbol})`
  }))
);

const categoryOptions = computed<SelectOption[]>(() =>
  (categoriesData.value ?? []).filter((c) => c.is_active).map((c) => ({
    value: Number(c.id),
    label: `[${c.code}] ${c.name}`
  }))
);

const filteredSubcategoryOptions = computed<SelectOption[]>(() => {
  const all = (subcategoriesData.value ?? []).filter((s) => s.is_active);
  const catId = form.value.category_id;

  const filtered = catId ? all.filter((s) => s.category_id === String(catId)) : all;

  return filtered.map((s) => ({
    value: Number(s.id),
    label: `[${s.code}] ${s.name}`
  }));
});

const brandOptions = computed<SelectOption[]>(() =>
  (brandsData.value ?? []).map((b) => ({
    value: Number(b.id),
    label: `[${b.code}] ${b.name}`
  }))
);

const filteredModelOptions = computed<SelectOption[]>(() => {
  const all = modelsData.value ?? [];
  const brandId = form.value.brand_id;

  const filtered = brandId ? all.filter((m) => m.brand_id === String(brandId)) : all;

  return filtered.map((m) => ({
    value: Number(m.id),
    label: `[${m.code}] ${m.name}`
  }));
});

// ── Category / brand cascade handlers ──────────────────────────────────────

function onCategoryChange() {
  form.value.subcategory_id = "";
}

function onBrandChange() {
  form.value.model_id = "";
}

// ── Table filter + sort + pagination ───────────────────────────────────────

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return products.value;

  return products.value.filter((p) => {
    const searchable = [
      String(p.id),
      p.sku,
      p.barcode ?? "",
      p.name,
      p.category_name ?? "",
      p.subcategory_name ?? "",
      p.brand_name ?? "",
      p.model_name ?? ""
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });
});

const getComparableValue = (p: ProductItem, key: typeof sortKey.value): string | number => {
  switch (key) {
    case "id": return Number(p.id);
    case "sale_price": return p.sale_price;
    case "is_active": return p.is_active ? 1 : 0;
    case "created_at": return p.created_at ? new Date(p.created_at).getTime() : 0;
    default: return (p[key] ?? "").toString().toLowerCase();
  }
};

const sortedProducts = computed(() => {
  const list = [...filteredProducts.value];
  const direction = sortDirection.value === "asc" ? 1 : -1;

  list.sort((a, b) => {
    const left = getComparableValue(a, sortKey.value);
    const right = getComparableValue(b, sortKey.value);
    if (left === right) return 0;
    if (typeof left === "number" && typeof right === "number") return (left - right) * direction;
    return String(left).localeCompare(String(right), "es") * direction;
  });

  return list;
});

const pageSizeNumber = computed(() => Number(pageSize.value) || 10);
const totalPages = computed(() => Math.max(1, Math.ceil(sortedProducts.value.length / pageSizeNumber.value)));
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSizeNumber.value;
  return sortedProducts.value.slice(start, start + pageSizeNumber.value);
});
const paginationStart = computed(() => filteredProducts.value.length === 0 ? 0 : (currentPage.value - 1) * pageSizeNumber.value + 1);
const paginationEnd = computed(() => filteredProducts.value.length === 0 ? 0 : Math.min(currentPage.value * pageSizeNumber.value, filteredProducts.value.length));

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

// ── Lifecycle ───────────────────────────────────────────────────────────────

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

// ── Modal handlers ──────────────────────────────────────────────────────────

async function openCreateModal() {
  if (!isComponentActive) return;
  isEditMode.value = false;
  editingId.value = null;
  form.value = emptyForm();
  formErrors.value = emptyFormErrors();

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-product-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

async function openEditModal(product: ProductItem) {
  if (!isComponentActive) return;
  isEditMode.value = true;
  editingId.value = product.id;
  form.value = {
    sku: product.sku,
    barcode: product.barcode ?? "",
    name: product.name,
    description: product.description ?? "",
    category_id: product.category_id ? Number(product.category_id) : "",
    subcategory_id: product.subcategory_id ? Number(product.subcategory_id) : "",
    brand_id: product.brand_id ? Number(product.brand_id) : "",
    model_id: product.model_id ? Number(product.model_id) : "",
    base_uom_id: Number(product.base_uom_id),
    tax_rate: product.tax_rate,
    cost_price: product.cost_price,
    sale_price: product.sale_price,
    min_price: product.min_price ?? "",
    is_featured: product.is_featured,
    track_inventory: product.track_inventory,
    min_stock: product.min_stock,
    is_service: product.is_service,
    is_active: product.is_active
  };
  formErrors.value = emptyFormErrors();

  await nextTick();
  if (!isComponentActive) return;

  const firstTab = document.getElementById("tab-product-general");
  if (firstTab) (firstTab as HTMLElement).click();
  formModalInstance?.show();
}

function openViewModal(product: ProductItem) {
  if (!isComponentActive) return;
  selectedProduct.value = product;

  nextTick(() => {
    if (!isComponentActive) return;
    viewModalInstance?.show();
  });
}

function openEditFromView() {
  if (!isComponentActive || !selectedProduct.value) return;
  viewModalInstance?.hide();
  pendingEditTimeout = setTimeout(() => {
    pendingEditTimeout = null;
    if (!isComponentActive || !selectedProduct.value) return;
    void openEditModal(selectedProduct.value);
  }, 350);
}

// ── Form logic ───────────────────────────────────────────────────────────────

async function submitForm() {
  const hasErrors = validateForm();
  if (hasErrors) {
    return showValidationError("Revisa los campos resaltados para continuar.");
  }

  const f = form.value;
  isSaving.value = true;

  try {
    if (isEditMode.value && editingId.value) {
      await updateProduct({
        id: editingId.value,
        payload: {
          barcode: f.barcode || null,
          name: f.name,
          description: f.description || null,
          category_id: f.category_id ? Number(f.category_id) : null,
          subcategory_id: f.subcategory_id ? Number(f.subcategory_id) : null,
          brand_id: f.brand_id ? Number(f.brand_id) : null,
          model_id: f.model_id ? Number(f.model_id) : null,
          base_uom_id: Number(f.base_uom_id),
          tax_rate: Number(f.tax_rate),
          cost_price: Number(f.cost_price),
          sale_price: Number(f.sale_price),
          min_price: f.min_price !== "" ? Number(f.min_price) : null,
          is_featured: f.is_featured,
          track_inventory: f.track_inventory,
          min_stock: Number(f.min_stock),
          is_service: f.is_service,
          is_active: f.is_active
        }
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Producto actualizado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    } else {
      await createProduct({
        sku: f.sku,
        barcode: f.barcode || null,
        name: f.name,
        description: f.description || null,
        category_id: f.category_id ? Number(f.category_id) : null,
        subcategory_id: f.subcategory_id ? Number(f.subcategory_id) : null,
        brand_id: f.brand_id ? Number(f.brand_id) : null,
        model_id: f.model_id ? Number(f.model_id) : null,
        base_uom_id: Number(f.base_uom_id),
        tax_rate: Number(f.tax_rate),
        cost_price: Number(f.cost_price),
        sale_price: Number(f.sale_price),
        min_price: f.min_price !== "" ? Number(f.min_price) : null,
        is_featured: f.is_featured,
        track_inventory: f.track_inventory,
        min_stock: Number(f.min_stock),
        is_service: f.is_service,
        is_active: f.is_active
      });
      formModalInstance?.hide();
      await Swal.fire({ icon: "success", title: "Producto creado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
    }
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Ocurrió un error inesperado.";
    await Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonText: "Entendido", customClass: { confirmButton: "btn btn-primary rounded-3 px-4" } });
  } finally {
    isSaving.value = false;
  }
}

function showValidationError(msg: string) {
  Swal.fire({ icon: "warning", title: "Validación", text: msg, confirmButtonText: "Entendido", customClass: { confirmButton: "btn btn-warning rounded-3 px-4" } });
}

function inputClass(error: string) {
  return [
    "w-full px-4 py-2.5 rounded-lg border focus:border-ink-black-500 focus:ring-2 focus:ring-ink-black-200 outline-none transition-all bg-white",
    error ? "border-danger product-form-input-error" : "border-slate-300"
  ];
}

function validateField(field: ProductFormField): string {
  const f = form.value;
  let error = "";

  if (field === "sku" && !isEditMode.value && !f.sku.trim()) {
    error = "El SKU es obligatorio.";
  }

  if (field === "name" && !f.name.trim()) {
    error = "El nombre es obligatorio.";
  }

  if (field === "base_uom_id" && !f.base_uom_id) {
    error = "La unidad de medida es obligatoria.";
  }

  if (field === "sale_price" && (f.sale_price === "" || Number(f.sale_price) < 0)) {
    error = "El precio de venta debe ser 0 o mayor.";
  }

  if (field === "cost_price" && (f.cost_price === "" || Number(f.cost_price) < 0)) {
    error = "El precio de costo debe ser 0 o mayor.";
  }

  (formErrors.value as Record<string, string>)[field] = error;
  return error;
}

function validateForm(): boolean {
  const fields: ProductFormField[] = ["sku", "name", "base_uom_id", "sale_price", "cost_price"];
  let hasErrors = false;

  fields.forEach((field) => {
    if (validateField(field)) hasErrors = true;
  });

  // Navigate to first tab with errors
  if (formErrors.value.sku || formErrors.value.name) {
    document.getElementById("tab-product-general")?.click();
  } else if (formErrors.value.base_uom_id || formErrors.value.sale_price || formErrors.value.cost_price) {
    document.getElementById("tab-product-precios")?.click();
  }

  return hasErrors;
}

async function confirmDelete(product: ProductItem) {
  const result = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar producto?",
    html: `<p class="mb-0">Estás por eliminar <strong>${product.name}</strong>.<br>Esta acción desactivará el registro.</p>`,
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
    await deleteProduct(product.id);
    await Swal.fire({ icon: "success", title: "Producto eliminado", toast: true, position: "top-end", showConfirmButton: false, timer: 2500, timerProgressBar: true });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "No fue posible eliminar el producto.";
    await Swal.fire({ icon: "error", title: "Error", text: msg, confirmButtonText: "Cerrar", customClass: { confirmButton: "btn btn-primary rounded-3 px-4" } });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(value: number): string {
  return value.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
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

.field-help {
  font-size: 0.78rem;
  color: #6c757d;
  margin-top: 4px;
  margin-bottom: 0;
}

.field-error {
  font-size: 0.78rem;
  color: #dc3545;
  margin-top: 4px;
  margin-bottom: 0;
}

.product-form-input-error {
  border-color: #dc3545 !important;
}

.product-form-modal-body {
  overflow-x: hidden;
}

.product-form-tab-content {
  max-height: 450px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.product-form-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.product-form-tabs .nav-link {
  font-size: .875rem;
  padding: .5rem .9rem;
  white-space: normal;
  word-break: break-word;
}
</style>
