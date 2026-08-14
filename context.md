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
- Normalizacion de contenido pegado desde Word y Excel.
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
- El dialogo contextual debe posicionarse por fuera del rectangulo de la imagen seleccionada para no superponerse sobre el contenido.

Decision sobre captions:

- No se implementan en la Fase 4 actual.
- Un caption editable debe modelarse como contenido estructural, no como atributo simple de `image`.
- Si se retoma, debe definirse un contenedor canonico como `figure`/`figcaption` o alternativa equivalente, ampliar el schema permitido, ajustar sanitizacion/serializacion y agregar pruebas de persistencia.

Decision sobre importacion y exportacion HTML con imagenes:

- No se agregan modos nuevos a `EditorMode`. El flujo normal conserva en `contentJson` y `contentHtml` las rutas seguras retornadas por el backend.
- `MountedEditorApp.setHtml(html)` sera la entrada publica para cargar HTML. Debe sanitizar y validar todo el contenido antes de reemplazar el documento, y la operacion debe ser atomica.
- `MountedEditorApp.getHtmlWithBase64Images()` sera una salida adicional y asincrona. Trabaja sobre una copia del HTML actual, descarga cada imagen enlazada y devuelve HTML autocontenido sin mutar el JSON canonico, las rutas internas, la seleccion ni el historial.
- El resultado de `getHtmlWithBase64Images()` solo puede contener `data:image/png|jpeg|webp;base64,...` en `img[src]`; no puede contener rutas, URL remotas, `blob:`, `srcset`, scripts o eventos inline.
- `setHtml` debe aceptar tanto rutas/URL seguras como Base64 validado para permitir el roundtrip de la API, pero permitir Base64 no habilita `data:` de forma global. Se rechazan SVG, MIME no admitidos, payloads malformados y data URI fuera de `img[src]`.
- La conversion de una ruta existente a Base64 puede requerir CORS, autorizacion o un proxy del backend. El exportador debe admitir URL base y `fetch`/resolvedor inyectable, errores tipados y cancelacion.
- Si una imagen no se puede resolver, la exportacion completa falla: no se devuelve HTML parcialmente autocontenido.
- Base64 aumenta el payload aproximadamente un tercio antes de contar el HTML que lo contiene; deben mantenerse limites de imagen y documentarse limites de exportacion.

API publica implementada:

```ts
type SetHtmlResult =
  | { ok: true; code: 'applied'; html: string; warnings?: string[] }
  | {
      ok: false;
      code: 'empty-html' | 'unsafe-content' | 'unsupported-schema';
      message: string;
    };

editorApp.setHtml(html: string, options?: {
  mode?: 'strict' | 'legacy';
}): SetHtmlResult;
editorApp.getHtmlWithBase64Images(options?: {
  signal?: AbortSignal;
}): Promise<string>;
```

La configuracion del montaje permite resolver rutas del backend, inyectar un
`fetch` autenticado, agregar opciones comunes de request y ajustar limites:

```ts
const editorApp = await mountEditorApp({
  app,
  htmlBase64Export: {
    baseUrl: 'https://api.example.com/documents/123/',
    fetch: authenticatedFetch,
    requestInit: { credentials: 'include' },
    maxImageBytes: 10 * 1024 * 1024,
    concurrency: 4,
  },
});

const imported = editorApp.setHtml(htmlFromBackend);

if (imported.ok) {
  const controller = new AbortController();
  const portableHtml = await editorApp.getHtmlWithBase64Images({
    signal: controller.signal,
  });
}
```

El modo `strict`, usado por defecto, rechaza de forma atomica etiquetas y
atributos fuera del schema. Para migrar contenido historico de editores
anteriores se puede usar `setHtml(html, { mode: 'legacy' })`: primero adapta
marcas obsoletas como `<font color>`, sanitiza scripts, eventos, URL y atributos
no permitidos, conserva el texto y la estructura compatibles, y devuelve
`warnings` sin impedir que el resultado seguro se renderice. Las advertencias
deben mostrarse al usuario o registrarse para revisar la migracion; nunca se
debe volver a persistir el HTML original inseguro como contenido canonico.

`HtmlBase64ExportError` identifica `aborted`, `invalid-source`, `http-error`,
`network-error`, `unsupported-mime` y `size-limit`, e incluye la fuente original
en `source` y el error subyacente en `cause` cuando existe. Los errores HTTP,
CORS/red, MIME, limite o cancelacion rechazan toda la operacion.

