# SOP Corporativo: Migracion de Rama Principal de master a main

## Control documental

| Campo | Valor |
| --- | --- |
| Codigo documental | SOP-GIT-001 |
| Titulo | Migracion de rama principal de master a main |
| Tipo de documento | Procedimiento Operativo Estandar (SOP) |
| Version | 1.1 |
| Estado | Vigente |
| Clasificacion | Interno - Uso del equipo de Ingenieria |
| Fecha de emision | 2026-05-02 |
| Fecha de vigencia | 2026-05-02 |
| Proxima revision anual (due date) | 2027-05-02 |
| Propietario del proceso | Engineering Manager |
| Custodio documental | Tech Lead |
| Aprobador | Engineering Manager |
| Repositorio de control | docs/ |

## Historial de cambios

| Version | Fecha | Autor | Descripcion del cambio | Aprobador |
| --- | --- | --- | --- | --- |
| 1.0 | 2026-05-02 | Copilot / Tech Lead | Emision inicial del SOP | Engineering Manager |
| 1.1 | 2026-05-02 | Copilot / Tech Lead | Adecuacion ISO-like: control documental, clasificacion, revision anual y matriz de evidencias | Engineering Manager |

## Control de distribucion

| Perfil | Acceso | Medio |
| --- | --- | --- |
| Engineering Manager | Lectura / Aprobacion | Repositorio Git |
| Tech Lead | Lectura / Edicion controlada | Repositorio Git |
| DevOps Engineer | Lectura / Ejecucion | Repositorio Git |
| QA Lead | Lectura / Verificacion | Repositorio Git |
| Developers | Lectura | Repositorio Git |

## 1. Proposito
Establecer un procedimiento estandar, auditable y repetible para migrar la rama principal de master a main, asegurando continuidad operativa, cumplimiento de controles de calidad y gobernanza de cambios.

## 2. Alcance
Aplica a todos los repositorios GitHub administrados por el equipo de desarrollo con flujo de trabajo basado en pull requests y CI/CD.

## 3. Referencias
- Politica interna de control de cambios del equipo.
- Reglas de rama y rulesets de GitHub del repositorio.
- Workflows CI/CD vigentes en el repositorio.

## 4. Definiciones
- Rama principal: rama por defecto del repositorio para integracion y despliegue.
- Branch protection: conjunto de controles para restringir merge y push.
- Evidencia: artefacto verificable (captura, log, enlace, ejecucion CI) que demuestra cumplimiento.
- Due date de revision: fecha maxima para revisar vigencia, exactitud y necesidad de actualizacion documental.

## 5. Roles y responsabilidades
- Engineering Manager
  - Autoriza el cambio de rama principal.
  - Aprueba cierre del procedimiento.
  - Aprueba revisiones de version del SOP.
- Tech Lead
  - Ejecuta la migracion tecnica.
  - Valida integridad de reglas y pipelines.
  - Custodia el documento y su versionado.
- DevOps Engineer
  - Verifica y corrige triggers de pipelines.
  - Confirma estado de checks requeridos.
- QA Lead
  - Verifica flujo de PR y condiciones de bloqueo.
- Repo Admin
  - Gestiona permisos y reglas en GitHub.

## 6. Matriz RACI

| Actividad | Engineering Manager | Tech Lead | DevOps Engineer | QA Lead | Repo Admin |
| --- | --- | --- | --- | --- | --- |
| Planificar ventana de cambio | A | R | I | I | C |
| Ejecutar migracion de rama | I | R | I | I | C |
| Ajustar branch protection y rulesets | A | C | I | I | R |
| Validar CI/CD en main | I | C | R | I | I |
| Ejecutar PR de prueba end-to-end | I | C | I | R | I |
| Cierre y comunicacion | A | R | I | I | I |

## 7. Prerrequisitos de control
- Permisos administrativos en el repositorio.
- Rama main existente en remoto.
- Inventario de reglas actuales en master.
- Pipelines CI/CD operativos en estado verde.

## 8. Procedimiento operativo

### 8.1 Preparacion
1. Levantar snapshot de configuracion actual:
   - Default branch actual.
   - Branch protection rules de master.
   - Rulesets activos.
   - Required status checks.
2. Definir ventana de cambio y responsable on-call.

