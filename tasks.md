# Tasks - Editor WYSIWYG Vite + TypeScript

Este archivo convierte el plan de `plan_editor_wysiwyg_vite_ts.md` en tareas cumplibles, medibles y verificables. Cada tarea debe cerrarse solo cuando su criterio de verificacion este cumplido y registrado en `worklog.md`.

Convencion:

- `[ ]` pendiente.
- `[x]` completada.
- Una tarea completada debe tener evidencia: archivo creado/modificado, comando ejecutado, prueba manual o prueba automatizada.
- Si una tarea se divide durante la implementacion, agregar subtareas antes de marcarla como terminada.

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
  - Criterio: contiene archivos base para shell, toolbar, source view, preview, fullscreen, dialogos y menus.
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
- [x] Implementar `EditorMode`.
  - Criterio: soporta `wysiwyg`, `source-html`, `source-json`, `preview` y `fullscreen`.
- [x] Implementar `EditorConfig`.
  - Criterio: define opciones configurables como `documentId`, `autosave`, limites de imagen, placeholder y modo inicial.
- [x] Agregar validaciones basicas de tipos donde se consuman datos externos.
  - Criterio: los payloads de persistencia y assets tienen validacion o parsing controlado.

### 1.4 Instancia base de Tiptap

- [x] Implementar `createEditorExtensions`.
  - Criterio: registra StarterKit, Underline, TextStyle, Color, Highlight, TextAlign, Link, Table, TaskList, TaskItem, Placeholder e imagen personalizada segun la fase disponible.
- [x] Implementar `createWysiwygEditor`.
  - Criterio: recibe elemento HTML, contenido inicial y callback `onChange`.
- [x] Garantizar que el editor emite JSON y HTML en cada actualizacion.
  - Criterio: el callback devuelve `editor.getJSON()` y `editor.getHTML()`.
- [x] Desactivar CSS inyectado cuando el proyecto use estilos propios.
  - Criterio: `injectCSS: false` queda configurado o se documenta la decision contraria.
- [ ] Crear montaje inicial en `src/main.ts`.
  - Criterio: al ejecutar `npm run dev` se visualiza el editor en navegador.

### 1.5 Shell visual del editor

- [ ] Implementar `editor-shell.ts`.
  - Criterio: renderiza contenedor principal, toolbar, area editable y barra de estado.
- [ ] Implementar estilos base en `src/style.css`.
  - Criterio: el editor tiene borde, toolbar fija/sticky, area editable con scroll y estados visuales basicos.
- [ ] Agregar estado visual de guardado.
  - Criterio: se muestran estados `Sin cambios`, `Guardando`, `Guardado` y `Error`.
- [ ] Validar comportamiento responsive inicial.
  - Criterio: el editor es usable en escritorio y en viewport movil sin solapamientos evidentes.

### 1.6 Toolbar minima del MVP

- [ ] Implementar comandos de parrafo y encabezados H1, H2, H3.
  - Criterio: los botones cambian el bloque seleccionado y reflejan estado activo.
- [ ] Implementar comandos de negrita, cursiva y subrayado.
  - Criterio: los botones aplican y remueven formato sobre seleccion y texto nuevo.
- [ ] Implementar lista no ordenada y lista ordenada.
  - Criterio: se pueden crear, anidar y desactivar listas.
- [ ] Implementar deshacer y rehacer.
  - Criterio: los botones ejecutan historial de Tiptap correctamente.
- [ ] Implementar boton de guardado manual.
  - Criterio: ejecuta el servicio de persistencia y muestra estado correcto.
- [ ] Agregar accesibilidad basica a controles.
  - Criterio: cada boton tiene `aria-label`, estado disabled cuando aplique y foco visible.

### 1.7 Persistencia MVP

- [ ] Implementar `serializer.service.ts`.
  - Criterio: expone funciones para obtener JSON canonico y HTML renderizable desde el editor.
