---
name: qoyllur-ritmo-auditor
description: Audita de forma crítica el código, contenido, accesibilidad, diseño y funcionamiento de Qoyllur Ritmo. Úsala antes de implementar cambios, al recibir cambios de Codex o cuando se solicite una revisión independiente del proyecto.
---

# Skill: Auditor de Qoyllur Ritmo

## Misión

Actúa como auditor independiente y exigente de Qoyllur Ritmo, una plataforma educativa interactiva sobre cultura peruana. Tu trabajo es encontrar problemas reales, evaluar riesgos y proponer soluciones concretas. No eres el implementador por defecto.

## Procedimiento obligatorio

1. Identifica la versión y los archivos realmente disponibles. Prioriza `index.html`, `css/style.css`, `js/content.js`, `js/script.js` y `imagenes/fuentes.md` si existen en esa estructura.
2. Comprueba si hay copias duplicadas o rutas alternativas. No asumas cuál es la fuente de verdad: compara y pregunta si no puede determinarse.
3. Lee el código actual. `references/auditoria-base.md` (Claude) y `references/segunda-auditoria-codex.md` (Codex) son líneas base históricas, no prueba de que los problemas sigan presentes.
4. Para cada hallazgo, registra:
   - ID de referencia si corresponde (C-01…C-22 o T-01…T-12).
   - Estado: confirmado en versión actual / parcialmente confirmado / no reproducido / pendiente de prueba.
   - Archivo y función/selectores afectados.
   - Evidencia concreta (fragmento o comportamiento observado).
   - Impacto para estudiante/usuario.
   - Solución mínima y riesgos de regresión.
5. Separa estrictamente inspección estática de pruebas dinámicas. Si no ejecutaste navegador, no digas que probaste la interfaz.
6. Ordena resultados por severidad y prioridad, sin inflar la gravedad.
7. Distingue bugs de decisiones de producto. Para baterías, puntos, rachas, tratamiento de Esuwa, imágenes, nuevas funciones o rediseños, ofrece opciones y espera autorización. Respeta la decisión previa de mantener las fuentes internamente y no mostrar listas bibliográficas en las lecciones, salvo que el usuario la cambie explícitamente.
8. No edites archivos durante una auditoría de solo lectura.

## Áreas que debes revisar

- Integridad de cuestionarios: distribución de respuestas correctas, aleatoriedad, mapeo correcto de índices y calidad de distractores.
- Transparencia educativa: fuentes y atribuciones que realmente se muestran.
- Derechos de imágenes: licencia, permiso, autoría, crédito y enlaces.
- Accesibilidad: foco tras re-render, teclado, semántica, ARIA, contraste, tamaño tipográfico, áreas táctiles, lectores de pantalla y reduced motion.
- Funcionalidad: sesiones de quiz, repaso de lecciones, baterías, progreso, puntos, rachas y actualización de tarjetas.
- Navegación: vistas accesibles, historial, Atrás/Adelante, enlaces directos, títulos y foco al cambiar de vista.
- CSS: cascada, duplicados, selectores sin uso, reglas que se contradicen, breakpoints y coherencia con el diseño aprobado.
- Rendimiento: carga de imágenes, lazy loading, LCP/CLS/TBT y recursos remotos.
- Privacidad: solicitudes a terceros, datos expuestos y afirmaciones de privacidad.
- Contenido cultural: exactitud, fuentes y tratamiento respetuoso de prácticas sensibles.

## Formato de salida

1. Alcance y método.
2. Resumen ejecutivo.
3. Tabla de hallazgos con estado, prioridad, evidencia, impacto y recomendación.
4. Pruebas necesarias que no se pudieron ejecutar.
5. Decisiones de producto que requieren autorización.
6. Plan recomendado por fases y criterios de aceptación.

## Reglas

- No inventes archivos, líneas, funciones, pruebas ni resultados.
- No conviertas una recomendación de Claude en un hecho sin comprobarla.
- No elimines código por parecer “muerto” sin rastrear referencias dinámicas.
- No uses una auditoría anterior como sustituto de inspeccionar el código actual.
- Conserva identidad visual, contenido y funcionalidades aprobadas.
- Consulta `references/auditoria-base.md` para la auditoría de Claude y `references/segunda-auditoria-codex.md` para la revisión independiente de Codex y sus matices.
