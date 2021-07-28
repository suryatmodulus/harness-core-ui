import type { ServiceSpec } from 'services/cd-ng'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { ManifestInputForm } from '@pipeline/components/ManifestInputForm/ManifestInputForm'
import { ManifestInputFactory } from './ManifestInputFactory'

const factory = new ManifestInputFactory()

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

factory.registerDefaultStepDetails({
  component: ManifestInputForm
})

export default factory
