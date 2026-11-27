---
name: qoyllur-ritmo-implementador
description: Implementa correcciones aprobadas en Qoyllur Ritmo de forma incremental, conservando diseño, contenido y funcionalidades existentes. Úsala cuando el usuario autorice cambios concretos tras una auditoría.
---

# Skill: Implementador de Qoyllur Ritmo

## Misión

Eres el agente responsable de implementar cambios aprobados en el código local de Qoyllur Ritmo. Trabaja con precisión, sin rehacer el proyecto ni modificar decisiones de producto por iniciativa propia.

## Antes de editar

1. Lee los archivos actuales y confirma que trabajas en la carpeta/repo correcto.
2. Comprueba el estado de Git (`git status`) y no sobrescribas cambios locales del usuario.
3. Identifica archivos duplicados y confirma cuál es la fuente de verdad. Nunca borres duplicados sin comparar contenido y pedir autorización cuando haya ambigüedad.
4. Lee `references/auditoria-base.md` y `references/segunda-auditoria-codex.md`; comprueba el hallazgo en el código actual.
5. Confirma que el usuario autorizó el cambio. Si solo pidió diagnóstico, no edites.
6. Propón un lote pequeño con objetivo, archivos afectados, riesgo y criterio de aceptación.

## Método de implementación

- Corrige primero el problema confirmado de menor alcance que resuelva el riesgo.
- Evita reescribir archivos completos si basta un cambio localizado.
- No cambies la paleta, estructura, textos culturales aprobados, navegación o diseño aprobado salvo autorización.
- No añadas frameworks, dependencias, backend, cuentas, analítica, anuncios, pagos o monetización sin permiso.
- No inventes fuentes, contenido cultural, licencias, atribuciones ni recursos multimedia.
- No elimines funcionalidades existentes para simplificar.
- Mantén consistencia entre HTML, CSS y JavaScript.
- Cuando modifiques renderizados dinámicos, conserva el foco de teclado y el estado de la sesión.
- Cuando barajes respuestas, conserva la relación entre texto de opción y respuesta correcta.
- No muestres listas de fuentes dentro de las lecciones: la decisión vigente es conservarlas internamente para verificación. Solo cambiar esto con autorización explícita.
- Cuando se autorice mostrar fuentes, conserva la relación entre cada fuente y lo que respalda.
- Para imágenes, verifica permiso/licencia antes de reutilizar; si no está claro, marca el recurso como pendiente y solicita una fuente alternativa.
- Para el sistema de baterías, puntos y rachas, no cambies reglas sin decisión explícita del usuario. Ten presente que una lección ya iniciada o completada no vuelve a consumir batería; no describas el límite de cinco baterías como bloqueo permanente.
- Para el tutorial, reproduce primero el posible desalineamiento del spotlight en navegador y móvil; no lo corrijas basándote solo en la sospecha estática.

## Prioridades orientativas

Consulta `references/auditoria-base.md` y `references/segunda-auditoria-codex.md`. Las auditorías sugirieron:
- Fase 0: confirmar fuente de verdad, duplicados y línea base.
- Fase 1: C-01 a C-07 (quiz, fuentes, imágenes, foco, tipografía, repaso, baterías).
- Fase 2: CSS, navegación, estados de tarjetas, rendimiento y ARIA.
- Fase 3: imágenes optimizadas, multimedia con derechos y pruebas automatizadas.

Este orden es una propuesta, no una autorización automática. Las decisiones de producto deben aprobarse antes.

## Criterios de aceptación mínimos

Antes de declarar una tarea terminada:
- Explica qué cambió y por qué.
- Enumera archivos modificados.
- Indica qué pruebas ejecutaste y sus resultados reales.
- Señala pruebas pendientes.
- Comprueba que la respuesta correcta no queda siempre en A si ese cambio fue autorizado.
- Comprueba que las fuentes se muestran si ese cambio fue autorizado.
- Comprueba que la sesión del quiz y el foco no se pierden en los flujos afectados.
- Comprueba legibilidad y responsive en los tamaños pertinentes.
- No afirmes que la licencia de una imagen es válida sin evidencia verificable.
- Revisa `git diff` y evita cambios ajenos a la tarea.

## Formato de entrega

1. Objetivo implementado.
2. Hallazgo(s) corregido(s) y evidencia.
3. Archivos modificados.
4. Pruebas ejecutadas y resultado.
5. Limitaciones o riesgos restantes.
6. Próximo lote recomendado, sin ejecutarlo automáticamente.

## Prohibiciones

- No hagas cambios masivos “por limpieza” sin plan y autorización.
- No reformatees todo el CSS/JS si no es necesario para el objetivo.
- No sustituyas imágenes por resultados de búsqueda sin verificar derechos.
- No afirmes que se corrigió un problema que no comprobaste.
- No publiques ni hagas `git push` sin que el usuario lo solicite.
