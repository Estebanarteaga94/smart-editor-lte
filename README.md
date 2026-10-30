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

## Preparación de HTML sin modificar el editor

La exportación pública `prepareHtmlContent` prepara un candidato inmutable con
el importador estricto y el modelo de conservación del editor existente, sin construir
una instancia de `Editor`. Requiere DOM de navegador.

```ts
import { prepareHtmlContent } from 'smart-editor-lte';

const result = prepareHtmlContent({
  html: '<p>Texto<br><strong>destacado</strong> {{literal}}</p>',
});
if (result.ok) {
  // Candidato local; todavía no se aplica ni se guarda.
  console.log(result.html, result.contentJson, result.schemaVersion);
} else {
  console.log(result.codigo, result.incidencias);
}
```

La política reducida `gd-html-piloto-v2` fue retirada en WMCP-HTML-01.
Se llama a `prepareHtmlImport` con `{mode:'strict', preserveSource:true}`:
reutiliza `preparePreservedHtml`, el esquema actual y sus restricciones reales,
sin otra lista de etiquetas, atributos o nodos. Conserva imágenes, tablas,
CSS, clases y documentos completos admitidos por ese importador. Handlebars
permanece literal, con sus bloques comprobados pero sin evaluar plantillas.
La cadena vacía representa vaciado explícito. `editor-html-v1` versiona el
contrato compartido; los candidatos de la política antigua se rechazan.
`pilotHtmlPolicyId` y los tipos `PreparePilotHtml*` son alias obsoletos de los
nuevos nombres `editorHtmlPolicyId`/`PrepareHtml*`, sin una política distinta.

La salida debe coincidir exactamente con la entrada. Una normalización necesaria
produce `CONTENIDO_REQUIERE_ADAPTACION`; no se devuelve contenido parcialmente
limpiado. Los otros códigos son `HTML_NO_PERMITIDO` y `POLITICA_NO_SOPORTADA`.
El éxito contiene `html`, `contentJson`, `schemaVersion`, `policyId` y `cambios: []`.
El JSON preparado es interno, no un nuevo formato de persistencia de Vitraya.

La operación no cambia selección, foco, historial, DOM visible, callbacks ni
almacenamiento, y no carga recursos. No autoriza campos ni reemplaza límites de
entrada o validaciones del servidor. La coordinación entre varios campos, la integración Angular y la activación
WebMCP siguen pendientes.

## Aplicación del contenido preparado

`mounted.applyPreparedHtml(candidate)` aplica el candidato sobre el editor
existente en vista visual. También se exporta `applyPreparedHtml(editor, candidate)`
para consumidores del editor creado por esta biblioteca; el consumidor directo
se responsabiliza de coordinar sus vistas. No se crea otro editor.

```ts
const candidate = prepareHtmlContent({
  html: '<p>Texto actualizado<br>{{literal}}</p>',
});
if (candidate.ok) {
  const applied = mounted.applyPreparedHtml(candidate);
  if (!applied.ok) mostrarError(applied.codigo);
}
```

- Revalida política, versión y correspondencia exacta de HTML/JSON. Rechaza
  candidatos fallidos, alterados o de otra versión antes de modificar la vista.
- Aplica una transacción del editor y conserva las ediciones anteriores como
  pasos de Deshacer. La aplicación y la edición posterior forman pasos separados;
  Deshacer restaura documento, selección y metadatos anteriores. Rehacer recupera
  el contenido aplicado. El foco no se fuerza y la selección queda al inicio
  tras aplicar. Una edición nueva descarta la rama Rehacer, como de costumbre.
- Devuelve `{ ok: true, aplicado: true, html }`. Si el documento ya coincide,
  devuelve `aplicado: false`, sin transacciones, callbacks ni cambios al historial.
  Los rechazos devuelven `CANDIDATO_INVALIDO`, `EDITOR_NO_DISPONIBLE` o
  `APLICACION_RECHAZADA`. El método montado rechaza vista fuente y vista previa;
  también se rechazan editores destruidos, de solo lectura o ajenos a la fábrica.
- Comprueba el estado resultante de los plugins antes de actualizar la vista.
  Si filtran, fallan o alteran el candidato, conserva documento, selección e
  historial y no emite un cambio parcial. Las listas admitidas conservan su fuente
  mediante los metadatos existentes; los párrafos internos para edición y cursor
  no se agregan al HTML aplicado. Preparación válida no garantiza aplicación bajo
  todos los plugins o estados del editor. No se desactivan sus reglas habituales.
- El vaciado explícito devuelve `html: ''`; el editor conserva su representación
  vacía normal `<p></p>`, también en callbacks. No se altera ese contrato existente.
- Un cambio real emite el callback habitual una vez. El autosave configurado por el
  consumidor sigue activo; la API no guarda directamente. Las excepciones que
  lance el consumidor después de observar el cambio se propagan: no se informa
  falsamente que hubo restauración. Las garantías no cubren plugins/callbacks
  externos que muten otros recursos o reentren en el editor.

La operación individual es síncrona. Para coordinar varias instancias se ofrece
la API de lote descrita a continuación. Ninguna verifica tenant/revisión/caducidad
ni activa WebMCP. La integración Angular sigue pendiente; los cambios son locales.

