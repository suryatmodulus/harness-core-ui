/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { clone } from 'lodash-es'
import type { IDrawerProps } from '@blueprintjs/core'
import type { YamlSnippetMetaData, PipelineInfoConfig } from 'services/cd-ng'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type * as Diagram from '@pipeline/components/Diagram'
import type { EntityGitDetails, EntityValidityDetails } from 'services/pipeline-ng'
import type { DependencyElement } from 'services/ci'
import type { TemplateType } from '@common/interfaces/RouteInterfaces'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { StepState } from '../ExecutionGraph/ExecutionGraphUtil'
import type { AdvancedPanels, StepOrStepGroupOrTemplateStepData } from '../StepCommands/StepCommandTypes'

export enum PipelineActions {
  DBInitialize = 'DBInitialize',
  UpdateSelection = 'UpdateSelection',
  Initialize = 'Initialize',
  Fetching = 'Fetching',
  UpdatePipelineView = 'UpdatePipelineView',
  UpdateTemplateView = 'UpdateTemplateView',
  UpdatePipeline = 'UpdatePipeline',
  SetYamlHandler = 'SetYamlHandler',
  SetTemplateTypes = 'SetTemplateTypes',
  PipelineSaved = 'PipelineSaved',
  UpdateSchemaErrorsFlag = 'UpdateSchemaErrorsFlag',
  Success = 'Success',
  Error = 'Error'
}
export const DefaultNewPipelineId = '-1'

export enum TemplateDrawerTypes {
  UseTemplate = 'UseTemplate'
}

export enum DrawerTypes {
  StepConfig = 'StepConfig',
  AddStep = 'AddCommand',
  PipelineVariables = 'PipelineVariables',
  Templates = 'Templates',
  ExecutionStrategy = 'ExecutionStrategy',
  AddService = 'AddService',
  ConfigureService = 'ConfigureService',
  PipelineNotifications = 'PipelineNotifications',
  FlowControl = 'FlowControl',
  AdvancedOptions = 'AdvancedOptions',
  PolicySets = 'PolicySets',
  ProvisionerStepConfig = 'ProvisionerStepConfig',
  AddProvisionerStep = 'AddProvisionerStep'
}

export const TemplateDrawerSizes: Record<TemplateDrawerTypes, React.CSSProperties['width']> = {
  [TemplateDrawerTypes.UseTemplate]: 700
}

export const DrawerSizes: Record<DrawerTypes, React.CSSProperties['width']> = {
  [DrawerTypes.StepConfig]: 600,
  [DrawerTypes.AddStep]: 700,
  [DrawerTypes.ProvisionerStepConfig]: 600,
  [DrawerTypes.AddProvisionerStep]: 700,
  [DrawerTypes.PipelineVariables]: 876, // has 60px more offset from right
  [DrawerTypes.Templates]: 450,
  [DrawerTypes.ExecutionStrategy]: 1136,
  [DrawerTypes.AddService]: 485,
  [DrawerTypes.ConfigureService]: 600,
  [DrawerTypes.PipelineNotifications]: 'calc(100% - 270px - 60px)', // has 60px more offset from right
  [DrawerTypes.FlowControl]: 600,
  [DrawerTypes.AdvancedOptions]: 840,
  [DrawerTypes.PolicySets]: 1000
}

export enum SplitViewTypes {
  Notifications = 'Notifications',
  StageView = 'StageView'
}
export interface DrawerData extends Omit<IDrawerProps, 'isOpen'> {
  type: DrawerTypes
  data?: {
    paletteData?: {
      isRollback: boolean
      isParallelNodeClicked: boolean
      onUpdate?: (stepOrGroup: StepOrStepGroupOrTemplateStepData | DependencyElement) => void
      entity: Diagram.DefaultNodeModel
      stepsMap: Map<string, StepState>
      hiddenAdvancedPanels?: AdvancedPanels[]
    }
    stepConfig?: {
      node: StepOrStepGroupOrTemplateStepData | DependencyElement
      addOrEdit: 'add' | 'edit'
      isStepGroup: boolean
      stepsMap: Map<string, StepState>
      onUpdate?: (stepOrGroup: StepOrStepGroupOrTemplateStepData | DependencyElement) => void
      isUnderStepGroup?: boolean
      hiddenAdvancedPanels?: AdvancedPanels[]
    }
  }
}

export interface SelectorData {
  templateType: TemplateType
  childTypes?: string[]
  selectedTemplateRef?: string
  onUseTemplate?: (template: TemplateSummaryResponse, isCopied?: boolean) => void
}

export interface TemplateDrawerData extends Omit<IDrawerProps, 'isOpen'> {
  type: TemplateDrawerTypes
  data?: {
    selectorData?: SelectorData
  }
}

export interface PipelineViewData {
  isSplitViewOpen: boolean
  isYamlEditable: boolean
  splitViewData: {
    type?: SplitViewTypes
  }
  isDrawerOpened: boolean
  drawerData: DrawerData
}

export interface TemplateViewData {
  isTemplateDrawerOpened: boolean
  templateDrawerData: TemplateDrawerData
}

export interface SelectionState {
  selectedStageId?: string | undefined
  selectedStepId?: string | undefined
  selectedSectionId?: string | undefined
}

