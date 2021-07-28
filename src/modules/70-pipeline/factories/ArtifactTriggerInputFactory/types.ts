import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ServiceSpec } from 'services/cd-ng'

export interface K8SDirectServiceStep extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  handleTabChange?: (tab: string) => void
  customStepProps?: Record<string, any>
}

export interface KubernetesServiceInputFormProps {
  initialValues: K8SDirectServiceStep
  onUpdate?: ((data: ServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ServiceSpec
  allValues?: ServiceSpec
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
  formik?: any
}

export enum TriggerType {
  Webhook = 'Webhook',
  Scheduled = 'Scheduled'
}

export enum TriggerFormType {
  Artifact = 'Artifact',
  Manifest = 'Manifest'
}

export interface FormDetailsRegister {
  component: React.ComponentType<KubernetesServiceInputFormProps>
}
