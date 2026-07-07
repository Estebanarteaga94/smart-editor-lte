# Worklog - Editor WYSIWYG Vite + TypeScript

Bitacora cronologica del trabajo realizado. Cada entrada debe permitir que otro agente continue sin perder contexto.

## 2026-07-06 - Preparacion de documentos operativos

Objetivo:

- Analizar `plan_editor_wysiwyg_vite_ts.md`.
- Crear documentos de ejecucion para que el proyecto avance por tareas medibles.

Acciones realizadas:

- Se leyo el plan completo de 1233 lineas.
- Se identifico que el workspace inicial solo contenia `plan_editor_wysiwyg_vite_ts.md`.
- Se intento revisar estado Git, pero la carpeta actual no es un repositorio Git.
- Se creo `tasks.md` con fases, tareas detalladas, criterios de verificacion y checkboxes `[ ]` / `[x]`.
- Se creo `instructions.md` con reglas para agentes por sesion.
- Se creo `context.md` con objetivo, stack, arquitectura, modelos, roadmap, seguridad y contratos esperados.
- Se creo `worklog.md` como bitacora del proyecto.

Archivos modificados:

- `tasks.md`
- `instructions.md`
- `context.md`
- `worklog.md`

Verificacion:

- Lectura completa por rangos de `plan_editor_wysiwyg_vite_ts.md`.
- Revision de archivos existentes con `rg --files`.
- Revision de directorio con `ls -la`.

Pendientes inmediatos:

- Inicializar el proyecto Vite + TypeScript.
- Instalar dependencias principales.
- Configurar scripts y TypeScript estricto.
- Ejecutar primer `npm run build` cuando exista el proyecto.

Bloqueos o notas:

- No hay repositorio Git inicializado en `/home/esteban94/Proyectos/typescript/smart-editor-lte`.
- No hay aun `package.json`, `src/`, ni comandos npm disponibles.

## 2026-07-06 - Inicializacion Vite vanilla-ts

Objetivo:

- Cerrar la primera tarea pendiente de Fase 1.1: inicializar el proyecto con Vite usando plantilla `vanilla-ts`.

Acciones realizadas:

- Se genero un scaffold Vite `vanilla-ts` con `npm create vite@latest`.
- El generador creo inicialmente los archivos en `tmp/smart-editor-lte-vite-scaffold` dentro del workspace.
- Se copiaron los archivos base generados a la raiz del proyecto.
- Se elimino el directorio temporal `tmp`.
- Se ajusto el nombre del paquete a `smart-editor-lte`.

Archivos creados:

- `.gitignore`
- `index.html`
- `package.json`
- `public/favicon.svg`
- `public/icons.svg`
- `src/assets/hero.png`
- `src/assets/typescript.svg`
- `src/assets/vite.svg`
- `src/counter.ts`
- `src/main.ts`
- `src/style.css`
- `tsconfig.json`

Archivos modificados:

- `package.json`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `test -f package.json && test -f index.html && test -f src/main.ts && test -f src/style.css && test -f tsconfig.json`.
- Resultado: `vite base files present`.

Pendientes inmediatos:

- Instalar dependencias principales del editor: Tiptap, extensiones, CodeMirror, DOMPurify y Zod.
- Instalar dependencias de desarrollo: Vitest, jsdom y Playwright.
- Completar scripts `test` y `test:e2e` cuando correspondan.
- Configurar alias `@/*`.
- Activar `strict` en TypeScript.
- Ejecutar `npm run build` cuando las dependencias esten instaladas.

## 2026-07-06 - Instalacion de dependencias principales

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.1: instalar dependencias principales del editor.

Acciones realizadas:

- Se instalaron las dependencias runtime aprobadas para el editor: Tiptap, extensiones principales, CodeMirror, DOMPurify y Zod.
- Se genero `package-lock.json` con el arbol de dependencias resuelto por npm.
- Se ejecuto build como validacion adicional de compatibilidad con la base Vite actual.

Dependencias instaladas:

- `@tiptap/core`
- `@tiptap/starter-kit`
- `@tiptap/extension-underline`
- `@tiptap/extension-text-style`
- `@tiptap/extension-color`
- `@tiptap/extension-highlight`
- `@tiptap/extension-text-align`
- `@tiptap/extension-link`
- `@tiptap/extension-image`
- `@tiptap/extension-table`
- `@tiptap/extension-table-row`
- `@tiptap/extension-table-cell`
- `@tiptap/extension-table-header`
- `@tiptap/extension-task-list`
- `@tiptap/extension-task-item`
- `@tiptap/extension-placeholder`
- `codemirror`
- `@codemirror/view`
- `@codemirror/state`
- `@codemirror/lang-html`
- `@codemirror/lang-json`
- `dompurify`
- `zod`

Archivos modificados:

- `package.json`
- `package-lock.json`
- `tasks.md`
- `worklog.md`

Verificacion:

- `npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-style @tiptap/extension-color @tiptap/extension-highlight @tiptap/extension-text-align @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/extension-placeholder codemirror @codemirror/view @codemirror/state @codemirror/lang-html @codemirror/lang-json dompurify zod`
- Resultado npm: `added 95 packages`, `found 0 vulnerabilities`.
- Se ejecuto un chequeo Node contra `package.json` para confirmar que todas las dependencias esperadas existen en `dependencies`.
- Resultado: `all editor runtime dependencies present`.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite.

Notas:

- La tarea `Ejecutar validacion inicial del proyecto` permanece pendiente porque antes deben cerrarse las tareas intermedias de dependencias de desarrollo, scripts, alias y TypeScript estricto.

Pendientes inmediatos:

- Instalar dependencias de desarrollo: Vitest, jsdom y Playwright.
- Configurar scripts de desarrollo.
- Configurar alias `@/*`.
- Activar reglas TypeScript estrictas.

## 2026-07-06 - Instalacion de dependencias de desarrollo

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.1: instalar dependencias de desarrollo.

Acciones realizadas:

- Se instalaron `vitest`, `jsdom` y `playwright` como dependencias de desarrollo.
- Se actualizo `package-lock.json` con el arbol de dependencias dev.
- Se ejecuto build como validacion adicional de compatibilidad.

Archivos modificados:

- `package.json`
- `package-lock.json`
- `tasks.md`
- `worklog.md`

Verificacion:

- `npm install -D vitest jsdom playwright`
- Resultado npm: `added 69 packages`, `found 0 vulnerabilities`.
- Se ejecuto un chequeo Node contra `package.json` para confirmar que `vitest`, `jsdom` y `playwright` existen en `devDependencies`.
- Resultado: `all editor dev dependencies present`.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite.

Pendientes inmediatos:

- Configurar scripts de desarrollo.
- Configurar alias `@/*`.
- Activar reglas TypeScript estrictas.
- Ejecutar validacion inicial completa del proyecto.

## 2026-07-06 - Configuracion de scripts de desarrollo

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.1: configurar scripts de desarrollo.

Acciones realizadas:

- Se agrego script `test` con Vitest.
- Se agrego script `test:e2e` con Playwright.
- Se conservaron los scripts base `dev`, `build` y `preview`.
- Los scripts de prueba usan opciones para permitir ejecucion exitosa mientras aun no existen archivos de prueba.

Scripts configurados:

- `dev`: `vite`
- `build`: `tsc && vite build`
- `preview`: `vite preview`
- `test`: `vitest run --passWithNoTests`
- `test:e2e`: `playwright test --pass-with-no-tests`

Archivos modificados:

- `package.json`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto un chequeo Node contra `package.json` para confirmar que existen `dev`, `build`, `preview`, `test` y `test:e2e`.
- Se ejecuto `npm test`.
- Resultado: Vitest no encontro pruebas, pero termino con codigo 0 por `--passWithNoTests`.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino con codigo 0 por `--pass-with-no-tests`.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite.

Pendientes inmediatos:

- Configurar alias `@/*`.
- Activar reglas TypeScript estrictas.
- Ejecutar validacion inicial completa del proyecto.

## 2026-07-06 - Configuracion de alias @/*

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.1: configurar alias `@/*` en `vite.config.ts` y `tsconfig.json`.

Acciones realizadas:

- Se creo `vite.config.ts` con `resolve.alias` para mapear `@` hacia `src`.
- Se configuro `compilerOptions.paths` en `tsconfig.json` con `@/*` hacia `./src/*`.
- Se verifico una importacion temporal desde `@/editor/alias-check` para confirmar que TypeScript resuelve el alias esperado.
- Se eliminaron los archivos temporales usados para la prueba y el directorio temporal `src/editor`, para no adelantar tareas de estructura de carpetas.

Archivos modificados:

- `vite.config.ts`
- `tsconfig.json`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm run build` con archivos temporales `src/editor/alias-check.ts` y `src/alias-import-check.ts`.
- Primer intento fallido: TypeScript 6 rechazo `baseUrl` por deprecacion futura.
- Segundo intento fallido: TypeScript 6 exigio rutas relativas explicitas en `paths` al no usar `baseUrl`.
- Se ajusto `paths` a `"@/*": ["./src/*"]`.
- Se ejecuto nuevamente `npm run build` con la importacion temporal desde `@/editor/...`.
- Resultado: build correcto con Vite.
- Se eliminaron los archivos temporales de prueba.
- Se ejecuto `npm run build` en el estado final del proyecto.
- Resultado: build correcto con Vite.

Pendientes inmediatos:

- Activar reglas TypeScript estrictas.
- Ejecutar validacion inicial completa del proyecto.

## 2026-07-06 - Activacion de reglas TypeScript estrictas

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.1: activar reglas TypeScript estrictas.

Acciones realizadas:

- Se agrego `strict: true` en `tsconfig.json`.
- Se conservaron activas las reglas `noUnusedLocals`, `noUnusedParameters` y `noFallthroughCasesInSwitch`.

Archivos modificados:

- `tsconfig.json`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite.
- Se intento un chequeo Node directo sobre `tsconfig.json`; fallo porque el removedor simple de comentarios interpreto la cadena `"@/*"` como comentario.
- Se repitio el chequeo usando `npx tsc --showConfig` como salida normalizada de TypeScript.
- Resultado: `strict TypeScript options active`.

Pendientes inmediatos:

- Ejecutar validacion inicial completa del proyecto.

## 2026-07-06 - Validacion inicial del proyecto

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.1: ejecutar validacion inicial del proyecto.

Acciones realizadas:

- Se ejecuto el build completo del proyecto despues de instalar dependencias, configurar scripts, alias y reglas TypeScript estrictas.

Archivos modificados:

- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm run build`.
- Resultado: `tsc && vite build` termino correctamente.
- Salida relevante: `vite v8.1.3 building client environment for production` y `built in 104ms`.

Notas:

- La Fase 1.1 queda completada.
- El directorio `dist/` se regenera por el build y esta cubierto por `.gitignore`.

Pendientes inmediatos:

- Crear `src/editor/core`.
- Continuar con las tareas de estructura de carpetas de Fase 1.2 en orden.

## 2026-07-06 - Creacion de src/editor/core

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.2: crear `src/editor/core`.

Acciones realizadas:

- Se creo la carpeta `src/editor/core`.
- Se agregaron archivos base para editor, extensiones, comandos y tipos.
- Los archivos definen contratos TypeScript iniciales sin implementar todavia la instancia real de Tiptap.

Archivos creados:

- `src/editor/core/create-editor.ts`
- `src/editor/core/editor-extensions.ts`
- `src/editor/core/editor-commands.ts`
- `src/editor/core/table-commands.ts`
- `src/editor/core/editor-types.ts`

Archivos modificados:

- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `find src/editor/core -maxdepth 1 -type f | sort`.
- Resultado: existen los cinco archivos base esperados.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.

Notas:

- `createEditorExtensions` y `createWysiwygEditor` siguen pendientes porque pertenecen a las tareas de Fase 1.4.
- Los comandos concretos de toolbar y tablas siguen pendientes en sus fases correspondientes.

Pendientes inmediatos:

- Crear `src/editor/components`.
- Continuar con las tareas de estructura de carpetas de Fase 1.2 en orden.

## 2026-07-06 - Finalizacion de estructura de carpetas Fase 1.2

Objetivo:

- Terminar la Fase 1.2 completa por solicitud directa del usuario.

Acciones realizadas:

- Se creo `src/editor/components` con archivos base para shell, toolbar, source view, preview, fullscreen, dialogo de imagen y menu de tabla.
- Se creo `src/editor/extensions` con archivos base para imagen redimensionable, tabla personalizada y link seguro.
- Se creo `src/editor/services` con contratos base para storage, media upload, sanitizacion, serializacion y autosave.
- Se creo `src/editor/models` con archivos base para documento, modo, asset y configuracion.
- Se creo `src/editor/utils` con utilidades base para debounce, validacion de archivos, validacion de HTML y helpers DOM.
- Se creo `src/api` con clientes API base para documentos y assets.

Archivos creados:

- `src/editor/components/editor-shell.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/source-view.ts`
- `src/editor/components/preview-view.ts`
- `src/editor/components/fullscreen.ts`
- `src/editor/components/image-dialog.ts`
- `src/editor/components/table-menu.ts`
- `src/editor/extensions/resizable-image.extension.ts`
- `src/editor/extensions/custom-table.extension.ts`
- `src/editor/extensions/link.extension.ts`
- `src/editor/services/document-storage.service.ts`
- `src/editor/services/media-upload.service.ts`
- `src/editor/services/sanitizer.service.ts`
- `src/editor/services/serializer.service.ts`
- `src/editor/services/autosave.service.ts`
- `src/editor/models/editor-document.ts`
- `src/editor/models/editor-mode.ts`
- `src/editor/models/editor-asset.ts`
- `src/editor/models/editor-config.ts`
- `src/editor/utils/debounce.ts`
- `src/editor/utils/file-validator.ts`
- `src/editor/utils/html-validator.ts`
- `src/editor/utils/dom.ts`
- `src/api/documents.api.ts`
- `src/api/assets.api.ts`

Archivos modificados:

- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `find src/editor/components src/editor/extensions src/editor/services src/editor/models src/editor/utils src/api -maxdepth 1 -type f | sort`.
- Resultado: existen los archivos base esperados para todas las carpetas restantes de Fase 1.2.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.

Notas:

- Los archivos de `src/editor/models` son marcadores de estructura; los tipos definitivos `EditorDocument`, `EditorAsset`, `EditorMode` y `EditorConfig` siguen pendientes en Fase 1.3.
- Las extensiones, servicios, vistas y clientes API quedan como contratos iniciales; su implementacion funcional se completara en las fases correspondientes.
- La Fase 1.2 queda completada.

Pendientes inmediatos:

- Implementar `EditorDocument`.
- Continuar con Fase 1.3 en orden.

## 2026-07-06 - Implementacion de EditorDocument

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.3: implementar `EditorDocument`.

Acciones realizadas:

- Se reemplazo el marcador `EditorDocumentModel = unknown` por la interfaz `EditorDocument`.
- Se agrego `EditorDocumentStatus` con los estados `draft`, `published` y `archived`.
- Se mantuvo `contentJson` como contenido canonico de tipo `unknown`, siguiendo el contrato definido en `context.md`.

Archivos modificados:

- `src/editor/models/editor-document.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se ejecuto un chequeo Node sobre `src/editor/models/editor-document.ts` para confirmar los campos `id`, `title`, `contentJson`, `contentHtml`, `status`, `createdAt` y `updatedAt`.
- Resultado: `EditorDocument fields present`.

Pendientes inmediatos:

- Implementar `EditorAsset`.
- Continuar con Fase 1.3 en orden.

## 2026-07-06 - Creacion de repositorio Git local

Objetivo:

- Crear un repositorio Git local en la raiz del proyecto por solicitud directa del usuario.

Acciones realizadas:

- Se verifico que `/home/esteban94/Proyectos/typescript/smart-editor-lte` no era todavia un repositorio Git.
- Se ejecuto `git init`.
- Se renombro la rama inicial a `main`.
- Se agregaron `test-results` y `playwright-report` a `.gitignore` para evitar versionar salidas generadas por Playwright.

Archivos modificados:

- `.gitignore`
- `worklog.md`

Verificacion:

- `git rev-parse --is-inside-work-tree` fallo antes de inicializar, confirmando que no existia repositorio.
- `git init` inicializo `.git/` correctamente.
- `git branch -m main` dejo la rama inicial como `main`.
- `git status --short` mostro los archivos del proyecto como no versionados, listos para un primer commit cuando se solicite.

Pendientes inmediatos:

- Crear el primer commit si el usuario lo solicita.
- Continuar con `EditorAsset` si el trabajo vuelve a las tareas del editor.

## 2026-07-06 - Instruccion operativa de commits

Objetivo:

- Agregar una regla de trabajo para evaluar commits al completar una o varias tareas.

Acciones realizadas:

- Se agrego la seccion `Reglas de Git` en `instructions.md`.
- La regla indica evaluar un commit cuando se complete una o varias tareas verificadas.
- La regla pide crear commit cuando el conjunto de cambios tenga cierre claro, verificable y coherente.
- La regla pide registrar en `worklog.md` si se crea el commit o si se decide no hacerlo.

Archivos modificados:

- `instructions.md`
- `worklog.md`

Verificacion:

- Cambio documental revisado por lectura del archivo.

Notas:

- No se creo commit en esta entrada porque el usuario pidio agregar la instruccion, no crear el primer commit.

Pendientes inmediatos:

- Continuar con `EditorAsset` si el trabajo vuelve a las tareas del editor.

## 2026-07-06 - Implementacion de EditorAsset

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.3: implementar `EditorAsset`.

Acciones realizadas:

- Se reemplazo el marcador `EditorAssetModel = unknown` por la interfaz `EditorAsset`.
- Se agregaron los campos `id`, `documentId`, `fileName`, `mimeType`, `size`, `url`, `altText` opcional y `createdAt`.

Archivos modificados:

- `src/editor/models/editor-asset.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se ejecuto un chequeo Node sobre `src/editor/models/editor-asset.ts` para confirmar los campos requeridos y `altText` opcional.
- Resultado: `EditorAsset fields present`.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo un commit inicial porque el repositorio local aun no tenia commits y el conjunto actual representa una base verificable del proyecto.

Pendientes inmediatos:

- Implementar `EditorMode`.
- Continuar con Fase 1.3 en orden.

## 2026-07-06 - Implementacion de EditorMode

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.3: implementar `EditorMode`.

Acciones realizadas:

