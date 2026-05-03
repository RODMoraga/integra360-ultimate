# QA Checklist: Select Dropdown Rendering

## Objetivo
Validar que los dropdown de CustomSelect se rendericen correctamente en modales, tablas y mobile, sin recortes por overflow ni conflictos de z-index.

## Precondiciones
1. Frontend compilado y levantado en entorno QA.
2. Sesion iniciada con un usuario con permisos de lectura/edicion.
3. Datos semilla cargados para tener opciones en los selects.

## Criterios de aceptacion global
1. El dropdown siempre queda visible por encima de modal, tabla y contenedores scrollables.
2. No se corta horizontal ni verticalmente.
3. Al hacer scroll de pagina o modal, el dropdown permanece alineado con su campo.
4. Cierra correctamente con click fuera y tecla Escape.
5. Funciona igual en modo create y edit.

## Casos criticos por vista

### 1) Documentos
Referencia: frontend/src/views/DocumentsView.vue
1. Abrir modal de crear documento.
2. Abrir select de tipo documento, cliente/proveedor y bodega.
3. Verificar dropdown visible completo, sin quedar bajo la tabla de detalle.
4. En tabla de lineas, abrir select de variante y bodega de linea.

Resultado esperado:
- No hay recorte en modal-body ni table-responsive.
- El dropdown se superpone correctamente.

### 2) Ventas
Referencia: frontend/src/views/SalesView.vue
1. Abrir modal create/edit.
2. Probar selects de tipo, cliente y bodega.
3. Hacer scroll dentro del modal con dropdown abierto.

Resultado esperado:
- El menu permanece anclado al campo.
- No pierde posicion visual.

### 3) Productos
Referencia: frontend/src/views/ProductsView.vue
1. Abrir modal create/edit.
2. Probar selects de categoria, subcategoria, marca, modelo y unidad.
3. Verificar comportamiento en formularios largos con scroll interno.

Resultado esperado:
- Menus visibles y alineados en todos los campos.

### 4) Inventario
Referencia: frontend/src/views/InventoryView.vue
1. Abrir modal create/edit movimiento.
2. Probar selects de variante y bodegas.
3. Probar en pantalla con tabla visible al fondo.

Resultado esperado:
- Dropdown no queda por debajo de tabla ni encabezados.

### 5) Clientes y Proveedores
Referencias:
- frontend/src/views/CustomersView.vue
- frontend/src/views/SuppliersView.vue
1. Abrir modal create/edit.
2. Probar selects de comuna/ciudad/region y otros catalogos.

Resultado esperado:
- Render consistente en ambos modulos.

### 6) Empresas y Usuarios
Referencias:
- frontend/src/views/CompaniesView.vue
- frontend/src/views/UsersView.vue
1. Abrir modal create/edit.
2. Probar selects de perfil/rol/comuna/region.

Resultado esperado:
- Sin solapamientos con header/footer del modal.

## Pruebas responsive (mobile)
1. Viewport 390x844 (mobile vertical): abrir modales y dropdowns.
2. Viewport 844x390 (mobile horizontal): repetir validacion.
3. Viewport 768x1024 (tablet): repetir validacion.

Resultado esperado:
- El dropdown se reposiciona automaticamente para mantenerse dentro de viewport.
- Si no hay espacio abajo, abre hacia arriba sin recorte.

## Compatibilidad navegador
1. Chrome (ultima version estable).
2. Edge (ultima version estable).
3. Firefox (ultima version estable).

Resultado esperado:
- Mismo comportamiento visual y funcional en los 3 navegadores.

## Regresion funcional rapida
1. Buscar dentro del select (cuando searchable=true).
2. Seleccionar opcion con mouse.
3. Navegar opciones con teclado (arriba/abajo/enter).
4. Cerrar con Escape.
5. Click fuera para cerrar.

Resultado esperado:
- Sin regresiones en interaccion.

## Evidencia sugerida para QA
1. Captura por vista (modal + dropdown abierto).
2. Captura mobile vertical y horizontal.
3. Video corto de caso con scroll en modal.
4. Resultado final por vista: PASS/FAIL con observaciones.
