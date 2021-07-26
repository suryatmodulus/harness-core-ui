import React from 'react'
import type { FormikProps } from 'formik'
import { Formik, FormikForm, Accordion, AccordionHandle } from '@wings-software/uicore'
import * as Yup from 'yup'
import { defaultTo, isEmpty } from 'lodash-es'

import { useStrings } from 'framework/strings'
import {
  AdvancedPanels,
  StepCommandsProps,
  Values
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { TabTypes } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type { StepElementConfig } from 'services/cd-ng'

import DelegateSelectorPanel from './DelegateSelectorPanel/DelegateSelectorPanel'
import FailureStrategyPanel, { AllFailureStrategyConfig } from './FailureStrategyPanel/FailureStrategyPanel'
import { getFailureStrategiesValidationSchema } from './FailureStrategyPanel/validation'
import { StepType } from '../PipelineStepInterface'
import ConditionalExecutionPanel from './ConditionalExecutionPanel/ConditionalExecutionPanel'
import css from './AdvancedSteps.module.scss'

export type FormValues = Pick<Values, 'delegateSelectors' | 'when'> & {
  failureStrategies: AllFailureStrategyConfig[]
}

export interface AdvancedStepsProps extends StepCommandsProps {
  _?: unknown // to void empty interface error
}

export default function AdvancedSteps(props: AdvancedStepsProps, formikRef: StepFormikFowardRef): React.ReactElement {
  const { step, onChange } = props
  const { getString } = useStrings()

  return (
    <Formik<FormValues>
      initialValues={{
        failureStrategies: defaultTo(step.failureStrategies, []) as AllFailureStrategyConfig[],
        delegateSelectors: defaultTo((step as StepElementConfig).spec?.delegateSelectors, []),
        when: step.when
      }}
      onSubmit={data => {
        onChange({ ...data, tab: TabTypes.Advanced })
      }}
      formName="pipelineAdvancedSteps"
      validationSchema={Yup.object().shape({
        failureStrategies: getFailureStrategiesValidationSchema(getString)
      })}
    >
      {(formikProps: FormikProps<FormValues>) => {
        setFormikRef(formikRef, formikProps)

        return <AdvancedTabForm {...props} formikProps={formikProps} />
      }}
    </Formik>
  )
}

export interface AdvancedTabFormProps extends Omit<AdvancedStepsProps, 'onChange'> {
  formikProps: FormikProps<FormValues>
}

export function AdvancedTabForm(props: AdvancedTabFormProps): React.ReactElement {
  const {
    step,
    formikProps,
    hiddenPanels = [],
    hasStepGroupAncestor,
    isStepGroup,
    stepsFactory,
    isReadonly,
    stageType
  } = props
  const stepType = isStepGroup ? StepType.StepGroup : (step as StepElementConfig).type
  const accordionRef = React.useRef<AccordionHandle>({} as AccordionHandle)
  const { getString } = useStrings()

  React.useEffect(() => {
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
  }, [formikProps.isSubmitting, formikProps.errors])

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
}

export const AdvancedStepsWithRef = React.forwardRef(AdvancedSteps)
