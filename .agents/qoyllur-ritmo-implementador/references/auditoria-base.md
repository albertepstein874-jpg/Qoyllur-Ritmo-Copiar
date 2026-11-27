# Base de auditoría de Qoyllur Ritmo

## Alcance y límites de la evaluación original

La auditoría de Claude fue estática. Revisó `index.html`, `css/style.css`, `js/content.js`, `js/script.js` y `fuentes.md`. No ejecutó la aplicación ni la probó en un navegador.

La auditoría indicó que los archivos llegaban duplicados, con entre 2 y 4 copias aparentemente idénticas. No realizó diff. Asumió `css/` y `js/` como fuente de verdad y recomendó que Codex lo confirme.

En esta referencia:
- **Comprobado en la auditoría**: conclusión que Claude dijo poder deducir leyendo el código. La IA que use esta skill debe volver a comprobarla en la versión actual antes de editar.
- **Pendiente de prueba**: requiere navegador, dispositivos, red, lector de pantalla u otra comprobación dinámica.
- No afirmar que se ejecutaron pruebas si no se ejecutaron.
- No asumir que los hallazgos siguen vigentes si los archivos han cambiado.

## Veredicto general de Claude

La base fue considerada razonable por contar con estado persistente validado, `<dialog>` nativo, `escapeHtml`, `rel="noopener"`, foco visible, skip-link y soporte CSS para `prefers-reduced-motion`.

Claude señaló cuatro áreas de fondo:
1. Integridad educativa: la respuesta correcta aparece siempre en la opción A y las fuentes no se muestran.
2. Licencias y atribuciones de imágenes.
3. Accesibilidad: texto muy pequeño y pérdida de foco al volver a renderizar.
4. CSS acumulado en capas contradictorias.

---

## A. Hallazgos que Claude clasificó como comprobados

### Críticos y altos

**C-01 — Crítico — Respuesta correcta siempre A**
- En `content.js`, las 8 preguntas de trivia tienen `answer: 0` y las 6 preguntas de lección tienen `correct: 0`.
- El render no baraja las opciones.
- Claude observó que las respuestas correctas suelen ser también las más largas.
- Solución sugerida: barajar opciones al renderizar y mantener correctamente mapeado el índice de la respuesta correcta. Revisar también la calidad de los distractores.

**C-02 — Alto — Las fuentes de las lecciones no se muestran**
- Cada lección tiene `sources[]` con `supports`.
- CSS contiene `.source-list`.
- `renderLessonDialog` no renderiza esas fuentes.
- Solución: incluir una sección “Fuentes” en el diálogo, con enlaces y explicación de qué respalda cada fuente.

**C-03 — Alto — Licencia incierta y atribución incompleta de imágenes**
- `fuentes.md` reconoce que fotos de Rumbos del Perú y UNESCO no tienen licencia abierta.
- La foto de Rumbos se usa en `lessons[0]` de Danzas, portada del área, tarjeta de inicio y recomendación.
- Las portadas de área no muestran crédito.
- Créditos de tarjetas aparecen en 5–6 px (`.home-flag-credit`, `.category-photo-credit`).
- La etiqueta “Foto ↗” de las tarjetas no es un enlace.
- Solución: sustituir imágenes sin licencia compatible o conseguir permiso; mostrar autor, licencia, enlace y cambios realizados; mantener una sección de créditos.

**C-04 — Alto — Se pierde el foco al re-renderizar**
- `renderQuizQuestion`, `renderLessonDialog`, `renderAssociation` y `renderAreaViews` reemplazan `innerHTML`.
- Con teclado, al elegir una opción el botón enfocado se destruye y el foco puede volver al inicio del documento.
- `#trivia-card` usa `aria-live` en toda la tarjeta, lo que puede provocar que el lector de pantalla relea demasiado contenido.
- Solución sugerida: actualizar clases/atributos sin reconstruir o restaurar el foco después del render; usar una región `aria-live` pequeña para feedback.

**C-05 — Alto — Tipografía demasiado pequeña**
- Se identificaron textos de 5, 6, 7, 8 y 9 px en créditos, metadatos, estados y cuerpo de lección.
- El cuerpo de lección está en 9–10 px y algunos botones en 8–9 px.
- `DM Sans` y `Space Grotesk` están declaradas pero no se cargan.
- Solución: escala tipográfica en `rem`; Claude sugirió mínimo de 12 px para metadatos y 16 px para lectura; cargar las fuentes con `@font-face`, preferiblemente autoalojadas. Verificar contraste y legibilidad en contexto.

