import type { FormikErrors } from 'formik'
import isEmpty from 'lodash-es/isEmpty'
import set from 'lodash-es/set'
import reduce from 'lodash-es/reduce'
import isObject from 'lodash-es/isObject'
import memoize from 'lodash-es/memoize'
import type {
  NgPipeline,
  StageElementConfig,
  StageElementWrapper,
  ExecutionWrapperConfig,
  StepElement,
  ExecutionWrapper,
  PipelineInfoConfig,
  StageElementWrapperConfig
} from 'services/cd-ng'

import type { UseStringsReturn } from 'framework/exports'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'

export const clearRuntimeInput = (template: NgPipeline): NgPipeline => {
  return JSON.parse(
    JSON.stringify(template || {}).replace(/"<\+input>.?(?:allowedValues\((.*?)\)|regex\((.*?)\))?"/g, '""')
  )
}

export function getStepFromStage(stepId: string, steps?: ExecutionWrapperConfig[]): ExecutionWrapperConfig | undefined {
  let responseStep: ExecutionWrapperConfig | undefined = undefined
  steps?.forEach(item => {
    if (item.step?.identifier === stepId) {
      responseStep = item
    } else if (item.stepGroup?.identifier === stepId) {
      responseStep = item
    } else if (item.parallel) {
      return ((item.parallel as unknown) as StepElement[]).forEach((node: ExecutionWrapper) => {
        if (node.step?.identifier === stepId) {
          responseStep = node
        }
      })
    }
  })
  return responseStep
}

export function getStageFromPipeline(
  stageId: string,
  pipeline?: PipelineInfoConfig
): StageElementWrapperConfig | undefined {
  if (pipeline?.stages) {
    let responseStage: StageElementWrapperConfig | undefined = undefined
    pipeline.stages.forEach(item => {
      if (item.stage && item.stage.identifier === stageId) {
        responseStage = item
      } else if (item.parallel) {
        return ((item.parallel as unknown) as StageElementWrapperConfig[]).forEach(node => {
          if (node.stage?.identifier === stageId) {
            responseStage = node
          }
        })
      }
    })
    return responseStage
  }
  return
}

const validateStep = (
  steps: ExecutionWrapperConfig[],
  template?: ExecutionWrapperConfig[],
  originalSteps?: ExecutionWrapperConfig[],
  getString?: UseStringsReturn['getString']
): FormikErrors<ExecutionWrapperConfig> => {
  const errors = {}
  steps.forEach((stepObj, index) => {
    if (stepObj.step) {
      const originalStep = getStepFromStage(stepObj.step.identifier || '', originalSteps)
      const pipelineStep = factory.getStep(originalStep?.step?.type)
      const errorResponse = pipelineStep?.validateInputSet(stepObj.step, template?.[index].step, getString)
      if (!isEmpty(errorResponse)) {
        set(errors, `steps[${index}].step`, errorResponse)
      }
    } else if (stepObj.parallel) {
      ;((stepObj.parallel as unknown) as StepElement[]).forEach((stepParallel, indexP) => {
        if (stepParallel.step) {
          const originalStep = getStepFromStage(stepParallel.step.identifier || '', originalSteps)
          const pipelineStep = factory.getStep(originalStep?.step?.type)
          const errorResponse = pipelineStep?.validateInputSet(
            stepParallel.step,
            ((template?.[index]?.parallel as unknown) as StepElement[])?.[indexP]?.step,
            getString
          )
          if (!isEmpty(errorResponse)) {
            set(errors, `steps[${index}].parallel[${indexP}].step`, errorResponse)
          }
        }
      })
    } else if (stepObj.stepGroup) {
      const originalStepGroup = getStepFromStage(stepObj.stepGroup.identifier, originalSteps)
      if (stepObj.stepGroup.steps) {
        const errorResponse = validateStep(
          stepObj.stepGroup.steps,
          template?.[index]?.stepGroup?.steps,
          originalStepGroup?.stepGroup?.steps,
          getString
        )
        if (!isEmpty(errorResponse)) {
          set(errors, `steps[${index}].stepGroup.steps`, errorResponse)
        }
      }
      if (stepObj.stepGroup.rollbackSteps) {
        const errorResponse = validateStep(
          stepObj.stepGroup.rollbackSteps,
          template?.[index]?.stepGroup?.rollbackSteps,
          originalStepGroup?.stepGroup?.rollbackSteps,
          getString
        )
        if (!isEmpty(errorResponse)) {
          set(errors, `steps[${index}].stepGroup.rollbackSteps`, errorResponse)
        }
      }
    }
  })

  return errors
}

