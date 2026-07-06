# Plan completo para crear un editor WYSIWYG con Vite + TypeScript

## 1. Objetivo

Crear un editor WYSIWYG web reutilizable, desarrollado con **Vite + TypeScript**, que permita crear, editar, guardar y renderizar documentos enriquecidos.

El editor debe incluir herramientas comunes de edición:

- Formato de texto.
- Títulos.
- Listas.
- Tablas.
- Imágenes.
- Enlaces.
- Vista de código.
- Vista previa.
- Vista completa.
- Guardado del contenido.
- Sanitización de HTML.
- Arquitectura extensible para futuras funciones.

---

## 2. Decisión técnica recomendada

La arquitectura recomendada es:

```txt
Vite + TypeScript
+ Tiptap
+ ProseMirror JSON
+ CodeMirror
+ DOMPurify
```

### Por qué esta combinación

| Tecnología | Uso |
|---|---|
| **Vite** | Build tool rápido para frontend moderno. |
| **TypeScript** | Tipado, mantenibilidad y seguridad en el desarrollo. |
| **Tiptap** | Motor WYSIWYG extensible basado en ProseMirror. |
| **ProseMirror JSON** | Modelo canónico del documento. |
| **CodeMirror** | Editor para vista de código HTML/JSON. |
| **DOMPurify** | Sanitización de HTML para prevenir XSS. |

No se recomienda construir el editor directamente con `contenteditable` puro, porque un editor real necesita manejar selección, historial, comandos, nodos, marcas, tablas, imágenes, serialización y validaciones.

---

## 3. Alcance funcional

### 3.1 Funciones principales

| Módulo | Funciones |
|---|---|
| Formato | Negrita, cursiva, subrayado, tachado, color, resaltado. |
| Títulos | Párrafo, H1, H2, H3, H4. |
| Listas | Lista ordenada, lista no ordenada, checklist. |
| Tablas | Insertar tabla, eliminar tabla, filas, columnas, encabezados, combinar celdas. |
| Imágenes | Subir, pegar, arrastrar, alinear, redimensionar, texto alternativo. |
| Enlaces | Crear, editar y eliminar enlaces. |
| Código | Vista de código HTML y JSON. |
| Vista completa | Modo pantalla completa del editor. |
| Historial | Deshacer y rehacer. |
| Persistencia | Guardar JSON canónico y HTML renderizable. |
| Seguridad | Sanitización de HTML y validación de archivos. |

---

## 4. Arquitectura general

```txt
src
├── main.ts
├── style.css
├── editor
│   ├── core
│   │   ├── create-editor.ts
│   │   ├── editor-extensions.ts
│   │   ├── editor-commands.ts
│   │   └── editor-types.ts
│   │
│   ├── components
│   │   ├── editor-shell.ts
│   │   ├── toolbar.ts
│   │   ├── bubble-menu.ts
│   │   ├── source-view.ts
│   │   ├── preview-view.ts
│   │   ├── fullscreen.ts
│   │   ├── image-dialog.ts
│   │   └── table-menu.ts
│   │
│   ├── extensions
│   │   ├── resizable-image.extension.ts
│   │   ├── custom-table.extension.ts
│   │   └── link.extension.ts
│   │
│   ├── services
│   │   ├── document-storage.service.ts
│   │   ├── media-upload.service.ts
│   │   ├── sanitizer.service.ts
│   │   ├── serializer.service.ts
│   │   └── autosave.service.ts
│   │
│   ├── models
│   │   ├── editor-document.ts
│   │   ├── editor-mode.ts
│   │   ├── editor-asset.ts
│   │   └── editor-config.ts
│   │
│   └── utils
│       ├── debounce.ts
│       ├── file-validator.ts
│       ├── html-validator.ts
│       └── dom.ts
│
└── api
    ├── documents.api.ts
    └── assets.api.ts
```

---

## 5. Creación del proyecto

