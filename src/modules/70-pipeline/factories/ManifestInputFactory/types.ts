import type { KubernetesServiceInputFormProps } from './index'

export enum TriggerType {
  Webhook = 'Webhook',
  Scheduled = 'Scheduled'
}

export enum FormType {
  PipelineRunTime = 'PipelineRunTime',
  Trigger = 'Trigger'
}

export interface StepDetailsRegister {
  component: React.ComponentType<KubernetesServiceInputFormProps>
}