- Se reemplazo el marcador `EditorModeModel = unknown` por el tipo union `EditorMode`.
- Se agregaron los modos `wysiwyg`, `source-html`, `source-json`, `preview` y `fullscreen`.

Archivos modificados:

- `src/editor/models/editor-mode.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se ejecuto un chequeo Node sobre `src/editor/models/editor-mode.ts` para confirmar los cinco valores requeridos.
- Resultado: `EditorMode values present`.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio es pequeno, coherente y ya fue verificado.

Pendientes inmediatos:

- Implementar `EditorConfig`.
- Continuar con Fase 1.3 en orden.

## 2026-07-06 - Finalizacion de modelos y validaciones Fase 1.3

Objetivo:

- Terminar la Fase 1.3 completa por solicitud directa del usuario.

Acciones realizadas:

- Se implemento `EditorConfig` con `documentId`, `autosave`, `imageLimits`, `placeholder` e `initialMode`.
- Se agrego `defaultEditorConfig` con autosave activo, limite de imagen de 5 MB, MIME permitidos PNG/JPEG/WEBP y modo inicial `wysiwyg`.
- Se agregaron schemas y parsers Zod para `EditorDocument`, `EditorAsset`, `EditorMode` y `EditorConfig`.
- Se agrego parser Zod para `DocumentStoragePayload`.
- Se tiparon los contratos de `DocumentsApi`, `AssetsApi` y `MediaUploadService` para evitar `unknown` en payloads externos sin parsing disponible.
- Se agregaron pruebas unitarias para validar payloads validos e invalidos de documento, asset, modo y configuracion.

Archivos modificados:

- `src/editor/models/editor-config.ts`
- `src/editor/models/editor-document.ts`
- `src/editor/models/editor-asset.ts`
- `src/editor/models/editor-mode.ts`
- `src/editor/services/document-storage.service.ts`
- `src/editor/services/media-upload.service.ts`
- `src/api/documents.api.ts`
- `src/api/assets.api.ts`
- `tasks.md`
- `worklog.md`

Archivos creados:

- `src/editor/models/editor-models.test.ts`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 1 archivo de prueba correcto, 5 pruebas correctas.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.

Decision Git:

- Se evaluo crear commit al cerrar las tareas restantes de Fase 1.3.
- Se creo commit porque el cambio cierra una fase completa, tiene pruebas y build correcto.

Pendientes inmediatos:

- Implementar `createEditorExtensions`.
- Continuar con Fase 1.4 en orden.

## 2026-07-06 - Implementacion de createEditorExtensions

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.4: implementar `createEditorExtensions`.

Acciones realizadas:

- Se implemento `createEditorExtensions` en `src/editor/core/editor-extensions.ts`.
- Se registro StarterKit con `link` y `underline` desactivados para configurar esas extensiones de forma explicita y evitar duplicados.
- Se registraron Underline, TextStyle, Color, Highlight, TextAlign, Link, Image, Table, TableRow, TableHeader, TableCell, TaskList, TaskItem y Placeholder.
- Se configuro Highlight multicolor, TextAlign para `heading` y `paragraph`, tabla redimensionable, TaskItem anidable y Placeholder configurable.
- Se configuro Link con protocolos permitidos, `defaultProtocol: https`, atributos seguros y validacion por `defaultValidate`.
- Se uso la extension base `Image` porque la extension personalizada redimensionable se implementara en la fase de imagenes.
- Se agrego prueba unitaria para confirmar el registro de extensiones base esperadas.

Archivos modificados:

- `src/editor/core/editor-extensions.ts`
- `tasks.md`
- `worklog.md`

Archivos creados:

- `src/editor/core/editor-extensions.test.ts`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 2 archivos de prueba correctos, 6 pruebas correctas.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio es pequeno, coherente y ya fue verificado.

Pendientes inmediatos:

- Implementar `createWysiwygEditor`.
- Continuar con Fase 1.4 en orden.

## 2026-07-06 - Implementacion de createWysiwygEditor

Objetivo:

- Cerrar las siguientes tareas pendientes de Fase 1.4 relacionadas con la instancia base de Tiptap.

Acciones realizadas:

- Se implemento `createWysiwygEditor` en `src/editor/core/create-editor.ts`.
- La factory recibe `element`, `initialContent`, `placeholder` y `onChange`.
- La factory crea una instancia real de `Editor` de Tiptap con las extensiones de `createEditorExtensions`.
- Se configuro `onUpdate` para emitir `contentJson` con `editor.getJSON()` y `contentHtml` con `editor.getHTML()`.
- Se configuro `injectCSS: false` para que los estilos sean responsabilidad del proyecto.
- Se agregaron pruebas con ambiente `jsdom` para validar montaje, emision JSON/HTML e `injectCSS: false`.

Archivos modificados:

- `src/editor/core/create-editor.ts`
- `tasks.md`
- `worklog.md`

Archivos creados:

- `src/editor/core/create-editor.test.ts`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 3 archivos de prueba correctos, 9 pruebas correctas.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.

Decision Git:

- Se evaluo crear commit al cerrar estas tareas.
- Se creo commit porque el cambio es coherente, verificable y cierra tres criterios contiguos de Fase 1.4.

Pendientes inmediatos:

- Crear montaje inicial en `src/main.ts`.
- Continuar con Fase 1.4 en orden.

## 2026-07-06 - Montaje inicial en src/main.ts

Objetivo:

- Cerrar la ultima tarea pendiente de Fase 1.4: crear montaje inicial en `src/main.ts`.

Acciones realizadas:

- Se reemplazo la pantalla demo de Vite por una pantalla inicial del editor.
- Se monto `createWysiwygEditor` sobre `#wysiwyg-editor`.
- Se agrego contenido inicial editable para confirmar que Tiptap se renderiza.
- Se agrego estado visual minimo que se actualiza cuando cambia el JSON canonico.
- Se reemplazaron los estilos demo de Vite por estilos minimos para que el editor sea visible.
- Se actualizo el titulo HTML a `Smart Editor LTE`.

Archivos modificados:

- `index.html`
- `src/main.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 3 archivos de prueba correctos, 9 pruebas correctas.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5173/`.
- Se verifico con Playwright que la pagina muestra `Smart Editor LTE`, existe un elemento `.tiptap` y el editor contiene el texto inicial.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio completa Fase 1.4 y deja un resultado visible verificado.

Pendientes inmediatos:

- Implementar `editor-shell.ts`.
- Continuar con Fase 1.5 en orden.

## 2026-07-06 - Implementacion de editor-shell.ts

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.5: implementar `editor-shell.ts`.

Acciones realizadas:

- Se implemento `createEditorShell` en `src/editor/components/editor-shell.ts`.
- El shell renderiza contenedor principal, encabezado, toolbar, area editable y barra de estado.
- `main.ts` ahora usa `createEditorShell` y monta Tiptap sobre `shell.editable`.
- Se agregaron controles placeholder deshabilitados en la toolbar para reservar la estructura visual sin adelantar comandos de Fase 1.6.
- Se ajustaron estilos para `editor-shell`, toolbar, body editable y status.
- Se agregaron pruebas unitarias con `jsdom` para validar estructura del shell, referencias devueltas y accesibilidad basica de controles placeholder.

Archivos modificados:

- `src/editor/components/editor-shell.ts`
- `src/main.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Archivos creados:

- `src/editor/components/editor-shell.test.ts`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 4 archivos de prueba correctos, 11 pruebas correctas.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se verifico con Playwright sobre `http://127.0.0.1:5173/` que existe un toolbar, un editor `.tiptap`, barra de estado `Sin cambios` y 7 botones placeholder.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio es pequeno, coherente y verificado.

Pendientes inmediatos:

- Implementar estilos base en `src/style.css`.
- Continuar con Fase 1.5 en orden.

## 2026-07-06 - Estilos base del shell visual

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.5: implementar estilos base en `src/style.css`.

Acciones realizadas:

- Se reforzo el estilo base del contenedor `editor-shell` con borde, sombra, radio y layout vertical.
- Se configuro la toolbar como `position: sticky` dentro del shell.
- Se configuro el cuerpo editable con altura controlada y `overflow: auto`.
- Se agregaron estilos base para foco, botones deshabilitados, listas, citas, codigo inline, tablas y placeholder.
- Se agrego un indicador visual neutral en la barra de estado.
- Se conservaron ajustes responsive basicos sin cerrar todavia la tarea especifica de validacion responsive.

Archivos modificados:

- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 4 archivos de prueba correctos, 11 pruebas correctas.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se verifico con Playwright sobre `http://127.0.0.1:5173/` que el shell tiene borde `solid`, la toolbar tiene `position: sticky`, el cuerpo editable tiene `overflow: auto` y la barra de estado muestra indicador visual.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio es pequeno, coherente y verificado.

Pendientes inmediatos:

- Agregar estado visual de guardado.
- Continuar con Fase 1.5 en orden.

## 2026-07-06 - Configuracion de ESLint

Objetivo:

- Cerrar la primera tarea pendiente de Fase 0.1: configurar ESLint.
- Agregar el script `lint` porque el criterio de configuracion exige validar con `npm run lint`.

Acciones realizadas:

- Se instalaron `eslint`, `@eslint/js`, `typescript-eslint` y `globals` como dependencias de desarrollo.
- Se creo `eslint.config.js` con configuracion flat compatible con Vite + TypeScript `vanilla-ts`.
- Se activo lint type-aware con `projectService` contra `tsconfig.json`.
- Se configuraron globals de navegador para `src` y globals de Node para archivos de configuracion.
- Se configuraron reglas para fallar ante imports, variables y parametros sin uso, permitiendo nombres intencionalmente ignorados con prefijo `_`.
- Se agrego el script `lint` para ejecutar ESLint sobre `src`, `vite.config.ts` y `eslint.config.js`.

Archivos creados:

- `eslint.config.js`

Archivos modificados:

- `package.json`
- `package-lock.json`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npx eslint src vite.config.ts eslint.config.js`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente usando el script del proyecto.
- Se ejecuto `npm test`.
- Resultado: 4 archivos de prueba correctos, 11 pruebas correctas.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.

Decision Git:

- Se evaluo crear commit al cerrar tareas verificadas.
- Se creo commit porque el cambio cierra configuracion y script de lint con validacion correcta.

Pendientes inmediatos:

- Configurar Prettier.
- Continuar con Fase 0.1 en orden.

## 2026-07-06 - Finalizacion de Fase 0.1 calidad de codigo

Objetivo:

- Completar las tareas restantes de Fase 0.1: Prettier, `.editorconfig`, scripts `format` y `check`, criterios finales de calidad y validacion inicial.

Acciones realizadas:

- Se instalo `prettier` como dependencia de desarrollo.
- Se agrego `.prettierrc` con reglas base de formato para el proyecto.
- Se agrego `.prettierignore` para excluir salidas generadas, dependencias, fuentes y assets binarios.
- Se agrego `.editorconfig` con UTF-8, LF, indentacion de 2 espacios, salto final y limpieza de espacios finales.
- Se agrego script `format` para formatear TypeScript, CSS, HTML, JSON y Markdown.
- Se agrego script `check` para ejecutar build, lint y tests en un solo comando.
- Se actualizo `instructions.md` para incluir `npm run lint`, `npm run format` y `npm run check` en la verificacion operativa.
- Se ejecuto `npm run format`; Prettier formateo documentos y modulos existentes sin cambiar contratos funcionales.
- Se marco Fase 0.1 como completada en `tasks.md`.

Archivos creados:

- `.editorconfig`
- `.prettierignore`
- `.prettierrc`

Archivos modificados:

- `context.md`
- `eslint.config.js`
- `instructions.md`
- `package.json`
- `package-lock.json`
- `plan_editor_wysiwyg_vite_ts.md`
- `src/**/*.ts`
- `src/style.css`
- `tasks.md`
- `vite.config.ts`
- `worklog.md`

Verificacion:

- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm test`.
- Resultado: 4 archivos de prueba correctos, 11 pruebas correctas.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.

Decision Git:

- Se creo commit porque la Fase 0.1 quedo completa y verificada.

Pendientes inmediatos:

- Ajustar `EditorMode` como modo de contenido.
- Continuar con Fase 1.3 en orden.

## 2026-07-06 - Finalizacion de modelos y tipos base reabiertos

Objetivo:

- Cerrar las tareas pendientes de Fase 1.3 relacionadas con `EditorMode`, `EditorViewState` y separacion del estado fullscreen.

Acciones realizadas:

- Se elimino `fullscreen` de `editorModeSchema`.
- `EditorMode` quedo limitado a los modos de contenido `wysiwyg`, `source-html`, `source-json` y `preview`.
- Se agrego `editorViewStateSchema` con forma `{ mode: EditorMode; fullscreen: boolean }`.
- Se agregaron `EditorViewState`, `defaultEditorViewState` y `parseEditorViewState`.
- Se actualizaron pruebas de modelos para confirmar que `fullscreen` se rechaza como modo y se acepta como estado visual independiente.
- Se marco Fase 1.3 como completada en `tasks.md`.

Archivos modificados:

- `src/editor/models/editor-mode.ts`
- `src/editor/models/editor-models.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 4 archivos de prueba correctos, 11 pruebas correctas.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.

Decision Git:

- Se creo commit porque la Fase 1.3 quedo completa y verificada.

Pendientes inmediatos:

- Implementar definicion de schema para JSON canonico.
- Continuar con Fase 1.3.1 en orden.

## 2026-07-06 - Finalizacion de schema del JSON canonico

Objetivo:

- Completar Fase 1.3.1 para validar `contentJson` con un schema permitido antes de cargar, persistir o aplicar JSON editado.

Acciones realizadas:

- Se agrego `src/editor/models/editor-content.ts` con especificacion versionada del JSON canonico.
- Se definieron los nodos permitidos: `doc`, `paragraph`, `text`, `heading`, `bulletList`, `orderedList`, `listItem`, `taskList`, `taskItem`, `table`, `tableRow`, `tableCell`, `tableHeader`, `image`, `blockquote`, `codeBlock` y `horizontalRule`.
- Se definieron las marcas permitidas: `bold`, `italic`, `underline`, `strike`, `link`, `textStyle` y `highlight`.
- Se validaron atributos por nodo y marca, incluyendo `href`, `src`, `alt`, `level`, `width`, `height`, `align`, `color`, `textAlign`, `colspan`, `rowspan` y `colwidth`.
- Se bloquearon atributos desconocidos y protocolos inseguros como `javascript:`.
- `EditorDocument` ahora valida `contentJson` con `canonicalEditorContentSchema`.
- `DocumentStoragePayload` ahora usa `CanonicalEditorContent` y valida el payload antes de persistir.
- Se agrego validacion pura para `source-json` en `source-view.ts`; si el JSON es invalido, conserva el contenido anterior y devuelve mensaje accionable.
- Se actualizo `context.md` para documentar `EditorViewState`, la separacion de `fullscreen` y el schema canonico.
- Se agregaron pruebas unitarias para casos validos, nodos desconocidos, marcas desconocidas, atributos inseguros, payloads API/storage y source-json invalido.
- Se marco Fase 1.3.1 como completada en `tasks.md`.

Archivos creados:

- `src/editor/models/editor-content.ts`
- `src/editor/models/editor-content.test.ts`

Archivos modificados:

- `context.md`
- `src/editor/components/source-view.ts`
- `src/editor/models/editor-document.ts`
- `src/editor/services/document-storage.service.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 5 archivos de prueba correctos, 19 pruebas correctas.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.

Decision Git:

- Se creo commit porque la Fase 1.3.1 quedo completa y verificada.

Pendientes inmediatos:

- Agregar estado visual de guardado.
- Continuar con Fase 1.5 en orden.

## 2026-07-06 - Finalizacion de shell visual Fase 1.5

Objetivo:

- Completar las tareas pendientes de Fase 1.5: estado visual de guardado y validacion responsive inicial.

Acciones realizadas:

- Se agrego `EditorSaveStatus` con estados `unchanged`, `saving`, `saved` y `error`.
- `createEditorShell` ahora expone `statusBar`, `status` y `setSaveStatus`.
- La barra de estado renderiza los textos `Sin cambios`, `Guardando`, `Guardado` y `Error`.
- Se agrego `data-save-status` para estilos y pruebas estables.
- `main.ts` inicializa el estado en `Sin cambios` y cambia a `Guardando`/`Guardado` cuando Tiptap emite contenido JSON/HTML.
- Se agregaron estilos por estado de guardado y ajustes responsive para toolbar, status, header y area editable.
- Se agrego `white-space: pre-wrap` al area ProseMirror para resolver la advertencia de Vite/ProseMirror detectada durante la prueba manual.
- Se actualizaron pruebas unitarias del shell para cubrir los cuatro estados de guardado.
- Se valido responsive con Playwright en escritorio `1280x800` y movil `375x667`, confirmando editor, toolbar y status visibles, sin overflow horizontal evidente y sin solapamiento toolbar/body/status.
- Se marco Fase 1.5 como completada en `tasks.md`.

Archivos modificados:

- `src/editor/components/editor-shell.ts`
- `src/editor/components/editor-shell.test.ts`
- `src/main.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 5 archivos de prueba correctos, 20 pruebas correctas.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5173/`.
- Se ejecuto una prueba manual automatizada con Playwright sobre escritorio y movil.
- Resultado: estado inicial `Sin cambios`, estado tras editar `Guardado`, toolbar/editor/status visibles, sin overflow horizontal, sin solapamientos evidentes y `white-space: pre-wrap` aplicado en `.tiptap`.

Decision Git:

- Se creo commit porque la Fase 1.5 quedo completa y verificada.

Pendientes inmediatos:

- Implementar ciclo de vida del editor.
- Continuar con Fase 1.5.1 en orden.

## 2026-07-06 - Finalizacion de ciclo de vida y cleanup Fase 1.5.1

Objetivo:

- Completar Fase 1.5.1 para que montar, cambiar vista y desmontar el editor no deje instancias duplicadas, listeners repetidos ni timers activos.

Acciones realizadas:

- Se agrego `EditorLifecycle` en `src/editor/core/editor-lifecycle.ts`.
- El lifecycle monta el root del shell con `mountRoot` y reemplaza el root anterior sin duplicar nodos.
- Se agrego `registerTiptapEditor` para destruir la instancia anterior al cambiar de documento o al desmontar.
- Se agrego `registerSourceView` y `destroySourceView` para destruir vistas tipo CodeMirror al salir de `source-html` o `source-json` y antes de crear una nueva.
- Se agrego `addEventListener` con cleanup automatico para listeners manuales de toolbar, fullscreen, dialogs, drag and drop, paste y shortcuts futuros.
- Se agregaron `registerTimer`, `registerInterval` y `registerDebounce` para cancelar timeouts, intervalos y debounces activos.
- `dispose()` quedo idempotente para evitar dobles destrucciones.
- `main.ts` ahora monta el shell mediante `EditorLifecycle`, registra la instancia Tiptap y limpia recursos en `beforeunload`.
- Se agregaron pruebas automatizadas para montar/desmontar varias veces, destruir Tiptap, destruir vistas tipo CodeMirror, limpiar listeners, cancelar timers/debounce y bloquear registros despues de `dispose`.
- Se marco Fase 1.5.1 como completada en `tasks.md`.

Archivos creados:

- `src/editor/core/editor-lifecycle.ts`
- `src/editor/core/editor-lifecycle.test.ts`

Archivos modificados:

- `src/main.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Resultado de pruebas: 6 archivos de prueba correctos, 26 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5174/` porque `5173` estaba ocupado.
- Se ejecuto una prueba manual automatizada con Playwright.
- Resultado: existe una sola instancia `.tiptap`, estado inicial `Sin cambios` y estado tras editar `Guardado`.

Decision Git:

- Se creo commit porque la Fase 1.5.1 quedo completa y verificada.

Pendientes inmediatos:

- Implementar comandos de parrafo y encabezados H1, H2, H3.
- Continuar con Fase 1.6 en orden.

## 2026-07-06 - Finalizacion de toolbar minima del MVP Fase 1.6

Objetivo:

- Completar Fase 1.6 con comandos basicos de toolbar, historial, guardado manual y accesibilidad.

Acciones realizadas:

- Se implementaron comandos reales en `editor-commands.ts` para parrafo, H1, H2, H3, negrita, cursiva, subrayado, lista no ordenada, lista ordenada, deshacer y rehacer.
- Se reemplazaron los placeholders del shell por una toolbar funcional en `toolbar.ts`.
- La toolbar crea botones accesibles con `aria-label`, `aria-pressed` en controles conmutables, estado `disabled` cuando aplica y `data-active` para estado visual.
- La toolbar escucha `selectionUpdate`, `transaction` y `update` de Tiptap, y registra cleanup en `EditorLifecycle`.
- `main.ts` monta la toolbar real y conecta el boton `Guardar`.
- Se agrego `serializeEditorContent(editor)` para extraer JSON canonico validado y HTML renderizable.
- Se agrego `createLocalDocumentStorageService` como persistencia local temporal para el guardado manual mientras no existe backend.
- El guardado manual persiste `title`, `contentJson` y `contentHtml`, y actualiza estado `Guardando`, `Guardado` o `Error`.
- Se agregaron estilos para toolbar funcional y boton activo.
- Se agregaron pruebas unitarias para comandos de bloques, marcas, listas, undo/redo, toolbar, accesibilidad y guardado local.
- Se agrego prueba de guardado/carga de listas para verificar que la estructura se conserva.
- Se marco Fase 1.6 como completada en `tasks.md`.

Archivos creados:

- `src/editor/components/toolbar.test.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/services/document-storage.service.test.ts`

Archivos modificados:

- `src/editor/components/editor-shell.ts`
- `src/editor/components/editor-shell.test.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/core/editor-commands.ts`
- `src/editor/services/document-storage.service.ts`
- `src/editor/services/serializer.service.ts`
- `src/main.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 9 archivos de prueba correctos, 35 pruebas correctas.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto. Vite emitio advertencia de chunk mayor a 500 kB.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente. Se mantiene la advertencia no bloqueante de Vite por chunk mayor a 500 kB.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5174/` porque `5173` estaba ocupado.
- Se ejecuto una prueba manual automatizada con Playwright.
- Resultado: 12 botones de toolbar, una sola instancia `.tiptap`, sin overflow horizontal, botones con `aria-label`, H1/negrita/lista/undo/redo operativos y guardado local con `title`, `contentJson` y `contentHtml`.

Decision Git:

- Se creo commit porque la Fase 1.6 quedo completa y verificada.

Pendientes inmediatos:

- Implementar `serializer.service.ts` como tarea formal de Fase 1.7.
- Continuar con Fase 1.7 en orden.

## 2026-07-06 - Iconos Fontello en toolbar

Objetivo:

- Reemplazar texto visible de la toolbar por iconos usando la carpeta `font` existente en la raiz.

Acciones realizadas:

- Se movio `font/` a `public/font/` para que Vite sirva los assets en runtime.
- Se agrego `@font-face` para `fontello` usando `woff2` y `woff`.
- Los botones de toolbar ahora renderizan glifos Fontello en spans `aria-hidden`.
- Se conservaron `aria-label`, `aria-pressed`, `title`, `disabled` y `data-active` para accesibilidad y estado visual.
- Los botones H1, H2 y H3 usan el icono de encabezado con modificador numerico.
- Se ajustaron estilos para iconos, modificadores y estados activos.
- Se actualizaron pruebas de toolbar para verificar que cada boton tiene icono y accesibilidad.
- Se agrego nota en `tasks.md` bajo la accesibilidad de Fase 1.6.

Archivos movidos:

- `font/*` a `public/font/*`

Archivos modificados:

- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 9 archivos de prueba correctos, 35 pruebas correctas.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto. Se mantiene la advertencia no bloqueante de Vite por chunk mayor a 500 kB.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5174/` porque `5173` estaba ocupado.
- Se ejecuto una prueba manual automatizada con Playwright.
- Resultado: 12 botones, 12 iconos, fuente `fontello` aplicada, sin botones sin `aria-label`, sin overflow horizontal y boton de negrita activo al usarlo.

Decision Git:

- Se creo commit porque el cambio queda acotado a los iconos de toolbar y esta verificado.

Pendientes inmediatos:

- Implementar `serializer.service.ts` como tarea formal de Fase 1.7.
- Continuar con Fase 1.7 en orden.

## 2026-07-06 - Implementacion formal de serializer.service.ts

Objetivo:

- Cerrar la primera tarea pendiente de Fase 1.7: implementar `serializer.service.ts`.

Acciones realizadas:

- Se amplio `serializer.service.ts` con funciones explicitas para obtener JSON canonico y HTML renderizable desde una instancia de Tiptap.
- Se agrego `getCanonicalEditorJson(editor)` para validar `editor.getJSON()` con el schema canonico antes de devolverlo.
- Se agrego `getRenderableEditorHtml(editor)` para devolver el HTML renderizable generado por Tiptap.
- Se mantuvo `serializeEditorContent(editor)` como funcion combinada usada por el guardado actual.
- Se agrego `createSerializerService(editor)` para exponer las operaciones como servicio ligado a una instancia de editor.
- Se agregaron pruebas unitarias propias del serializer, incluyendo JSON valido, JSON fuera del schema, HTML renderizable, serializacion combinada y factory de servicio.

Archivos creados:

- `src/editor/services/serializer.service.test.ts`

Archivos modificados:

- `src/editor/services/serializer.service.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 10 archivos de prueba correctos, 40 pruebas correctas.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio cierra una tarea formal de Fase 1.7 y esta cubierto por pruebas, lint, build y check.

Pendientes inmediatos:

- Implementar `document-storage.service.ts` con `saveDocument(documentId, payload)` usando `PUT /api/documents/{id}`.
- Continuar con Fase 1.7 en orden.

## 2026-07-06 - Implementacion HTTP de document-storage.service.ts

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.7: implementar `document-storage.service.ts` con `saveDocument(documentId, payload)` usando `PUT /api/documents/{id}`.

Acciones realizadas:

- Se agrego `createHttpDocumentStorageService` como implementacion HTTP del contrato `DocumentStorageService`.
- `saveDocument(documentId, payload)` valida el payload con `parseDocumentStoragePayload` antes de enviarlo.
- El guardado remoto usa `PUT` hacia `/api/documents/{id}` con `Content-Type: application/json`.
- El `documentId` se codifica con `encodeURIComponent` para construir una URL segura.
- Se agrego soporte opcional de `baseUrl` para apuntar a un backend externo sin cambiar el contrato.
- Se implemento `loadDocument(documentId)` para completar la interfaz HTTP con `GET`, validando la respuesta con `parseEditorDocument`.
- Se mantuvo intacta la implementacion local existente para que la siguiente tarea de persistencia temporal pueda cerrarse de forma separada.
- Se agregaron pruebas unitarias para verificar metodo, URL, headers, body JSON, `baseUrl`, validacion previa al envio y manejo de respuesta no OK.

Archivos modificados:

- `src/editor/services/document-storage.service.ts`
- `src/editor/services/document-storage.service.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 10 archivos de prueba correctos, 44 pruebas correctas.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio cierra una tarea formal de Fase 1.7 y esta cubierto por pruebas, lint, build y check.

Pendientes inmediatos:

- Implementar persistencia local temporal si no existe backend.
- Continuar con Fase 1.7 en orden.

## 2026-07-06 - Refinamiento visual compacto de toolbar

Objetivo:

- Tomar como referencia una toolbar clasica de editor, sin copiarla exactamente, para compactar la UI actual.

Acciones realizadas:

- Se mantuvieron solo controles funcionales ya disponibles: selector de formato de bloque, negrita, cursiva, subrayado, listas, undo, redo y guardado.
- Se agregaron separadores visuales entre grupos de controles.
- Se redujeron los botones a 30x30 px con estilo de icono plano.
- Se ajusto el fondo y espaciado de la toolbar para acercarla a una barra compacta de editor.
- Se conservaron `aria-label`, `aria-pressed`, estados disabled y foco visible.
- Se agrego prueba para confirmar que existen cuatro separadores decorativos `aria-hidden`.
- Se agrego nota en `tasks.md` bajo la accesibilidad de toolbar.

Archivos modificados:

- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 10 archivos de prueba correctos, 47 pruebas correctas.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5174/` porque `5173` estaba ocupado.
- Se ejecuto verificacion manual automatizada con Playwright en `1280x800` y `375x667`.
- Resultado: selector visible, 8 botones, 4 separadores, botones de 30x30 px y sin overflow horizontal evidente.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.

Decision Git:

- Se evaluo crear commit por ser un refinamiento visual solicitado sobre toolbar.
- Se creo commit porque el cambio esta acotado, verificado y documentado.

Pendientes inmediatos:

- Implementar persistencia local temporal si no existe backend.
- Continuar con Fase 1.7 en orden.

## 2026-07-06 - Renombre de opciones de encabezado

Objetivo:

- Cambiar las opciones visibles del selector de titulos de `Titulo H*` a `Encabezado *`.

Acciones realizadas:

- Se cambiaron las etiquetas del selector de formato de bloque a `Encabezado 1`, `Encabezado 2`, `Encabezado 3`, `Encabezado 4`, `Encabezado 5` y `Encabezado 6`.
- Se conservaron los valores internos `heading-1` a `heading-6` para no cambiar contratos de comandos ni JSON canonico.
- Se actualizo la prueba de toolbar para validar tambien el texto visible de las opciones.
- Se agrego nota en `tasks.md` bajo la tarea de titulos completada.

Archivos modificados:

- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 10 archivos de prueba correctos, 47 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.

Decision Git:

- Se evaluo crear commit por ser un ajuste pequeno de texto visible solicitado.
- Se creo commit porque el cambio esta acotado, verificado y documentado.

Pendientes inmediatos:

- Implementar persistencia local temporal si no existe backend.
- Continuar con Fase 1.7 en orden.

## 2026-07-06 - Selector de titulos H1 a H6 en toolbar

Objetivo:

- Atender la solicitud de reemplazar los botones separados de titulos por una lista o select y ampliar los niveles hasta H6.

Acciones realizadas:

- Se reemplazaron los botones `H1`, `H2` y `H3` por un selector de formato de bloque con opciones `Parrafo`, `Titulo H1`, `Titulo H2`, `Titulo H3`, `Titulo H4`, `Titulo H5` y `Titulo H6`.
- Se mantuvieron los controles restantes de toolbar como botones con iconos Fontello.
- Se amplio `HeadingLevel` a `1 | 2 | 3 | 4 | 5 | 6`.
- Se agregaron comandos `setHeading4`, `setHeading5` y `setHeading6`.
- Se actualizo el schema canonico para aceptar `heading.attrs.level` entre 1 y 6.
- Se agregaron estilos responsive para el selector de formato de bloque.
- Se actualizaron pruebas de toolbar, comandos y schema canonico para cubrir H1-H6 y el selector.
- Se agrego nota en `tasks.md` bajo la tarea de titulos completada.

Archivos modificados:

- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/core/editor-commands.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/models/editor-content.ts`
- `src/editor/models/editor-content.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 10 archivos de prueba correctos, 47 pruebas correctas.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5174/` porque `5173` estaba ocupado.
- Se ejecuto verificacion manual automatizada con Playwright.
- Resultado: existe el selector con `paragraph` y `heading-1` a `heading-6`, no existen botones de heading separados y seleccionar `heading-6` genera un `<h6>` con el texto del documento.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.

Decision Git:

- Se evaluo crear commit por ser un ajuste funcional solicitado sobre toolbar y schema.
- Se creo commit porque el cambio esta acotado, verificado y documentado.

Pendientes inmediatos:

- Implementar persistencia local temporal si no existe backend.
- Continuar con Fase 1.7 en orden.

## 2026-07-07 - Verificacion formal de persistencia local temporal

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.7: implementar persistencia local temporal si no existe backend.

Acciones realizadas:

- Se formalizo el prefijo por defecto de claves locales como `defaultLocalDocumentStorageKeyPrefix`.
- Se mantuvo `createLocalDocumentStorageService` como implementacion temporal basada en `window.localStorage` por defecto.
- Se conservaron las opciones `storage` y `keyPrefix` para usar un mock documentado en pruebas o ambientes sin backend.
- Se agrego prueba para confirmar que el servicio usa `window.localStorage` por defecto y guarda bajo la clave `smart-editor-lte:document:{documentId}`.
- Se agrego prueba para confirmar que `loadDocument` recupera el payload local guardado.
- Se agrego prueba para confirmar que un documento local inexistente devuelve `null`.
- Se mantuvo separada la carga automatica en UI porque corresponde a la tarea siguiente de Fase 1.7.
- Se marco la tarea como completada en `tasks.md`.

Archivos modificados:

- `src/editor/services/document-storage.service.ts`
- `src/editor/services/document-storage.service.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 10 archivos de prueba correctos, 49 pruebas correctas.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio cierra una tarea formal de Fase 1.7 y esta cubierto por pruebas, lint, build y check.

Pendientes inmediatos:

- Guardar siempre JSON canonico y HTML renderizable.
- Continuar con Fase 1.7 en orden.

## 2026-07-07 - Validacion de payload completo en guardado

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.7: guardar siempre JSON canonico y HTML renderizable.

Acciones realizadas:

- Se hizo estricto `documentStoragePayloadSchema`.
- `contentHtml` ahora debe ser un string no vacio para considerarse salida renderizable.
- Se conservaron `contentJson` y `contentHtml` como campos obligatorios en `DocumentStoragePayload`.
- El storage local ahora devuelve promesas que rechazan cuando el payload no cumple el schema, igual que el storage HTTP.
- Se agregaron pruebas para confirmar que un payload solo HTML no se escribe en localStorage.
- Se agregaron pruebas para confirmar que un payload solo JSON no se escribe en localStorage.
- Se agrego prueba para confirmar que payloads incompletos no se envian al API HTTP.
- Se marco la tarea como completada en `tasks.md`.

Archivos modificados:

