import type { UseStringsReturn } from 'framework/strings'

export enum TemplateType {
  pipeline = 'pipeline',
  stage = 'stage',
  service = 'service',
  infrastructure = 'infrastructure',
  step = 'step',
  stepGroup = 'stepGroup',
  execution = 'execution'
}

export interface TemplateTypeOption {
  label: string
  value: string
  disabled?: boolean
}

export const getAllowedTemplateTypes = (getString: UseStringsReturn['getString']): TemplateTypeOption[] => [
  {
    label: getString('common.pipeline'),
    value: TemplateType.pipeline
  },
  {
    label: getString('templatesLibrary.stageTemplate'),
    value: TemplateType.stage
  },
  {
    label: getString('step'),
    value: TemplateType.step
  },
  {
    label: getString('service'),
    value: TemplateType.service
  },
  {
    label: getString('infrastructureText'),
    value: TemplateType.infrastructure
  },
  {
    label: getString('stepGroup'),
    value: TemplateType.stepGroup
  },
  {
    label: getString('executionText'),
    value: TemplateType.execution
  }
]
