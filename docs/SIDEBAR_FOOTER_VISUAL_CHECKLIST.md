# Sidebar/Footer Visual Checklist

Checklist de validacion visual y de accesibilidad para Sidebar y Footer.

## Breakpoint Movil (320px-767px)

- Sidebar: abrir/cerrar overlay sin cortes visuales ni solapamiento de texto.
- Sidebar: verificar legibilidad de etiquetas, iconos y subtitulos de seccion.
- Sidebar: validar estados hover/focus/active en items y subitems.
- Sidebar: revisar footer de usuario (nombre, rol, icono logout) con contraste claro.
- DashFooter: comprobar que enlaces y metadatos se leen correctamente en una linea o wrap limpio.
- Footer global: validar que bloques de informacion no se monten y mantengan separacion.

## Breakpoint Tablet (768px-1023px)

- Sidebar: confirmar jerarquia visual entre grupos, subitems y elementos activos.
- Sidebar: revisar color de iconografia en estado normal y hover.
- DashFooter: validar centrado, espaciado y contraste de textos secundarios.
- Footer global: verificar alineacion de columnas y contraste de links.

## Breakpoint Desktop (1024px+)

- Sidebar: evaluar lectura continua en sesiones largas (fatiga visual reducida).
- Sidebar: validar consistencia cromatica entre encabezado, navegacion y footer de usuario.
- DashFooter: revisar balance visual de marca, links y copyright.
- Footer global: comprobar uniformidad de colores en iconos sociales y textos legales.

## Accesibilidad y UX

- Navegacion por teclado: foco visible en links y botones del Sidebar/Footer.
- Contraste: ejecutar `npm run check:contrast:chrome` y validar resultado OK.
- Estados de hover/focus: sin saltos bruscos de color ni perdida de legibilidad.
- Responsive: sin truncamiento critico de texto en nombres largos de menu.

## Comandos Recomendados

```bash
cd frontend
npm run check:contrast:chrome
npm run build
```
