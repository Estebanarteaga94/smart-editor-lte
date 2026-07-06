# Instructions - Sesiones de agentes

Estas instrucciones son obligatorias para cualquier agente que trabaje en este proyecto. El objetivo es avanzar de forma continua, medible y verificable sin perder el alcance definido en `plan_editor_wysiwyg_vite_ts.md`.

## Archivos que se deben leer al iniciar cada sesion

1. `context.md`
2. `tasks.md`
3. `worklog.md`
4. `plan_editor_wysiwyg_vite_ts.md` cuando una tarea necesite detalle tecnico del plan original.

No empezar a editar codigo sin revisar al menos `context.md`, `tasks.md` y `worklog.md`.

## Como elegir la siguiente tarea

- Buscar en `tasks.md` la primera tarea pendiente `[ ]` de la fase activa.
- Si una fase tiene dependencias sin terminar, resolver primero la dependencia.
- Si el usuario dice `continua`, retomar automaticamente la primera tarea pendiente y registrar la decision en `worklog.md`.
- No saltar a funciones avanzadas si el MVP aun no compila, no guarda o no recupera contenido.
- Si una tarea esta demasiado grande para cerrarse con evidencia clara, dividirla en subtareas antes de implementarla.

## Reglas de implementacion

- Respetar la arquitectura planteada:
  - Vite + TypeScript.
  - Tiptap como motor WYSIWYG.
  - ProseMirror JSON como formato canonico.
  - CodeMirror para HTML/JSON.
  - DOMPurify para sanitizacion.
- No construir el editor con `contenteditable` puro.
- No guardar HTML como unica fuente de verdad.
- No renderizar HTML de usuario sin sanitizar.
- No confiar en validaciones de frontend para seguridad final de archivos; el backend tambien debe validar.
- Mantener cambios pequenos y alineados con la tarea activa.
- Preferir servicios y utilidades reutilizables antes que logica duplicada en componentes.
- Mantener nombres de archivos y carpetas cercanos al plan original salvo que exista una razon tecnica clara.
- Usar TypeScript estricto y evitar `any` salvo justificacion concreta.
- Si se usa `unknown`, convertirlo o validarlo antes de operar sobre el dato.
- Mantener el codigo legible, con comentarios solo donde una decision no sea obvia.

## Reglas de UI

- La primera pantalla debe ser el editor utilizable, no una landing page.
- La toolbar debe ejecutar comandos del editor, no manipular DOM manualmente.
- Los controles deben tener estado activo, disabled cuando aplique y `aria-label`.
- La barra de estado debe informar guardado, error y cambios pendientes.
- La UI debe funcionar en escritorio y movil.
- Evitar solapamientos de texto, botones o paneles.
- Mantener medidas estables para toolbar, area editable, preview y fullscreen.

## Reglas de persistencia

- Guardar siempre:
  - `title`
  - `contentJson`
  - `contentHtml`
- `contentJson` es la fuente canonica.
- `contentHtml` es salida renderizable y debe estar sanitizada.
- Mientras no exista backend real, se permite persistencia local o mock documentado.
- Los errores de guardado no deben borrar el contenido actual del usuario.
- Autosave no reemplaza el guardado manual; ambos deben poder coexistir.

## Reglas de seguridad

- Usar DOMPurify para sanitizar HTML.
- Bloquear scripts, eventos inline y protocolos inseguros.
- Validar links antes de crearlos o persistirlos.
- Validar imagenes por MIME y tamano en frontend.
- Documentar que el backend debe validar MIME real y procesar metadata sensible.
- Cualquier uso de `innerHTML` debe estar cerca de una llamada clara a `sanitizeHtml`.

## Verificacion obligatoria antes de cerrar una tarea

Segun el tipo de cambio, ejecutar lo que aplique:

- `npm run build`
- `npm run lint`
- `npm run format`
- `npm test`
- `npm run check`
- `npm run test:e2e`
- Prueba manual en navegador con `npm run dev`

Si un comando no existe todavia, crear la tarea correspondiente o registrar en `worklog.md` por que no se ejecuto.

## Como actualizar `tasks.md`

- Marcar `[x]` solo cuando el criterio de verificacion este cumplido.
- No marcar tareas por intencion o avance parcial.
- Si se completa una tarea mediante una solucion diferente al plan, agregar una nota breve bajo la tarea.
- Si aparece una tarea nueva necesaria para cerrar una fase, agregarla donde corresponda.
- Si algo se decide postergar, dejarlo como `[ ]` con nota de bloqueo o moverlo a fase opcional.

## Como actualizar `worklog.md`

Al final de cada sesion o bloque de trabajo, agregar una entrada con:

- Fecha.
- Objetivo trabajado.
- Tareas completadas.
- Archivos modificados.
- Verificacion ejecutada.
- Pendientes inmediatos.
- Bloqueos o decisiones tomadas.

La bitacora debe permitir que otro agente continue sin preguntar que paso.

## Reglas de Git

- Cada vez que se complete una o varias tareas verificadas, evaluar si corresponde crear un commit.
- Realizar un commit cuando el conjunto de cambios tenga un cierre claro, verificable y coherente.
- No mezclar en el mismo commit tareas no relacionadas si pueden separarse de forma limpia.
- Registrar en `worklog.md` si se crea el commit o si se decide no hacerlo, indicando brevemente la razon.

## Que puede hacer el agente por si solo

- Crear estructura de carpetas y archivos definida en el plan.
- Instalar dependencias necesarias del stack aprobado.
- Crear modelos, servicios, componentes y utilidades del roadmap.
- Agregar pruebas unitarias, integracion y E2E.
- Corregir errores de build, TypeScript y pruebas.
- Actualizar `tasks.md` y `worklog.md` con avances reales.
- Usar persistencia local temporal si el backend no existe, siempre que quede claro.
- Dividir tareas grandes en subtareas medibles.

## Cuando debe pedir confirmacion

- Antes de cambiar el stack tecnico principal.
- Antes de eliminar alcance funcional del plan.
- Antes de introducir un backend real con tecnologia no definida por el usuario.
- Antes de borrar archivos o reestructurar masivamente sin necesidad.
- Cuando existan dos decisiones de producto incompatibles y el plan no permita inferir una respuesta segura.

## Orden recomendado de trabajo

1. Crear base Vite + TypeScript.
2. Montar Tiptap basico.
3. Crear toolbar minima.
4. Guardar JSON/HTML localmente.
5. Implementar servicio de persistencia.
6. Agregar formato avanzado.
7. Agregar tablas.
8. Agregar imagenes.
9. Agregar CodeMirror.
10. Agregar sanitizacion completa.
11. Agregar preview y fullscreen.
12. Agregar autosave.
13. Agregar versionado.
14. Agregar pruebas.

## Formato de cierre de sesion recomendado

Responder al usuario con:

- Que se completo.
- Que archivos se modificaron.
- Que validacion se ejecuto.
- Cual es la siguiente tarea pendiente.

Mantener la respuesta breve y concreta.
