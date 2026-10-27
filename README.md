# Smart Editor LTE

![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white)
![Tiptap](https://img.shields.io/badge/Tiptap-3.30.1-111111)
![CodeMirror](https://img.shields.io/badge/CodeMirror-6.x-2146c7)
![Vitest](https://img.shields.io/badge/Vitest-4.x-6e9f18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.x-2ead33?logo=playwright&logoColor=white)

Editor WYSIWYG web construido con Vite, TypeScript, Tiptap, ProseMirror,
CodeMirror, DOMPurify y Zod. El proyecto funciona como demo local vanilla
TypeScript y como libreria ESM reutilizable para aplicaciones web o Angular.

## Tags

`typescript` `vite` `wysiwyg` `tiptap` `prosemirror` `codemirror` `dompurify`
`zod` `vitest` `playwright` `vanilla-ts` `esm` `editor`

## Caracteristicas

- Edicion WYSIWYG basada en Tiptap y ProseMirror.
- Documento canonico en JSON de ProseMirror/Tiptap.
- HTML renderizable generado y sanitizado.
- Toolbar con titulos H1-H6, parrafo, negrita, cursiva, subrayado, tachado,
  listas, alineacion, color, resaltado, links, citas, separadores y bloques de
  codigo.
- Tablas con comandos de filas, columnas, encabezados, combinacion, separacion y
  redimensionamiento.
- Imagenes con dialogo, validacion de tipo/tamano, opciones de alt, alineacion,
  ancho y alto.
- Vista de codigo HTML y JSON con CodeMirror.
- Vista previa sanitizada.
- Pantalla completa como estado visual independiente.
- Autosave, guardado manual y persistencia local por defecto.
- Historial de versiones mediante API local o cliente HTTP.
- Importacion HTML con modo estricto y modo legacy para contenido historico.
- Exportacion de HTML con imagenes embebidas en base64.
- Validacion de contenido con Zod y rechazo de nodos, marcas, atributos o URLs
  inseguras.

## Requisitos

- Node.js moderno compatible con Vite 8 y TypeScript 6.
- npm o pnpm.

El repositorio incluye `package-lock.json`, por lo que npm es el flujo fijado
actualmente. pnpm tambien puede usarse si el equipo decide generar y versionar
un `pnpm-lock.yaml`.

## Instalacion para desarrollo con npm

```bash
npm install
npm run dev
```

Vite mostrara la URL local de desarrollo, normalmente:

```txt
http://localhost:5173/
```

Comandos frecuentes:

```bash
npm run build
npm run build:lib
npm run preview
npm run lint
npm test
npm run test:e2e
npm run check
```

## Instalacion para desarrollo con pnpm

```bash
pnpm install
pnpm dev
```

Comandos equivalentes:

```bash
pnpm build
pnpm build:lib
pnpm preview
pnpm lint
pnpm test
pnpm test:e2e
pnpm check
```

Si se usa pnpm de forma oficial en el proyecto, conviene confirmar el lockfile
con:

```bash
pnpm install --lockfile-only
```

## Build de la aplicacion demo

```bash
npm run build
```

o con pnpm:

```bash
pnpm build
```

Este comando ejecuta TypeScript y luego genera la build Vite de la demo.

## Build de libreria

```bash
npm run build:lib
```

o con pnpm:

```bash
pnpm build:lib
```

La salida queda en `dist/` e incluye:

- `smart-editor-lte.js`: modulo ESM.
- `smart-editor-lte.css`: estilos de la libreria.
- `types/`: declaraciones TypeScript.
- `package.json`: manifiesto para consumir la libreria.
- `README.md`: README especifico de distribucion.
- `font/`: fuentes necesarias para los iconos.

## Instalar la libreria desde una build local

Primero genera la distribucion:

```bash
npm run build:lib
```

Luego instala el paquete desde otra aplicacion:

```bash
npm install /ruta/a/smart-editor-lte/dist
```

Con pnpm:

```bash
pnpm add /ruta/a/smart-editor-lte/dist
```

## Uso como libreria

```ts
import { mountEditorApp, type MountedEditorApp } from 'smart-editor-lte';
import 'smart-editor-lte/style.css';

const host = document.querySelector<HTMLDivElement>('#editor');

if (!host) {
  throw new Error('Editor host was not found');
}

const editor: MountedEditorApp = await mountEditorApp({
  app: host,
  embedded: true,
  documentId: 'documento-1',
  documentTitle: 'Documento',
  onChange: ({ contentJson, contentHtml }) => {
    console.log({ contentJson, contentHtml });
  },
});

editor.setHtml('<h1>Titulo</h1><p>Contenido inicial</p>');
```

Al desmontar la vista que contiene el editor, libera recursos:

```ts
editor.lifecycle.dispose();
```

## Uso en Angular

Importa la API:

```ts
import { mountEditorApp, type MountedEditorApp } from 'smart-editor-lte';
```

Agrega los estilos a `angular.json`:

```json
{
  "styles": ["node_modules/smart-editor-lte/smart-editor-lte.css"]
}
```

Monta el editor sobre un `div` y destruyelo en `ngOnDestroy`:

```ts
private editor: MountedEditorApp | null = null;

async ngAfterViewInit(): Promise<void> {
  this.editor = await mountEditorApp({
    app: this.host.nativeElement,
    embedded: true,
    documentId: 'documento-1',
    onChange: ({ contentHtml }) => console.log(contentHtml),
  });
}

ngOnDestroy(): void {
  this.editor?.lifecycle.dispose();
}
```

## API publica principal

El paquete exporta desde `src/lib.ts`:

- `mountEditorApp(options)`: monta el editor y devuelve la instancia controlable.
- `MountedEditorApp`: tipo de la instancia montada.
- `MountEditorAppOptions`: opciones de montaje.
- `setHtml(html, options)`: aplica HTML al editor con validacion y sanitizacion.
- `getHtmlWithBase64Images(options)`: devuelve HTML con imagenes convertidas a
  base64 cuando sea posible.
- `getAgentSections()`: devuelve secciones marcadas para flujo con agentes.
- Tipos asociados a importacion HTML, exportacion base64, secciones de agente y
  contenido canonico.

Ejemplo de carga HTML legacy:

```ts
const result = editor.setHtml(htmlGuardado, { mode: 'legacy' });

if (result.ok && result.warnings?.length) {
  console.warn(result.warnings);
}
```

El modo legacy conserva contenido compatible, transforma etiquetas historicas
como `<font color>` y elimina scripts, eventos y atributos inseguros.

## Persistencia

Por defecto el editor usa servicios locales para documentos, assets y versiones.
Para integrarlo con backend, pasa implementaciones propias o clientes HTTP al
montar:

```ts
await mountEditorApp({
  app: host,
  documentId: 'documento-remoto',
  storage: customDocumentStorage,
  mediaUpload: customMediaUpload,
  versionsApi: customVersionsApi,
});
```

El cliente HTTP incluido espera rutas con esta forma:

- `POST /api/documents`
- `GET /api/documents/{documentId}`
- `PUT /api/documents/{documentId}`
- `DELETE /api/documents/{documentId}`
- `GET /api/documents/{documentId}/versions`
- `POST /api/documents/{documentId}/versions`
- `POST /api/documents/{documentId}/versions/{versionId}/restore`

## Modelo de documento

El JSON canonico es la fuente principal. El HTML es una salida renderizable.

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

## Seguridad

- El HTML se sanitiza antes de renderizarse.
- El JSON canonico se valida antes de cargar, persistir o aplicar contenido
  editado desde la vista de codigo.
- Se rechazan protocolos inseguros como `javascript:`.
- La importacion HTML no reemplaza el documento actual si el contenido queda
  fuera del schema permitido.
- Las imagenes se validan por MIME y tamano segun la configuracion.

## Estructura del proyecto

```txt
src/
  api/                  Clientes y contratos HTTP/locales
  editor/
    components/         Shell, toolbar, dialogos, preview y vistas source
    core/               Instancia Tiptap, extensiones, comandos y ciclo de vida
    extensions/         Extensiones personalizadas de Tiptap
    models/             Tipos y schemas del dominio
    services/           Persistencia, sanitizacion, serializacion y autosave
    utils/              Validadores y utilidades DOM
  lib.ts                Entrada publica de libreria
  main.ts               Entrada de la demo Vite
  style.css             Estilos base del editor
```

## Verificacion

Ejecuta la validacion completa:

```bash
npm run check
```

o con pnpm:

```bash
pnpm check
```

Para pruebas end-to-end:

```bash
npm run test:e2e
```

o:

```bash
pnpm test:e2e
```

## Notas operativas

- `contentJson` debe tratarse como la fuente canonica del documento.
- `contentHtml` debe regenerarse y sanitizarse antes de renderizar.
- `fullscreen` es estado visual, no modo de contenido.
- La demo local se monta desde `src/main.ts`.
- La libreria publica se monta desde `src/lib.ts` y se empaqueta con
  `npm run build:lib`.

## Conservación de plantillas en el editor actual

La misma API `mountEditorApp` admite documentos HTML completos y fragmentos
Handlebars mediante `setHtml`. Usa la barra, el menú de tablas, la selección,
el historial y el almacenamiento existentes. La demo conserva un único editor;
el prototipo `mountTemplateEditor` fue retirado.

```ts
const mounted = await mountEditorApp({ app, storage });
const result = mounted.setHtml(htmlDeLaPlantilla);
if (!result.ok) mostrarError(result.message);
const html = mounted.editor.getHTML();
```

- Se conservan doctype, atributos html/body, head, hojas CSS, clases, IDs,
  contenedores, secciones de tablas y expresiones Handlebars. Sin edición se
  devuelve la fuente original; tras editar, ProseMirror puede normalizar la
  sintaxis y agregar los párrafos que requiere su esquema.
- El JSON canónico **versión 2** incluye metadatos `preservedDocument` en la raíz
  y `preservedHtml` en elementos/marcas, además de contenedores y referencias
  de plantilla. Se guardan junto al contenido mediante el almacenamiento actual.
  Conservar solo el HTML de la proyección visual perdería esos metadatos.
- Los comandos de tablas siguen siendo los de Tiptap. Las filas nuevas mantienen
  su sección/bloque; se rechazan combinaciones entre regiones y cambios que
  dejen Handlebars incompleto, conservando el documento anterior.
- Las expresiones se muestran como referencias atómicas, sin evaluarlas. La
  vista HTML existente permite modificar la fuente completa. Se conserva el CSS
  original al guardar; la proyección de hojas CSS se limita al área editable y
  omite reglas que cargan recursos. La vista previa existente aísla el documento en
  un iframe sin scripts ni recursos remotos.
- La exportación Base64 existente conserva la plantilla, convierte imágenes de
  URL fija y deja expresiones como `src="{{firma}}"` sin descargar ni evaluar.
  Una plantilla con referencias dinámicas aún requiere datos para renderizarse.
- Se rechazan contenido activo, elementos sin representación conservable y
  estructuras condicionales entre celdas que el esquema no puede interpretar;
  no se eliminan silenciosamente. No es un compilador Handlebars ni una garantía
  de equivalencia PDF de cualquier HTML. Las definiciones originales `colgroup`
  se mantienen. Se rechazan cambios de cantidad/ancho de columnas en esas tablas
  hasta coordinar la actualización de sus definiciones explícitas; no se guarda
  una definición desincronizada.

Esta corrección es local a la biblioteca. La actualización de Vitraya requiere
seleccionar una versión y verificar sus consumidores del JSON v2 y del HTML
completo; no se realizó aquí. Tampoco se modificaron dependencias para publicar.
