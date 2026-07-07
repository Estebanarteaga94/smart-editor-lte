# Tasks - Editor WYSIWYG Vite + TypeScript vanilla-ts

Este archivo convierte el plan de `plan_editor_wysiwyg_vite_ts.md` en tareas cumplibles, medibles y verificables. El proyecto base es Vite + TypeScript con plantilla `vanilla-ts`: no se usa React, Vue, Angular, Svelte ni otro framework frontend en la primera version.

En este documento, "componente" significa modulo TypeScript que crea, monta, actualiza y destruye nodos DOM manualmente.

Cada tarea debe cerrarse solo cuando su criterio de verificacion este cumplido y registrado en `worklog.md`.

Convencion:

- `[ ]` pendiente.
- `[x]` completada.
- Una tarea completada debe tener evidencia: archivo creado/modificado, comando ejecutado, prueba manual o prueba automatizada.
- Si una tarea se divide durante la implementacion, agregar subtareas antes de marcarla como terminada.
- Si una tarea completada cambia de criterio por una decision tecnica posterior, agregar una nota bajo la tarea y crear una tarea pendiente de ajuste cuando aplique.

## Definicion de hecho

Una tarea puede marcarse como completada solo si:

- cumple su criterio de verificacion;
- tiene evidencia registrada en `worklog.md`;
- no rompe `npm run build` cuando afecta codigo o configuracion;
- no rompe `npm run lint` si ya esta configurado;
- incluye o actualiza pruebas cuando aplica, o registra una justificacion si no aplica;
- actualiza documentacion operativa cuando cambia arquitectura, contratos o decisiones tecnicas;
- si completa una o varias tareas verificadas, evalua si corresponde crear commit y registra la decision.

## Fase 0 - Preparacion y documentacion operativa

- [x] Leer y analizar `plan_editor_wysiwyg_vite_ts.md`.
  - Verificacion: el alcance funcional, arquitectura, dependencias, roadmap, pruebas y criterios de aceptacion quedaron reflejados en este archivo.
- [x] Crear `tasks.md` con fases, tareas medibles y checkboxes `[ ]` / `[x]`.
  - Verificacion: el archivo existe en la raiz y cubre MVP, formato avanzado, tablas, imagenes, codigo, preview, fullscreen, autosave, versionado, seguridad y pruebas.
- [x] Crear `instructions.md` con reglas de trabajo para agentes por sesion.
  - Verificacion: el archivo existe y explica como retomar tareas, editar, validar y registrar avances.
- [x] Crear `context.md` con contexto tecnico y decisiones del proyecto.
  - Verificacion: el archivo existe y resume objetivo, stack, arquitectura, modelo canonico y alcance por fases.
- [x] Crear `worklog.md` como bitacora de avances.
  - Verificacion: el archivo existe y contiene la entrada inicial de preparacion.

## Fase 0.1 - Calidad de codigo, linting y formato

Objetivo medible: el proyecto tiene una base consistente de calidad, formato y comandos de verificacion antes de crecer en funcionalidades.

> Dependencia: esta fase debe quedar completa antes de declarar estable el MVP.

- [x] Configurar ESLint.
  - Criterio: existe configuracion ESLint compatible con Vite + TypeScript `vanilla-ts`, y `npm run lint` detecta errores TypeScript, imports sin uso y variables sin uso.
- [x] Configurar Prettier.
  - Criterio: existe configuracion Prettier y `npm run format` aplica formato consistente sin alterar contratos funcionales.
- [x] Configurar `.editorconfig`.
  - Criterio: el repositorio define indentacion, charset, saltos de linea y trim de espacios finales.
- [x] Agregar script `lint`.
  - Criterio: `npm run lint` ejecuta ESLint sobre `src` y archivos de configuracion relevantes.
- [x] Agregar script `format`.
  - Criterio: `npm run format` formatea archivos TypeScript, CSS, HTML, JSON y Markdown del proyecto.
- [x] Agregar script `check`.
  - Criterio: `npm run check` ejecuta build, lint y tests en un solo comando.
- [x] Integrar calidad de codigo en criterios finales.
  - Criterio: `npm run lint`, `npm test`, `npm run build` y `npm run check` forman parte de la validacion final.
- [x] Validar calidad inicial del proyecto.
  - Criterio: `npm run lint`, `npm test`, `npm run build` y `npm run check` terminan correctamente o queda documentada la razon tecnica de cualquier comando pendiente.

## Fase 1 - Base del proyecto y MVP guardable

Objetivo medible: el usuario puede escribir contenido, aplicar formato basico, guardar JSON/HTML y recuperar el documento sin perdida.

### 1.1 Crear proyecto Vite + TypeScript

- [x] Inicializar el proyecto con Vite usando plantilla `vanilla-ts`.
  - Criterio: existen `package.json`, `index.html`, `src/main.ts`, `src/style.css`, `tsconfig.json` y configuracion base de Vite.
- [x] Instalar dependencias principales del editor.
  - Criterio: `package.json` incluye Tiptap, extensiones principales, CodeMirror, DOMPurify y Zod.
- [x] Instalar dependencias de desarrollo.
  - Criterio: `package.json` incluye Vitest, jsdom y Playwright o queda documentada la razon si alguna se posterga.
- [x] Configurar scripts de desarrollo.
  - Criterio: existen scripts `dev`, `build`, `preview`, `test` y, cuando aplique, `test:e2e`.
- [x] Configurar alias `@/*` en `vite.config.ts` y `tsconfig.json`.
  - Criterio: se puede importar desde `@/editor/...` sin errores de TypeScript.