**C-06 — Alto — “Repasar esta lección” puede destruir el progreso del quiz**
- El handler pone `quizSession = null` y abre la lección.
- Si la lección no se había iniciado, puede gastar una batería o mostrar “Te faltan baterías”, y el quiz ya se perdió.
- Solución: abrir el repaso sin descartar la sesión del quiz ni cobrar batería.

**C-07 — Alto — La mecánica de baterías puede bloquear el acceso al contenido**
- Hay 5 baterías y 6 lecciones.
- La recarga llega 24 horas después del primer uso.
- El botón de anuncio no hace nada.
- En móvil, el botón “?” de baterías está oculto por CSS (`.battery-pill .icon-button { display:none }` en ≤650 px), por lo que tampoco se explica la regla.
- Solución sugerida: decisión de producto; como mínimo, asegurar que las seis lecciones sean accesibles y que el estado sin energía tenga una salida clara. No implementar monetización, anuncios ni compras sin autorización explícita.

### Medios

**C-08 — Navegación “Explorar” y ruta huérfanas**
- `view-explorar` solo se alcanza desde resultado del quiz y “Repasar”.
- “Ver mi ruta →” en la barra lateral lleva a Inicio, donde la ruta ya no aparece.
- Mapa de aprendizaje y filtros no son accesibles desde el menú.

**C-09 — CSS por capas contradictorias**
- Se detectaron varios rediseños acumulados.
- `.home-welcome`, `.sidebar`, `.topbar` y `.streak-pill` se definen varias veces.
- El último bloque define `.category-grid` con `grid-template-columns`, pero un bloque anterior mantiene `display:flex`; las columnas y un media query de 1100 px no tienen efecto.
- `.category-danzas` y `.category-musica` no se emiten; JS genera `category-clay` y `category-blue`, por lo que algunas reglas son código muerto.
- `.category-card.category-clay` gana por cascada sobre `.category-theme-danzas`, dejando Danzas marrón.
- `.category-coming-soon` pierde su borde punteado por una regla posterior.
- Se mezclan paletas: rojo/dorado en menú y turquesa/violeta/rosa en botones, quiz y diálogo.
- Solución: definir un único sistema de diseño, consolidar tokens y eliminar reglas muertas solo después de comprobar dependencias.

**C-10 — CSS sin uso**
- Quedan reglas de componentes que ya no aparecen en HTML, entre ellas `.hero-card`, `.home-feature`, `.quiz-promo`, `.home-challenge`, `.route-preview`, `.today-chip`, `.welcome-row`, `.future-area-grid`, `.home-welcome-mark`, `.trivia-start-actions` (JS usa `quiz-start-actions`) y otras.
- Verificar antes de borrar: selectores dinámicos pueden generarse desde JS.

**C-11 — Textos que no coinciden con la lógica**
- “Cada visita cuenta” no es exacto: solo cuentan lecciones completadas, asociación y quiz.
- Repetir una actividad el mismo día da 0 puntos por deduplicación por fecha e id y conserva los puntos de la primera vez.
- Con 0/8 en el primer intento aparece “¡Nuevo récord personal!”.
- “Cada respuesta suma!” carece del signo de apertura.
- Solución: alinear el texto con la lógica real o cambiar la lógica con autorización.

**C-12 — Tarjetas desactualizadas tras abrir una lección**
- `openLesson` y el cierre del diálogo no llaman a `renderAreaViews()`.
- La batería baja, pero la tarjeta puede seguir mostrando “Por descubrir” hasta volver a navegar.

**C-13 — Carga de imágenes y rendimiento**
- `renderFutureArea` para cuatro áreas futuras y `renderAreaViews` crean `<img>` sin `loading="lazy"`; cargan aunque la vista tenga `hidden`.
- Hero asignado por JS no es detectado por escáner de precarga, lo que puede retrasar LCP.
- La bandera del hero tiene `loading="lazy"` aunque está visible.
- `preconnect` apunta a `commons.wikimedia.org`, pero los bytes vienen de `upload.wikimedia.org`.
- Solución: carga diferida para imágenes fuera de pantalla, prioridad adecuada para hero visible y optimización responsable.