- [ ] Implementar `document-storage.service.ts`.
  - Criterio: contiene `saveDocument(documentId, payload)` con `PUT /api/documents/{id}`.
- [ ] Implementar persistencia local temporal si no existe backend.
  - Criterio: el documento se guarda y recupera desde `localStorage` o mock documentado.
- [ ] Guardar siempre JSON canonico y HTML renderizable.
  - Criterio: ningun guardado persiste solo HTML.
- [ ] Implementar carga de documento existente.
  - Criterio: al recargar la pagina se restaura contenido guardado.
- [ ] Manejar error de guardado.
  - Criterio: fallo de red, respuesta no OK o excepcion muestra estado `Error` sin perder contenido local.

### 1.8 Renderizado de contenido guardado

- [ ] Implementar vista de renderizado basica.
  - Criterio: existe una zona o ruta/componente que muestra el HTML guardado.
- [ ] Sanitizar antes de renderizar con HTML.
  - Criterio: no se usa `innerHTML` con contenido de usuario sin sanitizacion.
- [ ] Verificar que el contenido recuperado conserva estructura.
  - Criterio: titulos, parrafos, negrita, cursiva, subrayado y listas se restauran correctamente.

## Fase 2 - Formato avanzado

Objetivo medible: el editor soporta marcas y bloques frecuentes sin romper serializacion ni recuperacion.

- [ ] Agregar tachado.
  - Criterio: toolbar permite activar/desactivar tachado y el estado se persiste.
- [ ] Agregar color de texto.
  - Criterio: se puede seleccionar color, aplicarlo, removerlo y persistirlo.
- [ ] Agregar resaltado.
  - Criterio: se puede aplicar resaltado multicolor y eliminarlo.
- [ ] Agregar alineacion izquierda, centro, derecha y justificada.
  - Criterio: funciona sobre parrafos y encabezados.
- [ ] Agregar citas.
  - Criterio: se puede convertir un bloque en cita y volver a parrafo.
- [ ] Agregar separador horizontal.
  - Criterio: toolbar inserta separador y se persiste en JSON/HTML.
- [ ] Agregar bloques de codigo.
  - Criterio: se puede insertar y editar bloque de codigo sin perder formato.
- [ ] Configurar placeholder.
  - Criterio: el editor vacio muestra texto de ayuda configurable.
- [ ] Implementar links configurables.
  - Criterio: crear, editar y eliminar link con validacion de URL/protocolo.
- [ ] Impedir protocolos inseguros en enlaces.
  - Criterio: `javascript:` y protocolos no permitidos no quedan persistidos.
- [ ] Validar build despues de formato avanzado.
  - Criterio: `npm run build` termina correctamente.

## Fase 3 - Tablas

Objetivo medible: el usuario puede crear y modificar tablas completas desde la UI.

- [ ] Implementar `table-commands.ts`.
  - Criterio: expone insertar tabla, filas, columnas, encabezados, combinar, separar y eliminar.
- [ ] Agregar boton para insertar tabla 3x3 con encabezado.
  - Criterio: se inserta tabla funcional en la posicion del cursor.
- [ ] Agregar controles para agregar fila antes y despues.
  - Criterio: funcionan dentro de una tabla y se deshabilitan fuera de tabla.
- [ ] Agregar controles para eliminar fila.
  - Criterio: elimina la fila actual y maneja ultima fila sin error.
- [ ] Agregar controles para agregar columna antes y despues.
  - Criterio: funcionan dentro de una tabla y se deshabilitan fuera de tabla.
- [ ] Agregar controles para eliminar columna.
  - Criterio: elimina la columna actual y maneja ultima columna sin error.
- [ ] Agregar control para eliminar tabla.
  - Criterio: remueve la tabla completa sin afectar bloques externos.
- [ ] Agregar control para alternar fila de encabezado.
  - Criterio: la primera fila cambia entre header y fila normal.
- [ ] Agregar combinar celdas.
  - Criterio: combina seleccion rectangular valida y mantiene contenido.