### 5.1 Crear proyecto con Vite + TypeScript

```bash
npm create vite@latest wysiwyg-editor -- --template vanilla-ts
cd wysiwyg-editor
npm install
```

### 5.2 Instalar dependencias principales

```bash
npm install @tiptap/core @tiptap/starter-kit
npm install @tiptap/extension-underline
npm install @tiptap/extension-text-style @tiptap/extension-color @tiptap/extension-highlight
npm install @tiptap/extension-text-align
npm install @tiptap/extension-link
npm install @tiptap/extension-image
npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header
npm install @tiptap/extension-task-list @tiptap/extension-task-item
npm install @tiptap/extension-placeholder
npm install codemirror @codemirror/view @codemirror/state @codemirror/lang-html @codemirror/lang-json
npm install dompurify zod
```

### 5.3 Dependencias de desarrollo

```bash
npm install -D vitest jsdom playwright
```

---

## 6. Configuración base

### 6.1 `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 6.2 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

---

## 7. Modelo de documento

El contenido principal debe guardarse como **JSON del editor**, no como HTML.

### 7.1 Motivo

Guardar JSON permite:

- Mantener estructura semántica.
- Migrar documentos con mayor control.
- Validar nodos y atributos.
- Evitar depender de HTML frágil.
- Generar HTML, Markdown o PDF desde una fuente canónica.

### 7.2 Modelo TypeScript

```ts
// src/editor/models/editor-document.ts

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

### 7.3 Modelo de asset

```ts
// src/editor/models/editor-asset.ts

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

### 7.4 Modos del editor

```ts
// src/editor/models/editor-mode.ts

export type EditorMode =
  | 'wysiwyg'
  | 'source-html'
  | 'source-json'
  | 'preview'
  | 'fullscreen';
```

---

## 8. Inicialización del editor

### 8.1 Extensiones del editor

```ts
// src/editor/core/editor-extensions.ts

import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { ResizableImage } from '@/editor/extensions/resizable-image.extension';

export function createEditorExtensions() {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4],
      },
    }),

    Underline,
    TextStyle,
    Color,

    Highlight.configure({
      multicolor: true,
    }),

    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),

    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      protocols: ['http', 'https', 'mailto'],
    }),

    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,

    TaskList,
    TaskItem.configure({
      nested: true,
    }),

    ResizableImage,

    Placeholder.configure({
      placeholder: 'Escribe aquí...',
    }),
  ];
}
```

### 8.2 Crear instancia del editor

```ts
// src/editor/core/create-editor.ts

import { Editor } from '@tiptap/core';
import { createEditorExtensions } from './editor-extensions';

export interface CreateEditorOptions {
  element: HTMLElement;
  content?: unknown;
  onChange?: (payload: { json: unknown; html: string }) => void;
}

export function createWysiwygEditor(options: CreateEditorOptions): Editor {
  return new Editor({
    element: options.element,
    extensions: createEditorExtensions(),
    content: options.content ?? '<p></p>',
    autofocus: true,
    injectCSS: false,
    onUpdate({ editor }) {
      options.onChange?.({
        json: editor.getJSON(),
        html: editor.getHTML(),
      });
    },
  });
}
```

---

## 9. Extensión personalizada para imágenes

La extensión base de imagen permite insertar imágenes, pero para un editor empresarial normalmente se necesitan atributos adicionales como ancho, alto, alineación y texto alternativo.

```ts
// src/editor/extensions/resizable-image.extension.ts

import Image from '@tiptap/extension-image';

export const ResizableImage = Image.extend({
  name: 'resizableImage',

  addAttributes() {
    return {
      ...this.parent?.(),

      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },

      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },

      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') ?? 'center',
        renderHTML: attributes => {
          return { 'data-align': attributes.align ?? 'center' };
        },
      },
    };
  },
});
```

> Nota: el redimensionamiento visual con handles se puede implementar después mediante un `NodeView` personalizado.

