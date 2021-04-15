import React from 'react'
import { Classes } from '@blueprintjs/core'
import { Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { debounce } from 'lodash-es'

import type { ExecutionWrapper, FailureStrategyConfig, StageElementWrapperConfig } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import FailureStrategyPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/FailureStrategyPanel'
import {
  Domain,
  ErrorType,
  Strategy
} from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyConfig'
import { getFailureStrategiesValidationSchema } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/validation'
import { Modes } from '@pipeline/components/PipelineSteps/AdvancedSteps/common'

import type { StepCommandsRef } from '../StepCommands/StepCommands'

export interface FailureStrategyProps {
  selectedStage?: StageElementWrapperConfig
  isReadonly: boolean
  onUpdate(data: { failureStrategies: FailureStrategyConfig[] }): void
}

export function FailureStrategy(props: FailureStrategyProps, ref: StepCommandsRef): React.ReactElement {
  const { getString } = useStrings()
  const { selectedStage, onUpdate, isReadonly } = props
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(debounce(onUpdate, 300), [onUpdate])
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useImperativeHandle(ref, () => ({
    setFieldError(key: string, error: string) {
      if (formikRef.current) {
        formikRef.current.setFieldError(key, error)
      }
    },
    isDirty() {
      if (formikRef.current) {
        return formikRef.current.dirty
      }
    },
    submitForm() {
      if (formikRef.current) {
        return formikRef.current.submitForm()
      }
    },
    getErrors() {
      if (formikRef.current) {
        return formikRef.current.errors
      }

      return {}
    },
    getValues() {
      if (formikRef.current) {
        return formikRef.current.values as ExecutionWrapper
      }

      return {}
    }
  }))

  const domain = selectedStage?.stage?.type as Domain
  const fallbackValues =
    domain === 'CI'
      ? []
      : [
          {
            onFailure: {
              errors: [ErrorType.AnyOther],
              action: {
                type: Strategy.StageRollback
              }
            }
          }
        ]
  return (
    <Formik
      initialValues={{
        failureStrategies: selectedStage?.stage?.failureStrategies || fallbackValues
      }}
      validationSchema={Yup.object().shape({
        failureStrategies: getFailureStrategiesValidationSchema(getString).required().min(1)
      })}
      onSubmit={onUpdate}
      validate={debouncedUpdate}
    >
      {formik => (
        <div className={Classes.DIALOG_BODY}>
          <FailureStrategyPanel isReadonly={isReadonly} mode={Modes.STAGE} domain={domain} formikProps={formik} />
        </div>
      )}
    </Formik>
  )
}

export const FailureStrategyWithRef = React.forwardRef(FailureStrategy)