- [x] Activar reglas TypeScript estrictas.
  - Criterio: `strict`, `noUnusedLocals`, `noUnusedParameters` y `noFallthroughCasesInSwitch` estan activos.
- [x] Ejecutar validacion inicial del proyecto.
  - Criterio: `npm run build` termina correctamente.

### 1.2 Crear estructura de carpetas

- [x] Crear `src/editor/core`.
  - Criterio: contiene archivos para editor, extensiones, comandos y tipos.
- [x] Crear `src/editor/components`.
  - Criterio: contiene modulos TypeScript vanilla para shell, toolbar, source view, preview, fullscreen, dialogos y menus; no son componentes de framework.
- [x] Crear `src/editor/extensions`.
  - Criterio: contiene extensiones personalizadas de imagen, tabla y link cuando existan.
- [x] Crear `src/editor/services`.
  - Criterio: contiene servicios de storage, media, sanitizacion, serializacion y autosave.
- [x] Crear `src/editor/models`.
  - Criterio: contiene modelos de documento, modo, asset y configuracion.
- [x] Crear `src/editor/utils`.
  - Criterio: contiene utilidades reutilizables como debounce, validadores y helpers DOM.
- [x] Crear `src/api`.
  - Criterio: contiene clientes API para documentos y assets, aunque inicien con implementacion mock o local.

### 1.3 Modelos y tipos base

- [x] Implementar `EditorDocument`.
  - Criterio: incluye `id`, `title`, `contentJson`, `contentHtml`, `status`, `createdAt` y `updatedAt`.
- [x] Implementar `EditorAsset`.
  - Criterio: incluye `id`, `documentId`, `fileName`, `mimeType`, `size`, `url`, `altText` opcional y `createdAt`.
- [x] Ajustar `EditorMode` como modo de contenido.
  - Criterio: `EditorMode` solo contiene `wysiwyg`, `source-html`, `source-json` y `preview`; `fullscreen` no aparece en este tipo.
  - Nota: la implementacion previa quedo marcada como completada con `fullscreen` dentro de `EditorMode`; se reabre por decision tecnica para separar contenido y estado visual.
- [x] Implementar `EditorViewState`.
  - Criterio: existe un tipo o interfaz con forma `{ mode: EditorMode; fullscreen: boolean }`.
- [x] Separar `fullscreen` de `EditorMode`.
  - Criterio: `fullscreen` queda representado como estado visual independiente y puede aplicarse sobre `wysiwyg`, `source-html`, `source-json` o `preview`.
- [x] Implementar `EditorConfig`.
  - Criterio: define opciones configurables como `documentId`, `autosave`, limites de imagen, placeholder y modo inicial de contenido; cualquier opcion fullscreen usa `EditorViewState` o estado visual equivalente.
- [x] Agregar validaciones basicas de tipos donde se consuman datos externos.
  - Criterio: los payloads de persistencia y assets tienen validacion o parsing controlado.

### 1.3.1 Schema del JSON canonico

Objetivo medible: el frontend valida que `contentJson` use solo nodos, marcas y atributos permitidos antes de cargar o persistir contenido.

> Dependencia: requiere que los modelos base de Fase 1.3 existan y que las extensiones registradas en Fase 1.4 esten alineadas con el schema permitido.

- [x] Implementar definicion de schema para JSON canonico.
  - Criterio: existe una especificacion versionada de nodos, marcas y atributos permitidos para ProseMirror/Tiptap JSON.
- [x] Definir nodos permitidos del documento.
  - Criterio: solo se aceptan nodos documentados como `doc`, `paragraph`, `text`, `heading`, `bulletList`, `orderedList`, `listItem`, `taskList`, `taskItem`, `table`, `tableRow`, `tableCell`, `tableHeader`, `image`, `blockquote`, `codeBlock` y `horizontalRule`.
- [x] Definir marcas permitidas.
  - Criterio: solo se aceptan marcas documentadas como `bold`, `italic`, `underline`, `strike`, `link`, `textStyle` y `highlight`.
- [x] Validar atributos permitidos.
  - Criterio: atributos como `href`, `src`, `alt`, `level`, `width`, `height`, `align`, `color`, `textAlign`, `colspan`, `rowspan` y similares tienen reglas explicitas.
- [x] Rechazar JSON con nodos, marcas o atributos no permitidos.
  - Criterio: el contenido invalido no se carga directamente en Tiptap, se conserva el documento anterior y se muestra error controlado.
- [x] Validar JSON recibido desde la API.
  - Criterio: el frontend no confia ciegamente en `contentJson`; todo payload externo pasa por parser o schema antes de montarse.
- [x] Validar JSON editado desde la vista `source-json`.
  - Criterio: JSON invalido o fuera de schema no reemplaza el documento actual y muestra mensaje accionable.
- [x] Agregar pruebas del schema.
  - Criterio: existen casos validos, invalidos, nodos desconocidos, marcas desconocidas y atributos inseguros.

### 1.4 Instancia base de Tiptap

- [x] Implementar `createEditorExtensions`.
  - Criterio: registra StarterKit, Underline, TextStyle, Color, Highlight, TextAlign, Link, Table, TaskList, TaskItem, Placeholder e imagen personalizada segun la fase disponible.
- [x] Implementar `createWysiwygEditor`.
  - Criterio: recibe elemento HTML, contenido inicial y callback `onChange`.
