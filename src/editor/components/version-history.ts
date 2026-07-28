import type { EditorLifecycle } from '../core/editor-lifecycle';
import type { EditorVersion } from '../models/editor-version';
import type { VersionComparison } from '../services/version-comparison.service';

export interface VersionHistoryOptions {
  lifecycle: EditorLifecycle;
  listVersions: () => Promise<EditorVersion[]>;
  createVersion: () => Promise<EditorVersion>;
  restoreVersion: (version: EditorVersion) => Promise<void>;
  compareVersion: (version: EditorVersion) => VersionComparison;
}

export interface VersionHistory {
  element: HTMLElement;
  open: () => Promise<void>;
  close: () => void;
}

export function createVersionHistory(options: VersionHistoryOptions): VersionHistory {
  const element = document.createElement('section');
  const titleId = `version-history-${crypto.randomUUID()}`;
  element.className = 'editor-version-history';
  element.hidden = true;
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-modal', 'true');
  element.setAttribute('aria-labelledby', titleId);
  element.innerHTML = `
    <header>
      <h2 id="${titleId}">Historial de versiones</h2>
      <button type="button" data-version-action="close" aria-label="Cerrar historial">×</button>
    </header>
    <div class="editor-version-history__actions">
      <button type="button" data-version-action="create">Crear versión</button>
    </div>
    <p class="editor-version-history__status" aria-live="polite"></p>
    <ol class="editor-version-history__list"></ol>
  `;
  const list = requiredElement<HTMLOListElement>(element, '.editor-version-history__list');
  const status = requiredElement<HTMLElement>(element, '.editor-version-history__status');
  const createButton = requiredElement<HTMLButtonElement>(
    element,
    '[data-version-action="create"]',
  );
  const closeButton = requiredElement<HTMLButtonElement>(element, '[data-version-action="close"]');

  const refresh = async (): Promise<void> => {
    status.textContent = 'Cargando versiones...';
    try {
      renderVersions(await options.listVersions());
    } catch {
      status.textContent = 'No se pudo cargar el historial.';
    }
  };

  options.lifecycle.addEventListener(closeButton, 'click', () => {
    element.hidden = true;
  });
  options.lifecycle.addEventListener(createButton, 'click', () => {
    void runCreate();
  });
  options.lifecycle.addEventListener(list, 'click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>(
      '[data-version-action="restore"]',
    );
    const version = button ? versionsById.get(button.dataset.versionId ?? '') : undefined;
    if (version) {
      void runRestore(version);
    }
  });

  let versionsById = new Map<string, EditorVersion>();

  return {
    element,
    open: async () => {
      element.hidden = false;
      await refresh();
      createButton.focus();
    },
    close: () => {
      element.hidden = true;
    },
  };

  async function runCreate(): Promise<void> {
    setBusy(true, 'Creando versión...');
    try {
      await options.createVersion();
      await refresh();
    } catch {
      status.textContent = 'No se pudo crear la versión.';
    } finally {
      setBusy(false);
    }
  }

  async function runRestore(version: EditorVersion): Promise<void> {
    setBusy(true, `Restaurando versión ${version.versionNumber}...`);
    try {
      await options.restoreVersion(version);
      element.hidden = true;
    } catch {
      status.textContent = 'No se pudo restaurar la versión.';
    } finally {
      setBusy(false);
    }
  }

  function renderVersions(versions: EditorVersion[]): void {
    versionsById = new Map(versions.map((version) => [version.id, version]));
    list.replaceChildren(
      ...versions.map((version) => {
        const item = document.createElement('li');
        const comparison = options.compareVersion(version);
        const metadata = document.createElement('div');
        const label = document.createElement('strong');
        const time = document.createElement('time');
        const summary = document.createElement('span');
        const restoreButton = document.createElement('button');
        label.textContent = `Versión ${version.versionNumber}`;
        time.dateTime = version.createdAt;
        time.textContent = new Date(version.createdAt).toLocaleString();
        summary.textContent = comparison.summary;
        restoreButton.type = 'button';
        restoreButton.dataset.versionAction = 'restore';
        restoreButton.dataset.versionId = version.id;
        restoreButton.textContent = 'Restaurar';
        metadata.append(label, time, summary);
        item.append(metadata, restoreButton);
        return item;
      }),
    );
    status.textContent =
      versions.length > 0 ? `${versions.length} versiones` : 'Aún no hay versiones.';
  }

  function setBusy(busy: boolean, message?: string): void {
    createButton.disabled = busy;
    for (const button of list.querySelectorAll<HTMLButtonElement>('button')) {
      button.disabled = busy;
    }
    if (message) {
      status.textContent = message;
    }
  }
}

function requiredElement<T extends Element>(parent: ParentNode, selector: string): T {
  const element = parent.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing version history element: ${selector}`);
  }
  return element;
}