---

## 10. Toolbar

La toolbar no debe manipular el DOM directamente. Debe ejecutar comandos del editor.

### 10.1 Acciones principales

```ts
// src/editor/core/editor-commands.ts

import type { Editor } from '@tiptap/core';

export function toggleBold(editor: Editor) {
  editor.chain().focus().toggleBold().run();
}

export function toggleItalic(editor: Editor) {
  editor.chain().focus().toggleItalic().run();
}

export function toggleUnderline(editor: Editor) {
  editor.chain().focus().toggleUnderline().run();
}

export function toggleStrike(editor: Editor) {
  editor.chain().focus().toggleStrike().run();
}

export function setHeading(editor: Editor, level: 1 | 2 | 3 | 4) {
  editor.chain().focus().toggleHeading({ level }).run();
}

export function setParagraph(editor: Editor) {
  editor.chain().focus().setParagraph().run();
}

export function toggleBulletList(editor: Editor) {
  editor.chain().focus().toggleBulletList().run();
}

export function toggleOrderedList(editor: Editor) {
  editor.chain().focus().toggleOrderedList().run();
}

export function toggleTaskList(editor: Editor) {
  editor.chain().focus().toggleTaskList().run();
}

export function undo(editor: Editor) {
  editor.chain().focus().undo().run();
}

export function redo(editor: Editor) {
  editor.chain().focus().redo().run();
}
```

### 10.2 Comandos de tabla

```ts
// src/editor/core/table-commands.ts

import type { Editor } from '@tiptap/core';

export function insertTable(editor: Editor) {
  editor
    .chain()
    .focus()
    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    .run();
}

export function addColumnBefore(editor: Editor) {
  editor.chain().focus().addColumnBefore().run();
}

export function addColumnAfter(editor: Editor) {
  editor.chain().focus().addColumnAfter().run();
}

export function deleteColumn(editor: Editor) {
  editor.chain().focus().deleteColumn().run();
}

export function addRowBefore(editor: Editor) {
  editor.chain().focus().addRowBefore().run();
}

export function addRowAfter(editor: Editor) {
  editor.chain().focus().addRowAfter().run();
}

export function deleteRow(editor: Editor) {
  editor.chain().focus().deleteRow().run();
}

export function deleteTable(editor: Editor) {
  editor.chain().focus().deleteTable().run();
}

export function mergeCells(editor: Editor) {
  editor.chain().focus().mergeCells().run();
}

export function splitCell(editor: Editor) {
  editor.chain().focus().splitCell().run();
}

export function toggleHeaderRow(editor: Editor) {
  editor.chain().focus().toggleHeaderRow().run();
}
```

---

## 11. Vista de código con CodeMirror

La vista de código debe permitir editar:

- HTML generado.
- JSON del documento.

### 11.1 Crear vista CodeMirror

```ts
// src/editor/components/source-view.ts

import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';

export type SourceLanguage = 'html' | 'json';

export interface SourceViewOptions {
  parent: HTMLElement;
  value: string;
  language: SourceLanguage;
  onChange?: (value: string) => void;
}

export function createSourceView(options: SourceViewOptions): EditorView {
  const languageExtension = options.language === 'html' ? html() : json();

  const state = EditorState.create({
    doc: options.value,
    extensions: [
      basicSetup,
      languageExtension,
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          options.onChange?.(update.state.doc.toString());
        }
      }),
    ],
  });

  return new EditorView({
    state,
    parent: options.parent,
  });
}
```

### 11.2 Flujo de edición de código HTML

```txt
Editor WYSIWYG
→ generar HTML
→ mostrar HTML en CodeMirror
→ usuario edita código
→ sanitizar HTML
→ validar HTML permitido
→ cargar HTML de nuevo en Tiptap
```

### 11.3 Servicio de sanitización

