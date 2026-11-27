---
name: qoyllur-ritmo-validador
description: Valida los cambios de Qoyllur Ritmo después de su implementación, buscando regresiones funcionales, visuales, responsive y de accesibilidad. Úsala antes de aprobar un lote de cambios o publicar.
---

# Skill: Validador de Qoyllur Ritmo

## Misión

Actúa como control de calidad independiente. Comprueba que los cambios autorizados funcionan y que no dañan otras partes de Qoyllur Ritmo. No implementes correcciones salvo que el usuario lo solicite expresamente.

## Preparación

1. Identifica el commit o diff que se va a validar.
2. Comprueba qué archivos cambiaron y compáralos con el objetivo aprobado.
3. Lee `references/auditoria-base.md` y `references/segunda-auditoria-codex.md` para conocer riesgos históricos y matices.
4. Confirma que la versión local corresponde a la versión que se quiere evaluar.
5. Si no puedes ejecutar la web, limita tus conclusiones a inspección estática.

## Matriz de validación

### Funcionalidad educativa
- Recorrer las seis lecciones existentes.
- Abrir/cerrar diálogo de lección.
- Verificar que las fuentes internas están completas y respaldan el contenido. No exigir listas bibliográficas visibles en lecciones, salvo que el usuario haya autorizado cambiar esa decisión.
- Completar preguntas y comprobar mapeo de respuesta correcta.
- Verificar que repetir o repasar no destruye la sesión de quiz.
- Comprobar asociación y trivia.
- Verificar puntos, racha, baterías y persistencia sin alterar reglas aprobadas; recordar que las lecciones ya iniciadas o completadas no vuelven a consumir batería.
- Probar el tutorial con objetivos fuera de pantalla y en móvil para comprobar la alineación del spotlight.
- Comprobar estados de tarjetas después de completar actividades.

### Navegación
- Recorrer todas las opciones del menú.
- Probar logo, enlaces, Atrás/Adelante, URL/hash si existe routing.
- Comprobar títulos y foco al cambiar de vista.
- Comprobar Liga y Progreso en escritorio y móvil.

### Responsive y visual
- Revisar 320, 390, 768, 1024 y 1440 px cuando sea posible.
- Comprobar topbar, sidebar, tarjetas, diálogos, carruseles y tutorial.
- Comparar con la referencia visual aprobada si está disponible.
- Verificar que los cambios no introducen colores, estilos o componentes ajenos a la identidad aprobada.
- No declarar fidelidad visual sin una comparación real.

### Accesibilidad
- Navegar solo con teclado.
- Comprobar orden de tabulación, foco visible y restauración de foco.
- Revisar etiquetas, landmarks, tabs, dialog y regiones live.
- Medir contraste de texto pequeño.
- Comprobar objetivos táctiles.
- Probar `prefers-reduced-motion`.
- Si están disponibles, usar axe-core y lectores de pantalla; identificar cuál se utilizó.

### Rendimiento y recursos
- Revisar carga de imágenes, dimensiones, lazy loading y prioridad del hero.
- Comprobar funcionamiento sin red y errores de recursos remotos.
- Si están disponibles, registrar Lighthouse LCP, CLS y TBT.
- No inferir métricas sin ejecutarlas.

## Registro de resultados

Cada caso debe tener:
- ID de prueba.
- Pasos.
- Resultado esperado.
- Resultado observado.
- Estado: aprobado / fallido / bloqueado / no probado.
- Evidencia.
- Severidad y posible regresión.

## Reglas de salida

- Distingue fallos confirmados de sospechas.
- No inventes resultados.
- No apruebes el lote si quedan fallos críticos relacionados con el objetivo.
- Informa limitaciones del entorno.
- No cambies el código; entrega hallazgos al implementador.
- Consulta `references/auditoria-base.md` para C-01…C-22 y T-01…T-12, y `references/segunda-auditoria-codex.md` para la segunda revisión y los matices confirmados por Codex.
