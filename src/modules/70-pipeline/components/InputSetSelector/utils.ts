import type { IconName, SelectOption } from '@harness/uicore'
import type { EntityGitDetails, InputSetSummaryResponse } from 'services/pipeline-ng'
import css from './InputSetSelector.module.scss'

type InputSetLocal = InputSetSummaryResponse & SelectOption
export interface InputSetValue extends InputSetLocal {
  type: InputSetSummaryResponse['inputSetType']
  gitDetails?: EntityGitDetails
}

export const getIconByType = (type: InputSetSummaryResponse['inputSetType']): IconName => {
  return type === 'OVERLAY_INPUT_SET' ? 'step-group' : 'yaml-builder-input-sets'
}

export const onDragStart = (event: React.DragEvent<HTMLLIElement>, row: InputSetValue): void => {
  event.dataTransfer.setData('data', JSON.stringify(row))
  event.currentTarget.classList.add(css.dragging)
}

export const onDragEnd = (event: React.DragEvent<HTMLLIElement>): void => {
  event.currentTarget.classList.remove(css.dragging)
}

export const onDragLeave = (event: React.DragEvent<HTMLLIElement>): void => {
  event.currentTarget.classList.remove(css.dragOver)
}

export const onDragOver = (event: React.DragEvent<HTMLLIElement>): void => {
  if (event.preventDefault) {
    event.preventDefault()
  }
  event.currentTarget.classList.add(css.dragOver)
  event.dataTransfer.dropEffect = 'move'
}