**C-14 — ARIA y estructura**
- `aria-label` en `div` y `span` genéricos puede ignorarse o estar desaconsejado; fechas ISO no son legibles para lector de pantalla.
- Pestañas sin tabindex itinerante.
- `tabpanel` no enfocable.
- Destino del skip-link (`<main>`) sin `tabindex="-1"`.
- `aria-labelledby="home-title"` duplicado.
- Tres elementos con `aria-current` para Inicio.
- `<aside aria-label>` contiene `<nav>` con otra etiqueta.
- `<footer>` dentro de `<main>`.
- Corregir con semántica adecuada, sin añadir ARIA innecesaria.

**C-15 — Reduced motion no respetado completamente por JS**
- `scrollTo({behavior:'smooth'})` y `scrollIntoView` pueden anular el `scroll-behavior:auto` del CSS.
- Respetar `prefers-reduced-motion` también desde JavaScript.

**C-16 — Promesas de contenido no implementadas**
- La lección de Marinera dice “Mirar el mapa y escuchar ejemplos”, pero no hay mapa ni audio.
- No hay audio ni video en la aplicación.
- Solución: cambiar el texto para reflejar lo que existe o añadir recursos verificados y con derechos adecuados.

**C-17 — Sin routing**
- No hay URL por vista; el botón Atrás no sirve y no se puede enlazar a una lección.
- `document.title` no cambia.
- El logo usa `href="#inicio"` sin `preventDefault`, lo que modifica historial.
- Solución sugerida: routing por hash o History API, título dinámico, foco al encabezado al cambiar de vista y comportamiento correcto de Atrás/Adelante.

**C-18 — Objetivos táctiles pequeños**
- `.icon-button` mide 19 px y `.lesson-open` alrededor de 24 px.
- Hay dos paradas de tabulación por tarjeta para la misma acción (imagen y botón).
- Solución: ampliar áreas táctiles y evitar acciones duplicadas en el orden de tabulación.

### Bajos

**C-19 — Deuda de código**
- Se asignan IDs que no existen: `home-league-points` y `home-league-days`.
- `renderRoute` compacto y variable `layer` no se usan.
- Totales 6, 3 y /8 están escritos a mano.
- Reto relámpago usa índices fijos `trivia[1]`, `[4]`, `[6]`.
- `reconcileEnergy` guarda estado dentro de una función de render.
- Cadena de `if` del handler global depende del orden.
- Verificar cada elemento en la versión actual antes de tocarlo.

**C-20 — Renders duplicados**
- `closeLesson()` y evento `close` del diálogo llaman a los mismos renders dos veces.
- `renderHome` reconstruye carrusel y reinicia su scroll horizontal.

**C-21 — Privacidad y seguridad menor**
- Handlers `onerror` en línea dificultan una CSP estricta.
- Imágenes remotas no llevan `referrerpolicy`.
- Aviso “no se recopilan datos” no contempla que las solicitudes a Wikimedia, UNESCO y Rumbos exponen IP y referer a esos servidores.
- Baterías y planes son manipulables desde cliente; aceptable para demo, pero no presentarlo como sistema seguro.
- No introducir analítica, cuentas ni transmisión de datos sin decisión explícita.

**C-22 — Ausencia de favicon, noscript y metadatos sociales**
- Sin JS la home queda vacía.
- Considerar favicon, `<noscript>` y metadatos sociales; no son prioridad sobre los bloqueantes.

---

## B. Puntos que Claude marcó como pendientes de pruebas

**T-01 — Sidebar entre 651 y 900 px:** posible recorte del logo y desbordamiento de iconos por reglas posteriores que anulan media queries.

**T-02 — Botón de cierre del diálogo:** está después de `.dialog-scroll`, con `float`, `sticky` y margen negativo; comprobar con contenido largo. Escape y clic en fondo fueron considerados funcionales según lectura del código, pero probarlos.

**T-03 — Logo y menú activo:** posible rectángulo con degradado tras el logo; estilo activo más tenue de lo previsto. Revisar visualmente.

**T-04 — Topbar entre 320 y 390 px:** posible desbordamiento de cuatro píldoras y botón de menú.

**T-05 — Imágenes remotas:** verificar miniaturas Wikimedia, errores/429, protección anti-hotlink de Rumbos, estabilidad de URL UNESCO con `?t=`, y funcionamiento sin red.

**T-06 — Glifos Unicode y emojis:** comprobar consistencia en Windows y Android; algunos iconos se repiten semánticamente.

**T-07 — Tutorial:** comprobar foco circular sobre elementos rectangulares/grandes, restauración del foco, compatibilidad de `inert` y sidebar en móvil.

