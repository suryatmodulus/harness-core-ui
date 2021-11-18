import type { UseStringsReturn } from 'framework/strings'

export enum TemplateType {
  Step = 'Step',
  Stage = 'Stage',
  Pipeline = 'Pipeline',
  Service = 'Service',
  Infrastructure = 'Infrastructure',
  StepGroup = 'StepGroup',
  Execution = 'Execution'
}

export interface TemplateTypeOption {
  label: string
  value: string
  disabled?: boolean
}

export const getAllowedTemplateTypes = (
  getString: UseStringsReturn['getString'],
  disableStageTemplates: boolean
): TemplateTypeOption[] => [
  {
    label: getString('step'),
    value: TemplateType.Step
  },
  {
    label: getString('templatesLibrary.stageTemplate'),
    value: TemplateType.Stage,
    disabled: disableStageTemplates
  },
  {
    label: getString('common.pipeline'),
    value: TemplateType.Pipeline,
    disabled: true
  },
  {
    label: getString('service'),
    value: TemplateType.Service,
    disabled: true
  },
  {
    label: getString('infrastructureText'),
    value: TemplateType.Infrastructure,
    disabled: true
  },
  {
    label: getString('stepGroup'),
    value: TemplateType.StepGroup,
    disabled: true
  },
  {
    label: getString('executionText'),
    value: TemplateType.Execution,
    disabled: true
  }
]