- `src/editor/services/document-storage.service.ts`
- `src/editor/services/document-storage.service.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 10 archivos de prueba correctos, 52 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio cierra una tarea formal de Fase 1.7 y esta cubierto por pruebas y check.

Pendientes inmediatos:

- Implementar carga de documento existente.
- Continuar con Fase 1.7 en orden.

## 2026-07-07 - Carga de documento existente al iniciar

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.7: implementar carga de documento existente para restaurar contenido guardado al recargar la pagina.

Acciones realizadas:

- Se extrajo el montaje principal a `src/editor/editor-app.ts` con `mountEditorApp`.
- `main.ts` ahora invoca `mountEditorApp({ app })`.
- `mountEditorApp` consulta `storage.loadDocument(documentId)` antes de crear la instancia Tiptap.
- Si existe documento guardado, el editor inicia desde `contentJson`, manteniendo el JSON de ProseMirror como fuente canonica.
- Si no existe documento guardado, se usa el contenido inicial de ejemplo.
- El guardado manual sigue enviando `title`, `contentJson` y `contentHtml`.
- Se agregaron pruebas unitarias para confirmar que el contenido guardado se restaura antes del montaje.
- Se agregaron pruebas unitarias para confirmar que, despues de restaurar o iniciar, el guardado sigue enviando JSON canonico y HTML renderizable.
- Se marco la tarea como completada en `tasks.md`.

Archivos creados:

- `src/editor/editor-app.ts`
- `src/editor/editor-app.test.ts`

Archivos modificados:

- `src/main.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 11 archivos de prueba correctos, 54 pruebas correctas.
- Se ejecuto `npm run lint`.
- Resultado: ESLint termino correctamente.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5174/` porque `5173` estaba ocupado.
- Se ejecuto verificacion manual automatizada con Playwright sembrando `localStorage`.
- Resultado: al abrir la pagina, el editor mostro `<h2>Restaurado desde localStorage</h2>` y el parrafo guardado.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio cierra una tarea formal de Fase 1.7 y esta cubierto por pruebas, check y verificacion manual automatizada.

Pendientes inmediatos:

- Manejar error de guardado.
- Continuar con Fase 1.7 en orden.

## 2026-07-07 - Manejo de error de guardado

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.7: manejar error de guardado.

Acciones realizadas:

- Se verifico el flujo existente de `mountEditorApp`: el guardado manual envuelve `storage.saveDocument` en `try/catch`.
- El estado visual cambia a `Guardando` antes del intento y a `Error` cuando `saveDocument` rechaza.
- Se agrego prueba unitaria para simular un fallo de red, respuesta no OK o excepcion mediante un storage que rechaza el guardado.
- La prueba confirma que el estado visible queda en `Error`.
- La prueba confirma que `data-save-status` queda en `error`.
- La prueba confirma que el contenido actual del editor no se pierde despues del fallo.
- Se marco la tarea como completada en `tasks.md`.

Archivos modificados:

- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 11 archivos de prueba correctos, 55 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio completa Fase 1.7 y esta cubierto por pruebas y check.

Pendientes inmediatos:

- Implementar vista de renderizado basica.
- Continuar con Fase 1.8 en orden.

## 2026-07-07 - Vista de renderizado basica

Objetivo:

- Cerrar la primera tarea pendiente de Fase 1.8: implementar una vista de renderizado basica.

Acciones realizadas:

- Se implemento `createPreviewView` en `src/editor/components/preview-view.ts`.
- La vista crea una seccion `.editor-preview` con titulo y contenedor `.editor-preview__content`.
- La vista expone `setHtml(html)` para actualizar el HTML renderizado.
- `mountEditorApp` monta la vista debajo del shell del editor.
- Al cargar un documento existente, la vista inicia con `contentHtml` guardado.
- Al editar contenido, la vista se actualiza con el HTML renderizable emitido por Tiptap.
- Se agregaron estilos base para la zona de renderizado.
- Se agregaron pruebas unitarias del componente de preview.
- Se agregaron pruebas unitarias para confirmar que la preview se monta desde documento cargado y se actualiza al editar.
- Se marco la tarea como completada en `tasks.md`.

Archivos creados:

- `src/editor/components/preview-view.test.ts`

Archivos modificados:

- `src/editor/components/preview-view.ts`
- `src/editor/editor-app.ts`
- `src/editor/editor-app.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 12 archivos de prueba correctos, 58 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5174/` porque `5173` estaba ocupado.
- Se ejecuto verificacion manual automatizada con Playwright.
- Resultado: existe `.editor-preview`, el titulo dice `Vista renderizada` y el contenido se actualiza con el texto editado.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.

Notas:

- La vista usa por ahora el HTML producido por Tiptap. La sanitizacion queda pendiente para la siguiente tarea de Fase 1.8.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creo commit porque el cambio cierra una tarea formal de Fase 1.8 y esta cubierto por pruebas, check y verificacion manual automatizada.

Pendientes inmediatos:

- Sanitizar antes de renderizar con HTML.
- Continuar con Fase 1.8 en orden.

## 2026-07-07 - Sanitizacion de HTML en preview

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.8: sanitizar antes de renderizar con HTML.

Acciones realizadas:

- Se implemento `sanitizeHtml` en `src/editor/services/sanitizer.service.ts` usando DOMPurify.
- Se agrego una politica explicita de tags, atributos y protocolos permitidos para el HTML renderizable del editor.
- `createPreviewView` ahora recibe un `SanitizerService` opcional y usa uno seguro por defecto.
- Todo HTML inicial y todo HTML actualizado mediante `setHtml(html)` pasa por `sanitizeHtml` antes de asignarse a `innerHTML`.
- Se agregaron pruebas para confirmar que la preview elimina `<script>`, handlers inline como `onclick`/`onerror` y URLs `javascript:`.
- Se marco la tarea como completada en `tasks.md`.

Archivos modificados:

- `src/editor/services/sanitizer.service.ts`
- `src/editor/components/preview-view.ts`
- `src/editor/components/preview-view.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 12 archivos de prueba correctos, 60 pruebas correctas.
- Se ejecuto `npm run build`.
- Resultado: build correcto con Vite y TypeScript estricto.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.
- Se ejecuto `npm run lint`.
- Resultado inicial: fallo por una asercion de tipo innecesaria en `sanitizer.service.ts`.
- Se retiro la asercion innecesaria.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque se cerro una sola tarea pequena en esta iteracion y el usuario no solicito publicar cambios.

Pendientes inmediatos:

- Verificar que el contenido recuperado conserva estructura.
- Continuar con Fase 1.8 en orden.

## 2026-07-07 - Verificacion de estructura recuperada

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 1.8: verificar que el contenido recuperado conserva estructura.

Acciones realizadas:

- Se agrego una prueba de integracion en `src/editor/editor-app.test.ts` para montar la app con un documento recuperado desde storage.
- El documento de prueba incluye encabezado, parrafo, negrita, cursiva, subrayado, lista no ordenada y lista ordenada.
- La prueba valida que el JSON restaurado conserva tipos de nodo y marcas.
- La prueba valida que el HTML generado por Tiptap conserva la estructura renderizable esperada.
- La prueba valida que la preview renderiza la estructura recuperada despues de pasar por sanitizacion.
- Se marco la tarea como completada en `tasks.md`.

Archivos modificados:

- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 12 archivos de prueba correctos, 61 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se creara commit porque las tareas finales de Fase 1.8 quedaron completas, verificadas y forman un cierre coherente junto con la sanitizacion de preview.

Pendientes inmediatos:

- Agregar tachado.
- Continuar con Fase 2 en orden.

## 2026-07-07 - Tachado en toolbar

Objetivo:

- Cerrar la primera tarea pendiente de Fase 2: agregar tachado.

Acciones realizadas:

- Se agrego `toggleStrike` al registro de comandos del editor.
- La toolbar ahora incluye el boton de tachado junto a negrita, cursiva y subrayado.
- El boton usa `aria-label`, `aria-pressed`, estado activo con `editor.isActive('strike')` y el mismo ciclo de vida de listeners de la toolbar.
- Se agregaron pruebas para validar que el comando genera marca canonica `strike` y HTML renderizable con `<s>`.
- Se agrego prueba de integracion para activar tachado desde la toolbar, guardar y confirmar que el payload persiste `contentJson` con `strike` y `contentHtml` renderizable.
- Se marco la tarea como completada en `tasks.md`.

Archivos modificados:

- `src/editor/core/editor-commands.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 12 archivos de prueba correctos, 62 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el usuario no solicito commit en esta iteracion y el cambio queda listo para agruparse con las siguientes tareas de Fase 2 si corresponde.

Pendientes inmediatos:

- Agregar color de texto.
- Continuar con Fase 2 en orden.

## 2026-07-07 - Color de texto en toolbar

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 2: agregar color de texto.

Acciones realizadas:

- Se agregaron comandos `setTextColor` y `unsetTextColor` al registro de comandos del editor.
- La toolbar ahora incluye selector nativo de color, cinco swatches predefinidos y un boton para quitar color.
- Los controles de color tienen `aria-label`, estado disabled, `aria-pressed` en swatches y actualizacion de estado segun `editor.getAttributes('textStyle').color`.
- Se agregaron estilos compactos para picker, swatches y boton de limpiar color, manteniendo dimensiones estables en la toolbar.
- Se agregaron pruebas para aplicar y quitar color desde comandos.
- Se agregaron pruebas de toolbar para seleccionar color desde swatch, seleccionar desde picker y remover color.
- Se agrego prueba de integracion para seleccionar color desde la toolbar, guardar y confirmar que el payload persiste `contentJson` con `textStyle.attrs.color` y `contentHtml` renderizable.
- Se marco la tarea como completada en `tasks.md`.

Archivos modificados:

- `src/editor/core/editor-commands.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 12 archivos de prueba correctos, 64 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol ya tenia cambios locales no commiteados de la tarea de tachado y el usuario no solicito commit.

Pendientes inmediatos:

- Agregar resaltado.
- Continuar con Fase 2 en orden.

## 2026-07-07 - Resaltado multicolor en toolbar

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 2: agregar resaltado multicolor y permitir eliminarlo.

Acciones realizadas:

- Se agregaron comandos `setHighlightColor` y `unsetHighlight` al registro central de comandos.
- El picker de color quedo parametrizable con `actionPrefix` y etiquetas, para reutilizarlo sin colisionar selectores.
- La toolbar ahora incluye un picker independiente de resaltado con prefijo `highlight-color`.
- El picker de resaltado usa la misma paleta tipo Office: `Sin resaltado`, colores de tema, colores estandar y `Mas colores...`.
- Se sincroniza el estado activo desde `editor.getAttributes('highlight').color`.
- Se agregaron pruebas de comando para aplicar y quitar highlight con color.
- Se agregaron pruebas de toolbar para aplicar resaltado desde swatch y quitarlo desde `Sin resaltado`.
- Se agrego prueba de integracion para guardar resaltado y confirmar `contentJson` con marca `highlight` y `contentHtml` renderizable con `<mark>`.
- Se marco la tarea como completada en `tasks.md`.

Archivos modificados:

- `src/editor/core/editor-commands.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/components/text-color-picker.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 13 archivos de prueba correctos, 70 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5174/` porque `5173` estaba ocupado.
- Se ejecuto verificacion manual automatizada con Playwright.
- Resultado: panel de resaltado visible; grillas de tema y estandar visibles; swatch amarillo aplica `<mark data-color="#ffff00">`; `Sin resaltado` elimina los marks.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Agregar alineacion izquierda, centro, derecha y justificada.
- Continuar con Fase 2 en orden.

## 2026-07-07 - Alineacion de parrafos y encabezados

Objetivo:

- Cerrar la siguiente tarea pendiente de Fase 2: agregar alineacion izquierda, centro, derecha y justificada.

Acciones realizadas:

- Se agrego el tipo `TextAlignment`.
- Se agregaron comandos `setTextAlignLeft`, `setTextAlignCenter`, `setTextAlignRight` y `setTextAlignJustify`.
- Se agrego comando base `setTextAlign(editor, alignment)`.
- La toolbar ahora incluye botones para izquierda, centro, derecha y justificar.
- Los botones usan iconos Fontello reales `align-left`, `align-center`, `align-right` y `align-justify`.
- Los botones exponen `aria-label`, `aria-pressed` y estado activo segun `textAlign`.
- Se agregaron pruebas para alinear parrafos y encabezados.
- Se agregaron pruebas de toolbar para los cuatro botones.
- Se agrego prueba de integracion para guardar alineacion y confirmar `contentJson.attrs.textAlign` y `contentHtml` renderizable.
- Se marco la tarea como completada en `tasks.md`.

Archivos modificados:

- `src/editor/core/editor-commands.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 13 archivos de prueba correctos, 72 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5174/` porque `5173` estaba ocupado.
- Se ejecuto verificacion manual automatizada con Playwright.
- Resultado: los botones `align-left`, `align-center`, `align-right` y `align-justify` quedaron presionados al usarse y aplicaron `text-align` visible `left`, `center`, `right` y `justify`.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Agregar citas.
- Continuar con Fase 2 en orden.

## 2026-07-07 - Selector de color tipo Office

Objetivo:

- Ajustar el selector de color de texto para que visualmente siga la referencia enviada por el usuario, con estilo tipo Office.

Acciones realizadas:

- Se reemplazo el selector segmentado anterior por un panel con secciones.
- El panel ahora muestra una fila `Automatico` para quitar el color aplicado.
- Se agrego una seccion `Colores de tema` con 48 swatches organizados por columnas y variaciones.
- Se agrego una seccion `Colores estandar` con 9 swatches.
- Se agrego la accion `Mas colores...`, que despliega el input nativo `type="color"`.
- El trigger de toolbar sigue siendo compacto y muestra una barra con el color activo.
- Se actualizo la persistencia para usar un color existente en la nueva paleta.
- Se actualizaron pruebas unitarias y de toolbar para validar la nueva estructura.
- Se actualizo `tasks.md` para describir el picker tipo Office.

Archivos modificados:

- `src/editor/components/text-color-picker.ts`
- `src/editor/components/text-color-picker.test.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 13 archivos de prueba correctos, 68 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5174/` porque `5173` estaba ocupado.
- Se ejecuto verificacion manual automatizada con Playwright.
- Resultado: panel visible; `Automatico` visible; `Colores de tema` visible con 48 swatches; `Colores estandar` visible con 9 swatches; `Mas colores...` despliega un input `type="color"`.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar el ajuste visual.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Agregar resaltado.
- Continuar con Fase 2 en orden.

## 2026-07-07 - Selector de color como popover con modos alternables

Objetivo:

- Corregir el refinamiento anterior porque el selector de color seguia viendose como controles inline y no como un color picker con dos modos claros.

Acciones realizadas:

- `text-color-picker.ts` ahora renderiza un boton compacto en la toolbar y un panel desplegable.
- El panel tiene un selector de modo entre `Grid` y `Personalizado`.
- En modo `Grid` se muestra solo la grilla de colores predefinidos.
- En modo `Personalizado` se muestra solo el input nativo `type="color"`.
- Se mantiene el boton para quitar color dentro del panel.
- Se agrego cierre al seleccionar un swatch, al limpiar color y al hacer click fuera del picker.
- Se actualizo el CSS para que el panel sea un popover con `z-index` y no quede recortado por la toolbar.
- Se actualizaron pruebas unitarias y de toolbar para abrir el picker y alternar modos.
- Se actualizo la prueba de persistencia para abrir el picker antes de seleccionar un color.
- Se actualizo la nota de `tasks.md` para dejar claro que los modos son alternables en un popover.

Archivos modificados:

- `src/editor/components/text-color-picker.ts`
- `src/editor/components/text-color-picker.test.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 13 archivos de prueba correctos, 68 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Se ejecuto `npm run dev -- --host 127.0.0.1`.
- Resultado: Vite sirvio la aplicacion en `http://127.0.0.1:5174/` porque `5173` estaba ocupado.
- Se ejecuto verificacion manual automatizada con Playwright.
- Resultado: al abrir el trigger, el panel es visible; inicialmente se ve el grid; al seleccionar `Personalizado`, el grid se oculta y aparece el input `type="color"`.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar el ajuste visual.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Agregar resaltado.
- Continuar con Fase 2 en orden.

## 2026-07-07 - Componente de selector de color de texto

Objetivo:

- Refinar la tarea completada de color de texto para usar un componente dedicado con dos modos: grid de colores predefinidos e input nativo `type="color"`.

Acciones realizadas:

- Se creo `text-color-picker.ts` como componente TypeScript vanilla reutilizable.
- El componente renderiza un grid de colores predefinidos y un input nativo `type="color"`.
- El componente expone `setValue` y `setDisabled` para que la toolbar sincronice el estado activo del editor sin conocer detalles internos del DOM.
- La toolbar ahora solo conecta `onChange` con `setTextColor` y `onClear` con `unsetTextColor`.
- Se movio la normalizacion de colores hexadecimales al componente.
- Se actualizaron clases CSS para el nuevo componente, manteniendo dimensiones estables y comportamiento responsive.
- Se agregaron pruebas unitarias especificas de `text-color-picker`.
- Se actualizaron las pruebas de toolbar para validar el componente, el grid y el input de color.
- Se agrego nota en `tasks.md` bajo la tarea de color de texto completada.

Archivos creados:

- `src/editor/components/text-color-picker.ts`
- `src/editor/components/text-color-picker.test.ts`

Archivos modificados:

- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test`.
- Resultado: 13 archivos de prueba correctos, 68 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar el refinamiento.
- No se creo commit todavia porque el arbol ya contiene cambios locales acumulados de Fase 2 y el usuario no solicito commit.

Pendientes inmediatos:

- Agregar resaltado.
- Continuar con Fase 2 en orden.

## 2026-07-06 - Citas en toolbar y persistencia

Objetivo:

- Cerrar la tarea de Fase 2: agregar citas.

Acciones realizadas:

- Se agrego el comando `toggleBlockquote` al registro de comandos del editor.
- Se agrego un boton de cita en la toolbar usando el icono Fontello `quote-left`.
- El boton refleja estado activo con `editor.isActive('blockquote')` y `aria-pressed`.
- Se agrego `mousedown.preventDefault()` a los botones de toolbar para conservar la seleccion del editor antes de ejecutar comandos.
- Se agrego prueba de comando para convertir un parrafo en `blockquote` y volverlo a parrafo.
- Se agrego prueba de toolbar para activar y desactivar la cita con estado accesible.
- Se agrego prueba de integracion para guardar contenido citado como JSON canonico y HTML renderizable.
- Se marco la tarea `Agregar citas` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/core/editor-commands.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/editor-commands.test.ts src/editor/components/toolbar.test.ts src/editor/editor-app.test.ts`.
- Resultado: 3 archivos de prueba correctos, 23 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 13 archivos de prueba correctos, 75 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Agregar separador horizontal.
- Continuar con Fase 2 en orden.

## 2026-07-06 - Separador horizontal en toolbar y persistencia

Objetivo:

- Cerrar la tarea de Fase 2: agregar separador horizontal.

Acciones realizadas:

- Se agrego el comando `setHorizontalRule` al registro central de comandos.
- Se agrego el boton `horizontal-rule` a la toolbar usando el icono Fontello `minus`.
- El boton inserta un nodo canonico `horizontalRule` en la posicion del cursor.
- Se mantuvo `hr` como HTML renderizable y sanitizable; no fue necesario cambiar el schema ni el sanitizador porque ya aceptaban `horizontalRule` y `hr`.
- Se agrego prueba de comando para insertar el separador y validar JSON/HTML.
- Se agrego prueba de toolbar para insertar el separador desde el boton.
- Se agrego prueba de integracion para guardar el separador como JSON canonico y HTML renderizable.
- Se marco la tarea `Agregar separador horizontal` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/core/editor-commands.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/editor-commands.test.ts src/editor/components/toolbar.test.ts src/editor/editor-app.test.ts`.
- Resultado: 3 archivos de prueba correctos, 26 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente; ajusto formato en `src/editor/components/toolbar.test.ts`.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 13 archivos de prueba correctos, 78 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Agregar bloques de codigo.
- Continuar con Fase 2 en orden.

## 2026-07-06 - Bloques de codigo en toolbar y persistencia

Objetivo:

- Cerrar la tarea de Fase 2: agregar bloques de codigo.

Acciones realizadas:

- Se agrego el comando `toggleCodeBlock` al registro central de comandos.
- Se agrego el boton `code-block` a la toolbar con icono textual `</>`.
- El boton activa y desactiva `codeBlock`, refleja estado activo con `aria-pressed` y conserva la seleccion del editor mediante el manejo existente de `mousedown`.
- Se agregaron estilos para `pre` y `pre code` en el editor y en la vista previa.
- Se confirmo que no era necesario cambiar schema ni sanitizador porque ya aceptaban `codeBlock`, `pre` y `code`.
- Se agrego prueba de comando para activar un bloque de codigo, editar texto multilinea y validar JSON/HTML.
- Se agrego prueba de toolbar para activar/desactivar bloque de codigo sin perder texto.
- Se agrego prueba de integracion para guardar el bloque de codigo como JSON canonico y HTML renderizable.
- Se marco la tarea `Agregar bloques de codigo` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/core/editor-commands.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/editor-commands.test.ts src/editor/components/toolbar.test.ts src/editor/editor-app.test.ts`.
- Resultado: 3 archivos de prueba correctos, 29 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente; ajusto formato en `src/editor/editor-app.test.ts`.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 13 archivos de prueba correctos, 81 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Configurar placeholder.
- Continuar con Fase 2 en orden.

