# Skills de Qoyllur Ritmo

Paquete de tres skills para agentes compatibles con Agent Skills, incluidos Claude y Codex.

## Contenido del paquete

- `qoyllur-ritmo-auditor/SKILL.md`: auditoría independiente basada en evidencia.
- `qoyllur-ritmo-implementador/SKILL.md`: implementación incremental de cambios autorizados.
- `qoyllur-ritmo-validador/SKILL.md`: validación posterior de código, interfaz, accesibilidad y regresiones.

Cada skill contiene ambas referencias históricas en su carpeta `references/`:

- `auditoria-base.md`: auditoría de Claude.
- `segunda-auditoria-codex.md`: revisión independiente de Codex y sus matices.

## Uso en Codex

Para habilitarlas solo en este proyecto, coloca las tres carpetas de skills bajo `.agents/skills/` en la raíz del repositorio. Para uso personal en varios repositorios, Codex admite skills en `$HOME/.agents/skills/`. Si una skill recién añadida no aparece, reinicia Codex.

Mantén cada carpeta de referencia junto a su `SKILL.md`. Antes de una auditoría o cambio, confirma la versión actual de los archivos del proyecto y vuelve a comprobar los hallazgos: las auditorías adjuntas son líneas base históricas, no prueba de que un problema siga vigente.

No permitas que dos agentes editen simultáneamente los mismos archivos. La decisión vigente es conservar las fuentes culturales internamente y no mostrar listas bibliográficas dentro de las lecciones. Las decisiones de producto requieren autorización.
