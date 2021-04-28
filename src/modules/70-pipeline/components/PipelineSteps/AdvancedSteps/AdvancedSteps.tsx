import React, { useMemo } from 'react'
import type { FormikProps } from 'formik'
import { Formik, FormikForm, Accordion } from '@wings-software/uicore'
import * as Yup from 'yup'

import { cloneDeep } from 'lodash-es'
import { useStrings } from 'framework/strings'
import {
  AdvancedPanels,
  StepCommandsProps,
  Values
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { TabTypes } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'

import type { ExecutionWrapper } from 'services/cd-ng'
import DelegateSelectorPanel from './DelegateSelectorPanel/DelegateSelectorPanel'

import FailureStrategyPanel from './FailureStrategyPanel/FailureStrategyPanel'
import { getFailureStrategiesValidationSchema } from './FailureStrategyPanel/validation'
import { Modes } from './common'
import { StepType } from '../PipelineStepInterface'
import { cvDefaultFailureStrategies } from './constants'
import ConditionalExecutionPanel from './ConditionalExecutionPanel/ConditionalExecutionPanel'
import css from './AdvancedSteps.module.scss'

export interface AdvancedStepsProps extends StepCommandsProps {
  _?: unknown // to void empty interface error
}

export default function AdvancedSteps(props: AdvancedStepsProps, formikRef: StepFormikFowardRef): React.ReactElement {
  function getInitialValues(step: ExecutionWrapper): Values {
    let failureStrategies = step.failureStrategies
    if (!step['failureStrategies'] && step.type === StepType.Verify) {
      failureStrategies = cloneDeep(cvDefaultFailureStrategies)
    }
    return {
      failureStrategies,
      delegateSelectors: step.spec?.delegateSelectors || [],
      when: step.when
    }
  }

  const {
    step,
    onChange,
    hiddenPanels = [],
    hasStepGroupAncestor,
    isStepGroup,
    stepsFactory,
    isReadonly,
    domain
  } = props
  const { getString } = useStrings()
  const stepType = isStepGroup ? StepType.StepGroup : step.type
  const initialValues = useMemo(() => getInitialValues(step), [step])
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={data => {
        onChange({ ...data, tab: TabTypes.Advanced })
      }}
      validationSchema={Yup.object().shape({
        failureStrategies: getFailureStrategiesValidationSchema(getString)
      })}
    >
      {(formikProps: FormikProps<Values>) => {
        setFormikRef(formikRef, formikProps)
        return (
          <FormikForm className={css.form}>
            <div>
              <Accordion activeId={AdvancedPanels.ConditionalExecution}>
                {hiddenPanels.indexOf(AdvancedPanels.ConditionalExecution) === -1 && (
                  <Accordion.Panel
                    id={AdvancedPanels.ConditionalExecution}
                    summary={getString('pipeline.conditionalExecution.title')}
                    details={
                      <ConditionalExecutionPanel
                        formikProps={formikProps}
                        mode={isStepGroup ? Modes.STEP_GROUP : Modes.STEP}
                        isReadonly={isReadonly}
                      />
                    }
                  />
                )}
                {hiddenPanels.indexOf(AdvancedPanels.FailureStrategy) === -1 && (
                  <Accordion.Panel
                    id={AdvancedPanels.FailureStrategy}
                    summary={getString('pipeline.failureStrategies.title')}
                    details={
                      <FailureStrategyPanel
                        mode={hasStepGroupAncestor || isStepGroup ? Modes.STEP_GROUP : Modes.STEP}
                        domain={domain}
                        formikProps={formikProps}
                        isReadonly={isReadonly}
                      />
                    }
                  />
                )}
                {hiddenPanels.indexOf(AdvancedPanels.DelegateSelectors) === -1 &&
                  stepsFactory.getStep(stepType)?.hasDelegateSelectionVisible && (
                    <Accordion.Panel
                      id={AdvancedPanels.DelegateSelectors}
                      summary={getString('delegate.DelegateSelector')}
                      details={<DelegateSelectorPanel isReadonly={isReadonly} formikProps={formikProps} />}
                    />
                  )}
              </Accordion>
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const AdvancedStepsWithRef = React.forwardRef(AdvancedSteps)
