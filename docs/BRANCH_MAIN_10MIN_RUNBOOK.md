# Runbook 10 minutos: Migracion de master a main (Onboarding)

Objetivo: dejar el repositorio operando en main con protecciones y CI activos.
Duracion estimada: 10 minutos.

## Minuto 0 a 1: Verificaciones rapidas
- Tener permisos de admin en el repo.
- Confirmar que existe la rama main en remoto.

Comandos de chequeo:
    git branch -a -vv
    git remote -v

## Minuto 1 a 3: Crear o publicar main (si falta)
Si estas en master y quieres migrar:
    git branch -m master main
    git push -u origin main

Si main ya existe, solo cambia a main:
    git checkout main

## Minuto 3 a 5: Cambiar rama por defecto en GitHub
- Ir a Settings > Branches.
- Cambiar Default branch a main.
- Guardar.

Resultado esperado:
- PRs nuevos apuntan por defecto a main.

## Minuto 5 a 7: Branch Protection en main
- Ir a Settings > Branches > Branch protection rules.
- Crear o ajustar regla para main con:
  - Require pull request before merging
  - Require approvals
  - Require status checks to pass
  - Require branches to be up to date
  - Require conversation resolution
  - Include administrators (segun politica)

Resultado esperado:
- No se puede mergear directo sin cumplir validaciones.

## Minuto 7 a 8: Validar CI/CD
Revisar workflows para main.
Ejemplo esperado en Actions:
    on:
      push:
        branches: [main]
      pull_request:
        branches: [main]

Resultado esperado:
- Checks corren para PRs hacia main.

## Minuto 8 a 9: Prueba real
- Crear rama de prueba.
- Abrir PR a main.
- Confirmar que bloquea merge sin approvals/checks.

Resultado esperado:
- Gobernanza de merge activa y funcional.

## Minuto 9 a 10: Retiro de master (opcional, recomendado)
Solo cuando todo este validado:
    git push origin --delete master
    git fetch -p

## Checklist de cierre
- Default branch = main.
- Protecciones activas en main.
- CI requerido activo en PRs a main.
- Equipo notificado del cambio.

## Mensaje corto para onboarding
Desde hoy la rama principal es main. Toda rama nueva debe crearse desde main y todos los pull requests deben apuntar a main. No usar master para trabajo nuevo.