export interface PipelineReducerState {
  pipeline: PipelineInfoConfig
  yamlHandler?: YamlBuilderHandlerBinding
  originalPipeline: PipelineInfoConfig
  pipelineView: PipelineViewData
  templateView: TemplateViewData
  pipelineIdentifier: string
  error?: string
  schemaErrors: boolean
  templateTypes: { [key: string]: string }
  gitDetails: EntityGitDetails
  entityValidityDetails: EntityValidityDetails
  isDBInitialized: boolean
  isLoading: boolean
  isInitialized: boolean
  isBEPipelineUpdated: boolean
  isUpdated: boolean
  snippets?: YamlSnippetMetaData[]
  selectionState: SelectionState
}

export const DefaultPipeline: PipelineInfoConfig = {
  name: '',
  identifier: DefaultNewPipelineId
}

export interface ActionResponse {
  error?: string
  schemaErrors?: boolean
  isUpdated?: boolean
  gitDetails?: EntityGitDetails
  entityValidityDetails?: EntityValidityDetails
  pipeline?: PipelineInfoConfig
  pipelineIdentifier?: string
  yamlHandler?: YamlBuilderHandlerBinding
  templateTypes?: { [key: string]: string }
  originalPipeline?: PipelineInfoConfig
  isBEPipelineUpdated?: boolean
  pipelineView?: PipelineViewData
  templateView?: TemplateViewData
  selectionState?: SelectionState
}

export interface ActionReturnType {
  type: PipelineActions
  response?: ActionResponse
}

const dbInitialized = (): ActionReturnType => ({ type: PipelineActions.DBInitialize })
const initialized = (): ActionReturnType => ({ type: PipelineActions.Initialize })
const updatePipelineView = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.UpdatePipelineView,
  response
})
const updateTemplateView = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.UpdateTemplateView,
  response
})
const setYamlHandler = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.SetYamlHandler,
  response
})
const setTemplateTypes = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.SetTemplateTypes,
  response
})
const updating = (): ActionReturnType => ({ type: PipelineActions.UpdatePipeline })
const fetching = (): ActionReturnType => ({ type: PipelineActions.Fetching })
const pipelineSavedAction = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.PipelineSaved,
  response
})
const success = (response: ActionResponse): ActionReturnType => ({ type: PipelineActions.Success, response })
const error = (response: ActionResponse): ActionReturnType => ({ type: PipelineActions.Error, response })
const updateSchemaErrorsFlag = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.UpdateSchemaErrorsFlag,
  response
})
const updateSelectionState = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.UpdateSelection,
  response
})

export const PipelineContextActions = {
  dbInitialized,
  initialized,
  updating,
  fetching,
  pipelineSavedAction,
  updatePipelineView,
  updateTemplateView,
  setYamlHandler,
  setTemplateTypes,
  success,
  error,
  updateSchemaErrorsFlag,
  updateSelectionState
}

export const initialState: PipelineReducerState = {
  pipeline: { ...DefaultPipeline },
  originalPipeline: { ...DefaultPipeline },
  pipelineIdentifier: DefaultNewPipelineId,
  pipelineView: {
    isSplitViewOpen: false,
    isDrawerOpened: false,
    isYamlEditable: false,
    splitViewData: {},
    drawerData: {
      type: DrawerTypes.AddStep
    }
  },
  templateView: {
    isTemplateDrawerOpened: false,
    templateDrawerData: { type: TemplateDrawerTypes.UseTemplate }
  },
  schemaErrors: false,
  gitDetails: {},
  entityValidityDetails: {},
  templateTypes: {},
  isLoading: false,
  isBEPipelineUpdated: false,
  isDBInitialized: false,
  isUpdated: false,
  isInitialized: false,
  selectionState: {
    selectedStageId: undefined,
    selectedStepId: undefined,
    selectedSectionId: undefined
  }
}

export const PipelineReducer = (state = initialState, data: ActionReturnType): PipelineReducerState => {
  const { type, response } = data
  switch (type) {
    case PipelineActions.Initialize:
      return {
        ...state,
        isInitialized: true
      }
    case PipelineActions.DBInitialize:
      return {
        ...state,
        isDBInitialized: true
      }
    case PipelineActions.UpdateSchemaErrorsFlag:
      return {
        ...state,
        schemaErrors: response?.schemaErrors ?? state.schemaErrors
      }
    case PipelineActions.SetYamlHandler:
      return {
        ...state,
        yamlHandler: data.response?.yamlHandler
      }
    case PipelineActions.SetTemplateTypes:
      return {
        ...state,
        templateTypes: data.response?.templateTypes || {}
      }
    case PipelineActions.UpdatePipelineView:
      return {
        ...state,
        pipelineView: response?.pipelineView
          ? clone({ ...state.pipelineView, ...response?.pipelineView })
          : state.pipelineView
      }
    case PipelineActions.UpdateTemplateView:
      return {
        ...state,
        templateView: response?.templateView
          ? clone({ ...state.templateView, ...response?.templateView })
          : state.templateView
      }

    case PipelineActions.UpdatePipeline:
      return {
        ...state,
        isUpdated: response?.isUpdated ?? true,
        pipeline: response?.pipeline ? clone(response?.pipeline) : state.pipeline
      }
    case PipelineActions.PipelineSaved:
      return {
        ...state,
        ...response,
        isLoading: false,
        isUpdated: false
      }
    case PipelineActions.Fetching:
      return {
        ...state,
        isLoading: true,
        isBEPipelineUpdated: false,
        isUpdated: false
      }
    case PipelineActions.Success:
    case PipelineActions.Error:
      return { ...state, isLoading: false, ...response }
    case PipelineActions.UpdateSelection:
      return {
        ...state,
        selectionState: response?.selectionState || state.selectionState
      }
    default:
      return state
  }
}