- [x] Garantizar que el editor emite JSON y HTML en cada actualizacion.
  - Criterio: el callback devuelve `editor.getJSON()` y `editor.getHTML()`.
- [x] Desactivar CSS inyectado cuando el proyecto use estilos propios.
  - Criterio: `injectCSS: false` queda configurado o se documenta la decision contraria.
- [x] Crear montaje inicial en `src/main.ts`.
  - Criterio: al ejecutar `npm run dev` se visualiza el editor en navegador.

### 1.5 Shell visual del editor

- [x] Implementar `editor-shell.ts`.
  - Criterio: renderiza contenedor principal, toolbar, area editable y barra de estado.
- [x] Implementar estilos base en `src/style.css`.
  - Criterio: el editor tiene borde, toolbar fija/sticky, area editable con scroll y estados visuales basicos.
- [x] Agregar estado visual de guardado.
  - Criterio: se muestran estados `Sin cambios`, `Guardando`, `Guardado` y `Error`.
- [x] Validar comportamiento responsive inicial.
  - Criterio: el editor es usable en escritorio y en viewport movil sin solapamientos evidentes.

### 1.5.1 Ciclo de vida y cleanup

Objetivo medible: montar, cambiar vista y desmontar el editor no deja instancias duplicadas, listeners repetidos ni timers activos.

- [x] Implementar ciclo de vida del editor.
  - Criterio: existe una estrategia clara para montar, actualizar y desmontar shell, Tiptap, vistas de codigo, dialogs y servicios asociados.
- [x] Destruir instancia de Tiptap al desmontar.
  - Criterio: se llama `editor.destroy()` cuando el editor deja de usarse, cambia de documento de forma destructiva o se desmonta el shell.
- [x] Destruir instancia de CodeMirror al desmontar o cambiar de vista.
  - Criterio: se llama `EditorView.destroy()` al salir de `source-html` o `source-json` y antes de crear una nueva instancia.
- [x] Limpiar event listeners manuales.
  - Criterio: toolbar, fullscreen, dialogs, drag and drop, paste y shortcuts registran funciones de cleanup y las ejecutan al desmontar.
- [x] Cancelar timers y debounce activos.
  - Criterio: autosave, timers pendientes y debounces se cancelan al desmontar o cambiar de documento.
- [x] Evitar instancias duplicadas.
  - Criterio: cambiar de documento o alternar vistas no crea editores duplicados ni listeners repetidos.
- [x] Verificar cleanup manual o automaticamente.
  - Criterio: montar y desmontar varias veces no duplica eventos, no produce errores y queda cubierto por prueba automatizada o prueba manual documentada.

### 1.6 Toolbar minima del MVP

- [x] Implementar comandos de parrafo y encabezados H1, H2, H3.
  - Criterio: existen funciones en `editor-commands.ts`; al ejecutar cada accion, el JSON contiene el bloque esperado, el HTML renderiza correctamente y el boton refleja estado activo.
  - Nota: por solicitud de UI, los titulos se ampliaron a H1-H6 y se seleccionan desde una lista desplegable en lugar de botones separados.
  - Nota: las opciones visibles del selector usan `Encabezado 1` a `Encabezado 6`.
- [x] Implementar comandos de negrita, cursiva y subrayado.
  - Criterio: los botones aplican y remueven formato sobre seleccion y texto nuevo; JSON, HTML y estado activo quedan cubiertos por prueba o verificacion manual.
- [x] Implementar lista no ordenada y lista ordenada.
  - Criterio: se pueden crear, anidar y desactivar listas; guardar y recargar conserva la estructura.
- [x] Implementar deshacer y rehacer.
  - Criterio: los botones ejecutan historial de Tiptap; una prueba o verificacion manual confirma que contenido previo se restaura y se rehace.
- [x] Implementar boton de guardado manual.
  - Criterio: ejecuta el servicio de persistencia, envia `title`, `contentJson` y `contentHtml`, y muestra estado correcto.
- [x] Agregar accesibilidad basica a controles.
  - Criterio: cada boton tiene `aria-label`, estado disabled cuando aplique y foco visible.
  - Nota: la toolbar usa iconos Fontello servidos desde `public/font`, conservando `aria-label` para lectores de pantalla; el selector de formato de bloque tambien expone `aria-label`.
  - Nota: la toolbar se ajusto visualmente a una barra compacta con selector, botones de icono y separadores, tomando como referencia una toolbar clasica sin copiarla exactamente.

### 1.7 Persistencia MVP

- [x] Implementar `serializer.service.ts`.
  - Criterio: expone funciones para obtener JSON canonico y HTML renderizable desde el editor.
- [x] Implementar `document-storage.service.ts`.
  - Criterio: contiene `saveDocument(documentId, payload)` con `PUT /api/documents/{id}`.
- [x] Implementar persistencia local temporal si no existe backend.
  - Criterio: el documento se guarda y recupera desde `localStorage` o mock documentado.
- [x] Guardar siempre JSON canonico y HTML renderizable.
  - Criterio: ningun guardado persiste solo HTML.
- [x] Implementar carga de documento existente.
  - Criterio: al recargar la pagina se restaura contenido guardado.
- [x] Manejar error de guardado.
  - Criterio: fallo de red, respuesta no OK o excepcion muestra estado `Error` sin perder contenido local.

### 1.8 Renderizado de contenido guardado

- [x] Implementar vista de renderizado basica.
  - Criterio: existe una zona o ruta/componente que muestra el HTML guardado.