**T-08 — Fuentes y contenido:** tres declaratorias usan `consulta.jsp?pagina=24`, una página de listado frágil. Verificar enlaces de gob.pe, Andina y geoportal. Alinear la afirmación sobre marinera del norte con las fuentes listadas, que según la auditoría mencionan Lamas, Cusco, Arequipa, Puno, Ayacucho y Lima.

**T-09 — Contraste y foco:** medir `--dim` (`#747a8b`) con texto pequeño; comprobar si outline de 3 px queda recortado en carrusel con `overflow-x:auto`.

**T-10 — `.image-missing`:** posible solapamiento entre `display:grid` y pseudo-elemento “Fotografía no disponible”.

**T-11 — Métricas:** medir Lighthouse (LCP, CLS, TBT), cobertura de CSS sin uso y peso de imágenes remotas.

**T-12 — Lectores de pantalla:** probar NVDA y VoiceOver en quiz, diálogo y asociación.

---

## C. Recomendaciones generales de Claude

### Arquitectura
- Dividir CSS en tokens, base, layout y componentes.
- Usar `@layer`, `clamp()`, `rem` y un único sistema de color.
- Considerar módulos JS separados para estado, vistas, router y accesibilidad.
- Sustituir handler global complejo por manejadores por componente.
- Derivar totales de los datos en vez de escribirlos manualmente.

### Imágenes
- Autoalojar copias optimizadas WebP/AVIF, con `srcset`, `width` y `height`.
- Usar un `credits.json` para alimentar créditos visibles y `fuentes.md`.
- Respetar licencias y permisos; no asumir que una imagen puede reutilizarse porque es visible en internet.

### Contenido
- Añadir audio/video solo con licencia adecuada o enlazados a fuentes oficiales.
- Variar tipos de pregunta y calidad de distractores.
- Registrar errores por pregunta para repaso dirigido.
- Revisar sensibilidad cultural de Esuwa, descrita en la auditoría como práctica sagrada; valorar no asignarle puntuación ni feedback lúdico como “¡Qué buen oído!”.

### Áreas futuras
- Mostrar un estado “Próximamente” claro y único en vez de múltiples paneles vacíos.

### Navegación
- Routing por hash o History API.
- Título dinámico.
- Foco en `<h1>` al cambiar de vista.
- Dar acceso a Liga y Progreso en navegación móvil.

### Calidad
- Playwright para flujos: completar lección, quiz, reinicio y baterías.
- axe-core, Lighthouse CI, ESLint, Stylelint y validación HTML.

### Mecánica de energía
- Considerar que limitar acceso al contenido cultural por energía es una decisión de producto discutible.
- Evaluar gamificar actividades extra en vez de bloquear lectura básica.
- No implementar anuncios, compras, suscripciones ni monetización sin autorización explícita.

---

## D. Orden de trabajo sugerido por Claude

**Fase 0 — Línea base**
- Confirmar archivos fuente de verdad y resolver duplicados con comparación, sin borrado automático.
- Capturar línea base con Lighthouse, axe y capturas a 320, 390, 768, 1024 y 1440 px.

**Fase 1 — Bloqueantes**
- C-01 a C-07.
- Criterios de aceptación sugeridos por Claude:
  - La respuesta correcta no está siempre en A.
  - Cada lección muestra sus fuentes.
  - Cada imagen tiene licencia/permiso válido y crédito legible.
  - El teclado conserva foco durante un quiz completo.
  - Ningún texto queda por debajo de 12 px.
- Revisar la propuesta de mínimo 12 px para metadatos frente a diseño, sin sacrificar legibilidad.

**Fase 2 — Consistencia y navegación**
- C-09, C-10, T-01 a T-03.
- Reparar C-08 y C-17.
- Resolver C-12, C-13 y C-14.

**Fase 3 — Mejoras avanzadas**
- Imágenes autoalojadas optimizadas.
- Audio/video con derechos adecuados.
- Suite de pruebas automatizadas.

## E. Decisiones de producto que requieren autorización

No cambiar unilateralmente:
- Identidad visual aprobada y estructura general de navegación.
- Sistema de puntos, rachas, baterías y reglas de progreso.
- Si el contenido básico queda bloqueado por baterías.
- Si Esuwa se evalúa con puntos o se presenta de forma contemplativa.
- Sustitución de imágenes y elección de nuevas fuentes.
- Añadir audio, video, cuentas, anuncios, compras, analítica o backend.
- Convertir áreas futuras en un único estado “Próximamente”.
- Cambios de arquitectura grandes (módulos, router, reestructuración de carpetas).

La IA debe proponer alternativas, explicar consecuencias y esperar aprobación para decisiones de producto.