## 2026-07-06 - Placeholder configurable

Objetivo:

- Cerrar la tarea de Fase 2: configurar placeholder.

Acciones realizadas:

- Se conecto `mountEditorApp` con `defaultEditorConfig.placeholder`.
- Se agrego la opcion `placeholder?: string` a `MountEditorAppOptions`.
- La app ahora pasa el texto configurable a `createWysiwygEditor` en lugar de usar una cadena fija.
- Se agrego prueba de fabrica para confirmar que un editor vacio renderiza `data-placeholder` con el texto configurable.
- Se agrego prueba de app completa para confirmar que `mountEditorApp` propaga el placeholder personalizado a un documento vacio.
- Se marco la tarea `Configurar placeholder` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/editor-app.ts`
- `src/editor/editor-app.test.ts`
- `src/editor/core/create-editor.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/create-editor.test.ts src/editor/editor-app.test.ts`.
- Resultado: 2 archivos de prueba correctos, 17 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 13 archivos de prueba correctos, 83 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Implementar links configurables.
- Continuar con Fase 2 en orden.

## 2026-07-06 - Links configurables

Objetivo:

- Cerrar la tarea de Fase 2: implementar links configurables.

Acciones realizadas:

- Se agregaron comandos `setLink` y `unsetLink` al registro central de comandos.
- Se agrego normalizacion y validacion de enlaces para aceptar `http`, `https`, `mailto`, rutas relativas y anclas.
- Se rechazan entradas vacias, caracteres de control y protocolos no permitidos como `javascript:`, `data:` y `tel:`.
- Se creo el componente vanilla `link-popover.ts` para crear, editar y quitar enlaces desde la toolbar.
- El popover conserva la seleccion del editor al abrirse y la restaura antes de aplicar o quitar el enlace.
- Se integro el control de enlace en la toolbar junto a los controles inline de color y resaltado.
- Se ajusto la extension Link para alinear protocolos configurados con el schema y el sanitizador.
- Se amplio el schema canonico de `link` para aceptar `title` nullable, porque Tiptap lo emite en el JSON de la marca.
- Se agregaron estilos del popover de enlace en `src/style.css`.
- Se agregaron pruebas de comandos, toolbar, schema y persistencia desde la app montada.
- Se marco la tarea `Implementar links configurables` como completada en `tasks.md`.

Archivos creados:

- `src/editor/components/link-popover.ts`

Archivos modificados:

- `src/editor/core/editor-commands.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/core/editor-extensions.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.test.ts`
- `src/editor/models/editor-content.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/editor-commands.test.ts src/editor/components/toolbar.test.ts src/editor/editor-app.test.ts src/editor/models/editor-content.test.ts`.
- Resultado: 4 archivos de prueba correctos, 44 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente; ajusto formato en `src/editor/components/toolbar.test.ts`.
- Se ejecuto `npm run check`.
- Primer resultado: build correcto, pero lint fallo por `no-control-regex` en la validacion de caracteres de control.
- Se reemplazo esa validacion por comparacion de codigos de caracter y se reejecuto `npm run check`.
- Resultado final: build, lint y tests terminaron correctamente; 13 archivos de prueba correctos, 87 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Impedir protocolos inseguros en enlaces.
- Continuar con Fase 2 en orden.

## 2026-07-06 - Protocolos inseguros en enlaces

Objetivo:

- Cerrar la tarea de Fase 2: impedir protocolos inseguros en enlaces.
- Atender la solicitud adicional de usar el icono Fontello de tachado en la toolbar.

Acciones realizadas:

- Se creo `src/editor/utils/safe-url.ts` como fuente comun de validacion y normalizacion de URLs.
- Se centralizo la validacion de enlaces para aceptar solo `http`, `https`, `mailto`, rutas relativas validas y anclas.
- Se rechazan protocolos y formas inseguras como `javascript:`, `data:`, `tel:`, `ftp:`, `java\nscript:` y URLs protocol-relative `//host`.
- Se conecto la validacion comun con comandos de link, schema canonico y configuracion de la extension Link.
- Se ajusto el sanitizador para permitir rutas relativas `./` y `../`, y rechazar `//host`.
- Se cambio el serializer para devolver `contentHtml` sanitizado antes de persistir.
- Se agregaron pruebas para confirmar que HTML cargado con links inseguros no conserva marcas `link` peligrosas.
- Se agregaron pruebas de schema, storage local y serializer para confirmar que protocolos inseguros no quedan persistidos.
- Se cambio el boton de tachado para usar el glifo Fontello `strike` (`\uf0cc`) en lugar del texto `S`.
- Se agrego una asercion de toolbar para proteger el icono de tachado.
- Se marco la tarea `Impedir protocolos inseguros en enlaces` como completada en `tasks.md`.

Archivos creados:

- `src/editor/utils/safe-url.ts`

Archivos modificados:

- `src/editor/core/create-editor.test.ts`
- `src/editor/core/editor-commands.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/core/editor-extensions.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/models/editor-content.ts`
- `src/editor/models/editor-content.test.ts`
- `src/editor/services/document-storage.service.test.ts`
- `src/editor/services/sanitizer.service.ts`
- `src/editor/services/serializer.service.ts`
- `src/editor/services/serializer.service.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/create-editor.test.ts src/editor/core/editor-commands.test.ts src/editor/models/editor-content.test.ts src/editor/services/serializer.service.test.ts src/editor/services/document-storage.service.test.ts`.
- Resultado: 5 archivos de prueba correctos, 46 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 13 archivos de prueba correctos, 90 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Validar build despues de formato avanzado.
- Continuar con Fase 2 en orden.

## 2026-07-06 - Build despues de formato avanzado

Objetivo:

- Cerrar la tarea de Fase 2: validar build despues de formato avanzado.

Acciones realizadas:

- Se ejecuto el build de produccion despues de completar las tareas de formato avanzado.
- Se confirmo que TypeScript y Vite compilan correctamente con las funciones de tachado, color, resaltado, alineacion, citas, separador, bloques de codigo, placeholder y enlaces.
- Se marco la tarea `Validar build despues de formato avanzado` como completada en `tasks.md`.

Archivos modificados:

- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm run build`.
- Resultado: `tsc && vite build` termino correctamente.
- Artefactos reportados por Vite: `dist/index.html`, `dist/assets/index-D5ghJA8C.css` y `dist/assets/index-DX0OWhC3.js`.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Implementar `table-commands.ts`.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Comandos de tabla

Objetivo:

- Cerrar la tarea de Fase 3: implementar `table-commands.ts`.

Acciones realizadas:

- Se reemplazo el stub opcional de `table-commands.ts` por un registro real `tableCommands`.
- Se agregaron comandos tipados para insertar tabla, agregar/eliminar filas, agregar/eliminar columnas, eliminar tabla, alternar fila de encabezado, combinar celdas y separar celdas.
- Se agrego `InsertTableOptions` para configurar filas, columnas y fila de encabezado.
- Se definio `defaultInsertTableOptions` con tabla 3x3 y fila de encabezado.
- Se normalizan dimensiones de tabla y se rechazan valores invalidos antes de ejecutar el comando de Tiptap.
- Se agrego `table-commands.test.ts` con pruebas sobre un editor Tiptap real.
- Las pruebas cubren insercion 3x3 con encabezado, insercion personalizada, filas, columnas, encabezado, merge/split y eliminacion de tabla.
- Se marco la tarea `Implementar table-commands.ts` como completada en `tasks.md`.

Archivos creados:

- `src/editor/core/table-commands.test.ts`

Archivos modificados:

- `src/editor/core/table-commands.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/table-commands.test.ts`.
- Resultado: 1 archivo de prueba correcto, 7 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 14 archivos de prueba correctos, 97 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Agregar boton para insertar tabla 3x3 con encabezado.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Boton para insertar tabla 3x3

Objetivo:

- Cerrar la tarea de Fase 3: agregar boton para insertar tabla 3x3 con encabezado.

Acciones realizadas:

- Se agrego el boton `insert-table` a la toolbar.
- El boton usa el icono Fontello `table` (`\uf0ce`) y el texto accesible `Insertar tabla 3 por 3 con encabezado`.
- Se conecto el boton con `tableCommands.insertTable`, que usa por defecto una tabla 3x3 con fila de encabezado.
- Se mantuvieron separados los controles de filas, columnas, borrado y merges porque son tareas posteriores de Fase 3.
- Se actualizo la prueba de accesibilidad de toolbar para cubrir el nuevo boton.
- Se agrego una prueba de toolbar que inserta la tabla desde el boton y valida JSON con `table`, `tableRow`, `tableHeader` y `tableCell`, ademas de HTML renderizable con `table`, `th` y `td`.
- Se marco la tarea `Agregar boton para insertar tabla 3x3 con encabezado` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/toolbar.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 2 archivos de prueba correctos, 15 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Primer resultado: TypeScript fallo en el test nuevo por acceso a `content` sin narrowing.
- Se corrigio el test con helper tipado sobre `JSONContent` y se reejecuto `npm run check`.
- Resultado final: build, lint y tests terminaron correctamente; 14 archivos de prueba correctos, 98 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- No se creo commit todavia porque el arbol contiene cambios locales acumulados y el usuario no solicito commit.

Pendientes inmediatos:

- Agregar controles para agregar fila antes y despues.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Controles para agregar filas

Objetivo:

- Cerrar la tarea de Fase 3: agregar controles para agregar fila antes y despues.

Acciones realizadas:

- Se agregaron los botones `add-row-before` y `add-row-after` a la toolbar despues del boton de insertar tabla.
- Los botones usan iconos Fontello de flecha arriba y flecha abajo con modificador `+` para indicar insercion de fila.
- Se conectaron los botones con `tableCommands.addRowBefore` y `tableCommands.addRowAfter`.
- Se deshabilitan fuera de una tabla usando `editor.can().chain().focus().addRowBefore().run()` y `addRowAfter()`.
- Se actualizo la prueba de accesibilidad de toolbar para cubrir los nuevos botones y validar que inician deshabilitados fuera de tabla.
- Se agrego una prueba de toolbar que inserta una tabla, selecciona una celda real y valida que los botones agregan filas antes y despues.
- Se marco la tarea `Agregar controles para agregar fila antes y despues` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/toolbar.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 2 archivos de prueba correctos, 16 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 14 archivos de prueba correctos, 99 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se crea commit porque el cambio cierra una tarea formal de Fase 4, esta verificado y tiene un alcance coherente.

Pendientes inmediatos:

- Agregar controles para eliminar fila.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Ajuste de controles de filas en toolbar

Objetivo:

- Atender la decision de UI de no dejar botones individuales para agregar o quitar filas en la toolbar.

Acciones realizadas:

- Se retiraron los botones `add-row-before` y `add-row-after` de la toolbar.
- Se mantuvo el boton `insert-table` como unico control visible de tabla en la toolbar por ahora.
- Se restauro el separador visual despues del boton `insert-table` para conservar la agrupacion de controles.
- Se retiraron las pruebas de toolbar que asumian botones individuales para agregar filas.
- Se mantuvieron las pruebas de comandos de tabla, porque `tableCommands.addRowBefore`, `addRowAfter` y `deleteRow` siguen siendo la base para el menu contextual.
- Se reabrio la tarea `Agregar controles para agregar fila antes y despues` en `tasks.md`.
- Se agregaron notas en `tasks.md` para que agregar y eliminar filas se implementen despues en `table-menu.ts` o en un unico control agrupado de comandos de tabla, no como botones individuales.

Archivos modificados:

- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/toolbar.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 2 archivos de prueba correctos, 15 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 14 archivos de prueba correctos, 98 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Agregar controles para agregar fila antes y despues en menu contextual o control agrupado.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Filas antes y despues en menu contextual de tabla

Objetivo:

- Cerrar la tarea de Fase 3: agregar controles para agregar fila antes y despues sin usar botones individuales en la toolbar.

Acciones realizadas:

- Se agrego un slot contextual `tableMenu` al shell del editor debajo de la toolbar principal.
- Se implemento `createTableMenu` en `table-menu.ts` como menu contextual parcial de tabla.
- El menu se oculta fuera de tabla y mantiene sus controles deshabilitados cuando la seleccion no permite ejecutar los comandos.
- Se agregaron los controles `Fila antes` y `Fila despues` conectados a `tableCommands.addRowBefore` y `tableCommands.addRowAfter`.
- Se integro el menu contextual desde `mountEditorApp`.
- Se agregaron estilos compactos para el menu contextual de tabla.
- Se agrego prueba especifica de `table-menu.ts` para estado fuera de tabla, habilitacion dentro de tabla y agregado real de filas antes/despues.
- Se agrego prueba de integracion para confirmar que los comandos de fila se montan en el menu contextual y no en la toolbar.
- Se marco la tarea `Agregar controles para agregar fila antes y despues` como completada en `tasks.md`.

Archivos creados:

- `src/editor/components/table-menu.test.ts`

Archivos modificados:

- `src/editor/components/editor-shell.ts`
- `src/editor/components/editor-shell.test.ts`
- `src/editor/components/table-menu.ts`
- `src/editor/editor-app.ts`
- `src/editor/editor-app.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/components/editor-shell.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Primer resultado: fallo una asercion del test de menu por intentar salir de tabla con una posicion de seleccion ambigua.
- Se ajusto el test para validar el estado fuera de tabla reemplazando el contenido por un parrafo.
- Se reejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/components/editor-shell.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 4 archivos de prueba correctos, 27 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 101 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Agregar controles para eliminar fila.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Eliminar fila en menu contextual de tabla

Objetivo:

- Cerrar la tarea de Fase 3: agregar controles para eliminar fila sin usar botones individuales en la toolbar.

Acciones realizadas:

- Se agrego la accion `delete-row` al menu contextual `table-menu.ts`.
- El boton visible es `Eliminar fila` y usa el icono Fontello de papelera.
- El boton se conecta con `tableCommands.deleteRow`.
- El estado del menu ahora calcula `canDeleteRow`.
- Para manejar la ultima fila sin error, el boton `Eliminar fila` se deshabilita cuando la tabla actual solo tiene una fila.
- Se actualizo la prueba de `table-menu.ts` para validar estado fuera de tabla, eliminacion de una fila actual y comportamiento seguro en la ultima fila.
- Se actualizo la prueba de integracion de `editor-app.test.ts` para confirmar que `delete-row` aparece en el menu contextual y no en la toolbar.
- Se marco la tarea `Agregar controles para eliminar fila` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/components/table-menu.ts`
- `src/editor/components/table-menu.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Primer resultado: fallo la expectativa inicial de que Tiptap eliminara la tabla al borrar la ultima fila; Tiptap conserva la tabla de una fila.
- Se ajusto el comportamiento del menu para deshabilitar `Eliminar fila` cuando la tabla tiene una sola fila.
- Se reejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 3 archivos de prueba correctos, 25 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 102 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Agregar controles para agregar columna antes y despues.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Columnas antes y despues en menu contextual de tabla

Objetivo:

- Cerrar la tarea de Fase 3: agregar controles para agregar columna antes y despues.

Acciones realizadas:

- Se agregaron las acciones `add-column-before` y `add-column-after` al menu contextual `table-menu.ts`.
- Los botones visibles son `Columna antes` y `Columna despues`.
- Los botones usan iconos Fontello de flecha izquierda y derecha.
- Se conectaron con `tableCommands.addColumnBefore` y `tableCommands.addColumnAfter`.
- El estado del menu ahora calcula `canAddColumnBefore` y `canAddColumnAfter`.
- Los controles se mantienen deshabilitados fuera de tabla y se habilitan dentro de una tabla valida.
- Se actualizo la prueba de `table-menu.ts` para validar estado fuera de tabla y agregado real de columnas antes/despues.
- Se actualizo la prueba de integracion de `editor-app.test.ts` para confirmar que `add-column-after` aparece en el menu contextual y no en la toolbar.
- Se marco la tarea `Agregar controles para agregar columna antes y despues` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/components/table-menu.ts`
- `src/editor/components/table-menu.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 3 archivos de prueba correctos, 26 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente; ajusto formato en `src/editor/components/table-menu.ts` y `src/editor/components/table-menu.test.ts`.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 103 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Agregar controles para eliminar columna.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Eliminar columna en menu contextual de tabla

Objetivo:

- Cerrar la tarea de Fase 3: agregar controles para eliminar columna sin volver a crear botones individuales en la toolbar.

Acciones realizadas:

- Se agrego la accion `delete-column` al menu contextual `table-menu.ts`.
- El boton visible es `Eliminar columna`.
- El boton usa icono Fontello de papelera y se conecta con `tableCommands.deleteColumn`.
- El estado del menu ahora calcula `canDeleteColumn`.
- Para manejar la ultima columna sin error, el boton `Eliminar columna` se deshabilita cuando la tabla actual solo tiene una columna.
- Se actualizo la prueba de `table-menu.ts` para validar estado fuera de tabla, eliminacion de la columna actual y comportamiento seguro en la ultima columna.
- Se actualizo la prueba de integracion de `editor-app.test.ts` para confirmar que `delete-column` aparece en el menu contextual y no en la toolbar.
- Se marco la tarea `Agregar controles para eliminar columna` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/components/table-menu.ts`
- `src/editor/components/table-menu.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 3 archivos de prueba correctos, 27 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 104 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Agregar control para eliminar tabla.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Eliminar tabla en menu contextual de tabla

Objetivo:

- Cerrar la tarea de Fase 3: agregar control para eliminar tabla sin crear botones individuales en la toolbar.

Acciones realizadas:

- Se agrego la accion `delete-table` al menu contextual `table-menu.ts`.
- El boton visible es `Eliminar tabla`.
- El boton usa icono Fontello de papelera y se conecta con `tableCommands.deleteTable`.
- El estado del menu ahora calcula `canDeleteTable`.
- El control se mantiene deshabilitado fuera de una tabla y se habilita al seleccionar una celda dentro de una tabla.
- Se actualizo la prueba de `table-menu.ts` para validar estado fuera de tabla y eliminacion de una tabla conservando bloques externos.
- Se actualizo la prueba de integracion de `editor-app.test.ts` para confirmar que `delete-table` aparece en el menu contextual y no en la toolbar.
- Se marco la tarea `Agregar control para eliminar tabla` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/components/table-menu.ts`
- `src/editor/components/table-menu.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Primer resultado: fallo por helper `getTable` faltante en `editor-app.test.ts`.
- Se agrego el helper local y se reejecuto el comando.
- Resultado final: 3 archivos de prueba correctos, 28 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 105 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Agregar control para alternar fila de encabezado.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Alternar fila de encabezado en menu contextual de tabla

