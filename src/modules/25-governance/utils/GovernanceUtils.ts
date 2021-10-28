import { Intent, IToaster, IToastProps, Position, Toaster } from '@blueprintjs/core'
import type { editor as EDITOR } from 'monaco-editor/esm/vs/editor/editor.api'
import { Color } from '@wings-software/uicore'
import { get } from 'lodash-es'

/** This utility shows a toaster without being bound to any component.
 * It's useful to show cross-page/component messages */
export function showToaster(message: string, props?: Partial<IToastProps>): IToaster {
  const toaster = Toaster.create({ position: Position.TOP })
  toaster.show({ message, intent: Intent.SUCCESS, ...props })
  return toaster
}

// eslint-disable-next-line
export const getErrorMessage = (error: any): string =>
  get(error, 'data.error', get(error, 'data.message', error?.message))

export const MonacoEditorOptions = {
  ignoreTrimWhitespace: true,
  minimap: { enabled: false },
  codeLens: false,
  scrollBeyondLastLine: false,
  smartSelect: false,
  tabSize: 2,
  insertSpaces: true
}

// Monaco editor has a bug where when its value is set, the value
// is selected all by default.
// Fix by set selection range to zero
export const deselectAllMonacoEditor = (editor?: EDITOR.IStandaloneCodeEditor): void => {
  editor?.focus()
  setTimeout(() => {
    editor?.setSelection(new monaco.Selection(0, 0, 0, 0))
  }, 0)
}

export enum EvaluationStatus {
  ERROR = 'error',
  PASS = 'pass',
  WARNING = 'warning'
}

export const isEvaluationFailed = (status?: string): boolean => status === EvaluationStatus.ERROR

export enum PipleLineEvaluationEvent {
  ON_RUN = 'onrun',
  ON_SAVE = 'onsave'
}

export const LIST_FETCHING_PAGE_SIZE = 20

export enum PolicySetType {
  PIPELINE = 'pipeline'
}

export const evaluationStatusToColor = (status: string): Color => {
  switch (status) {
    case EvaluationStatus.ERROR:
      return Color.ERROR
    case EvaluationStatus.WARNING:
      return Color.WARNING
  }

  return Color.SUCCESS
}