- [x] Sanitizar antes de renderizar con HTML.
  - Criterio: no se usa `innerHTML` con contenido de usuario sin sanitizacion.
  - Nota: `createPreviewView` sanitiza todo HTML inicial y actualizado mediante `sanitizeHtml` antes de asignarlo a `innerHTML`.
- [x] Verificar que el contenido recuperado conserva estructura.
  - Criterio: titulos, parrafos, negrita, cursiva, subrayado y listas se restauran correctamente.
  - Nota: `editor-app.test.ts` cubre recuperacion desde storage con encabezado, parrafo con marcas basicas, lista no ordenada y lista ordenada.

## Fase 2 - Formato avanzado

Objetivo medible: el editor soporta marcas y bloques frecuentes sin romper serializacion ni recuperacion.

> Dependencia: requiere Fase 1.4 completa y toolbar base de Fase 1.6 disponible.

- [x] Agregar tachado.
  - Criterio: toolbar permite activar/desactivar tachado y el estado se persiste.
- [x] Agregar color de texto.
  - Criterio: se puede seleccionar color, aplicarlo, removerlo y persistirlo.
  - Nota: el selector de color quedo extraido como componente `text-color-picker.ts` y se muestra como popover tipo Office con `Automatico`, `Colores de tema`, `Colores estandar` y `Mas colores...` basado en input nativo `type="color"`.
- [x] Agregar resaltado.
  - Criterio: se puede aplicar resaltado multicolor y eliminarlo.
- [x] Agregar alineacion izquierda, centro, derecha y justificada.
  - Criterio: funciona sobre parrafos y encabezados.
- [x] Agregar citas.
  - Criterio: se puede convertir un bloque en cita y volver a parrafo.
- [x] Agregar separador horizontal.
  - Criterio: toolbar inserta separador y se persiste en JSON/HTML.
- [x] Agregar bloques de codigo.
  - Criterio: se puede insertar y editar bloque de codigo sin perder formato.
- [x] Configurar placeholder.
  - Criterio: el editor vacio muestra texto de ayuda configurable.
- [x] Implementar links configurables.
  - Criterio: crear, editar y eliminar link con validacion de URL/protocolo.
- [x] Impedir protocolos inseguros en enlaces.
  - Criterio: `javascript:` y protocolos no permitidos no quedan persistidos.
- [x] Validar build despues de formato avanzado.
  - Criterio: `npm run build` termina correctamente.

## Fase 3 - Tablas

Objetivo medible: el usuario puede crear y modificar tablas completas desde la UI.

> Dependencia: requiere Fase 1.4, Fase 1.6 y Fase 1.7 completas para validar comandos, UI y persistencia.

- [x] Implementar `table-commands.ts`.
  - Criterio: expone funciones tipadas para insertar tabla, filas, columnas, encabezados, combinar, separar y eliminar.
- [x] Agregar boton para insertar tabla 3x3 con encabezado.
  - Criterio: se inserta tabla funcional en la posicion del cursor; JSON contiene `table`, `tableRow`, `tableHeader` y `tableCell`, y HTML renderiza una tabla.
- [x] Agregar controles para agregar fila antes y despues.
  - Criterio: funcionan dentro de una tabla y se deshabilitan fuera de tabla.
  - Nota: por decision de UI, estos controles no deben quedar como botones individuales de toolbar; deben implementarse en `table-menu.ts` o en un unico control agrupado de comandos de tabla.
  - Nota: implementado en `table-menu.ts` como menu contextual parcial para filas.
- [x] Agregar controles para eliminar fila.
  - Criterio: elimina la fila actual y maneja ultima fila sin error.
  - Nota: por decision de UI, este control no debe quedar como boton individual de toolbar; debe implementarse en `table-menu.ts` o en un unico control agrupado de comandos de tabla.
  - Nota: implementado en `table-menu.ts`; el boton se deshabilita cuando la tabla actual solo tiene una fila.
- [x] Agregar controles para agregar columna antes y despues.
  - Criterio: funcionan dentro de una tabla y se deshabilitan fuera de tabla.
  - Nota: implementado en `table-menu.ts` como controles contextuales de tabla.
- [x] Agregar controles para eliminar columna.
  - Criterio: elimina la columna actual y maneja ultima columna sin error.
  - Nota: implementado en `table-menu.ts`; el boton se deshabilita cuando la tabla actual solo tiene una columna.
- [x] Agregar control para eliminar tabla.
  - Criterio: remueve la tabla completa sin afectar bloques externos.
  - Nota: implementado en `table-menu.ts`; el boton aparece en el menu contextual y usa `tableCommands.deleteTable`.
- [x] Agregar control para alternar fila de encabezado.
  - Criterio: la primera fila cambia entre header y fila normal.
  - Nota: implementado en `table-menu.ts` con `toggle-header-row`; alterna la fila seleccionada y queda validado sobre la primera fila.
- [x] Agregar combinar celdas.
  - Criterio: combina seleccion rectangular valida y mantiene contenido.
  - Nota: implementado en `table-menu.ts` con `merge-cells`; solo se habilita con seleccion rectangular valida y conserva el texto de las celdas combinadas.
  - Nota: las celdas seleccionadas se resaltan visualmente con la clase `selectedCell` para que el usuario vea con claridad que rango se va a combinar.
- [x] Agregar separar celdas.
  - Criterio: divide una celda combinada sin romper la tabla.
  - Nota: implementado en `table-menu.ts` con `split-cell`; solo se habilita sobre una celda combinada y restaura la estructura de la fila.