Evidencia requerida:
- Captura de pantalla de configuracion inicial.
- Registro de aprobacion de ventana (ticket o correo).

### 8.2 Ejecucion tecnica
1. Renombrar rama local y publicar main si no existe:

```bash
git branch -m master main
git push -u origin main
```

2. Cambiar default branch a main en GitHub.
3. Replicar branch protection de master hacia main.
4. Actualizar rulesets que apunten a master para incluir main.

Evidencia requerida:
- Captura de default branch en main.
- Captura de regla de proteccion activa para main.

### 8.3 Ajuste CI/CD
1. Verificar que workflows y pipelines apunten a main.
2. Confirmar que los status checks requeridos se ejecutan en PR a main.

Evidencia requerida:
- Enlace a ejecucion de pipeline en PR hacia main.
- Captura de checks requeridos configurados.

### 8.4 Validacion de control
1. Crear rama de prueba desde main.
2. Abrir PR de prueba a main.
3. Verificar bloqueos:
   - No merge sin aprobaciones.
   - No merge con checks fallidos.
   - Conversaciones deben estar resueltas.
4. Verificar merge permitido cuando se cumplen criterios.

Evidencia requerida:
- URL de PR de prueba.
- Capturas del bloqueo y del estado final habilitado.

### 8.5 Retiro de master (opcional, recomendado)
1. Confirmar 48 horas sin incidentes posteriores al cambio.
2. Eliminar rama remota master:

```bash
git push origin --delete master
```

3. Limpieza de referencias locales:

```bash
git fetch -p
```

Evidencia requerida:
- Salida de comando de eliminacion.
- Confirmacion visual de ramas remotas.

## 9. Criterios de aceptacion
- Default branch establecida en main.
- Branch protection activa en main con controles equivalentes o superiores.
- Rulesets y CI/CD alineados a main.
- PR de prueba ejecutada con evidencia de bloqueo y liberacion correcta.
- Comunicacion oficial enviada al equipo.

## 10. Gestion de riesgos y rollback
Riesgos principales:
- CI no dispara en main.
- Reglas no replicadas correctamente.
- Integraciones externas siguen apuntando a master.

Rollback de emergencia:
1. Restaurar temporalmente master como default branch.
2. Rehabilitar reglas previas en master.
3. Corregir configuraciones de main.
4. Repetir validacion de PR antes de nuevo intento.

## 11. Matriz de evidencias para auditoria

| ID | Evidencia | Responsable de generarla | Medio de almacenamiento | Retencion minima |
| --- | --- | --- | --- | --- |
| E1 | Estado inicial de ramas y reglas | Tech Lead | Ticket / Wiki / PR | 12 meses |
| E2 | Cambio de default branch a main | Repo Admin | Captura + enlace | 12 meses |
| E3 | Configuracion de branch protection en main | Repo Admin | Captura + enlace | 12 meses |
| E4 | Ejecucion de CI en PR hacia main | DevOps Engineer | URL de pipeline | 12 meses |
| E5 | PR de prueba con bloqueos activos | QA Lead | URL de PR + capturas | 12 meses |
| E6 | Comunicacion formal al equipo | Engineering Manager | Correo / canal oficial | 12 meses |

## 12. Plantilla de aprobacion
- Fecha de ejecucion:
- Repositorio:
- Responsable tecnico:
- DevOps revisor:
- QA revisor:
- Aprobador final (Engineering Manager):
- Estado: Aprobado / Rechazado / Requiere ajustes
- Observaciones:

## 13. Regla de revision anual
Este documento debe revisarse como minimo una vez por ano o antes si ocurre alguno de los siguientes eventos:
- Cambio de politica de branching.
- Cambio de plataforma Git o CI/CD.
- Incidente de gobernanza de merges.

Si no hay cambios, se registra resultado como Revision sin cambios y se actualiza la fecha de proxima revision anual.

## 14. Mensaje corporativo sugerido
Se informa que, a partir de la fecha, la rama principal oficial del repositorio es main. Todo desarrollo nuevo debe ramificarse desde main y todo pull request debe apuntar a main. Las reglas de proteccion y validaciones CI/CD ya se encuentran aplicadas en esta rama conforme al SOP-GIT-001.