- [ ] Agregar separar celdas.
  - Criterio: divide una celda combinada sin romper la tabla.
- [ ] Activar redimensionamiento de columnas.
  - Criterio: las columnas se pueden redimensionar y el resultado persiste.
- [ ] Implementar `table-menu.ts`.
  - Criterio: controles de tabla aparecen de forma contextual al estar dentro de una tabla.
- [ ] Probar persistencia de tabla.
  - Criterio: guardar y recargar conserva filas, columnas, encabezados, merges y anchos.

## Fase 4 - Imagenes y assets

Objetivo medible: el editor inserta imagenes validas, con metadata util y sin aceptar archivos peligrosos.

- [ ] Implementar `resizable-image.extension.ts`.
  - Criterio: soporta `src`, `alt`, `width`, `height` y `align`.
- [ ] Implementar `file-validator.ts`.
  - Criterio: acepta PNG, JPG/JPEG y WEBP, rechaza otros MIME y limita a 5 MB por defecto.
- [ ] Implementar `media-upload.service.ts`.
  - Criterio: valida archivo, hace `POST /api/documents/{documentId}/assets/images` y devuelve `id`, `url`, `altText`.
- [ ] Crear dialogo de insercion de imagen.
  - Criterio: permite seleccionar archivo, escribir texto alternativo y confirmar/cancelar.
- [ ] Insertar imagen subida en el editor.
  - Criterio: usa la URL retornada por el servicio y conserva `alt`.
- [ ] Soportar drag and drop de imagenes.
  - Criterio: soltar una imagen valida la sube e inserta; archivos invalidos muestran error.
- [ ] Soportar pegado desde portapapeles.
  - Criterio: pegar una imagen valida la sube e inserta sin bloquear texto pegado normal.
- [ ] Agregar alineacion de imagen.
  - Criterio: izquierda, centro y derecha se reflejan visualmente y en atributos.
- [ ] Agregar ancho y alto editables.
  - Criterio: el usuario puede cambiar dimensiones y estas se persisten.
- [ ] Evaluar caption opcional.
  - Criterio: se implementa o queda una decision documentada con tarea futura.
- [ ] Manejar errores de subida.
  - Criterio: fallo de validacion o red muestra mensaje y no inserta nodo roto.
- [ ] Preparar cliente para eliminar assets.
  - Criterio: existe funcion para `DELETE /api/documents/{id}/assets/{assetId}` o decision documentada.

## Fase 5 - Vista de codigo HTML/JSON

Objetivo medible: se puede alternar entre WYSIWYG, HTML y JSON sin corromper el documento.

- [ ] Instalar y configurar CodeMirror.
  - Criterio: HTML y JSON tienen resaltado de sintaxis.
- [ ] Implementar `source-view.ts`.
  - Criterio: crea `EditorView`, recibe valor inicial, lenguaje y callback `onChange`.
- [ ] Agregar modo `source-html`.
  - Criterio: muestra HTML generado actual y permite editarlo.
- [ ] Agregar modo `source-json`.
  - Criterio: muestra JSON formateado actual y permite editarlo.
- [ ] Implementar validacion de JSON.
  - Criterio: JSON invalido muestra error y no reemplaza el documento.
- [ ] Implementar sanitizacion de HTML.
  - Criterio: HTML editado pasa por DOMPurify antes de volver a Tiptap.
- [ ] Implementar validacion de HTML permitido.
  - Criterio: scripts, eventos inline, iframes no permitidos y protocolos inseguros se eliminan o bloquean.
- [ ] Sincronizar HTML editado hacia WYSIWYG.
  - Criterio: aplicar cambios HTML actualiza el editor visual sin perder historial critico.
- [ ] Sincronizar JSON editado hacia WYSIWYG.
  - Criterio: aplicar JSON valido actualiza el editor visual.
- [ ] Agregar mensajes de error amigables.
  - Criterio: errores indican que corregir sin exponer trazas tecnicas innecesarias.