- [x] Activar redimensionamiento de columnas.
  - Criterio: las columnas se pueden redimensionar y el resultado persiste.
  - Nota: `Table.configure` activa `resizable` con `handleWidth`, `cellMinWidth` y `lastColumnResizable`; el JSON conserva `colwidth` y el HTML sanitizado conserva `colgroup`/`col` para renderizar anchos.
- [x] Implementar `table-menu.ts`.
  - Criterio: controles de tabla aparecen de forma contextual al estar dentro de una tabla.
  - Nota: cerrado por consolidacion; `table-menu.ts` muestra los comandos contextuales de tabla dentro de un grupo desplegable.
  - Nota: por ajuste de diseño, los comandos se agruparon bajo un unico disparador de icono para evitar una segunda fila de botones.
  - Nota: por ajuste de UI, el disparador queda siempre visible en la toolbar normal, sin texto, y se deshabilita fuera de tabla.
- [x] Probar persistencia de tabla.
  - Criterio: guardar y recargar conserva filas, columnas, encabezados, merges y anchos.
  - Nota: validado con prueba de integracion que guarda y recarga una tabla con encabezados, celdas combinadas y `colwidth`; el serializer completa atributos estructurales de tabla desde el JSON canonico antes y despues de sanitizar.

## Fase 4 - Imagenes y assets

Objetivo medible: el editor inserta imagenes validas, con metadata util y sin aceptar archivos peligrosos.

> Dependencia: requiere Fase 1.7 para persistencia, Fase 8 para contrato de assets y Fase 9 para reglas de seguridad.

- [x] Implementar `resizable-image.extension.ts`.
  - Criterio: soporta `src`, `alt`, `width`, `height` y `align`.
  - Nota: implementado extendiendo la extension `Image` de Tiptap sin cambiar el tipo canonico `image`; activa resize y conserva `src`, `alt`, `title`, `width`, `height` y `align`.
- [x] Implementar `file-validator.ts`.
  - Criterio: acepta PNG, JPG/JPEG y WEBP, rechaza otros MIME y limita a 5 MB por defecto.
  - Nota: `validateImageFile` valida PNG, JPEG y WEBP por MIME, rechaza formatos no permitidos, aplica limite por defecto de 5 MB y permite opciones configurables para servicios futuros.
- [x] Implementar `media-upload.service.ts`.
  - Criterio: valida archivo, hace `POST /api/documents/{documentId}/assets/images` y devuelve `id`, `url`, `altText`.
  - Nota: `createHttpMediaUploadService` valida imagenes con `validateImageFile`, envia `FormData` por `POST`, conserva `altText` opcional, parsea la respuesta como `EditorAsset` y permite `baseUrl`/`fetch` inyectables.
- [x] Crear dialogo de insercion de imagen.
  - Criterio: permite seleccionar archivo, escribir texto alternativo y confirmar/cancelar.
  - Nota: `createImageDialog` crea un dialogo accesible con selector de archivo PNG/JPEG/WEBP, texto alternativo, confirmacion, cancelacion, cierre con Escape, validacion de archivo y API publica para abrir/cerrar.
- [x] Insertar imagen subida en el editor.
  - Criterio: usa la URL retornada por el servicio y conserva `alt`.
  - Nota: el boton de imagen abre `createImageDialog`, sube con `MediaUploadService`, inserta el nodo `image` con la URL retornada y conserva `alt` en JSON, HTML renderizable y preview.
  - Correccion: el uploader local por defecto ahora devuelve una URL `blob:` del archivo seleccionado para que la imagen sea visible en navegador mientras no exista backend real.
- [x] Soportar drag and drop de imagenes.
  - Criterio: soltar una imagen valida la sube e inserta; archivos invalidos muestran error.
  - Nota: el area editable acepta archivos soltados, valida/sube mediante `MediaUploadService`, inserta el nodo `image` con la URL retornada y muestra `Error` sin insertar imagen cuando el archivo no es valido.
- [x] Soportar pegado desde portapapeles.
  - Criterio: pegar una imagen valida la sube e inserta sin bloquear texto pegado normal.
  - Nota: el area editable intercepta `paste` solo cuando el portapapeles trae un archivo de imagen, lo sube mediante `MediaUploadService`, inserta el nodo `image` y deja pasar el pegado normal cuando no hay imagen.
- [x] Agregar alineacion de imagen.
  - Criterio: izquierda, centro y derecha se reflejan visualmente y en atributos.
  - Nota: los controles existentes de alineacion aplican sobre la imagen seleccionada; el JSON canonico conserva `attrs.align`, el HTML/preview conserva `align` sanitizado y el NodeView redimensionable refleja izquierda, centro y derecha visualmente.
  - Ajuste de UI: por decision posterior, las acciones sobre imagen seleccionada pasan a un dialogo contextual y dejan de ejecutarse desde la toolbar.
- [x] Agregar ancho y alto editables.
  - Criterio: el usuario puede cambiar dimensiones y estas se persisten.
  - Nota: la toolbar muestra controles numericos de ancho y alto cuando hay una imagen seleccionada; los valores actualizan `width` y `height` en JSON canonico y HTML renderizable.
  - Ajuste de UI: por decision posterior, los controles de ancho y alto se movieron al dialogo contextual de imagen seleccionada.
- [x] Evaluar caption opcional.
  - Criterio: decision documentada en `tasks.md` o documento tecnico; si se implementa, se crea tarea separada de implementacion.
  - Decision: no se implementa en Fase 4. Un caption correcto requiere introducir un contenedor semantico de imagen, por ejemplo `figure`/`figcaption`, y ampliar el schema canonico permitido; agregarlo como atributo de `image` mezclaria metadata con contenido editable.
  - Seguimiento: queda visible como funcion opcional empresarial en Fase 11.
