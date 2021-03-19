import { omit } from 'lodash-es'
import { Step, StepViewType, isCustomGeneratedString } from '@pipeline/exports'

export type { StepProps } from '@pipeline/components/AbstractSteps/Step'

export abstract class PipelineStep<T extends { name?: string; identifier?: string }> extends Step<T> {
  getDefaultValues(initialValues: T, viewType: StepViewType): T {
    if (initialValues.identifier && isCustomGeneratedString(initialValues.identifier)) {
      return { ...this.defaultValues, ...omit(initialValues, ['name', 'identifier']) }
    }
    if (viewType === StepViewType.InputSet || viewType === StepViewType.DeploymentForm) {
      return {
        ...initialValues
      }
    }
    return {
      ...this.defaultValues,
      ...initialValues
    }
  }
  processFormData(values: T): T {
    return values
  }
}