- [ ] Probar roundtrip WYSIWYG -> HTML -> WYSIWYG.
  - Criterio: contenido simple y avanzado conserva estructura permitida.
- [ ] Probar roundtrip WYSIWYG -> JSON -> WYSIWYG.
  - Criterio: JSON valido conserva estructura permitida.

## Fase 6 - Vista previa y pantalla completa

Objetivo medible: el editor ofrece preview y fullscreen usable en escritorio y movil.

- [ ] Implementar `preview-view.ts`.
  - Criterio: renderiza HTML sanitizado del documento actual.
- [ ] Agregar modo `preview`.
  - Criterio: se puede alternar desde toolbar y volver al editor.
- [ ] Implementar `fullscreen.ts`.
  - Criterio: alterna clase `editor-shell--fullscreen` sobre el root.
- [ ] Agregar boton de pantalla completa.
  - Criterio: entra y sale del modo fullscreen sin perder foco ni contenido.
- [ ] Agregar atajo `Esc` para salir de fullscreen.
  - Criterio: presionar Escape revierte el modo fullscreen.
- [ ] Mantener toolbar fija en fullscreen.
  - Criterio: la toolbar permanece disponible mientras se edita contenido largo.
- [ ] Centrar area de edicion cuando aplique.
  - Criterio: documentos largos son legibles en pantallas grandes.
- [ ] Validar responsive.
  - Criterio: toolbar, editor, preview y fullscreen funcionan en viewport movil.

## Fase 7 - Autosave y versionado

Objetivo medible: el editor guarda cambios de forma automatica, informa estado y permite recuperar versiones.

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
- [ ] Agregar pruebas de sanitizacion.
  - Criterio: casos XSS conocidos quedan cubiertos por tests unitarios.

## Fase 10 - Pruebas automatizadas y QA

Objetivo medible: flujos criticos quedan cubiertos por unitarias, integracion y E2E.

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

- [ ] Definir si se implementaran plantillas.
  - Criterio: decision documentada con alcance minimo o descartado.
- [ ] Definir bloques reutilizables.
  - Criterio: decision documentada con modelo de datos preliminar.
- [ ] Definir comentarios.
  - Criterio: decision documentada con UX y persistencia esperada.
- [ ] Definir revision/aprobacion.
  - Criterio: decision documentada con estados y permisos.
- [ ] Definir control de cambios.
  - Criterio: decision documentada con impacto tecnico.
- [ ] Definir permisos por documento.
  - Criterio: decision documentada con roles y acciones.
- [ ] Definir exportacion PDF.
  - Criterio: decision documentada con estrategia frontend/backend.
- [ ] Definir exportacion Markdown.
  - Criterio: decision documentada con estrategia de conversion desde JSON canonico.
- [ ] Definir firma o aprobacion documental.
  - Criterio: decision documentada con requisitos legales o funcionales.

## Criterios de aceptacion de primera version

- [ ] Permite crear contenido enriquecido.
- [ ] Permite editar contenido existente.
- [ ] Guarda correctamente JSON canonico.
- [ ] Guarda correctamente HTML renderizable.
- [ ] Recupera documentos sin perdida de contenido.
- [ ] Soporta titulos, listas, formato basico y enlaces.
- [ ] Soporta tablas.
- [ ] Soporta imagenes.
- [ ] Tiene vista de codigo HTML/JSON funcional.
- [ ] Tiene vista previa.
- [ ] Tiene modo pantalla completa.
- [ ] Sanitiza HTML antes de renderizar.
- [ ] Sanitiza HTML antes de guardar.
- [ ] Maneja errores de guardado.
- [ ] Funciona en escritorio.
- [ ] Funciona en movil.
- [ ] Tiene pruebas minimas de flujos criticos.
- [ ] `npm run build` finaliza correctamente.
- [ ] `npm test` finaliza correctamente.
- [ ] `npm run test:e2e` finaliza correctamente o queda justificado si el entorno no permite ejecutarlo.