- [x] Mover acciones de imagen seleccionada a dialogo contextual.
  - Criterio: al seleccionar una imagen aparece un dialogo con acciones de alineacion y dimensiones; la toolbar no expone controles para manipular imagenes ya insertadas.
  - Nota: `image-options-dialog.ts` centraliza las acciones de imagen seleccionada y la toolbar conserva solo el flujo de insertar imagen.
  - Ajuste: el dialogo contextual se posiciona fuera del rectangulo de la imagen seleccionada para evitar solaparse sobre la imagen.
  - Ajuste: el dialogo espera un rectangulo estable despues de insertar o pegar imagenes y recalcula posicion despues de alinear o cambiar dimensiones.
- [x] Manejar errores de subida.
  - Criterio: fallo de validacion o red muestra mensaje y no inserta nodo roto.
  - Nota: los errores de validacion muestran el detalle del validador, los errores de red muestran un mensaje accionable y el documento conserva su JSON/HTML previo sin insertar imagen.
- [ ] Preparar cliente para eliminar assets.
  - Criterio: existe funcion para `DELETE /api/documents/{id}/assets/{assetId}` o decision documentada.

## Fase 5 - Vista de codigo HTML/JSON

Objetivo medible: se puede alternar entre WYSIWYG, HTML y JSON sin corromper el documento.

> Dependencia: requiere Fase 1.4, Fase 1.5.1 y schema de JSON canonico de Fase 1.3.1.

- [ ] Instalar y configurar CodeMirror.
  - Criterio: HTML y JSON tienen resaltado de sintaxis.
- [ ] Implementar `source-view.ts`.
  - Criterio: crea `EditorView`, recibe valor inicial, lenguaje, callback `onChange` y funcion de cleanup que destruye la instancia.
- [ ] Agregar modo `source-html`.
  - Criterio: muestra HTML generado actual y permite editarlo.
- [ ] Agregar modo `source-json`.
  - Criterio: muestra JSON formateado actual y permite editarlo.
- [ ] Implementar validacion de JSON.
  - Criterio: JSON invalido o fuera del schema permitido muestra error y no reemplaza el documento.
- [ ] Implementar sanitizacion de HTML.
  - Criterio: HTML editado pasa por DOMPurify antes de volver a Tiptap.
- [ ] Implementar validacion de HTML permitido.
  - Criterio: scripts, eventos inline, iframes no permitidos y protocolos inseguros se eliminan o bloquean.
- [ ] Sincronizar HTML editado hacia WYSIWYG.
  - Criterio: aplicar cambios HTML actualiza el editor visual sin perder historial critico.
- [ ] Sincronizar JSON editado hacia WYSIWYG.
  - Criterio: aplicar JSON valido y permitido por schema actualiza el editor visual; JSON invalido conserva el contenido anterior.
- [ ] Agregar mensajes de error amigables.
  - Criterio: errores indican que corregir sin exponer trazas tecnicas innecesarias.
- [ ] Probar roundtrip WYSIWYG -> HTML -> WYSIWYG.
  - Criterio: contenido simple y avanzado conserva estructura permitida.
- [ ] Probar roundtrip WYSIWYG -> JSON -> WYSIWYG.
  - Criterio: JSON valido conserva estructura permitida.

## Fase 6 - Vista previa y estado fullscreen

Objetivo medible: el editor ofrece preview y un estado fullscreen usable en escritorio y movil.

> Dependencia: requiere Fase 1.5, Fase 1.5.1, Fase 1.7 y sanitizacion de Fase 9 para renderizar preview seguro.

- [ ] Implementar `preview-view.ts`.
  - Criterio: renderiza HTML sanitizado del documento actual.
- [ ] Agregar modo `preview`.
  - Criterio: se puede alternar desde toolbar y volver al editor.
- [ ] Implementar `EditorViewState` en la navegacion de vistas.
  - Criterio: `mode` controla `wysiwyg`, `source-html`, `source-json` o `preview`, y `fullscreen` se aplica como boolean independiente.
- [ ] Implementar `fullscreen.ts`.
  - Criterio: alterna clase `editor-shell--fullscreen` sobre el root sin cambiar `EditorMode`.
- [ ] Agregar boton de pantalla completa.
  - Criterio: entra y sale del estado fullscreen sin perder foco ni contenido.
- [ ] Agregar atajo `Esc` para salir de fullscreen.
  - Criterio: presionar Escape revierte el estado fullscreen sin cambiar el modo de contenido activo.
- [ ] Mantener toolbar fija en fullscreen.
  - Criterio: la toolbar permanece disponible mientras se edita contenido largo.
- [ ] Centrar area de edicion cuando aplique.
  - Criterio: documentos largos son legibles en pantallas grandes.
- [ ] Verificar fullscreen sobre cada vista.
  - Criterio: fullscreen funciona sobre WYSIWYG, HTML, JSON y preview sin recrear instancias ni perder contenido.
- [ ] Validar responsive.
  - Criterio: toolbar, editor, preview y estado fullscreen funcionan en viewport movil.

## Fase 7 - Autosave y versionado

Objetivo medible: el editor guarda cambios de forma automatica, informa estado y permite recuperar versiones.

> Dependencia: requiere Fase 1.7 para persistencia manual y Fase 1.5.1 para cleanup de debounce/timers.

