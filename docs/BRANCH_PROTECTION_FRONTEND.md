# Branch Protection - Frontend Required Checks

Configuracion recomendada para exigir checks de frontend antes de permitir merge a main.

## Requisitos sugeridos en GitHub

- Branch: main
- Require a pull request before merging: enabled
- Require status checks to pass before merging: enabled
- Require branches to be up to date before merging: enabled

## Status checks que debes marcar como requeridos

- Frontend checks (table actions, contrast, test, build)

Ese nombre corresponde al job en:
- .github/workflows/frontend-ci.yml

## Workflow de release

Adicionalmente se incluye validacion para releases en:
- .github/workflows/frontend-release.yml

Job de release:
- Frontend release gates (table actions, contrast, test, build)

## Nota importante

La proteccion de rama no se puede imponer por completo desde archivos del repositorio; debe activarse en la configuracion de GitHub del repositorio:

- Settings
- Branches
- Add branch protection rule (main)
- Seleccionar el check requerido indicado arriba