## Aplicación coordinada entre editores

`applyPreparedHtmlBatch(entries, options?)` coordina las instancias existentes.
Cada entrada contiene `{ editor, candidate }`; el resultado conserva sus índices.
Use `mounted.editor` para una instancia montada: su modo visual se comprueba
centralmente, también al usar la función libre.

```ts
import { applyPreparedHtmlBatch } from 'smart-editor-lte';

const result = applyPreparedHtmlBatch([
  { editor: primero.editor, candidate: primerCandidato },
  { editor: segundo.editor, candidate: segundoCandidato },
], {
  onApplied: resultados => actualizarRevisionLocalUnaVez(resultados),
});
if (!result.ok) mostrarError(result.codigo, result.indice);
// Si ok es true, erroresNotificacion informa fallos de observadores posteriores
// al commit; no se debe volver a aplicar el lote como si hubiese sido rechazado.
```

1. Revalida todos los candidatos y construye sus transacciones sin cambiar vistas.
2. Calcula los estados resultantes con los filtros y transacciones anexadas de los
   plugins actuales, una vez por editor. Si uno rechaza, falla o normaliza el
   candidato, descarta el lote sin modificar ninguna vista ni emitir eventos.
3. Confirma los estados sobre las vistas actuales, de forma síncrona. Si una
   actualización falla, restaura los objetos `EditorState` originales, incluidos
   contenido, metadatos, selección, marcas e historial; no emite notificaciones.
4. Tras confirmar todos, libera `transaction`, `selectionUpdate` cuando corresponde
   y `update` por cada editor modificado. Los callbacks y el autosave habituales
   se ejecutan entonces y ya ven el lote completo. Finalmente llama a `onApplied`
   una sola vez, para que el consumidor pueda registrar una revisión del conjunto.

Un éxito devuelve `{ ok: true, resultados, erroresNotificacion }`; cada resultado
contiene `{ indice, aplicado, html }`. Una entrada idéntica conserva su estado y
rama Rehacer sin eventos. Si todo el lote es idéntico, tampoco llama a `onApplied`.
Un rechazo devuelve `{ ok: false, codigo, indice }`; añade `LOTE_INVALIDO` a los
códigos individuales, con `indice: null` cuando el error corresponde al lote.
Los resultados y las incidencias devueltos no incluyen datos parciales de fallo.

El lote debe ser no vacío, sin editores duplicados ni vistas anidadas y en un mismo
documento DOM. Rechaza instancias destruidas, no editables, en modo fuente/vista
previa, componiendo texto o capturando otra transacción. Bloquea cambios
reentrantes en los participantes hasta terminar las notificaciones. No emite
`beforeTransaction` como señal de lote: las reglas de rechazo deben estar en los
plugins de filtrado. El historial sigue siendo independiente por editor;
Deshacer/Rehacer posterior continúa usando los comandos y atajos existentes.

Una excepción de un callback posterior al commit se recoge en
`erroresNotificacion` y continúa la entrega a los demás editores y al observador
del lote. El contenido ya está confirmado y no se devuelve un falso rechazo.
El emisor de Tiptap puede interrumpir los listeners restantes de ese mismo evento
si uno lanza una excepción; la incidencia identifica editor y evento.

La confirmación/restauración de vistas no es una transacción del DOM: observadores
DOM externos pueden registrar mutaciones síncronas transitorias si falla el
renderizado, aunque el estado final se restaure antes de devolver el rechazo.
Las garantías cubren los estados y notificaciones del editor actual; no revierten
efectos externos de plugins que incumplan la inmutabilidad del estado o de vistas
personalizadas destructivas. Si una vista también falla al restaurarse se lanza
`AggregateError`, sin liberar notificaciones ni afirmar que la restauración terminó.

La coordinación no crea editores, no persiste directamente ni incorpora reglas de
Vitraya. Contexto, tenant, revisión, caducidad, guardado manual e integración Angular
siguen a cargo del consumidor. La biblioteca no registra herramientas WebMCP.

## Conservación de fuente y vista de diferencias

La preparación reutiliza el importador y la conservación de fuente existentes.
El JSON canónico v2 contiene metadatos internos de conservación con un prefijo
determinista sin colisiones. La aplicación vuelve a llamar al mismo preparador
y comprueba fuente/JSON/versión. Los candidatos y metadatos quedan congelados.

Son válidas las listas con texto directamente dentro de `li`, listas anidadas y
las clases y estilos admitidos por el editor. La preparación y aplicación devuelven
el HTML original exacto con `cambios: []`; no se quitan clases ni se insertan
párrafos en la fuente. Si el validador exige otra adaptación, se rechaza como
antes. Los cambios humanos posteriores siguen la serialización habitual del
editor (que puede normalizar sintaxis), conservando las clases. La importación
general existente reconoce esas listas con clases al recargar el HTML guardado.

`preservedHtmlPreview` exporta la vista aislada ya usada por el editor: añade
CSP para bloquear scripts, conexiones y recursos externos; permite CSS local
e imágenes data. Debe usarse dentro de un iframe con sandbox vacío, nunca
inyectarse en el DOM principal. Conservar la fuente completa como texto para
revisar referencias externas bloqueadas. No sustituye controles de servidor,
permisos, revisión ni validación de PDF.
