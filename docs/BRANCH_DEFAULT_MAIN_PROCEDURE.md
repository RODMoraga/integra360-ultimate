# Procedimiento Interno: Migracion de master a main y Branch Protection

Fecha: 2026-05-02  
Responsable: Equipo de desarrollo

## Objetivo
Estandarizar el repositorio para usar main como rama principal, mantener controles de calidad en pull requests y evitar bloqueos por configuraciones antiguas en master.

## Alcance
Aplicable a todos los repositorios GitHub del equipo que aun usen master o tengan reglas de proteccion apuntando a master.

## Prerrequisitos
- Permisos de administrador en el repositorio.
- Rama main creada y publicada en remoto.
- CI funcionando para pull requests.

## Paso 1. Verificar rama principal
1. Ir a GitHub > Settings > Branches.
2. Confirmar o cambiar Default branch a main.
3. Guardar cambios.

Resultado esperado:
- main queda como rama por defecto.

## Paso 2. Replicar protecciones de master a main
1. Ir a GitHub > Settings > Branches > Branch protection rules.
2. Crear regla para main con la misma configuracion que master.
3. Mantener regla de master temporalmente hasta validar.

Checklist de proteccion recomendado:
- Require a pull request before merging
- Require approvals
- Dismiss stale approvals
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Restrict who can push to matching branches (si aplica)
- Include administrators (segun politica)

Resultado esperado:
- main protegido con la misma exigencia de calidad que master.

## Paso 3. Revisar Rulesets (si existen)
1. Ir a GitHub > Settings > Rules > Rulesets.
2. Actualizar el target de master a main.
3. Verificar include/exclude patterns.

Resultado esperado:
- No quedan reglas activas solo para master.

## Paso 4. Actualizar CI/CD
Actualizar workflows y pipelines para escuchar main.

Ejemplo para GitHub Actions (referencial):
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

Resultado esperado:
- Los checks obligatorios corren sobre PRs hacia main.

## Paso 5. Validacion operativa
1. Crear rama de prueba desde main.
2. Abrir PR hacia main.
3. Confirmar bloqueos esperados:
   - Sin aprobaciones no se puede mergear.
   - Si falla CI no se puede mergear.
   - Se exige resolver conversaciones.
4. Corregir y verificar que mergea cuando cumple todo.

Resultado esperado:
- Branch protection funciona correctamente en main.

## Paso 6. Retiro de master
Solo cuando main este validada:
1. Quitar proteccion de master (opcional, segun politica).
2. Eliminar master remota:
   git push origin --delete master
3. Limpieza local:
   git fetch -p

Resultado esperado:
- master retirada sin impacto operativo.

## Paso 7. Comunicacion al equipo
Enviar aviso interno con:
- main es la rama oficial.
- No abrir PRs a master.
- Actualizar ramas locales antiguas.

Texto sugerido para anuncio:
A partir de hoy, la rama principal del repositorio es main. Todas las nuevas ramas y pull requests deben salir y apuntar a main. Las reglas de proteccion y CI ya fueron migradas.

## Rollback (solo emergencia)
Si se detecta bloqueo critico:
1. Restaurar temporalmente master como default branch.
2. Rehabilitar protecciones previas.
3. Corregir configuracion de main y reintentar migracion.

## Criterios de cierre
- Default branch = main.
- Proteccion activa en main.
- Checks requeridos ejecutandose en PRs a main.
- Equipo informado.
- master retirada (si aplica).
