import type { StepElementConfig } from 'services/cd-ng'

export interface TemplateConfig {
  templateRef: string
  versionLabel: string
  templateInputs?: Omit<StepElementConfig, 'name' | 'identifier'>
}

export interface TemplateStepData {
  identifier: string
  name: string
  template: TemplateConfig
}
