import { Extension, type Editor } from '@tiptap/core';
import { Plugin, PluginKey, type Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface AgentSection {
  id: string;
  from: number;
  to: number;
  text: string;
  contentJson: unknown;
}

interface AgentSectionRange {
  id: string;
  from: number;
  to: number;
}

interface AgentSectionPluginState {
  ranges: AgentSectionRange[];
  decorations: DecorationSet;
}

type AgentSectionMeta =
  { type: 'toggle'; from: number; to: number; id: string } | { type: 'clear' };

export const agentSectionPluginKey = new PluginKey<AgentSectionPluginState>('agentSections');

export const AgentSectionExtension = Extension.create({
  name: 'agentSections',

  addProseMirrorPlugins() {
    return [
      new Plugin<AgentSectionPluginState>({
        key: agentSectionPluginKey,
        state: {
          init: (_, state) => createPluginState(state.doc, []),
          apply: (transaction, pluginState) => {
            const mappedRanges = mapRanges(transaction, pluginState.ranges);
            const meta = transaction.getMeta(agentSectionPluginKey) as AgentSectionMeta | undefined;
            const ranges = applyMeta(mappedRanges, meta);
            return createPluginState(transaction.doc, ranges);
          },
        },
        props: {
          decorations: (state) => agentSectionPluginKey.getState(state)?.decorations ?? null,
        },
      }),
    ];
  },
});

export function toggleAgentSection(editor: Editor): boolean {
  const { from, to, empty } = editor.state.selection;
  if (empty) {
    return false;
  }

  const transaction = editor.state.tr.setMeta(agentSectionPluginKey, {
    type: 'toggle',
    from,
    to,
    id: createSectionId(),
  } satisfies AgentSectionMeta);
  editor.view.dispatch(transaction);
  return true;
}

export function clearAgentSections(editor: Editor): boolean {
  if (!hasAgentSections(editor)) {
    return false;
  }
  editor.view.dispatch(
    editor.state.tr.setMeta(agentSectionPluginKey, { type: 'clear' } satisfies AgentSectionMeta),
  );
  return true;
}

export function hasAgentSections(editor: Editor): boolean {
  return getRanges(editor).length > 0;
}

export function isAgentSectionSelectionActive(editor: Editor): boolean {
  const { from, to } = editor.state.selection;
  return getRanges(editor).some((range) => range.from < to && range.to > from);
}

export function getAgentSections(editor: Editor): AgentSection[] {
  return getRanges(editor).map((range) => ({
    ...range,
    text: editor.state.doc.textBetween(range.from, range.to, '\n'),
    contentJson: editor.state.doc.slice(range.from, range.to).content.toJSON(),
  }));
}

function createPluginState(
  doc: Parameters<typeof DecorationSet.create>[0],
  ranges: AgentSectionRange[],
): AgentSectionPluginState {
  return {
    ranges,
    decorations: DecorationSet.create(
      doc,
      ranges.map((range) =>
        Decoration.inline(
          range.from,
          range.to,
          {
            class: 'editor-agent-section',
            'data-agent-section-id': range.id,
            title: 'Sección seleccionada para asistencia',
          },
          { inclusiveStart: true, inclusiveEnd: true },
        ),
      ),
    ),
  };
}

function mapRanges(transaction: Transaction, ranges: AgentSectionRange[]): AgentSectionRange[] {
  if (!transaction.docChanged) {
    return ranges;
  }
  return ranges
    .map((range) => ({
      ...range,
      from: transaction.mapping.map(range.from, 1),
      to: transaction.mapping.map(range.to, -1),
    }))
    .filter((range) => range.from < range.to);
}

function applyMeta(
  ranges: AgentSectionRange[],
  meta: AgentSectionMeta | undefined,
): AgentSectionRange[] {
  if (!meta) {
    return ranges;
  }
  if (meta.type === 'clear') {
    return [];
  }

  const overlapping = ranges.filter((range) => range.from < meta.to && range.to > meta.from);
  if (overlapping.length > 0) {
    return ranges.filter((range) => !overlapping.includes(range));
  }
  return [...ranges, { id: meta.id, from: meta.from, to: meta.to }];
}

function getRanges(editor: Editor): AgentSectionRange[] {
  return agentSectionPluginKey.getState(editor.state)?.ranges ?? [];
}

function createSectionId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `agent-section-${Date.now()}`;
}
