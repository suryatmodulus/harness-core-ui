import React from 'react'
import type { FormikProps } from 'formik'
import { Formik, FormikForm, Accordion, AccordionHandle } from '@wings-software/uicore'
import * as Yup from 'yup'
import { debounce, defaultTo, isEmpty } from 'lodash-es'

import { useStrings } from 'framework/strings'
import {
  AdvancedPanels,
  StepCommandsProps,
  Values
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { TabTypes } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type { StepElementConfig, StepGroupElementConfig } from 'services/cd-ng'
import type { TemplateStepData } from '@pipeline/utils/tempates'
import DelegateSelectorPanel from './DelegateSelectorPanel/DelegateSelectorPanel'
import FailureStrategyPanel, { AllFailureStrategyConfig } from './FailureStrategyPanel/FailureStrategyPanel'
import { getFailureStrategiesValidationSchema } from './FailureStrategyPanel/validation'
import type { StepType } from '../PipelineStepInterface'
import ConditionalExecutionPanel from './ConditionalExecutionPanel/ConditionalExecutionPanel'
import css from './AdvancedSteps.module.scss'

export type FormValues = Pick<Values, 'delegateSelectors' | 'when'> & {
  failureStrategies: AllFailureStrategyConfig[]
}

export interface AdvancedStepsProps extends StepCommandsProps {
  stepType?: StepType
}

export default function AdvancedSteps(props: AdvancedStepsProps, formikRef: StepFormikFowardRef): React.ReactElement {
  const { step, onChange, onUpdate } = props
  const { getString } = useStrings()

  const debouncedUpdate = React.useCallback(
    debounce((data: FormValues): void => {
      onChange?.({ ...data, tab: TabTypes.Advanced })
    }, 300),
    [onUpdate]
  )

  const failureStrategies =
    (step as TemplateStepData)?.template?.templateInputs?.failureStrategies ||
    (step as StepElementConfig | StepGroupElementConfig)?.failureStrategies

  const delegateSelectors =
    (step as TemplateStepData)?.template?.templateInputs?.failureStrategies ||
    (step as StepElementConfig)?.spec?.delegateSelectors

  const when =
    (step as TemplateStepData)?.template?.templateInputs?.when ||
    (step as StepElementConfig | StepGroupElementConfig)?.when

  return (
    <Formik<FormValues>
      initialValues={{
        failureStrategies: defaultTo(failureStrategies, []) as AllFailureStrategyConfig[],
        delegateSelectors: defaultTo(delegateSelectors, []),
        when
      }}
      onSubmit={data => {
        onUpdate({ ...data, tab: TabTypes.Advanced })
      }}
      validate={debouncedUpdate}
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
    formikProps,
    hiddenPanels = [],
    hasStepGroupAncestor,
    isStepGroup,
    stepsFactory,
    isReadonly,
    stageType,
    stepType
  } = props

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
