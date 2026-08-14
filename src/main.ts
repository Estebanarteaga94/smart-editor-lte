import './style.css';
import './demo.css';

import { mountEditorApp } from '@/editor/editor-app';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Root element #app was not found');
}

void mountEditorApp({ app });