Objetivo:

- Cerrar la tarea de Fase 3: agregar control para alternar fila de encabezado desde el menu contextual de tabla.

Acciones realizadas:

- Se agrego la accion `toggle-header-row` al menu contextual `table-menu.ts`.
- El boton visible es `Alternar encabezado`.
- El boton usa icono Fontello de tabla y se conecta con `tableCommands.toggleHeaderRow`.
- El estado del menu ahora calcula `canToggleHeaderRow`.
- El control se mantiene deshabilitado fuera de una tabla y se habilita al seleccionar una celda dentro de una tabla.
- Se actualizo la prueba de `table-menu.ts` para validar estado fuera de tabla y alternancia de la primera fila entre `tableCell` y `tableHeader`.
- Se actualizo la prueba de integracion de `editor-app.test.ts` para confirmar que `toggle-header-row` aparece en el menu contextual, no en la toolbar, y cambia la primera fila.
- Se marco la tarea `Agregar control para alternar fila de encabezado` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/components/table-menu.ts`
- `src/editor/components/table-menu.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 3 archivos de prueba correctos, 29 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 106 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Agregar combinar celdas.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Combinar celdas en menu contextual de tabla

Objetivo:

- Cerrar la tarea de Fase 3: agregar control para combinar celdas desde el menu contextual de tabla.

Acciones realizadas:

- Se agrego la accion `merge-cells` al menu contextual `table-menu.ts`.
- El boton visible es `Combinar celdas`.
- El boton usa icono Fontello de agrupacion y se conecta con `tableCommands.mergeCells`.
- El control reutiliza el estado `canMergeCells`, por lo que queda deshabilitado fuera de tabla y tambien cuando la seleccion actual no es un rango combinable.
- Se actualizo la prueba de `table-menu.ts` para validar estado fuera de tabla, seleccion de una sola celda deshabilitada, seleccion rectangular valida habilitada, `colspan` resultante y conservacion del texto de ambas celdas.
- Se actualizo la prueba de integracion de `editor-app.test.ts` para confirmar que `merge-cells` aparece en el menu contextual, no en la toolbar, y combina celdas seleccionadas.
- Se marco la tarea `Agregar combinar celdas` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/components/table-menu.ts`
- `src/editor/components/table-menu.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 3 archivos de prueba correctos, 30 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 107 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Agregar separar celdas.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Separar celdas en menu contextual de tabla

Objetivo:

- Cerrar la tarea de Fase 3: agregar control para separar celdas combinadas desde el menu contextual de tabla.

Acciones realizadas:

- Se agrego la accion `split-cell` al menu contextual `table-menu.ts`.
- El boton visible es `Separar celdas`.
- El boton usa icono Fontello de desagrupar y se conecta con `tableCommands.splitCell`.
- El control reutiliza el estado `canSplitCell`, por lo que queda deshabilitado fuera de tabla y cuando la celda actual no esta combinada.
- Se actualizo la prueba de `table-menu.ts` para validar estado fuera de tabla, estado deshabilitado en una celda normal, habilitado sobre una celda combinada y restauracion de la fila al separar.
- Se actualizo la prueba de integracion de `editor-app.test.ts` para confirmar que `split-cell` aparece en el menu contextual, no en la toolbar, y restaura la cantidad de celdas despues de combinar.
- Se marco la tarea `Agregar separar celdas` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/components/table-menu.ts`
- `src/editor/components/table-menu.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 3 archivos de prueba correctos, 31 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 108 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Activar redimensionamiento de columnas.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Resaltado de celdas seleccionadas para combinar

Objetivo:

- Mejorar la experiencia de seleccion de celdas para que el usuario identifique visualmente el rango que se va a combinar.

Acciones realizadas:

- Se agrego estilo en `src/style.css` para `th.selectedCell` y `td.selectedCell` dentro del editor.
- El resaltado usa fondo azul translucido y borde interno con `var(--focus)`.
- Se actualizo la prueba de `table-menu.ts` para validar que una seleccion de dos celdas queda marcada en el DOM con la clase `selectedCell`.
- Se agrego una nota en `tasks.md` bajo la tarea `Agregar combinar celdas`.

Archivos modificados:

- `src/style.css`
- `src/editor/components/table-menu.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 3 archivos de prueba correctos, 31 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 108 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Activar redimensionamiento de columnas.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Redimensionamiento de columnas de tabla

Objetivo:

- Cerrar la tarea de Fase 3: activar redimensionamiento de columnas y conservar el resultado al serializar.

Acciones realizadas:

- Se dejo explicita la configuracion de `Table.configure` con `resizable: true`, `handleWidth: 6`, `cellMinWidth: 80` y `lastColumnResizable: true`.
- Se agregaron estilos para `.tableWrapper`, `.column-resize-handle` y `.resize-cursor`.
- Se ajusto el schema canonico para aceptar `align` en `tableCell` y `tableHeader`, porque Tiptap agrega `align: null` en celdas de tabla.
- Se permitieron `colgroup` y `col` en el sanitizador para conservar el HTML renderizable de columnas redimensionadas.
- Se agregaron pruebas para validar la configuracion de resize, la persistencia de `colwidth` en JSON, la emision de `colgroup`/`col` en HTML y la serializacion sanitizada.
- Se agrego `playwright.config.ts` para que `npm run test:e2e` busque solo specs e2e y no intente ejecutar los tests unitarios de Vitest.
- Se marco la tarea `Activar redimensionamiento de columnas` como completada en `tasks.md`.

Archivos modificados:

- `playwright.config.ts`
- `src/editor/core/create-editor.test.ts`
- `src/editor/core/editor-extensions.test.ts`
- `src/editor/core/editor-extensions.ts`
- `src/editor/models/editor-content.test.ts`
- `src/editor/models/editor-content.ts`
- `src/editor/services/sanitizer.service.ts`
- `src/editor/services/serializer.service.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/editor-extensions.test.ts src/editor/core/create-editor.test.ts src/editor/models/editor-content.test.ts src/editor/services/serializer.service.test.ts src/editor/core/table-commands.test.ts src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts`.
- Primer resultado: fallo una expectativa porque DOMPurify conserva los anchos por `colgroup`/`col`, pero normaliza el atributo `colwidth` del HTML.
- Se ajusto la prueba para validar `colwidth` en JSON canonico y `colgroup`/`col` en HTML sanitizado.
- Resultado final: 7 archivos de prueba correctos, 56 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 111 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Primer resultado: fallo porque Playwright descubria tests unitarios de Vitest en `src`.
- Se agrego `playwright.config.ts` para limitar e2e a `./e2e/**/*.spec.ts`.
- Resultado final: `npm run test:e2e` termino correctamente sin specs e2e.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Implementar `table-menu.ts`.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Cierre de implementacion de table-menu.ts

Objetivo:

- Cerrar la tarea de Fase 3: implementar `table-menu.ts` como menu contextual completo de comandos de tabla.

Acciones realizadas:

- Se reviso `src/editor/components/table-menu.ts` y se confirmo que el menu contextual ya existe y se construyo incrementalmente en tareas previas.
- El menu se oculta fuera de tabla y se muestra al seleccionar una celda dentro de una tabla.
- El menu incluye controles para filas, columnas, eliminar tabla, alternar encabezado, combinar celdas y separar celdas.
- La prueba de integracion confirma que estos comandos aparecen en `.editor-table-menu` y no como botones individuales de la toolbar.
- No se requirieron cambios de codigo funcionales para esta tarea; se cerro como consolidacion verificada.
- Se marco la tarea `Implementar table-menu.ts` como completada en `tasks.md`.

Archivos modificados:

- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 3 archivos de prueba correctos, 31 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 111 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: termino correctamente sin specs e2e.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Probar persistencia de tabla.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Agrupacion visual de comandos de tabla

Objetivo:

- Corregir el diseño de gestion de tablas para evitar una fila completa de botones visibles como segunda toolbar.

Acciones realizadas:

- Se cambio `table-menu.ts` para renderizar un unico disparador contextual `Tabla`.
- Los comandos de filas, columnas, encabezado, combinar y separar celdas quedan dentro de un panel desplegable.
- El panel se abre y cierra con el disparador, se cierra con `Escape` y al hacer clic fuera.
- Los comandos mantienen sus `data-table-menu-action`, por lo que la logica y las pruebas existentes siguen apuntando a las mismas acciones.
- Se ajustaron los estilos de `.editor-table-menu`, `.editor-table-menu__trigger` y `.editor-table-menu__panel`.
- Se actualizaron pruebas unitarias y de integracion para validar que los comandos estan agrupados detras del disparador `Tabla`.
- Se agrego una nota en `tasks.md` bajo `Implementar table-menu.ts`.

Archivos modificados:

- `src/editor/components/table-menu.ts`
- `src/editor/components/table-menu.test.ts`
- `src/editor/editor-app.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 3 archivos de prueba correctos, 32 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Primer resultado: fallo TypeScript por el tipo de `panel.hidden`.
- Se ajusto el toggle del panel con comparacion booleana explicita.
- Resultado final: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 112 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: termino correctamente sin specs e2e.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Probar persistencia de tabla.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Boton de tabla siempre visible sin texto

Objetivo:

- Ajustar el disparador agrupado de comandos de tabla para que permanezca visible, se deshabilite fuera de tabla y no muestre texto.

Acciones realizadas:

- Se cambio `table-menu.ts` para no ocultar el contenedor fuera de tabla; solo se deshabilita el disparador cuando no hay seleccion dentro de una tabla.
- Se retiro la etiqueta visible `Tabla` del disparador y se conservaron `aria-label` y `title` para accesibilidad.
- Se ajusto el estilo del disparador para funcionar como boton de icono con ancho estable.
- Se actualizaron pruebas unitarias y de integracion para validar que el boton queda visible, deshabilitado fuera de tabla y sin texto visible.
- Se agrego una nota en `tasks.md` bajo `Implementar table-menu.ts`.

Archivos modificados:

- `src/editor/components/table-menu.ts`
- `src/editor/components/table-menu.test.ts`
- `src/editor/editor-app.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 3 archivos de prueba correctos, 32 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 112 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: termino correctamente sin specs e2e.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Pendientes inmediatos:

- Probar persistencia de tabla.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Boton de tabla dentro de la toolbar normal

Objetivo:

- Mover el disparador agrupado de comandos de tabla a la barra normal de herramientas.

Acciones realizadas:

- Se elimino el slot separado `editor-shell__table-menu-slot` del shell del editor.
- Se cambio el montaje para insertar `tableMenu.element` dentro de `toolbar.element`.
- El contenedor de comandos de tabla paso de `role="toolbar"` a `role="group"` para evitar una toolbar anidada.
- El disparador de tabla usa tambien la clase visual `editor-shell__tool` para integrarse con los botones normales de la barra.
- Se actualizaron pruebas del shell, del menu de tabla y de integracion para validar que el grupo vive dentro de `.editor-shell__toolbar`.
- Se actualizo la nota vigente de `tasks.md` bajo `Implementar table-menu.ts`.

Archivos modificados:

- `src/editor/components/editor-shell.ts`
- `src/editor/components/editor-shell.test.ts`
- `src/editor/components/table-menu.ts`
- `src/editor/components/table-menu.test.ts`
- `src/editor/editor-app.ts`
- `src/editor/editor-app.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/editor-shell.test.ts src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/editor/core/table-commands.test.ts`.
- Resultado: 4 archivos de prueba correctos, 35 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente sin cambios adicionales.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 112 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: termino correctamente sin specs e2e.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Pendientes inmediatos:

- Probar persistencia de tabla.
- Continuar con Fase 3 en orden.

## 2026-07-06 - Persistencia de tablas

Objetivo:

- Cerrar la tarea de Fase 3: probar que guardar y recargar conserva filas, columnas, encabezados, celdas combinadas y anchos.

Acciones realizadas:

- Se agrego una prueba de integracion en `editor-app.test.ts` que monta la app, crea una tabla con encabezados y `colwidth`, combina celdas con el comando real de ProseMirror, guarda el documento y vuelve a montar la app desde el payload guardado.
- La prueba valida el JSON canonico guardado, el HTML renderizable guardado y el preview despues de recargar.
- Se detecto que el JSON conservaba `colspan`, pero el HTML sanitizado perdia atributos estructurales de celdas.
- Se ajusto `serializer.service.ts` para completar `colspan`, `rowspan` y `colwidth` desde el JSON canonico antes y despues de sanitizar.
- Se ajusto `sanitizer.service.ts` para conservar atributos estructurales validos de celdas de tabla.
- Se agrego una prueba unitaria del serializer para cubrir la reconstruccion de atributos de celdas combinadas.
- Se marco la tarea `Probar persistencia de tabla` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/editor-app.test.ts`
- `src/editor/services/sanitizer.service.ts`
- `src/editor/services/serializer.service.ts`
- `src/editor/services/serializer.service.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/editor-app.test.ts src/editor/services/document-storage.service.test.ts src/editor/services/serializer.service.test.ts`.
- Primer resultado: fallo porque el HTML guardado no conservaba `colspan`.
- Se ajusto el serializer para completar atributos desde el JSON canonico.
- Segundo resultado: fallo porque el preview volvia a sanitizar el HTML y removia atributos estructurales.
- Se ajusto el sanitizador para conservar atributos validos de celdas de tabla.
- Resultado final: 3 archivos de prueba correctos, 36 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 114 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: termino correctamente sin specs e2e.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Implementar `resizable-image.extension.ts`.
- Continuar con Fase 4 en orden.

## 2026-07-06 - Extension de imagen redimensionable

Objetivo:

- Cerrar la tarea de Fase 4: implementar `resizable-image.extension.ts` con soporte para `src`, `alt`, `width`, `height` y `align`.

Acciones realizadas:

- Se implemento `ResizableImage` extendiendo la extension `Image` de Tiptap.
- Se mantuvo el nombre de nodo `image` para conservar compatibilidad con el JSON canonico existente.
- Se activo resize con `minWidth`, `minHeight` y preservacion de aspecto.
- Se agrego soporte explicito para parsear y renderizar `width`, `height` y `align`.
- `createEditorExtensions` ahora registra `ResizableImage` en lugar de la extension base `Image`.
- Se agregaron estilos para alinear imagenes a izquierda, centro y derecha en editor y preview.
- Se agregaron pruebas para validar la configuracion de resize y la persistencia de atributos de imagen en JSON/HTML.
- Se marco la tarea `Implementar resizable-image.extension.ts` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/extensions/resizable-image.extension.ts`
- `src/editor/core/editor-extensions.ts`
- `src/editor/core/editor-extensions.test.ts`
- `src/editor/core/create-editor.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/editor-extensions.test.ts src/editor/core/create-editor.test.ts src/editor/models/editor-content.test.ts src/editor/services/serializer.service.test.ts src/editor/components/preview-view.test.ts`.
- Resultado: 5 archivos de prueba correctos, 32 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.
- Se ejecuto `npm run check`.
- Primer resultado: fallo TypeScript porque `addOptions` podia devolver opciones incompletas.
- Se ajusto el fallback de opciones para devolver todos los campos requeridos por `ImageOptions`.
- Resultado final: build, lint y tests terminaron correctamente; 15 archivos de prueba correctos, 116 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: termino correctamente sin specs e2e.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Implementar `file-validator.ts`.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Validador de archivos de imagen

Objetivo:

- Cerrar la tarea de Fase 4: implementar `file-validator.ts`.

Acciones realizadas:

- Se implemento `validateImageFile` en `src/editor/utils/file-validator.ts`.
- Se agregaron constantes por defecto para MIME permitidos: `image/png`, `image/jpeg` y `image/webp`.
- Se agrego limite por defecto de 5 MB.
- La validacion rechaza MIME no permitidos y archivos que superan el limite configurado.
- La funcion acepta opciones configurables para que `media-upload.service.ts` pueda reutilizar el validador con otros limites si el editor lo requiere.
- Se agregaron pruebas unitarias para PNG, JPEG, WEBP, MIME invalido, limite de 5 MB y opciones personalizadas.
- Se marco la tarea `Implementar file-validator.ts` como completada en `tasks.md`.

Archivos creados:

- `src/editor/utils/file-validator.test.ts`

Archivos modificados:

- `src/editor/utils/file-validator.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/utils/file-validator.test.ts`.
- Resultado: 1 archivo de prueba correcto, 4 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 16 archivos de prueba correctos, 120 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el arbol ya contiene cambios locales acumulados de tareas anteriores y el usuario no solicito commit.

Pendientes inmediatos:

- Implementar `media-upload.service.ts`.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Servicio HTTP de subida de imagenes

Objetivo:

- Cerrar la tarea de Fase 4: implementar `media-upload.service.ts`.

Acciones realizadas:

- Se implemento `createHttpMediaUploadService` en `src/editor/services/media-upload.service.ts`.
- El servicio valida el archivo con `validateImageFile` antes de hacer cualquier request.
- La subida usa `POST /api/documents/{documentId}/assets/images` con `documentId` codificado por `encodeURIComponent`.
- El body se envia como `FormData` con el archivo en el campo `file`.
- Si existe texto alternativo, se envia en el campo `altText`.
- No se fuerza manualmente `Content-Type`, para permitir que el navegador agregue el boundary multipart correcto.
- La respuesta del backend se parsea con `parseEditorAsset` y devuelve un `EditorAsset` tipado.
- El servicio permite `baseUrl`, `fetch` e `imageValidation` inyectables para pruebas y configuracion futura.
- Se agregaron pruebas unitarias para subida exitosa, URL con `baseUrl`, validacion previa, error HTTP y respuesta invalida.
- Se marco la tarea `Implementar media-upload.service.ts` como completada en `tasks.md`.

Archivos creados:

- `src/editor/services/media-upload.service.test.ts`

Archivos modificados:

- `src/editor/services/media-upload.service.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/services/media-upload.service.test.ts`.
- Resultado: 1 archivo de prueba correcto, 5 pruebas correctas.
- Se ejecuto `npx prettier --check src/editor/services/media-upload.service.ts src/editor/services/media-upload.service.test.ts tasks.md worklog.md`.
- Resultado: todos los archivos revisados cumplen el formato de Prettier.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 17 archivos de prueba correctos, 125 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el arbol ya contiene cambios locales acumulados de tareas anteriores y el usuario no solicito commit.

Pendientes inmediatos:

- Crear dialogo de insercion de imagen.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Dialogo de insercion de imagen

Objetivo:

- Cerrar la tarea de Fase 4: crear dialogo de insercion de imagen.

Acciones realizadas:

- Se implemento `createImageDialog` en `src/editor/components/image-dialog.ts`.
- El componente renderiza un dialogo accesible con `role="dialog"`, `aria-modal`, titulo y mensaje de error asociado.
- El dialogo permite seleccionar archivo con `accept="image/png,image/jpeg,image/webp"`.
- El dialogo permite escribir texto alternativo y lo normaliza con `trim()` al confirmar.
- La confirmacion queda deshabilitada hasta que exista un archivo seleccionado.
- La confirmacion valida el archivo con `validateImageFile` antes de emitir el resultado.
- Cancelar, hacer click en el overlay o presionar Escape cierra el dialogo y resetea archivo, texto alternativo y errores.
- Se agrego `setDisabled` para bloquear los controles desde integraciones futuras.
- Se agregaron estilos base para overlay, panel, campos, acciones y errores.
- Se agregaron pruebas unitarias de render accesible, submit con archivo y alt, cancelacion/reset, errores de validacion, Escape y estado disabled.
- Se marco la tarea `Crear dialogo de insercion de imagen` como completada en `tasks.md`.

Archivos creados:

- `src/editor/components/image-dialog.test.ts`

Archivos modificados:

- `src/editor/components/image-dialog.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/image-dialog.test.ts`.
- Resultado: 1 archivo de prueba correcto, 5 pruebas correctas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 18 archivos de prueba correctos, 130 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se evaluo crear commit al cerrar la tarea.
- Se crea commit porque el cambio cierra una tarea formal de Fase 4, esta acotado al dialogo de imagen y ya fue verificado con pruebas, formato, build y lint.

Pendientes inmediatos:

- Insertar imagen subida en el editor.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Insercion de imagen subida en el editor

Objetivo:

- Cerrar la tarea de Fase 4: insertar imagen subida en el editor.

Acciones realizadas:

- Se agrego `editorCommands.insertImage` para insertar nodos `image` desde comandos centralizados.
- Se agrego el boton `insert-image` a la toolbar con `aria-label` y callback `onInsertImage`.
- `mountEditorApp` ahora monta `createImageDialog`, preserva la seleccion del editor antes de abrirlo y sube la imagen mediante un `MediaUploadService` inyectable.
- Al terminar la subida, el editor inserta la URL retornada por el servicio y conserva el texto alternativo como atributo `alt`.
- Se agrego `createLocalMediaUploadService` como servicio mock por defecto mientras no exista backend real; devuelve una URL relativa segura para no romper el schema canonico.
- Se agrego prueba de integracion que abre el dialogo desde toolbar, selecciona archivo, llama al servicio de subida, inserta la imagen, actualiza preview y guarda JSON/HTML.
- Se actualizo la cobertura de toolbar para el nuevo boton de imagen.
- Se marco la tarea `Insertar imagen subida en el editor` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/core/editor-commands.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.ts`
- `src/editor/editor-app.test.ts`
- `src/editor/services/media-upload.service.ts`
- `src/editor/utils/file-validator.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/toolbar.test.ts src/editor/editor-app.test.ts src/editor/services/media-upload.service.test.ts src/editor/components/image-dialog.test.ts`.
- Resultado: 4 archivos de prueba correctos, 35 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.
- Se ejecuto `npm run check`.
- Primer resultado: fallo `npm run lint` porque `createLocalMediaUploadService.uploadImage` estaba marcado como `async` sin `await`.
- Se corrigio el metodo para devolver `Promise.resolve` o `Promise.reject` de forma explicita.
- Se ejecuto `npx prettier --write src/editor/services/media-upload.service.ts src/editor/editor-app.ts src/editor/editor-app.test.ts src/editor/components/toolbar.ts src/editor/components/toolbar.test.ts src/editor/core/editor-commands.ts`.
- Resultado: los archivos revisados quedaron formateados.
- Se ejecuto `npm run check`.
- Resultado final: build, lint y tests terminaron correctamente; 18 archivos de prueba correctos, 131 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Soportar drag and drop de imagenes.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Drag and drop de imagenes

