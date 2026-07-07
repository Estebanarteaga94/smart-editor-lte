# Context - Editor WYSIWYG Vite + TypeScript

## Objetivo del proyecto

Construir un editor WYSIWYG web reutilizable con Vite + TypeScript que permita crear, editar, guardar y renderizar documentos enriquecidos de forma segura y extensible.

El editor debe cubrir:

- Formato de texto.
- Titulos.
- Listas.
- Tablas.
- Imagenes.
- Enlaces.
- Vista de codigo.
- Vista previa.
- Pantalla completa.
- Guardado de contenido.
- Sanitizacion de HTML.
- Arquitectura preparada para nuevas funciones.

## Fuente del alcance

El archivo base es `plan_editor_wysiwyg_vite_ts.md`. Ese plan define la arquitectura, dependencias, estructura, servicios, roadmap, pruebas y criterios de aceptacion.

Los archivos operativos son:

- `tasks.md`: lista de tareas medibles con checkboxes.
- `instructions.md`: reglas para agentes por sesion.
- `worklog.md`: bitacora cronologica de avances.

## Decision tecnica principal

La combinacion aprobada es:

```txt
Vite + TypeScript
+ Tiptap
+ ProseMirror JSON
+ CodeMirror
+ DOMPurify
```

Motivo:

- Vite ofrece una base frontend rapida.
- TypeScript da tipado y mantenibilidad.
- Tiptap resuelve la complejidad real de un editor WYSIWYG sobre ProseMirror.
- ProseMirror JSON sera el formato canonico del documento.
- CodeMirror permite editar HTML/JSON con una experiencia adecuada.
- DOMPurify reduce riesgos XSS al trabajar con HTML.

No se debe crear el editor con `contenteditable` puro porque el proyecto requiere historial, seleccion, comandos, nodos, marcas, tablas, imagenes, serializacion y validaciones.

## Modelo canonico del documento

El contenido principal se guarda como JSON del editor, no como HTML.

`contentJson` es la fuente canonica. `contentHtml` es una salida renderizable que debe generarse y sanitizarse.

Modelo esperado:

```ts
export interface EditorDocument {
  id: string;
  title: string;
  contentJson: unknown;
  contentHtml: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

Modelo de asset esperado:

```ts
export interface EditorAsset {
  id: string;
  documentId: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  altText?: string;
  createdAt: string;
}
```

Modos esperados:

```ts
export type EditorMode = 'wysiwyg' | 'source-html' | 'source-json' | 'preview';

export interface EditorViewState {
  mode: EditorMode;
  fullscreen: boolean;
}
```

`fullscreen` es estado visual independiente y no forma parte del modo de contenido.

## Schema del JSON canonico

El frontend valida `contentJson` antes de cargar, persistir o aplicar contenido editado desde JSON.

La especificacion inicial versionada acepta solo los nodos:

- `doc`
- `paragraph`
- `text`
- `heading`
- `bulletList`
- `orderedList`
- `listItem`
- `taskList`
- `taskItem`
- `table`
- `tableRow`
- `tableCell`
- `tableHeader`
- `image`
- `blockquote`
- `codeBlock`
- `horizontalRule`

Las marcas permitidas son:

- `bold`
- `italic`
- `underline`
- `strike`
- `link`
- `textStyle`
- `highlight`

Los atributos se validan por nodo o marca. Entre otros, se controlan `href`, `src`, `alt`, `level`, `width`, `height`, `align`, `color`, `textAlign`, `colspan`, `rowspan` y `colwidth`. Los atributos desconocidos y protocolos inseguros como `javascript:` se rechazan antes de aplicar el contenido.

## Arquitectura esperada

Estructura objetivo:

```txt
src
├── main.ts
├── style.css
├── editor
│   ├── core
│   │   ├── create-editor.ts
│   │   ├── editor-extensions.ts
│   │   ├── editor-commands.ts
│   │   ├── table-commands.ts
│   │   └── editor-types.ts
│   ├── components
│   │   ├── editor-shell.ts
│   │   ├── toolbar.ts
│   │   ├── bubble-menu.ts
│   │   ├── source-view.ts
│   │   ├── preview-view.ts
│   │   ├── fullscreen.ts
│   │   ├── image-dialog.ts
│   │   └── table-menu.ts
│   ├── extensions
│   │   ├── resizable-image.extension.ts
│   │   ├── custom-table.extension.ts
│   │   └── link.extension.ts
│   ├── services
│   │   ├── document-storage.service.ts
│   │   ├── media-upload.service.ts
│   │   ├── sanitizer.service.ts
│   │   ├── serializer.service.ts
│   │   └── autosave.service.ts
│   ├── models
│   │   ├── editor-document.ts
│   │   ├── editor-mode.ts
│   │   ├── editor-asset.ts
│   │   └── editor-config.ts
│   └── utils
│       ├── debounce.ts
│       ├── file-validator.ts
│       ├── html-validator.ts
│       └── dom.ts
└── api
    ├── documents.api.ts
    └── assets.api.ts