```ts
// src/editor/services/sanitizer.service.ts

import DOMPurify from 'dompurify';

export function sanitizeHtml(dirtyHtml: string): string {
  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: {
      html: true,
    },
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
}
```

---

## 12. Manejo de imágenes

### 12.1 Reglas mínimas

| Regla | Valor recomendado |
|---|---|
| Tamaño máximo | 5 MB por imagen. |
| Formatos permitidos | PNG, JPG, JPEG, WEBP. |
| Nombre del archivo | Generado por backend. |
| Metadata | Remover metadata sensible si es posible. |
| Almacenamiento | S3, MinIO, filesystem o blob storage. |
| Inserción | Insertar URL retornada por backend. |

### 12.2 Validador de archivo

```ts
// src/editor/utils/file-validator.ts

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Formato de imagen no permitido.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('La imagen supera el tamaño máximo permitido.');
  }
}
```

### 12.3 Servicio de upload

```ts
// src/editor/services/media-upload.service.ts

import { validateImageFile } from '@/editor/utils/file-validator';

export interface UploadImageResponse {
  id: string;
  url: string;
  altText?: string;
}

export async function uploadImage(
  documentId: string,
  file: File,
): Promise<UploadImageResponse> {
  validateImageFile(file);

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/documents/${documentId}/assets/images`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('No se pudo subir la imagen.');
  }

  return response.json() as Promise<UploadImageResponse>;
}
```

### 12.4 Insertar imagen en el editor

```ts
import type { Editor } from '@tiptap/core';

export function insertImage(editor: Editor, src: string, alt?: string) {
  editor
    .chain()
    .focus()
    .setImage({
      src,
      alt: alt ?? '',
    })
    .run();
}
```

---

## 13. Vista completa

Se recomienda iniciar con un modo fullscreen basado en CSS, no necesariamente con la API nativa del navegador.

### 13.1 Estado

```ts
let isFullscreen = false;

export function toggleFullscreen(root: HTMLElement) {
  isFullscreen = !isFullscreen;
  root.classList.toggle('editor-shell--fullscreen', isFullscreen);
}
```

### 13.2 CSS

```css
.editor-shell {
  border: 1px solid #ddd;
  background: #fff;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.editor-shell--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  background: #fff;
}

.editor-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #ddd;
  background: #fff;
  padding: 8px;
}

.editor-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
```

---

## 14. Autosave

### 14.1 Debounce

```ts
// src/editor/utils/debounce.ts

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: number | undefined;

  return (...args: Parameters<T>) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}
```

### 14.2 Servicio de guardado

```ts
// src/editor/services/document-storage.service.ts

export interface SaveDocumentPayload {
  title: string;
  contentJson: unknown;
  contentHtml: string;
}

