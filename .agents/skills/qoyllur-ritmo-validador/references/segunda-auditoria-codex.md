# Segunda auditoría: diagnóstico independiente de Codex

## Alcance declarado por Codex

Codex indicó que no modificó archivos ni instaló nada. Revisó el código actual y contrastó referencias de imágenes con sus páginas de procedencia. No abrió la plataforma en un navegador ni ejecutó pruebas de interfaz. Por ello separó lo comprobable por código de lo que requiere inspección visual.

Rutas y líneas indicadas por Codex corresponden a la copia local:
- `js/content.js`
- `js/script.js`
- `css/style.css`
- `imagenes/fuentes.md`

Las líneas pueden cambiar; volver a localizar los elementos por función, selector o contenido, no confiar ciegamente en números de línea.

## Hallazgos comparados

**C-01 — Respuesta correcta siempre en primera opción: confirmado**
- Codex confirmó seis preguntas de comprensión con `correct: 0` y ocho preguntas de trivia con `answer: 0`.
- Las opciones correctas aparecen primero.
- Recomendación: barajar conservando el vínculo entre opción y respuesta correcta; usar identificadores o un campo estable y mantener el orden durante cada pregunta para que no cambie en cada render.

**C-02 — Fuentes de lecciones no visibles: confirmado técnicamente, pero no autoriza cambio de producto**
- Las seis lecciones contienen `sources`.
- `renderLessonDialog` no las incluye en el HTML generado.
- Existe CSS `.source-list` sin uso desde esa función.
- Conflicto con una decisión previa del proyecto: las fuentes se mantienen internamente para verificar contenido y no se muestran como listas bibliográficas en las lecciones.
- Regla: NO implementar la visualización de fuentes sin autorización explícita. La ausencia de lista visible puede ser comportamiento intencional según la decisión previa. Se puede auditar la integridad interna de las fuentes sin mostrarlas.

**C-03 — Licencias y atribuciones: parcialmente confirmado**
- `fuentes.md` indica que las fotos de Lamas y Esuwa no tienen licencia abierta indicada.
- Codex observó que otras imágenes incluyen autor y licencia en el archivo.
- Codex citó como ejemplos páginas de Wikimedia Commons: foto de tijeras (CC0), Hatajo (CC BY-SA 4.0) y cajón. La existencia de una licencia debe comprobarse en la página específica y en la versión exacta del archivo utilizado.
- En lecciones el crédito enlaza a la fuente, pero no directamente a la licencia; en tarjetas de categoría el crédito es texto sin enlace.
- La página de Rumbos atribuye fotos a la Municipalidad Provincial de Lamas, pero no muestra licencia abierta.
- Regla: no afirmar que una imagen es libre solo porque está en internet. Confirmar archivo exacto, autor, licencia, requisitos de atribución y modificaciones. Una copia local no sustituye la licencia. No sustituir imágenes ni alterar créditos sin autorización y evidencia.

**C-04 — Pérdida de foco: confirmado en flujos de renderizado; comportamiento en navegador pendiente**
- `renderLessonDialog` reemplaza `#lesson-dialog-content` con `innerHTML` al seleccionar o comprobar respuesta.
- `renderQuizQuestion` reemplaza `#trivia-card` al elegir opción.
- Los botones enfocados se destruyen y el foco no se conserva automáticamente.
- No hubo prueba de navegador.
- Solución: restaurar el foco lógico apropiado o actualizar nodos sin destruirlos; probar teclado y lectores de pantalla.

**C-05 — Tipografía: parcialmente confirmado**
- CSS contiene textos de 7–10 px y créditos de 5–6 px en móvil.
- El tamaño reducido es comprobable por código; legibilidad real y contraste requieren medición visual.
- No imponer un mínimo universal de 12 px como solución automática. Priorizar lectura, controles y créditos; usar unidades escalables, comprobar contraste y zoom.

**C-06 — Pérdida de sesión de trivia al repasar: confirmado**
- El handler de “Repasar esta lección” borra `quizSession`, muestra introducción de trivia y abre la lección.
- La sesión activa se pierde.
- Solución técnica: preservar/pausar y reanudar la sesión de quiz. El costo de batería de iniciar una lección nueva es una regla aparte y requiere decisión si se desea modificar.

**C-07 — Cinco baterías y seis lecciones: parcialmente confirmado; decisión de producto**
- Plan Gratis tiene cinco baterías y hay seis lecciones.
- Cada lección nueva iniciada consume una batería; si no quedan, `openLesson` bloquea el acceso.
- Una lección ya iniciada o completada no vuelve a costar.
- Una cuenta Gratis nueva no puede iniciar las seis durante un único ciclo de recarga; podrá hacerlo después de la recarga de 24 horas.
- No tratarlo como bug técnico por defecto. Mostrar claramente saldo/costo es mejora UX; aumentar baterías, quitar el bloqueo o hacer el contenido básico ilimitado cambia el producto y requiere autorización.

## Problema adicional señalado por Codex: tutorial

- `positionTutorialSpotlight` usa `getBoundingClientRect()` y recorta la posición del foco a los límites de la ventana, pero no desplaza el objetivo al área visible (`scrollIntoView`).
- El tutorial activa `overflow: hidden` en el body.
- Un objetivo fuera de pantalla, especialmente en móvil, podría recibir un foco visual desalineado.
- Estado: sospecha fundada por lectura estática; requiere prueba visual en navegador y distintos tamaños.
- No cambiar el tutorial hasta reproducirlo y comprobar el flujo en móvil/escritorio.

## Evaluación de Codex sobre soluciones

- C-01: barajar con identificadores estables y orden fijo por pregunta.
- C-02: no mostrar fuentes sin autorización, por conflicto con decisión previa.
- C-03: sustituir o pedir permiso para imágenes sin licencia clara; enlazar licencia de CC y declarar modificaciones.
- C-04: restaurar el foco lógico correcto y probar accesibilidad.
- C-05: tamaños escalables y medición de contraste; 12 px no garantiza accesibilidad.
- C-06: pausar/reanudar trivia; no mezclar esto con el costo de batería.
- C-07: mostrar costo/saldo es mejora; cambiar el límite es decisión de producto.

## Conclusión conjunta Claude + Codex

Coincidencia fuerte:
- C-01, C-02 (solo existencia del problema técnico), C-04 y C-06.
- C-03 y C-05 son parciales y requieren más evidencia.
- C-07 es una limitación del modelo de energía y no debe modificarse sin decisión del usuario.
- El tutorial necesita validación visual antes de corregirse.

## Regla de decisión

Ningún agente debe interpretar el diagnóstico como autorización general para editar. Antes de cambiar:
1. comprobar el hallazgo en la versión actual;
2. identificar si es bug técnico, deuda técnica, pendiente de prueba o decisión de producto;
3. respetar decisiones previas del usuario;
4. proponer el cambio mínimo y sus efectos;
5. esperar aprobación cuando cambie comportamiento, contenido, licencias, navegación o diseño.