const validateStage = (
  stage: StageElementConfig,
  template: StageElementConfig,
  originalStage?: StageElementConfig,
  getString?: UseStringsReturn['getString']
): FormikErrors<StageElementConfig> => {
  const errors = {}
  if (
    stage.spec?.infrastructure?.infrastructureDefinition?.spec &&
    originalStage?.spec?.infrastructure?.infrastructureDefinition?.type
  ) {
    const step = factory.getStep(originalStage.spec.infrastructure.infrastructureDefinition.type)
    const errorsResponse = step?.validateInputSet(
      stage.spec?.infrastructure?.infrastructureDefinition?.spec,
      template.spec?.infrastructure?.infrastructureDefinition?.spec,
      getString
    )
    if (!isEmpty(errorsResponse)) {
      set(errors, 'spec.infrastructure.infrastructureDefinition.spec', errorsResponse)
    }
  }
  if (originalStage?.spec?.serviceConfig?.serviceDefinition?.type === 'Kubernetes') {
    const step = factory.getStep(StepType.K8sServiceSpec)
    const errorsResponse = step?.validateInputSet(
      stage.spec?.serviceConfig?.serviceDefinition?.spec,
      template.spec?.serviceConfig?.serviceDefinition?.spec,
      getString
    )
    if (!isEmpty(errorsResponse)) {
      set(errors, 'spec.serviceConfig.serviceDefinition.spec', errorsResponse)
    }
  }
  if (stage.spec?.execution?.steps) {
    const errorsResponse = validateStep(
      stage.spec.execution.steps as ExecutionWrapperConfig[],
      template.spec?.execution?.steps,
      originalStage?.spec?.execution?.steps,
      getString
    )
    if (!isEmpty(errorsResponse)) {
      set(errors, 'spec.execution', errorsResponse)
    }
  }
  if (stage.spec?.execution?.rollbackSteps) {
    const errorsResponse = validateStep(
      stage.spec.execution.rollbackSteps as ExecutionWrapperConfig[],
      template.spec?.execution?.rollbackSteps,
      originalStage?.spec?.execution?.rollbackSteps,
      getString
    )
    if (!isEmpty(errorsResponse)) {
      set(errors, 'spec.execution.rollbackSteps', errorsResponse)
    }
  }

  return errors
}

export const validatePipeline = (
  pipeline: NgPipeline,
  template: NgPipeline,
  originalPipeline?: NgPipeline,
  getString?: UseStringsReturn['getString'],
  path?: string
): FormikErrors<NgPipeline> => {
  const errors = {}
  pipeline.stages?.forEach((stageObj, index) => {
    if (stageObj.stage) {
      const originalStage = getStageFromPipeline(stageObj.stage.identifier, originalPipeline)
      const errorsResponse = validateStage(
        stageObj.stage as StageElementConfig,
        template.stages?.[index].stage,
        originalStage?.stage,
        getString
      )
      if (!isEmpty(errorsResponse)) {
        set(errors, `${isEmpty(path) ? '' : `${path}.`}stages[${index}].stage`, errorsResponse)
      }
    }
    if (stageObj.parallel) {
      stageObj.parallel.forEach((stageP: StageElementWrapper, indexP: number) => {
        if (stageP.stage) {
          const originalStage = getStageFromPipeline(stageP.stage.identifier, originalPipeline)
          const errorsResponse = validateStage(
            stageP.stage as StageElementConfig,
            template.stages?.[index].parallel?.[indexP].stage,
            originalStage?.stage,
            getString
          )
          if (!isEmpty(errorsResponse)) {
            set(errors, `${isEmpty(path) ? '' : `${path}.`}stages[${index}].parallel[${indexP}].stage`, errorsResponse)
          }
        }
      })
    }
  })

  return errors
}

const getErrorsFlatten = memoize((errors: any): string[] => {
  return reduce(
    errors,
    (result: string[], value: any) => {
      if (typeof value === 'string') {
        result.push(value)
      } else if (isObject(value)) {
        return result.concat(getErrorsFlatten(value as any))
      }

      return result
    },
    []
  )
})

export const getErrorsList = memoize((errors: any): string[] => {
  const errorList = getErrorsFlatten(errors)
  const errorCountMap: { [key: string]: number } = {}
  errorList.forEach(error => {
    if (errorCountMap[error]) {
      errorCountMap[error]++
    } else {
      errorCountMap[error] = 1
    }
  })
  const finalErrors = Object.entries(errorCountMap).map(([key, count]) => `${count} ${key}`)
  return finalErrors
})