```

## Dependencias esperadas

Principales:

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

Desarrollo:

- `vitest`
- `jsdom`
- `playwright`

## Roadmap funcional

### Fase 1 - MVP

Editor funcional con:

- Vite + TypeScript.
- Tiptap base.
- Toolbar minima.
- Parrafos.
- H1, H2, H3.
- Negrita.
- Cursiva.
- Subrayado.
- Listas.
- Deshacer/rehacer.
- Guardado JSON/HTML.
- Recuperacion y renderizado del contenido.

Resultado esperado:

```txt
Usuario escribe -> editor genera JSON/HTML -> se guarda -> se recupera correctamente.
```

### Fase 2 - Formato avanzado

Incluye tachado, color, resaltado, alineacion, citas, separador, bloques de codigo, links configurables y placeholder.

### Fase 3 - Tablas

Incluye insertar tabla, filas, columnas, encabezados, combinar, separar, redimensionar y menu contextual.

### Fase 4 - Imagenes

Incluye subida manual, drag and drop, pegado, alt, alineacion, ancho, alto, caption opcional, validacion de tamano/MIME y servicio de assets.

Decision de UI para imagenes:

- El boton de insertar imagen puede permanecer en la toolbar porque abre el flujo de carga.
- Las acciones sobre una imagen ya insertada no deben agregarse a la toolbar.
- Al seleccionar una imagen, debe aparecer un dialogo contextual con las acciones disponibles, como alineacion y dimensiones.

Decision sobre captions:

- No se implementan en la Fase 4 actual.
- Un caption editable debe modelarse como contenido estructural, no como atributo simple de `image`.
- Si se retoma, debe definirse un contenedor canonico como `figure`/`figcaption` o alternativa equivalente, ampliar el schema permitido, ajustar sanitizacion/serializacion y agregar pruebas de persistencia.

### Fase 5 - Vista de codigo

Incluye HTML, JSON, CodeMirror, validacion JSON, sanitizacion HTML, sincronizacion con WYSIWYG y errores amigables.

### Fase 6 - Preview y fullscreen

Incluye vista previa, pantalla completa, Escape para salir, toolbar fija, area centrada y responsive.

### Fase 7 - Autosave y versionado

Incluye debounce, estado visual, guardado manual, versiones, recuperacion y comparacion basica.

### Fase 8 - Empresarial opcional

Incluye plantillas, bloques reutilizables, comentarios, aprobaciones, control de cambios, permisos, PDF, Markdown y firma/aprobacion documental.

## API backend sugerida

Endpoints minimos esperados:

```http
POST /api/documents
GET /api/documents/{id}
PUT /api/documents/{id}
DELETE /api/documents/{id}
GET /api/documents/{id}/versions
POST /api/documents/{id}/versions
POST /api/documents/{id}/assets/images
DELETE /api/documents/{id}/assets/{assetId}
```

Payload base para guardar:

```json
{
  "title": "Documento actualizado",
  "contentJson": {
    "type": "doc",
    "content": []
  },
  "contentHtml": "<h1>Documento actualizado</h1>"
}
```

## Base de datos sugerida

Tablas esperadas si se implementa backend:

- `documents`
- `document_versions`
- `document_assets`

Campos clave:

- Documento: id, title, content_json, content_html, status, created_by, created_at, updated_at.
- Version: id, document_id, version_number, content_json, content_html, created_by, created_at.
- Asset: id, document_id, file_name, mime_type, url, size, alt_text, created_by, created_at.

## Seguridad

Riesgos principales:

- XSS.
- HTML malicioso.
- Archivos peligrosos.
- Imagenes demasiado pesadas.
- Links inseguros.
- Perdida de informacion.
- Corrupcion del documento.

Mitigaciones obligatorias:

- Sanitizar HTML en frontend y backend.
- Bloquear scripts, eventos inline e iframes no permitidos.
- Validar MIME real en backend.
- Limitar tamano de imagenes.
- Permitir solo protocolos seguros en links.
- Usar autosave y versionado.
- Validar JSON contra esquema permitido.

Regla critica:

```txt
Nunca renderizar HTML del usuario con innerHTML sin pasar primero por sanitizacion.
```

## Estado inicial del workspace

Al crear estos documentos, el directorio contenia solo:

- `plan_editor_wysiwyg_vite_ts.md`

No se detecto un repositorio Git inicializado en la raiz actual.

## Comandos de verificacion esperados cuando exista el proyecto

```bash
npm run build
npm test
npm run test:e2e
npm run dev
```

Si un comando todavia no existe, la tarea correspondiente debe permanecer pendiente o registrarse en `worklog.md`.
