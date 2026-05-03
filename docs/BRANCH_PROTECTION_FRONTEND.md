# Branch Protection - Frontend Required Checks

Configuracion sugerida para proteger main y exigir validaciones de frontend en cada pull request.

## Objetivo

Bloquear merges a main cuando falle cualquiera de los controles de frontend (table actions, contraste, tests o build).

## Regla recomendada de Branch Protection

- Branch name pattern: main
- Require a pull request before merging: enabled
- Require approvals: 1 (o la politica interna)
- Dismiss stale pull request approvals when new commits are pushed: enabled
- Require status checks to pass before merging: enabled
- Require branches to be up to date before merging: enabled
- Require conversation resolution before merging: enabled
- Do not allow bypassing the above settings: enabled (si aplica para admins)

## Required status check (nombre exacto)

Marca como requerido este check:

- Frontend checks (table actions, contrast, test, build)

Fuente del check:

- .github/workflows/frontend-ci.yml

Nota: el workflow Frontend CI ya esta configurado para ejecutarse en todos los pull requests, por lo que este check protege cualquier PR hacia main.

## Como configurarlo en GitHub

1. Ir a Settings del repositorio.
2. Entrar a Branches.
3. Click en Add branch protection rule.
4. En Branch name pattern, ingresar main.
5. Activar las opciones listadas en Regla recomendada.
6. En Required status checks, seleccionar Frontend checks (table actions, contrast, test, build).
7. Guardar cambios.

## Validacion rapida

1. Crear un PR de prueba con un fallo intencional en frontend.
2. Verificar que el check Frontend checks (table actions, contrast, test, build) falle.
3. Confirmar que GitHub bloquee el boton de merge hasta que el check pase.

## Alcance complementario

Para releases, existe validacion adicional en:

- .github/workflows/frontend-release.yml

Con el job:

- Frontend release gates (table actions, contrast, test, build)
