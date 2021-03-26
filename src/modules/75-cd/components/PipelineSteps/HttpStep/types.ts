import type { SelectOption } from '@wings-software/uicore'
import type { HttpStepInfo, StepElementConfig, HttpHeaderConfig, StringNGVariable } from 'services/cd-ng'

export interface HttpStepHeaderConfig extends HttpHeaderConfig {
  id: string
}

export interface HttpStepOutputVariable extends StringNGVariable {
  id: string
}

export interface HttpStepData extends StepElementConfig {
  spec: Omit<HttpStepInfo, 'header' | 'outputVariables'> & {
    header?: HttpHeaderConfig[] | string
    outputVariables?: StringNGVariable[] | string
  }
}

export interface HttpStepFormData extends StepElementConfig {
  spec: Omit<HttpStepInfo, 'method' | 'header' | 'outputVariables'> & {
    method: SelectOption | string
    header?: HttpStepHeaderConfig[] | string
    outputVariables?: HttpStepOutputVariable[] | string
  }
}
