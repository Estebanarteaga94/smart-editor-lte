# Smart Editor LTE

Distribucion ESM del editor WYSIWYG para aplicaciones web y Angular.

## Instalacion local

```bash
npm install /ruta/a/smart-editor-lte/dist
```

## Angular

Importa la API desde el paquete:

```ts
import { mountEditorApp, type MountedEditorApp } from 'smart-editor-lte';
```

Agrega `node_modules/smart-editor-lte/smart-editor-lte.css` al arreglo `styles`
de `angular.json`. Monta el editor sobre un elemento `div` y libera recursos con
`editor.lifecycle.dispose()` en `ngOnDestroy`.

```ts
const editor = await mountEditorApp({
  app: hostElement,
  embedded: true,
  documentId: 'documento-1',
  onChange: ({ contentHtml }) => console.log(contentHtml),
});
```

La API publica tambien expone `setHtml`, `getHtmlWithBase64Images` y
`getAgentSections`.
