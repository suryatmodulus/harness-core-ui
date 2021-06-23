import React, { useMemo } from 'react'
import type { FormikProps } from 'formik'
import { Formik, FormikForm, Accordion, AccordionHandle } from '@wings-software/uicore'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'

import { useStrings } from 'framework/strings'
import {
  AdvancedPanels,
  StepCommandsProps,
  Values
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { TabTypes } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type { ExecutionWrapper } from 'services/cd-ng'

import DelegateSelectorPanel from './DelegateSelectorPanel/DelegateSelectorPanel'
import FailureStrategyPanel from './FailureStrategyPanel/FailureStrategyPanel'
import { getFailureStrategiesValidationSchema } from './FailureStrategyPanel/validation'
import { StepType } from '../PipelineStepInterface'
import ConditionalExecutionPanel from './ConditionalExecutionPanel/ConditionalExecutionPanel'
import css from './AdvancedSteps.module.scss'

export interface AdvancedStepsProps extends StepCommandsProps {
  _?: unknown // to void empty interface error
}

export default function AdvancedSteps(props: AdvancedStepsProps, formikRef: StepFormikFowardRef): React.ReactElement {
  function getInitialValues(step: ExecutionWrapper): Values {
    return {
      failureStrategies: step.failureStrategies,
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
    stageType
  } = props
  const { getString } = useStrings()
  const stepType = isStepGroup ? StepType.StepGroup : step.type
  const initialValues = useMemo(() => getInitialValues(step), [step])
  const accordionRef = React.useRef<AccordionHandle>({} as AccordionHandle)

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={data => {
        onChange({ ...data, tab: TabTypes.Advanced })
      }}
      formName="pipelineAdvancedSteps"
      validationSchema={Yup.object().shape({
        failureStrategies: getFailureStrategiesValidationSchema(getString)
      })}
    >
      {(formikProps: FormikProps<Values>) => {
        setFormikRef(formikRef, formikProps)

        if (formikProps.isSubmitting) {
          if (!isEmpty(formikProps.errors?.failureStrategies) && accordionRef.current) {
            accordionRef.current.open(AdvancedPanels.FailureStrategy)
          }

          if (!isEmpty(formikProps.errors?.when) && accordionRef.current) {
            accordionRef.current.open(AdvancedPanels.ConditionalExecution)
          }

          if (!isEmpty(formikProps.errors?.delegateSelectors) && accordionRef.current) {
            accordionRef.current.open(AdvancedPanels.DelegateSelectors)
          }
        }

        return (
          <FormikForm className={css.form}>
            <div>
              <Accordion
                ref={accordionRef}
                allowMultiOpen
                activeId={
                  hiddenPanels.indexOf(AdvancedPanels.DelegateSelectors) === -1 &&
                  stepsFactory.getStep(stepType)?.hasDelegateSelectionVisible
                    ? AdvancedPanels.DelegateSelectors
                    : hiddenPanels.indexOf(AdvancedPanels.ConditionalExecution) === -1
                    ? AdvancedPanels.ConditionalExecution
                    : hiddenPanels.indexOf(AdvancedPanels.FailureStrategy) === -1
                    ? AdvancedPanels.FailureStrategy
                    : ''
                }
              >
                {hiddenPanels.indexOf(AdvancedPanels.DelegateSelectors) === -1 &&
                  stepsFactory.getStep(stepType)?.hasDelegateSelectionVisible && (
                    <Accordion.Panel
                      id={AdvancedPanels.DelegateSelectors}
                      summary={getString('delegate.DelegateSelector')}
                      details={<DelegateSelectorPanel isReadonly={isReadonly} formikProps={formikProps} />}
                    />
                  )}
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
                        stageType={stageType}
                        formikProps={formikProps}
                        isReadonly={isReadonly}
                      />
                    }
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