Objetivo:

- Cerrar la tarea de Fase 4: soportar drag and drop de imagenes.

Acciones realizadas:

- Se registraron listeners `dragenter`, `dragover`, `dragleave` y `drop` sobre el area editable mediante `EditorLifecycle`.
- Los eventos de archivo se interceptan con `capture` para evitar que ProseMirror o el navegador manejen el drop antes del flujo del editor.
- Al soltar una imagen, se conserva la posicion de insercion cuando el navegador permite resolver coordenadas y se reutiliza `MediaUploadService` para validar/subir el archivo.
- La imagen subida se inserta con `editorCommands.insertImage`, manteniendo el nodo canonico `image` y actualizando JSON, HTML y preview.
- Los archivos invalidos muestran estado `Error` y no insertan nodos de imagen rotos.
- Se agrego un estado visual `editor-shell__editable--drop-target` mientras el usuario arrastra archivos sobre el editor.
- Se agregaron pruebas de integracion para drop valido y drop invalido.
- Se marco la tarea `Soportar drag and drop de imagenes` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/editor-app.ts`
- `src/editor/editor-app.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/editor-app.test.ts`.
- Resultado: 1 archivo de prueba correcto, 19 pruebas correctas.
- Se ejecuto `npx prettier --write src/editor/editor-app.ts src/editor/editor-app.test.ts src/style.css`.
- Resultado: `editor-app.ts` quedo formateado; `editor-app.test.ts` y `src/style.css` ya estaban en formato.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 18 archivos de prueba correctos, 133 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- No se creo commit porque el usuario no lo solicito.

Pendientes inmediatos:

- Soportar pegado desde portapapeles.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Dialogo contextual para acciones de imagen

Objetivo:

- Ajustar la UI segun la decision del usuario: no agregar controles para trabajar con imagenes ya insertadas en la toolbar; mostrar un dialogo contextual al seleccionar una imagen.

Acciones realizadas:

- Se creo `image-options-dialog.ts` como componente vanilla TypeScript con ciclo de vida registrado.
- El dialogo aparece al seleccionar un nodo `image` y se oculta al volver a texto u otro contenido.
- El dialogo permite alinear imagen a izquierda, centro y derecha.
- El dialogo permite editar ancho y alto con inputs numericos; valores invalidos se marcan con `aria-invalid` y no reemplazan atributos previos.
- Se elimino de `toolbar.ts` la logica que usaba botones de alineacion para imagenes seleccionadas.
- Se eliminaron de la toolbar los controles numericos de dimensiones de imagen.
- La toolbar conserva el boton de insertar imagen porque abre el flujo de carga; las acciones sobre imagen ya insertada quedan en el dialogo contextual.
- Se reforzo `serializer.service.ts` para completar atributos canonicos de imagen en el HTML renderizable antes y despues de sanitizar.
- Se agregaron pruebas unitarias del dialogo contextual, pruebas de toolbar y una prueba de integracion de app para JSON, HTML y preview.
- Se actualizo `context.md` y `tasks.md` con la decision de UI.

Archivos modificados:

- `src/editor/components/image-options-dialog.ts`
- `src/editor/components/image-options-dialog.test.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/editor-app.ts`
- `src/editor/editor-app.test.ts`
- `src/editor/services/serializer.service.ts`
- `src/editor/services/serializer.service.test.ts`
- `src/style.css`
- `context.md`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/toolbar.test.ts`.
- Resultado: 1 archivo de prueba correcto, 9 pruebas correctas.
- Se ejecuto `npm test -- src/editor/components/image-options-dialog.test.ts`.
- Resultado: 1 archivo de prueba correcto, 1 prueba correcta.
- Se ejecuto `npm test -- src/editor/editor-app.test.ts`.
- Resultado: 1 archivo de prueba correcto, 24 pruebas correctas.
- Se ejecuto `npm test -- src/editor/services/serializer.service.test.ts`.
- Resultado: 1 archivo de prueba correcto, 9 pruebas correctas.
- Se ejecuto `npx prettier --write` sobre los archivos modificados.
- Se ejecuto `npm run check`.
- Primer resultado: fallo de TypeScript porque `clickToolbarButton` quedo sin uso despues de mover acciones de imagen fuera de la toolbar.
- Se elimino el helper sin uso.
- Se ejecuto nuevamente `npm run check`.
- Resultado final: build, lint y tests terminaron correctamente; 20 archivos de prueba correctos, 149 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Se ejecuto `git diff --check`.
- Resultado: sin errores de whitespace.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se crea commit porque el ajuste de UI queda completado, verificado y documentado.
- Commit creado: `44d4b0e` Mover acciones de imagen a dialogo contextual.

Pendientes inmediatos:

- Manejar errores de subida.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Recalculo diferido del dialogo de imagen

Objetivo:

- Corregir el caso donde, justo despues de insertar o pegar una imagen, el dialogo contextual podia aparecer solapado hasta que otra interaccion forzaba el reposicionamiento.
- Corregir que el dialogo no siguiera la nueva ubicacion de la imagen al alinearla o cambiar sus dimensiones.

Acciones realizadas:

- Se ajusto `image-options-dialog.ts` para no mostrar el dialogo cuando el rectangulo medido de la imagen aun es cero o inestable.
- Se agrego un reintento con `requestAnimationFrame` para recalcular la posicion cuando el navegador termine de pintar la imagen.
- Se reprogramo el calculo de posicion despues de acciones del dialogo como alineacion, restablecer dimensiones y editar ancho/alto.
- Se cancela cualquier reintento pendiente cuando el dialogo ya queda correctamente posicionado o cuando la seleccion deja de ser una imagen.
- Se agrego prueba para validar que el dialogo espera un rectangulo estable antes de mostrarse.
- Se agrego prueba para validar que el dialogo se mueve cuando la alineacion cambia el rectangulo de la imagen.
- Se ajusto la prueba de integracion de la app para simular rectangulos DOM estables en jsdom y cubrir el dialogo contextual real.
- Correccion posterior: el calculo de posicion ahora prefiere el rectangulo del `img` interno del NodeView, no el wrapper `[data-node="image"]`, para que el dialogo siga la imagen cuando cambia entre izquierda, centro y derecha.
- Se amplio la prueba de realineacion para cubrir izquierda, centro y derecha con un wrapper fijo y una imagen interna que se desplaza.

Archivos modificados:

- `src/editor/components/image-options-dialog.ts`
- `src/editor/components/image-options-dialog.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/image-options-dialog.test.ts`.
- Resultado: 1 archivo de prueba correcto, 4 pruebas correctas.
- Se ejecuto `npm test -- src/editor/editor-app.test.ts src/editor/components/image-options-dialog.test.ts`.
- Resultado: 2 archivos de prueba correctos, 28 pruebas correctas.
- Tras corregir el anclaje al `img` interno, se repitio `npm test -- src/editor/components/image-options-dialog.test.ts src/editor/editor-app.test.ts`.
- Resultado: 2 archivos de prueba correctos, 28 pruebas correctas.
- Se ejecuto `npx prettier --write` sobre los archivos modificados.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 20 archivos de prueba correctos, 152 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Se ejecuto `git diff --check`.
- Resultado: sin errores de whitespace.
- Nota: Vitest mantiene el aviso no bloqueante `Not implemented: Window's scrollBy() method` en jsdom durante las pruebas del editor.

Decision Git:

- Se crea commit porque el ajuste de UI queda verificado y documentado.
- Commit creado: `aae4383` Recalcular posicion del dialogo de imagen.
- Commit de correccion posterior: `bdd9c65` Anclar dialogo de imagen al img interno.

Pendientes inmediatos:

- Manejar errores de subida.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Manejo de errores de subida de imagen

Objetivo:

- Cerrar la tarea de Fase 4: manejar errores de subida.
- Garantizar que fallos de validacion o red muestren un mensaje visible y no inserten nodos de imagen rotos.

Acciones realizadas:

- Se amplio `createEditorShell` para permitir mensajes personalizados en la barra de estado sin romper los estados existentes.
- Se ajusto `insertUploadedImage` para mostrar mensajes accionables cuando falla la subida de imagen.
- Los errores de validacion conservan el mensaje especifico del validador de archivos.
- Los errores de red o servicio muestran un mensaje generico orientado a reintentar.
- Si la subida falla o la insercion no se puede aplicar, el documento conserva su JSON/HTML previo y no agrega un nodo `image`.
- Se agrego prueba de shell para mensajes personalizados de error.
- Se agrego prueba de integracion para fallo de red al subir desde el dialogo.
- Se ajustaron pruebas de drop y paste invalido para validar el mensaje especifico mostrado al usuario.
- Se marco `Manejar errores de subida` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/components/editor-shell.ts`
- `src/editor/components/editor-shell.test.ts`
- `src/editor/editor-app.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/editor-shell.test.ts src/editor/editor-app.test.ts src/editor/services/media-upload.service.test.ts`.
- Resultado: 3 archivos de prueba correctos, 36 pruebas correctas.
- Se ejecuto `npx prettier --write` sobre los archivos TypeScript modificados.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 20 archivos de prueba correctos, 154 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Se ejecuto `git diff --check`.
- Resultado: sin errores de whitespace.
- Nota: Vitest mantiene el aviso no bloqueante `Not implemented: Window's scrollBy() method` en jsdom durante las pruebas del editor.

Decision Git:

- Se crea commit porque la tarea quedo completada y verificada.
- Commit creado: `ab25c5d` Manejar errores de subida de imagen.

Pendientes inmediatos:

- Preparar cliente para eliminar assets.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Cliente para eliminar assets

Objetivo:

- Cerrar la tarea de Fase 4: preparar cliente para eliminar assets.
- Exponer una funcion para `DELETE /api/documents/{id}/assets/{assetId}` sin adelantar UI de eliminacion ni la Fase 8 completa.

Acciones realizadas:

- Se implemento `createHttpAssetsApi` en `src/api/assets.api.ts`.
- El cliente expone `uploadImage(documentId, file, altText?)` y `deleteAsset(documentId, assetId)`.
- `deleteAsset` usa metodo `DELETE`, codifica `documentId` y `assetId`, soporta `baseUrl` y rechaza respuestas no OK con mensaje controlado.
- `uploadImage` conserva el contrato de subida ya definido para assets y parsea la respuesta como `EditorAsset`.
- Se agregaron pruebas unitarias para subida, eliminacion, `baseUrl`, codificacion de identificadores, errores no OK y respuestas invalidas.
- Se marco `Preparar cliente para eliminar assets` como completada en `tasks.md`.

Archivos modificados:

- `src/api/assets.api.ts`
- `src/api/assets.api.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/api/assets.api.test.ts`.
- Resultado: 1 archivo de prueba correcto, 5 pruebas correctas.
- Se ejecuto `npx prettier --write src/api/assets.api.ts src/api/assets.api.test.ts`.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 21 archivos de prueba correctos, 159 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Se ejecuto `git diff --check`.
- Resultado: sin errores de whitespace.
- Nota: Vitest mantiene el aviso no bloqueante `Not implemented: Window's scrollBy() method` en jsdom durante las pruebas del editor.

Decision Git:

- Se crea commit porque la tarea quedo completada y verificada.
- Commit creado: `a4dd767` Preparar cliente para eliminar assets.

Pendientes inmediatos:

- Instalar y configurar CodeMirror.
- Continuar con Fase 5 en orden.

## 2026-07-07 - Resaltado y handles de imagen seleccionada

Objetivo:

- Corregir el bug reportado donde una imagen seleccionada no mostraba borde ni controles visibles para redimensionarla.

Acciones realizadas:

- Se agregaron clases propias al `ResizableNodeView` de imagen para contenedor, wrapper, handles y estado de resize.
- Se elimino el ocultamiento del NodeView hasta `onload` para evitar que la seleccion o los handles queden invisibles si la carga de imagen ya ocurrio o no dispara el evento esperado.
- Se agregaron estilos para mostrar borde azul, sombra y cuatro handles de resize solo cuando la imagen esta seleccionada o en proceso de redimensionamiento.
- Se agregaron cursores diagonales adecuados para cada handle.
- Se agrego prueba automatizada para confirmar que el DOM de imagen expone contenedor, wrapper y cuatro handles de resize.
- Se agrego nota correctiva en `tasks.md` bajo `Implementar resizable-image.extension.ts`.

Archivos modificados:

- `src/editor/extensions/resizable-image.extension.ts`
- `src/editor/core/create-editor.test.ts`
- `src/style.css`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/create-editor.test.ts src/editor/core/editor-extensions.test.ts`.
- Resultado: 2 archivos de prueba correctos, 11 pruebas correctas.
- Se ejecuto `npx prettier --write src/editor/extensions/resizable-image.extension.ts src/editor/core/create-editor.test.ts src/style.css`.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 21 archivos de prueba correctos, 160 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Se ejecuto `git diff --check`.
- Resultado: sin errores de whitespace.
- Se levanto `npm run dev -- --host 127.0.0.1 --port 4174` y se ejecuto una prueba Playwright manual automatizada insertando `src/assets/hero.png`, seleccionando la imagen y leyendo estilos computados.
- Resultado Playwright manual: el contenedor quedo con `ProseMirror-selectednode`, el wrapper mostro borde azul y sombra, y los cuatro handles quedaron visibles con `opacity: 1`, `pointer-events: auto`, tamano `12px` y cursor de resize diagonal.
- Se detuvo el servidor Vite usado para la prueba manual.
- Nota: Vitest mantiene el aviso no bloqueante `Not implemented: Window's scrollBy() method` en jsdom durante las pruebas del editor.

Decision Git:

- Se crea commit porque la correccion de bug reportado quedo verificada.
- Commit creado: `a3ace5a` Mostrar controles de resize en imagen seleccionada.

Pendientes inmediatos:

- Instalar y configurar CodeMirror.
- Continuar con Fase 5 en orden.

## 2026-07-07 - Posicion externa del dialogo de imagen

Objetivo:

- Ajustar el dialogo contextual de imagen para que quede por fuera de la imagen seleccionada y no se superponga sobre ella.

Acciones realizadas:

