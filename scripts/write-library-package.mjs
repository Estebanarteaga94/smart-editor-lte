import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const libraryReadme = await readFile(new URL('../library-readme.md', import.meta.url), 'utf8');
const libraryCssUrl = new URL('../dist/smart-editor-lte.css', import.meta.url);
const libraryCss = (await readFile(libraryCssUrl, 'utf8')).replaceAll(
  /url\((?:\.\.\/|\/)font\//g,
  'url(./font/',
);

const libraryPackage = {
  name: packageJson.name,
  version: packageJson.version,
  description: 'Editor WYSIWYG basado en Tiptap para aplicaciones web y Angular.',
  type: 'module',
  main: './smart-editor-lte.js',
  module: './smart-editor-lte.js',
  types: './types/lib.d.ts',
  exports: {
    '.': {
      types: './types/lib.d.ts',
      import: './smart-editor-lte.js',
      default: './smart-editor-lte.js',
    },
    './style.css': './smart-editor-lte.css',
  },
  sideEffects: ['*.css'],
  dependencies: packageJson.dependencies,
};

await mkdir(new URL('../dist/font/', import.meta.url), { recursive: true });

await Promise.all([
  writeFile(libraryCssUrl, libraryCss),
  writeFile(
    new URL('../dist/package.json', import.meta.url),
    `${JSON.stringify(libraryPackage, null, 2)}\n`,
  ),
  writeFile(new URL('../dist/README.md', import.meta.url), libraryReadme),
  copyFile(
    new URL('../public/font/fontello.woff2', import.meta.url),
    new URL('../dist/font/fontello.woff2', import.meta.url),
  ),
  copyFile(
    new URL('../public/font/fontello.woff', import.meta.url),
    new URL('../dist/font/fontello.woff', import.meta.url),
  ),
]);
