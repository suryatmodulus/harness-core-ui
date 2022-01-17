/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { clone } from 'lodash-es'
import type { IDrawerProps } from '@blueprintjs/core'
import type { EntityGitDetails, EntityValidityDetails, NGTemplateInfoConfig } from 'services/template-ng'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import {
  ActionReturnType,
  TemplateActions
} from '@templates-library/components/TemplateStudio/TemplateContext/TemplateActions'
import type { StepElementConfig } from 'services/cd-ng'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { DefaultNewTemplateId, DefaultNewVersionLabel, DefaultTemplate } from 'framework/Templates/templates'

export interface DrawerData extends Omit<IDrawerProps, 'isOpen'> {
  type: DrawerTypes
  data?: {
    paletteData?: {
      onSelection?: (stepOrGroup: StepElementConfig) => void
    }
  }
}

export interface TemplateViewData {
  isYamlEditable: boolean
  isDrawerOpened: boolean
  drawerData: DrawerData
}

export interface TemplateReducerState {
  template: NGTemplateInfoConfig
  yamlHandler?: YamlBuilderHandlerBinding
  originalTemplate: NGTemplateInfoConfig
  stableVersion: string
  versions: string[]
  templateView: TemplateViewData
  templateIdentifier: string
  isDBInitialized: boolean
  isLoading: boolean
  isInitialized: boolean
  isBETemplateUpdated: boolean
  isUpdated: boolean
  gitDetails: EntityGitDetails
  entityValidityDetails: EntityValidityDetails
  templateYaml: string
}

export const initialState: TemplateReducerState = {
  template: { ...DefaultTemplate },
  originalTemplate: { ...DefaultTemplate },
  stableVersion: DefaultNewVersionLabel,
  versions: [DefaultNewVersionLabel],
  templateIdentifier: DefaultNewTemplateId,
  templateView: {
    isDrawerOpened: false,
    isYamlEditable: false,
    drawerData: {
      type: DrawerTypes.AddStep
    }
  },
  isLoading: false,
  isBETemplateUpdated: false,
  isDBInitialized: false,
  isUpdated: false,
  isInitialized: false,
  gitDetails: {},
  entityValidityDetails: {},
  templateYaml: ''
}

export const TemplateReducer = (state: TemplateReducerState, data: ActionReturnType): TemplateReducerState => {
  const { type, response } = data
  switch (type) {
    case TemplateActions.Initialize:
      return {
        ...state,
        isInitialized: true
      }
    case TemplateActions.DBInitialize:
      return {
        ...state,
        isDBInitialized: true
      }
    case TemplateActions.Loading: {
      return {
        ...state,
        isLoading: !!response?.isLoading
      }
    }
    case TemplateActions.UpdateTemplateView:
      return {
        ...state,
        templateView: response?.templateView
          ? clone({ ...state.templateView, ...response?.templateView })
          : state.templateView
      }
    case TemplateActions.UpdateTemplate:
      return {
        ...state,
        isUpdated: response?.isUpdated ?? true,
        template: response?.template ? clone(response?.template) : state.template
      }
    case TemplateActions.Fetching:
      return {
        ...state,
        isLoading: true,
        isBETemplateUpdated: false,
        isUpdated: false
      }
    case TemplateActions.Success:
    case TemplateActions.Error:
      return { ...state, isLoading: false, ...response }
    default:
      return state
  }
}