- Se cambio el posicionamiento de `image-options-dialog.ts` para calcular la posicion desde el rectangulo DOM real del nodo de imagen seleccionado.
- El dialogo intenta ubicarse primero debajo de la imagen, luego arriba, luego a la derecha o izquierda si el viewport no permite las opciones verticales.
- Se agrego clamp contra los bordes del viewport.
- Se agrego prueba para validar que el dialogo se ubica debajo cuando hay espacio y arriba cuando no cabe debajo.
- Se actualizo `context.md` y `tasks.md` con la regla de no solapar la imagen.

Archivos modificados:

- `src/editor/components/image-options-dialog.ts`
- `src/editor/components/image-options-dialog.test.ts`
- `context.md`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/image-options-dialog.test.ts`.
- Resultado: 1 archivo de prueba correcto, 2 pruebas correctas.
- Se ejecuto `npx prettier --write` sobre los archivos modificados.
- Se ejecuto `npm run check`.
- Primer resultado: fallo de lint por una asercion de tipo innecesaria en la prueba de posicionamiento.
- Se reemplazo la asercion por `new DOMRect(...)`.
- Se ejecuto nuevamente `npm run check`.
- Resultado final: build, lint y tests terminaron correctamente; 20 archivos de prueba correctos, 150 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Se ejecuto `git diff --check`.
- Resultado: sin errores de whitespace.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se crea commit porque el ajuste de UI queda verificado y documentado.
- Commit creado: `3fc93f2` Evitar solape del dialogo de imagen.

Pendientes inmediatos:

- Manejar errores de subida.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Evaluacion de caption opcional

Objetivo:

- Cerrar la tarea de Fase 4: evaluar caption opcional.

Acciones realizadas:

- Se reviso el alcance de imagenes en `context.md`, `tasks.md` y `plan_editor_wysiwyg_vite_ts.md`.
- Se decidio no implementar captions en la Fase 4 actual.
- Se documento que un caption editable debe modelarse como contenido estructural, no como atributo simple del nodo `image`.
- Se dejo la razon tecnica en `context.md`: implementar caption requiere definir un contenedor canonico como `figure`/`figcaption` o alternativa equivalente, ampliar schema, ajustar sanitizacion/serializacion y agregar pruebas.
- Se marco `Evaluar caption opcional` como completada en `tasks.md`.
- Se agrego una tarea opcional de seguimiento en Fase 11 para revaluar captions de imagen.

Archivos modificados:

- `context.md`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npx prettier --write context.md tasks.md worklog.md`.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 19 archivos de prueba correctos, 147 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se crea commit porque la tarea queda completada, verificada y marcada como `[x]`.
- Commit creado: `c1341fb` Documentar decision de captions de imagen.

Pendientes inmediatos:

- Manejar errores de subida.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Ancho y alto editables para imagenes

Objetivo:

- Cerrar la tarea pendiente de Fase 4: agregar ancho y alto editables para imagenes.

Acciones realizadas:

- Se agrego el comando `setImageDimensions` para actualizar `width` y `height` de la imagen seleccionada.
- Se mantuvo `insertImage` compatible con el tipo esperado por Tiptap, sin permitir `null` en la insercion inicial.
- Se agrego en la toolbar un control compacto con dos inputs numericos para ancho y alto.
- Los controles se habilitan solo cuando hay una imagen seleccionada y conservan la seleccion de nodo antes de aplicar cambios.
- Los valores invalidos se marcan con `aria-invalid` y no reemplazan dimensiones previas.
- Se agregaron estilos estables para los inputs dentro de la toolbar.
- Se agregaron pruebas de comandos y toolbar para demostrar persistencia en JSON canonico y HTML renderizable.
- Se marco la tarea correspondiente en `tasks.md`.

Archivos modificados:

- `src/editor/core/editor-commands.ts`
- `src/editor/components/toolbar.ts`
- `src/style.css`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/components/toolbar.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/editor-commands.test.ts`.
- Resultado: 1 archivo de prueba correcto, 15 pruebas correctas.
- Se ejecuto `npm test -- src/editor/components/toolbar.test.ts`.
- Resultado: 1 archivo de prueba correcto, 9 pruebas correctas.
- Se ejecuto `npm run check`.
- Primer resultado: fallo de TypeScript porque `EditorImageAttributes` permitia `null` en `width`/`height` para `setImage`.
- Se ajusto `EditorImageAttributes` para que la insercion inicial acepte solo numeros en dimensiones, y el comando de edicion conserve `null` para limpiar atributos existentes.
- Se ejecuto nuevamente `npm run check`.
- Resultado final: build, lint y tests terminaron correctamente; 19 archivos de prueba correctos, 147 pruebas correctas.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se crea commit porque la tarea queda completada, verificada y marcada como `[x]`.
- Commit creado: `37bc3d8` Agregar dimensiones editables de imagen.

Pendientes inmediatos:

- Evaluar caption opcional.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Correccion de icono de insertar imagen

Objetivo:

- Cambiar el icono del boton de insertar imagen porque el glifo anterior no correspondia a la accion.

Acciones realizadas:

- Se reemplazo el glifo `book` usado por `insert-image` por el glifo `picture` disponible en la fuente Fontello del proyecto.
- Se agrego una asercion en la prueba de toolbar para fijar el icono correcto del boton de insertar imagen.

Archivos modificados:

- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/toolbar.test.ts`.
- Resultado: 1 archivo de prueba correcto, 9 pruebas correctas.
- Se ejecuto `npx prettier --write src/editor/components/toolbar.ts src/editor/components/toolbar.test.ts`.
- Resultado: archivos ya estaban en formato.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 19 archivos de prueba correctos, 145 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se crea commit obligatorio porque la correccion de bug reportado quedo verificada.

Pendientes inmediatos:

- Agregar ancho y alto editables.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Correccion de recorte del menu de tablas

Objetivo:

- Corregir el menu del boton de gestion de tablas, que no se veia completo al sobresalir del recuadro del editor.

Diagnostico:

- El panel de acciones de tabla estaba montado dentro de la toolbar del editor.
- El contenedor `.editor-shell` mantiene `overflow: hidden`, por lo que un panel ancho o desplegado cerca del borde podia quedar recortado.

Acciones realizadas:

- Se cambio el panel de acciones de tabla para montarlo en `document.body` como overlay flotante.
- El disparador conserva su lugar en la toolbar y referencia el panel con `aria-controls`.
- Al abrir el menu se calcula la posicion desde `getBoundingClientRect()` del disparador.
- El panel usa `position: fixed`, se ajusta al viewport y tiene scroll interno si su contenido supera la altura disponible.
- Se mantuvo el cierre por Escape y por clic fuera del menu, contemplando que el panel ya no es hijo del contenedor del disparador.
- Se agregaron pruebas para confirmar que el panel flotante se monta fuera del shell, se posiciona dentro del viewport y se limpia al destruir el ciclo de vida.

Archivos modificados:

- `src/editor/components/table-menu.ts`
- `src/editor/components/table-menu.test.ts`
- `src/editor/editor-app.test.ts`
- `src/style.css`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts`.
- Resultado: 2 archivos de prueba correctos, 35 pruebas correctas.
- Se ejecuto `npx prettier --write src/editor/components/table-menu.ts src/editor/components/table-menu.test.ts src/editor/editor-app.test.ts src/style.css`.
- Resultado: archivos formateados correctamente.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 19 archivos de prueba correctos, 146 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Se levanto `npm run dev -- --host 127.0.0.1 --port 4174` y se ejecuto una prueba Playwright manual automatizada insertando una tabla, seleccionando una celda y abriendo el menu de tabla.
- Resultado Playwright manual: el panel quedo visible, con `position: fixed`, montado en `BODY`, fuera de `.editor-shell`, `aria-expanded="true"` y dentro del viewport.
- Se detuvo el servidor Vite usado para la prueba manual.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se crea commit obligatorio porque la correccion de bug reportado quedo verificada.

Pendientes inmediatos:

- Agregar ancho y alto editables.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Alineacion de imagenes

Objetivo:

- Agregar alineacion izquierda, centro y derecha para imagenes seleccionadas, reflejada visualmente y en atributos canonicos.

Acciones realizadas:

- Se agregaron comandos `setImageAlignLeft`, `setImageAlignCenter`, `setImageAlignRight` y `setImageAlign`.
- La toolbar reutiliza los controles de alineacion existentes para imagenes seleccionadas y mantiene la alineacion de texto para parrafos/encabezados.
- El boton de justificar queda deshabilitado cuando la seleccion activa es una imagen.
- La extension `ResizableImage` sincroniza los atributos del nodo con el `img` del NodeView y aplica `justify-content` al contenedor redimensionable segun `align`.
- El sanitizer conserva `align` en imagenes solo para valores soportados: `left`, `center` y `right`.
- Se agregaron pruebas de comandos, toolbar, integracion de app y sanitizacion.
- Se marco la tarea `Agregar alineacion de imagen` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/core/editor-commands.ts`
- `src/editor/core/editor-commands.test.ts`
- `src/editor/components/toolbar.ts`
- `src/editor/components/toolbar.test.ts`
- `src/editor/extensions/resizable-image.extension.ts`
- `src/editor/editor-app.test.ts`
- `src/editor/services/sanitizer.service.ts`
- `src/editor/services/sanitizer.service.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/core/editor-commands.test.ts src/editor/components/toolbar.test.ts src/editor/editor-app.test.ts src/editor/services/sanitizer.service.test.ts`.
- Resultado: 4 archivos de prueba correctos, 49 pruebas correctas.
- Se ejecuto `npx prettier --write` sobre los archivos modificados de codigo y pruebas.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 19 archivos de prueba correctos, 145 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Se levanto `npm run dev -- --host 127.0.0.1 --port 4174`; como el puerto estaba ocupado por una sesion previa, Vite uso `http://127.0.0.1:4175/`.
- Se ejecuto una prueba Playwright manual automatizada usando el dialogo real de imagen, seleccionando `src/assets/hero.png`, seleccionando la imagen insertada y aplicando centro, derecha e izquierda.
- Resultado Playwright manual: el contenedor editable reporto `data-image-align` `center`/`right`/`left`, `justify-content` `center`/`flex-end`/`flex-start`, el `img` editable y el preview conservaron `align`, y el estado quedo en `Guardado`.
- Se detuvieron los servidores Vite usados para la prueba manual.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se crea commit obligatorio porque la tarea quedo completada y verificada.

Pendientes inmediatos:

- Agregar ancho y alto editables.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Pegado de imagenes desde portapapeles

Objetivo:

- Cerrar la tarea de Fase 4: soportar pegado desde portapapeles.

Acciones realizadas:

- Se agrego un listener `paste` sobre el area editable usando `EditorLifecycle`.
- El listener intercepta el evento solo cuando `clipboardData.items` contiene un archivo de imagen.
- Al pegar una imagen, se conserva la seleccion actual y se reutiliza `MediaUploadService` junto con `editorCommands.insertImage`.
- El pegado normal de texto queda sin interceptar cuando el portapapeles no trae imagenes.
- Las imagenes no permitidas muestran estado `Error` y no insertan nodos rotos.
- Se agregaron pruebas de integracion para imagen pegada valida, pegado normal de texto e imagen pegada invalida.
- Se marco la tarea `Soportar pegado desde portapapeles` como completada en `tasks.md`.

Archivos modificados:

- `src/editor/editor-app.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/editor-app.test.ts`.
- Resultado: 1 archivo de prueba correcto, 23 pruebas correctas.
- Se ejecuto `npx prettier --write src/editor/editor-app.ts src/editor/editor-app.test.ts`.
- Resultado: `editor-app.test.ts` quedo formateado; `editor-app.ts` ya estaba en formato.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 19 archivos de prueba correctos, 141 pruebas correctas.
- Se levanto `npm run dev -- --host 127.0.0.1 --port 4174` y se ejecuto una prueba Playwright manual automatizada disparando un `ClipboardEvent` con PNG.
- Resultado Playwright: el editor inserto un `img` con `src="blob:http://127.0.0.1:4174/..."`, `complete: true`, `naturalWidth: 1`, `naturalHeight: 1` y estado `Guardado`.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se crea commit obligatorio porque la tarea quedo completada y verificada.

Pendientes inmediatos:

- Agregar alineacion de imagen.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Correccion de insercion visible de imagen local

Objetivo:

- Corregir el flujo reportado donde se podia seleccionar una imagen desde el dialogo, pero no se veia insertada en el editor.

Diagnostico:

- El dialogo si llamaba al flujo de subida e insercion.
- El problema estaba en `createLocalMediaUploadService`: mientras no existe backend real, devolvia una ruta relativa mock como `/assets/editor-images/...`.
- Vite no sirve ningun archivo en esa ruta, por lo que el nodo `image` podia existir pero el navegador no tenia una imagen real para mostrar.

Acciones realizadas:

- Se cambio el uploader local por defecto para devolver `URL.createObjectURL(file)` como URL `blob:` visible durante la sesion.
- Se mantuvo la validacion previa de MIME y tamano antes de crear la URL local.
- Se permitio `blob:` en `image.src` dentro del schema canonico, sin permitirlo en links.
- Se ajusto DOMPurify para conservar `blob:` solo en `src` de `img` y seguir removiendolo de `href`.
- Se agrego prueba de integracion del flujo real del dialogo usando el uploader local por defecto.
- Se agregaron pruebas del servicio local, del schema canonico y del sanitizer para `blob:`.
- Se agrego una nota correctiva en `tasks.md` bajo `Insertar imagen subida en el editor`.

Archivos modificados:

- `src/editor/services/media-upload.service.ts`
- `src/editor/services/media-upload.service.test.ts`
- `src/editor/services/sanitizer.service.ts`
- `src/editor/services/sanitizer.service.test.ts`
- `src/editor/utils/safe-url.ts`
- `src/editor/models/editor-content.ts`
- `src/editor/models/editor-content.test.ts`
- `src/editor/editor-app.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/editor-app.test.ts src/editor/services/media-upload.service.test.ts src/editor/services/sanitizer.service.test.ts src/editor/models/editor-content.test.ts`.
- Resultado: 4 archivos de prueba correctos, 39 pruebas correctas.
- Se ejecuto `npx prettier --write` sobre los archivos modificados.
- Se ejecuto `npm run check`.
- Primer resultado: fallo `npm run lint` porque el rechazo de `createObjectURL` no garantizaba `Error`.
- Se corrigio el rechazo para devolver siempre un `Error`.
- Se ejecuto nuevamente `npm run check`.
- Resultado final: build, lint y tests terminaron correctamente; 19 archivos de prueba correctos, 138 pruebas correctas.
- Se levanto `npm run dev -- --host 127.0.0.1 --port 4174` y se ejecuto una prueba Playwright manual automatizada seleccionando un PNG desde el dialogo.
- Resultado Playwright: el editor inserto un `img` con `src="blob:http://127.0.0.1:4174/..."`, `complete: true`, `naturalWidth: 1`, `naturalHeight: 1` y estado `Guardado`.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Nota: Vite mantiene la advertencia no bloqueante de chunk mayor a 500 kB ya documentada previamente.

Decision Git:

- Se crea commit porque el usuario lo solicito y el alcance queda verificado: drag and drop de imagenes, uploader local visible con `blob:`, schema/sanitizer ajustados y pruebas actualizadas.

Pendientes inmediatos:

- Soportar pegado desde portapapeles.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Endurecimiento de reglas de commit

Objetivo:

- Ajustar `instructions.md` para evitar que los agentes omitan commits despues de cerrar tareas verificadas.

Acciones realizadas:

- Se cambio la regla de Git para que el commit sea automatico y obligatorio cuando una tarea queda completada y verificada.
- Se aclaro que marcar una tarea como `[x]` exige commit salvo instruccion explicita del usuario de no commitear.
- Se prohibio usar `el usuario no lo solicito` como razon para omitir commits cuando el cambio ya esta cerrado y verificado.
- Se definieron excepciones tecnicas concretas: verificacion fallida, cambios ajenos inseparables, tarea incompleta o instruccion explicita de no commitear.
- Se agrego al formato de cierre la linea `Commit creado: <hash> <mensaje>`.

Archivos modificados:

- `instructions.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npx prettier --write instructions.md worklog.md`.
- Resultado: documentos formateados correctamente.

Decision Git:

- Se crea commit porque el usuario pidio ajustar instrucciones y la propia regla actualizada exige commit para cambios cerrados y verificados.

Pendientes inmediatos:

- Soportar pegado desde portapapeles.
- Continuar con Fase 4 en orden.

## 2026-07-07 - Configuracion base de CodeMirror

Objetivo:

- Cerrar la primera tarea pendiente de Fase 5: instalar y configurar CodeMirror para que HTML y JSON tengan resaltado de sintaxis.

Acciones realizadas:

- Se agrego `@codemirror/language` como dependencia directa porque el codigo importa su API de resaltado.
- Se configuro `source-view.ts` con extensiones base de CodeMirror para HTML y JSON.
- La configuracion incluye numeros de linea, ajuste de linea, atributo `data-language`, `syntaxHighlighting(defaultHighlightStyle)` y las extensiones `html()` / `json()`.
- Se agrego un listener de actualizacion para emitir cambios de documento desde CodeMirror sin implementar todavia la vista completa.
- Se agrego `source-view.test.ts` para montar CodeMirror en jsdom y validar que HTML y JSON renderizan tokens resaltados.
- Se marco `Instalar y configurar CodeMirror` como completada en `tasks.md`.

Archivos modificados:

- `package.json`
- `package-lock.json`
- `src/editor/components/source-view.ts`
- `src/editor/components/source-view.test.ts`
- `tasks.md`
- `worklog.md`

Verificacion:

- Se ejecuto `npm test -- src/editor/components/source-view.test.ts`.
- Resultado: 1 archivo de prueba correcto, 3 pruebas correctas.
- Se ejecuto `npm run format`.
- Resultado: Prettier termino correctamente.
- Se ejecuto `npm run check`.
- Resultado: build, lint y tests terminaron correctamente; 22 archivos de prueba correctos, 163 pruebas correctas.
- Se ejecuto `npm run test:e2e`.
- Resultado: Playwright termino correctamente con `--pass-with-no-tests`.
- Se ejecuto `git diff --check`.
- Resultado: sin errores de whitespace.
- Nota: Vitest mantiene el aviso no bloqueante `Not implemented: Window's scrollBy() method` en jsdom durante las pruebas del editor.

Decision Git:

- Se crea commit porque la tarea quedo completada y verificada.

Pendientes inmediatos:

- Implementar `source-view.ts`.
- Continuar con Fase 5 en orden.