- [ ] Implementar `debounce.ts`.
  - Criterio: recibe funcion y delay, devuelve funcion debounced tipada.
- [ ] Implementar `autosave.service.ts`.
  - Criterio: guarda cambios con debounce configurable entre 800 y 1500 ms.
- [ ] Integrar autosave con cambios del editor.
  - Criterio: cambios de contenido disparan guardado automatico sin saturar requests.
- [ ] Mantener guardado manual.
  - Criterio: boton guardar fuerza persistencia inmediata aunque exista autosave.
- [ ] Mostrar estado visual de autosave.
  - Criterio: `Guardando`, `Guardado`, `Error` y `Cambios pendientes` se actualizan correctamente.
- [ ] Evitar condiciones de carrera entre guardados.
  - Criterio: una respuesta antigua no sobrescribe el estado de un guardado mas reciente.
- [ ] Implementar cliente para versiones.
  - Criterio: existen funciones para listar, crear y recuperar versiones.
- [ ] Crear version manual o al publicar.
  - Criterio: `POST /api/documents/{id}/versions` queda integrado o simulado.
- [ ] Implementar recuperacion de version.
  - Criterio: seleccionar una version carga su JSON/HTML en el editor.
- [ ] Implementar comparacion basica de versiones.
  - Criterio: se muestra diferencia basica de metadata o contenido, o queda documentado como pendiente opcional.

## Fase 8 - API backend y contratos

Objetivo medible: el frontend consume contratos claros y el backend esperado queda documentado o implementado.

> Dependencia: requiere modelos de Fase 1.3, persistencia de Fase 1.7 y assets de Fase 4 para validar contratos reales.

- [ ] Definir contratos TypeScript para documentos.
  - Criterio: payloads de crear, actualizar, obtener y eliminar documento estan tipados.
- [ ] Definir contratos TypeScript para versiones.
  - Criterio: payloads de listar, crear y recuperar version estan tipados.
- [ ] Definir contratos TypeScript para assets.
  - Criterio: subida y eliminacion de imagenes estan tipadas.
- [ ] Implementar `documents.api.ts`.
  - Criterio: contiene `create`, `get`, `update`, `delete`, `listVersions`, `createVersion`, `restoreVersion`.
- [ ] Implementar `assets.api.ts`.
  - Criterio: contiene `uploadImage` y `deleteAsset`.
- [ ] Centralizar manejo de errores HTTP.
  - Criterio: respuestas no OK generan errores claros para UI y logs.
- [ ] Documentar endpoints minimos.
  - Criterio: `context.md` o documento tecnico lista rutas, metodos y payloads.
- [ ] Documentar esquema de base de datos sugerido.
  - Criterio: quedan tablas `documents`, `document_versions` y `document_assets` con campos esperados.

## Fase 9 - Seguridad

Objetivo medible: el editor no renderiza ni persiste contenido peligroso conocido.

> Dependencia: requiere Fase 1.3.1 para JSON canonico, Fase 5 para source views, Fase 6 para preview y Fase 8 para contratos de API.

- [ ] Implementar `sanitizer.service.ts`.
  - Criterio: usa DOMPurify y una politica explicita de HTML permitido.
- [ ] Sanitizar antes de renderizar.
  - Criterio: todo HTML mostrado desde usuario pasa por `sanitizeHtml`.
- [ ] Sanitizar antes de guardar HTML.
  - Criterio: `contentHtml` persistido se guarda limpio.
- [ ] Validar enlaces.
  - Criterio: solo se permiten protocolos seguros como `http`, `https` y `mailto`.
- [ ] Bloquear scripts y eventos inline.
  - Criterio: `<script>`, `onerror`, `onclick` y equivalentes no sobreviven al flujo.
- [ ] Validar MIME real en backend o dejar contrato obligatorio.
  - Criterio: el frontend documenta que el backend no debe confiar solo en `file.type`.
- [ ] Proteger contra perdida de informacion.
  - Criterio: autosave, guardado manual y versionado cubren flujos criticos.
- [ ] Validar JSON contra esquema permitido.
  - Criterio: JSON de source view o API no carga nodos no soportados sin validacion.
- [ ] Agregar pruebas de schema JSON seguro.
  - Criterio: nodos desconocidos, marcas desconocidas, atributos inseguros y URLs peligrosas son rechazados por tests.
- [ ] Agregar pruebas de sanitizacion.
  - Criterio: casos XSS conocidos quedan cubiertos por tests unitarios.

## Fase 10 - Pruebas automatizadas y QA

Objetivo medible: flujos criticos quedan cubiertos por unitarias, integracion y E2E.

> Dependencia: las pruebas E2E requieren que Fase 1.7, Fase 3, Fase 4, Fase 5, Fase 6 y Fase 9 esten implementadas o mockeadas de forma explicita.

### 10.1 Unitarias

- [ ] Probar `sanitizeHtml`.
  - Criterio: elimina scripts, eventos inline, protocolos inseguros y conserva HTML permitido.
- [ ] Probar `validateImageFile`.
  - Criterio: acepta formatos validos y rechaza MIME/tamano invalidos.
- [ ] Probar serializacion JSON/HTML.
  - Criterio: el servicio devuelve ambos formatos y no omite contenido.
- [ ] Probar comandos del editor.
  - Criterio: bold, italic, underline, headings, listas, undo y redo tienen cobertura.
- [ ] Probar servicios de guardado.
  - Criterio: requests correctos, errores no OK y excepciones quedan cubiertos.
