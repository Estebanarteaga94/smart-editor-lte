import type { Editor } from '@tiptap/core';
import type { EditorState, Transaction } from '@tiptap/pm/state';
import {
  isPreparedHtmlEditorAvailable,
  lockPreparedHtmlEditors,
  planPreparedHtmlApplication,
  renderPreparedDocument,
  type ApplyPreparedHtmlFailureCode,
  type PreparedHtmlApplicationPlan,
  type PreparedHtmlContent,
} from './apply-prepared-html.service';

export type PreparedHtmlBatchEntry = Readonly<{ editor: Editor; candidate: PreparedHtmlContent }>;
export type PreparedHtmlBatchItemResult = Readonly<{
  indice: number;
  aplicado: boolean;
  html: string;
}>;
export type PreparedHtmlBatchNotification = 'transaction' | 'selectionUpdate' | 'update' | 'lote';
export type ApplyPreparedHtmlBatchResult =
  | Readonly<{
      ok: true;
      resultados: readonly PreparedHtmlBatchItemResult[];
      erroresNotificacion: readonly Readonly<{
        indice: number | null;
        evento: PreparedHtmlBatchNotification;
      }>[];
    }>
  | Readonly<{
      ok: false;
      codigo: ApplyPreparedHtmlFailureCode | 'LOTE_INVALIDO';
      indice: number | null;
    }>;
export interface ApplyPreparedHtmlBatchOptions {
  onApplied?: (resultados: readonly PreparedHtmlBatchItemResult[]) => void;
}

interface StagedApplication {
  plan: PreparedHtmlApplicationPlan;
  next: EditorState;
  transactions: readonly Transaction[];
}

/**
 * Synchronous coordination on existing views: stage all, commit all, then notify.
 * History remains local to each editor. No saves or application context decisions.
 */
export function applyPreparedHtmlBatch(
  entries: readonly PreparedHtmlBatchEntry[],
  options: ApplyPreparedHtmlBatchOptions = {},
): ApplyPreparedHtmlBatchResult {
  const input: unknown = entries;
  if (
    !Array.isArray(input) ||
    !input.length ||
    !options ||
    typeof options !== 'object' ||
    (options.onApplied !== undefined && typeof options.onApplied !== 'function')
  )
    return { ok: false, codigo: 'LOTE_INVALIDO', indice: null };
  const onApplied = options.onApplied;
  const plans: PreparedHtmlApplicationPlan[] = [];
  for (let indice = 0; indice < entries.length; indice++) {
    const entry = entries[indice];
    if (!entry || typeof entry !== 'object' || !('editor' in entry) || !('candidate' in entry))
      return { ok: false, codigo: 'LOTE_INVALIDO', indice };
    if (plans.some((plan) => plan.editor === entry.editor))
      return { ok: false, codigo: 'LOTE_INVALIDO', indice };
    const result = planPreparedHtmlApplication(entry.editor, entry.candidate);
    if (!result.ok) return { ...result, indice };
    const dom = entry.editor.view.dom;
    if (
      plans.some(
        (plan) =>
          plan.editor.view.dom.ownerDocument !== dom.ownerDocument ||
          plan.editor.view.dom.contains(dom) ||
          dom.contains(plan.editor.view.dom),
      )
    )
      return { ok: false, codigo: 'LOTE_INVALIDO', indice };
    plans.push(result.plan);
  }

  const unlock = lockPreparedHtmlEditors(plans.map((plan) => plan.editor));
  try {
    const staged: StagedApplication[] = [];
    for (let indice = 0; indice < plans.length; indice++) {
      const plan = plans[indice];
      try {
        const applied = plan.transaction
          ? plan.before.applyTransaction(plan.transaction)
          : { state: plan.before, transactions: [] };
        if (
          (plan.transaction && !applied.transactions.includes(plan.transaction)) ||
          !applied.state.doc.eq(plan.doc) ||
          renderPreparedDocument(applied.state.doc, plan.html === '') !== plan.html
        )
          return { ok: false, codigo: 'APLICACION_RECHAZADA', indice };
        staged.push({ plan, next: applied.state, transactions: applied.transactions });
      } catch {
        return { ok: false, codigo: 'APLICACION_RECHAZADA', indice };
      }
    }
    // Nothing asynchronous or user-visible has occurred. Check even no-op entries again.
    for (let indice = 0; indice < plans.length; indice++) {
      const plan = plans[indice];
      if (!isPreparedHtmlEditorAvailable(plan.editor, true) || plan.editor.state !== plan.before)
        return { ok: false, codigo: 'EDITOR_NO_DISPONIBLE', indice };
    }

    const attempted: StagedApplication[] = [];
    for (let indice = 0; indice < staged.length; indice++) {
      const item = staged[indice];
      if (!item.plan.transaction) continue;
      attempted.push(item);
      try {
        item.plan.editor.view.updateState(item.next);
        if (item.plan.editor.state !== item.next) throw new Error('Unexpected view state.');
      } catch {
        const errors: unknown[] = [];
        for (const previous of attempted.reverse()) {
          try {
            previous.plan.editor.view.updateState(previous.plan.before);
          } catch (cause) {
            errors.push(cause);
          }
        }
        if (errors.length)
          throw new AggregateError(
            errors,
            'Editor view restoration failed; no notifications were released.',
          );
        return { ok: false, codigo: 'APLICACION_RECHAZADA', indice };
      }
    }

    // Every observer now sees the complete committed batch. No beforeTransaction
    // event is broadcast: validation is done by the native filter/append plugins.
    const resultados = Object.freeze(
      staged.map(({ plan }, indice) =>
        Object.freeze({
          indice,
          aplicado: plan.transaction !== null,
          html: plan.html,
        }),
      ),
    );
    const erroresNotificacion: { indice: number | null; evento: PreparedHtmlBatchNotification }[] =
      [];
    staged.forEach(({ plan, transactions }, indice) => {
      if (!plan.transaction) return;
      const payload = {
        editor: plan.editor,
        transaction: plan.transaction,
        appendedTransactions: transactions.slice(1),
      };
      const notify = (evento: 'transaction' | 'selectionUpdate' | 'update') => {
        try {
          plan.editor.emit(evento, payload);
        } catch {
          erroresNotificacion.push({ indice, evento });
        }
      };
      notify('transaction');
      if (!plan.before.selection.eq(plan.editor.state.selection)) notify('selectionUpdate');
      notify('update');
    });
    if (staged.some((item) => item.plan.transaction) && onApplied) {
      try {
        onApplied(resultados);
      } catch {
        erroresNotificacion.push({ indice: null, evento: 'lote' });
      }
    }
    return {
      ok: true,
      resultados,
      erroresNotificacion: Object.freeze(erroresNotificacion.map((error) => Object.freeze(error))),
    };
  } finally {
    unlock();
  }
}