Por defecto se procesan hasta cuatro fuentes distintas en paralelo y se aceptan
hasta 10 MiB por imagen. Una misma URL se descarga una sola vez por llamada. El
Base64 aumenta los bytes de la imagen aproximadamente 33 %, ademas del HTML, por
lo que esta salida debe solicitarse bajo demanda y no reemplaza el guardado
normal. CORS, cookies o encabezados de autorizacion deben resolverse mediante el
backend o el `fetch` inyectado.

El roundtrip `setHtml(await getHtmlWithBase64Images())` esta soportado. Las URI
Base64 solo se admiten para PNG, JPEG y WebP validos en `img[src]`; no se habilita
el protocolo `data:` en links ni en otros atributos. Importar esa copia hace que
el Base64 pase a ser el `src` del nuevo documento; exportarla por si sola nunca
muta las rutas del documento existente.

### Fase 5 - Vista de codigo

Incluye HTML, JSON, CodeMirror, validacion JSON, sanitizacion HTML, sincronizacion con WYSIWYG y errores amigables.

### Fase 5.1 - Pegado desde Word y Excel

Incluye deteccion y normalizacion de contenido copiado desde Microsoft Word, Excel y fuentes equivalentes de Office. El objetivo es convertir HTML ruidoso, estilos `mso-*`, comentarios, namespaces, tablas y texto tabulado en contenido permitido por Tiptap/ProseMirror, sin convertir HTML en la fuente canonica. El resultado debe terminar como JSON canonico y HTML renderizable sanitizado.

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
POST /api/documents/{id}/versions/{versionId}/restore
POST /api/documents/{id}/assets/images
DELETE /api/documents/{id}/assets/{assetId}
```

Contratos de rutas:

| Metodo   | Ruta                                               | Request                                               | Response                   |
| -------- | -------------------------------------------------- | ----------------------------------------------------- | -------------------------- |
| `POST`   | `/api/documents`                                   | `CreateDocumentRequest`                               | `EditorDocument`           |
| `GET`    | `/api/documents/{id}`                              | Sin body                                              | `EditorDocument`           |
| `PUT`    | `/api/documents/{id}`                              | `UpdateDocumentRequest`                               | `EditorDocument`           |
| `DELETE` | `/api/documents/{id}`                              | Sin body                                              | `204` sin body             |
| `GET`    | `/api/documents/{id}/versions`                     | Sin body                                              | `EditorVersion[]`          |
| `POST`   | `/api/documents/{id}/versions`                     | `CreateVersionRequest`                                | `EditorVersion`            |
| `POST`   | `/api/documents/{id}/versions/{versionId}/restore` | Sin body                                              | `EditorVersion` restaurada |
| `POST`   | `/api/documents/{id}/assets/images`                | `multipart/form-data` con `file` y `altText` opcional | `EditorAsset`              |
| `DELETE` | `/api/documents/{id}/assets/{assetId}`             | Sin body                                              | `204` sin body             |

Todos los identificadores de ruta deben codificarse. Los clientes validan requests y responses,
y convierten cualquier respuesta no OK en `HttpApiError` con operacion, status y body diagnostico.

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

Restricciones e indices recomendados:

- `documents.status`: `draft`, `published` o `archived`.
- `document_versions`: `UNIQUE (document_id, version_number)` e indice por
  `(document_id, created_at DESC)`.
- `document_assets`: indice por `(document_id, created_at DESC)` y `size >= 0`.
- `document_versions.document_id` y `document_assets.document_id` referencian `documents.id`
  con politica de borrado definida por el backend.
- `content_json` es la fuente canonica; `content_html` es una proyeccion sanitizada.

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

## Secciones para asistencia de agentes

Las partes que el usuario marque para una futura operacion de redaccion, tono,
correccion o sugerencias se representan como decoraciones temporales de
ProseMirror. No son marcas del schema y, por tanto, no alteran ni se persisten en
`contentJson` o `contentHtml`.

`MountedEditorApp.getAgentSections()` expone cada seleccion mediante un
identificador, posiciones actuales, texto plano y fragmento JSON. Las posiciones
se mapean al editar el documento para mantener el resaltado unido al contenido
mientras la aplicacion siga montada. La accion concreta del agente, su prompt y
la aplicacion o revision de resultados quedan fuera de este primer contrato.

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