- [ ] Probar debounce.
  - Criterio: multiples llamadas rapidas ejecutan solo una vez al finalizar el delay.

### 10.2 Integracion

- [ ] Probar crear documento.
  - Criterio: se crea documento con titulo, JSON inicial y HTML inicial.
- [ ] Probar editar documento.
  - Criterio: cambios de contenido actualizan estado interno.
- [ ] Probar guardar documento.
  - Criterio: payload enviado contiene `title`, `contentJson` y `contentHtml`.
- [ ] Probar recuperar documento.
  - Criterio: contenido cargado coincide con lo guardado.
- [ ] Probar insertar imagen.
  - Criterio: upload mock retorna URL y la imagen queda en el documento.
- [ ] Probar insertar tabla.
  - Criterio: tabla creada queda en JSON y HTML.
- [ ] Probar cambio a vista codigo y regreso.
  - Criterio: no hay corrupcion de contenido.

### 10.3 End-to-end

> Dependencia: Playwright debe ejecutarse contra `npm run dev` o contra preview de build; los datos de prueba deben poder limpiarse entre ejecuciones.

- [ ] Configurar Playwright.
  - Criterio: existe configuracion y script `test:e2e`.
- [ ] E2E: crear documento nuevo.
  - Criterio: la pagina abre y permite iniciar documento.
- [ ] E2E: escribir titulo y parrafo.
  - Criterio: el contenido aparece en el editor.
- [ ] E2E: aplicar formato.
  - Criterio: negrita, cursiva y subrayado se reflejan.
- [ ] E2E: insertar lista.
  - Criterio: lista queda visible y persistida.
- [ ] E2E: insertar tabla.
  - Criterio: tabla queda visible y persistida.
- [ ] E2E: subir imagen.
  - Criterio: imagen valida queda visible y persistida.
- [ ] E2E: cambiar a vista codigo.
  - Criterio: HTML o JSON actual se muestra en CodeMirror.
- [ ] E2E: volver al editor visual.
  - Criterio: contenido sigue consistente.
- [ ] E2E: guardar y recargar.
  - Criterio: luego de recargar, el contenido persiste.
- [ ] E2E: validar movil.
  - Criterio: flujo principal funciona en viewport movil.

## Fase 11 - Funciones empresariales opcionales

Estas tareas no bloquean la primera version, pero deben quedar visibles para no perder alcance futuro.

- [ ] Decidir si se implementaran plantillas.
  - Criterio: decision documentada con alcance minimo o descartado.
- [ ] Decidir bloques reutilizables.
  - Criterio: decision documentada con modelo de datos preliminar.
- [ ] Decidir comentarios.
  - Criterio: decision documentada con UX y persistencia esperada.
- [ ] Decidir revision/aprobacion.
  - Criterio: decision documentada con estados y permisos.
- [ ] Decidir control de cambios.
  - Criterio: decision documentada con impacto tecnico.
- [ ] Decidir permisos por documento.
  - Criterio: decision documentada con roles y acciones.
- [ ] Decidir exportacion PDF.
  - Criterio: decision documentada con estrategia frontend/backend.
- [ ] Decidir exportacion Markdown.
  - Criterio: decision documentada con estrategia de conversion desde JSON canonico.
- [ ] Decidir firma o aprobacion documental.
  - Criterio: decision documentada con requisitos legales o funcionales.
- [ ] Revaluar captions de imagen.
  - Criterio: si se habilita, definir nodos canonicos `figure`/`figcaption` o alternativa equivalente, reglas de sanitizacion, serializacion, UI y pruebas de persistencia.

## Criterios de aceptacion de primera version

- [ ] El proyecto queda documentado y ejecutado como Vite + TypeScript `vanilla-ts`, sin framework frontend.
- [ ] Los modulos visuales vanilla TypeScript tienen ciclo de vida de montaje y desmontaje.
- [ ] Tiptap, CodeMirror, listeners manuales y timers se limpian correctamente.
- [ ] Permite crear contenido enriquecido.
- [ ] Permite editar contenido existente.
- [ ] Guarda correctamente JSON canonico.
- [ ] Guarda correctamente HTML renderizable.
- [ ] El JSON canonico se valida contra un schema permitido.
- [ ] El editor rechaza nodos, marcas y atributos no permitidos.
- [ ] Recupera documentos sin perdida de contenido.
- [ ] Soporta titulos, listas, formato basico y enlaces.
- [ ] Soporta tablas.
- [ ] Soporta imagenes.
- [ ] Tiene vista de codigo HTML/JSON funcional.
- [ ] Tiene vista previa.
- [ ] `EditorMode` solo contiene modos de contenido.
- [ ] `fullscreen` funciona como estado visual independiente.
- [ ] El estado fullscreen funciona sobre WYSIWYG, HTML, JSON y preview.
- [ ] Sanitiza HTML antes de renderizar.
- [ ] Sanitiza HTML antes de guardar.
- [ ] Maneja errores de guardado.
- [ ] Funciona en escritorio.
- [ ] Funciona en movil.
- [ ] Tiene pruebas minimas de flujos criticos.
- [ ] `npm run lint` finaliza correctamente.
- [ ] `npm run format` puede ejecutarse sin romper el proyecto.
- [ ] `npm run check` finaliza correctamente.
- [ ] `npm run build` finaliza correctamente.
- [ ] `npm test` finaliza correctamente.
- [ ] `npm run test:e2e` finaliza correctamente o queda justificado si el entorno no permite ejecutarlo.
