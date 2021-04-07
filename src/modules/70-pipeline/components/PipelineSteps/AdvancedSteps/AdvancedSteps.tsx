import React from 'react'
import type { FormikProps } from 'formik'
import { Formik, FormikForm, Accordion } from '@wings-software/uicore'
import * as Yup from 'yup'

import { useStrings } from 'framework/exports'
import {
  AdvancedPanels,
  StepCommandsProps,
  Values
} from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { TabTypes } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'

import DelegateSelectorPanel from './DelegateSelectorPanel/DelegateSelectorPanel'

import PreRequisitesPanel from './PreRequisitesPanel/PreRequisitesPanel'
import SkipConditionsPanel from './SkipConditionsPanel/SkipConditionsPanel'
import FailureStrategyPanel from './FailureStrategyPanel/FailureStrategyPanel'
import { getFailureStrategiesValidationSchema } from './FailureStrategyPanel/validation'
import { Modes } from './common'
import { StepType } from '../PipelineStepInterface'
import css from './AdvancedSteps.module.scss'

export interface AdvancedStepsProps extends StepCommandsProps {
  _?: unknown // to void empty interface error
}

export default function AdvancedSteps(props: AdvancedStepsProps, formikRef: StepFormikFowardRef): React.ReactElement {
  const { step, onChange, hiddenPanels = [], hasStepGroupAncestor, isStepGroup, stepsFactory } = props
  const { getString } = useStrings()
  const stepType = isStepGroup ? StepType.StepGroup : step.type
  return (
    <Formik
      initialValues={{
        skipCondition: step.skipCondition,
        failureStrategies: step.failureStrategies,
        delegateSelectors: step.spec?.delegateSelectors || []
      }}
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
              <Accordion activeId={AdvancedPanels.SkipCondition}>
                {hiddenPanels.indexOf(AdvancedPanels.PreRequisites) === -1 && (
                  <Accordion.Panel
                    id={AdvancedPanels.PreRequisites}
                    summary={getString('preRequisitesTitle')}
                    details={<PreRequisitesPanel />}
                  />
                )}
                {hiddenPanels.indexOf(AdvancedPanels.SkipCondition) === -1 && (
                  <Accordion.Panel
                    id={AdvancedPanels.SkipCondition}
                    summary={getString('skipConditionsTitle')}
                    details={<SkipConditionsPanel />}
                  />
                )}
                {hiddenPanels.indexOf(AdvancedPanels.FailureStrategy) === -1 && (
                  <Accordion.Panel
                    id={AdvancedPanels.FailureStrategy}
                    summary={getString('pipeline.failureStrategies.title')}
                    details={
                      <FailureStrategyPanel
                        mode={hasStepGroupAncestor || isStepGroup ? Modes.STEP_GROUP : Modes.STEP}
                        formikProps={formikProps}
                      />
                    }
                  />
                )}
                {hiddenPanels.indexOf(AdvancedPanels.DelegateSelectors) === -1 &&
                  stepsFactory.getStep(stepType)?.hasDelegateSelectionVisible && (
                    <Accordion.Panel
                      id={AdvancedPanels.DelegateSelectors}
                      summary={getString('delegate.DelegateSelector')}
                      details={<DelegateSelectorPanel formikProps={formikProps} />}
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
