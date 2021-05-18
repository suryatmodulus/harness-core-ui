import type { ReactNode } from 'react'
import type { LogViewerAccordionStatus } from '@common/components/MultiLogsViewer/LogViewerAccordion'
import type { FormattedLogLine } from '@common/components/MultiLogsViewer/types'
import type { ExecutionNode, UnitProgress } from 'services/pipeline-ng'

export enum ActionType {
  CreateSections = 'CreateSections',
  FetchSectionData = 'FetchSectionData',
  FetchingSectionData = 'FetchingSectionData',
  UpdateSectionData = 'UpdateSectionData',
  ToggleSection = 'ToggleSection',
  ResetSection = 'ResetSection'
}

export interface LogSectionData {
  title: ReactNode
  data: string
  startTime?: number
  endTime?: number
  id: string
  status: LogViewerAccordionStatus
  isOpen?: boolean
  logKey: string
  dataSource: 'blob' | 'stream'
  unitStatus: LogViewerAccordionStatus
  manuallyToggled?: boolean
  formattedData: FormattedLogLine[]
}

export interface CreateSectionsPayload {
  node: ExecutionNode
  selectedStep: string
  selectedStage: string
}

export interface Action<T extends ActionType> {
  type: T
  payload: T extends ActionType.CreateSections
    ? CreateSectionsPayload
    : T extends ActionType.UpdateSectionData
    ? { id: string; data: string }
    : string
}

export interface State {
  units: string[]
  dataMap: Record<string, LogSectionData>
  selectedStep: string
  selectedStage: string
}

export interface ProgressMapValue extends Pick<UnitProgress, 'startTime' | 'endTime'> {
  status: LogViewerAccordionStatus
}