export async function saveDocument(
  documentId: string,
  payload: SaveDocumentPayload,
): Promise<void> {
  const response = await fetch(`/api/documents/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('No se pudo guardar el documento.');
  }
}
```

### 14.3 Flujo recomendado

```txt
Cambio en el editor
→ debounce de 800 a 1500 ms
→ generar JSON y HTML
→ sanitizar HTML
→ enviar al backend
→ mostrar estado: guardando / guardado / error
```

---

## 15. API backend sugerida

Aunque el frontend se desarrolle con Vite + TypeScript, el backend puede ser .NET, Rust, Node o cualquier stack propio.

### 15.1 Endpoints mínimos

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

### 15.2 Crear documento

```json
{
  "title": "Documento de prueba",
  "contentJson": {
    "type": "doc",
    "content": []
  },
  "contentHtml": ""
}
```

### 15.3 Actualizar documento

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

### 15.4 Subir imagen

```json
{
  "id": "asset-uuid",
  "url": "/media/documents/document-uuid/image.webp",
  "altText": "Descripción de la imagen"
}
```

---

## 16. Base de datos sugerida

### 16.1 Tabla `documents`

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    title VARCHAR(250) NOT NULL,
    content_json JSONB NOT NULL,
    content_html TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_by UUID NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 16.2 Tabla `document_versions`

```sql
CREATE TABLE document_versions (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES documents(id),
    version_number INT NOT NULL,
    content_json JSONB NOT NULL,
    content_html TEXT NOT NULL,
    created_by UUID NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 16.3 Tabla `document_assets`

```sql
CREATE TABLE document_assets (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES documents(id),
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    size BIGINT NOT NULL,
    alt_text VARCHAR(500) NULL,
    created_by UUID NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 17. Seguridad

### 17.1 Riesgos principales

| Riesgo | Mitigación |
|---|---|
| XSS | Sanitizar HTML en frontend y backend. |
| HTML malicioso | Bloquear scripts, eventos inline e iframes no permitidos. |
| Archivos peligrosos | Validar MIME real en backend. |
| Imágenes demasiado pesadas | Limitar tamaño y comprimir. |
| Links inseguros | Permitir solo protocolos seguros. |
| Pérdida de información | Autosave y versionado. |
| Corrupción del documento | Validar JSON contra esquema permitido. |

### 17.2 Regla importante

Nunca renderizar HTML del usuario con `innerHTML` sin pasar primero por sanitización.

---

## 18. UI recomendada

### 18.1 Layout general

```txt
┌──────────────────────────────────────────────────────────────┐
│ Toolbar                                                       │
│ B I U S | H1 H2 H3 | Listas | Tabla | Imagen | Código | Full │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Área editable                                                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Estado: Guardado / Guardando / Error                         │
└──────────────────────────────────────────────────────────────┘
```

### 18.2 Toolbar mínima del MVP

```txt
Párrafo | H1 | H2 | H3
Negrita | Cursiva | Subrayado
Lista | Lista numerada
Link
Deshacer | Rehacer
Guardar
```

### 18.3 Toolbar completa

```txt
Párrafo | H1 | H2 | H3 | H4
B | I | U | S
Color | Resaltado
Izquierda | Centro | Derecha | Justificar
Lista | Lista numerada | Checklist
Tabla | Imagen | Link
Cita | Código | Separador
Deshacer | Rehacer
Vista código | Vista previa | Pantalla completa
```

---

## 19. Roadmap de desarrollo

## Fase 1: MVP del editor

Objetivo: tener un editor funcional y guardable.

Incluye:

- Proyecto Vite + TypeScript.
- Instancia base de Tiptap.
- Toolbar básica.
- Párrafos.
- Títulos H1, H2, H3.
- Negrita.
- Cursiva.
- Subrayado.
- Listas.
- Deshacer/rehacer.
- Guardar JSON y HTML.
- Renderizar contenido guardado.

Resultado esperado:

```txt
Usuario escribe → editor genera JSON/HTML → se guarda → se recupera correctamente.
```

---

## Fase 2: Formato avanzado

Incluye:

- Tachado.
- Color de texto.
- Resaltado.
- Alineación.
- Citas.
- Separador horizontal.
- Bloques de código.
- Links configurables.
- Placeholder.

---

## Fase 3: Tablas

Incluye:

- Insertar tabla.
- Agregar fila.
- Eliminar fila.
- Agregar columna.
- Eliminar columna.
- Encabezados.
- Combinar celdas.
- Separar celdas.
- Redimensionar columnas.
- Menú contextual para tablas.

---

## Fase 4: Imágenes

Incluye:

- Subida manual.
- Drag and drop.
- Pegado desde portapapeles.
- Atributo `alt`.
- Alineación.
- Ancho y alto.
- Caption opcional.
- Validación de tamaño.
- Validación de MIME.
- Servicio backend para assets.

---

## Fase 5: Vista de código

Incluye:

- Modo HTML.
- Modo JSON.
- CodeMirror.
- Validación de JSON.
- Sanitización de HTML.
- Sincronización con editor WYSIWYG.
- Mensajes de error amigables.

---

## Fase 6: Vista previa y pantalla completa

Incluye:

- Modo preview.
- Modo fullscreen.
- Atajo `Esc` para salir.
- Toolbar fija.
- Área de edición centrada.
- Diseño responsive.

---

## Fase 7: Autosave y versionado

Incluye:

- Autosave con debounce.
- Indicador visual de estado.
- Guardado manual.
- Versiones del documento.
- Recuperación de versión.
- Comparación básica de versiones.

---

## Fase 8: Funciones empresariales opcionales

Incluye:

- Plantillas.
- Bloques reutilizables.
- Comentarios.
- Revisión/aprobación.
- Control de cambios.
- Permisos por documento.
- Exportación PDF.
- Exportación Markdown.
- Firma o aprobación documental.

---

## 20. Pruebas

### 20.1 Unitarias

Probar:

- Sanitización de HTML.
- Validación de archivos.
- Serialización JSON/HTML.
- Comandos del editor.
- Conversión de contenido.
- Servicios de guardado.

### 20.2 Integración

Probar:

- Crear documento.
- Editar documento.
- Guardar documento.
- Recuperar documento.
- Insertar imagen.
- Insertar tabla.
- Cambiar a vista código.
- Volver a WYSIWYG.

### 20.3 End-to-end

Con Playwright:

```txt
1. Crear documento nuevo.
2. Escribir título y párrafo.
3. Aplicar formato.
4. Insertar lista.
5. Insertar tabla.
6. Subir imagen.
7. Cambiar a vista de código.
8. Volver al editor visual.
9. Guardar.
10. Recargar página.
11. Verificar que el contenido persiste.
```

---

## 21. Criterios de aceptación

El editor se considera listo para una primera versión cuando:

- Permite crear y editar contenido enriquecido.
- Guarda correctamente JSON y HTML.
- Recupera documentos sin pérdida de contenido.
- Soporta títulos, listas, formato, enlaces, tablas e imágenes.
- Tiene vista de código funcional.
- Tiene modo pantalla completa.
- Sanitiza HTML antes de renderizar o guardar.
- Maneja errores de guardado.
- Funciona correctamente en escritorio y móvil.
- Tiene pruebas mínimas de los flujos críticos.

---

## 22. Orden recomendado de implementación

El orden óptimo sería:

```txt
1. Crear proyecto Vite + TypeScript.
2. Montar Tiptap básico.
3. Crear toolbar mínima.
4. Guardar JSON/HTML localmente.
5. Implementar servicio de persistencia.
6. Agregar formato avanzado.
7. Agregar tablas.
8. Agregar imágenes.
9. Agregar CodeMirror para vista de código.
10. Agregar sanitización.
11. Agregar pantalla completa.
12. Agregar autosave.
13. Agregar versionado.
14. Agregar pruebas.
```

---

## 23. Decisión final recomendada

La decisión técnica óptima para este proyecto es:

```txt
Vite + TypeScript como base frontend.
Tiptap como motor WYSIWYG.
ProseMirror JSON como formato principal.
CodeMirror para edición de código HTML/JSON.
DOMPurify para sanitización.
Backend propio para documentos, imágenes y versiones.
```

Esta arquitectura permite construir un editor moderno, extensible y seguro, sin quedar limitado a un editor cerrado ni caer en la complejidad excesiva de crear todo desde cero.

---

## 24. Referencias técnicas

- Vite: https://vite.dev/
- Vite Getting Started: https://vite.dev/guide/
- Tiptap Editor: https://tiptap.dev/docs/editor/getting-started/install
- Tiptap Vite UI Components: https://tiptap.dev/docs/ui-components/install/vite
- Tiptap GitHub: https://github.com/ueberdosis/tiptap
- CodeMirror Docs: https://codemirror.net/docs/
- CodeMirror Reference: https://codemirror.net/docs/ref/
- DOMPurify GitHub: https://github.com/cure53/DOMPurify
