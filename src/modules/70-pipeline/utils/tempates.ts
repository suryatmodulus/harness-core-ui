import type { StepElementConfig } from 'services/cd-ng'

export interface TemplateStepData {
  identifier: string
  name: string
  template?: {
    templateRef: string
    versionLabel: string
    templateInputs: Omit<StepElementConfig, 'name' | 'identifier'>
  }
}
