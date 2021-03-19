import React from 'react'
import { Tabs, Tab } from '@wings-software/uicore'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'

import { useStrings } from 'framework/exports'
import { StepWidgetWithFormikRef } from '@pipeline/components/AbstractSteps/StepWidget'
import { AdvancedStepsWithRef } from '@pipeline/components/PipelineSteps/AdvancedSteps/AdvancedSteps'

import type { ExecutionWrapper } from 'services/cd-ng'
import type { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StepCommandsProps } from './StepCommandTypes'
import css from './StepCommands.module.scss'

export type StepFormikRef<T = unknown> = {
  isDirty(): FormikProps<T>['dirty'] | undefined
  submitForm: FormikProps<T>['submitForm']
  getErrors(): FormikProps<T>['errors']
  getValues(): ExecutionWrapper
}

export type StepCommandsRef<T = unknown> =
  | ((instance: StepFormikRef<T> | null) => void)
  | React.MutableRefObject<StepFormikRef<T> | null>
  | null

enum StepCommandTabs {
  StepConfiguration = 'StepConfiguration',
  Advanced = 'Advanced'
}

export function StepCommands(props: StepCommandsProps, ref: StepCommandsRef): React.ReactElement {
  const { step, onChange, isStepGroup, stepsFactory, hiddenPanels, hasStepGroupAncestor } = props
  const { getString } = useStrings()
  const [activeTab, setActiveTab] = React.useState(StepCommandTabs.StepConfiguration)
  const stepRef = React.useRef<FormikProps<unknown> | null>(null)
  const advancedConfRef = React.useRef<FormikProps<unknown> | null>(null)

  async function handleTabChange(newTab: StepCommandTabs, prevTab: StepCommandTabs): Promise<void> {
    if (prevTab === StepCommandTabs.StepConfiguration && stepRef.current) {
      // please do not remove the await below.
      // This is required for errors to be populated correctly
      await stepRef.current.submitForm()

      if (isEmpty(stepRef.current.errors)) {
        setActiveTab(newTab)
      }
    } else if (prevTab === StepCommandTabs.Advanced && advancedConfRef.current) {
      // please do not remove the await below.
      // This is required for errors to be populated correctly
      await advancedConfRef.current.submitForm()

      if (isEmpty(advancedConfRef.current.errors)) {
        setActiveTab(newTab)
      }
    }
  }

  React.useImperativeHandle(ref, () => ({
    isDirty() {
      if (activeTab === StepCommandTabs.StepConfiguration && stepRef.current) {
        return stepRef.current.dirty
      }

      if (activeTab === StepCommandTabs.Advanced && advancedConfRef.current) {
        return advancedConfRef.current.dirty
      }
    },
    submitForm() {
      if (activeTab === StepCommandTabs.StepConfiguration && stepRef.current) {
        return stepRef.current.submitForm()
      }

      if (activeTab === StepCommandTabs.Advanced && advancedConfRef.current) {
        return advancedConfRef.current.submitForm()
      }
    },
    getErrors() {
      return activeTab === StepCommandTabs.StepConfiguration && stepRef.current
        ? stepRef.current.errors
        : activeTab === StepCommandTabs.Advanced && advancedConfRef.current
        ? advancedConfRef.current.errors
        : {}
    },
    getValues() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stepObj = stepsFactory.getStep(step.type) as PipelineStep<any>
      return activeTab === StepCommandTabs.StepConfiguration && stepRef.current
        ? (stepObj.processFormData(stepRef.current.values) as ExecutionWrapper)
        : activeTab === StepCommandTabs.Advanced && advancedConfRef.current
        ? (advancedConfRef.current.values as ExecutionWrapper)
        : ({} as ExecutionWrapper)
    }
  }))

  return (
    <div className={css.stepCommand}>
      <div className={cx(css.stepTabs, { stepTabsAdvanced: activeTab === StepCommandTabs.Advanced })}>
        <Tabs id="step-commands" selectedTabId={activeTab} onChange={handleTabChange} renderAllTabPanels>
          <Tab
            id={StepCommandTabs.StepConfiguration}
            title={isStepGroup ? getString('stepGroupConfiguration') : getString('stepConfiguration')}
            panel={
              <StepWidgetWithFormikRef
                factory={stepsFactory}
                initialValues={step}
                onUpdate={onChange}
                type={isStepGroup ? 'StepGroup' : step.type}
                ref={stepRef}
              />
            }
          />
          <Tab
            id={StepCommandTabs.Advanced}
            title={getString('advancedTitle')}
            panel={
              <AdvancedStepsWithRef
                step={step}
                stepsFactory={stepsFactory}
                onChange={onChange}
                hiddenPanels={hiddenPanels}
                isStepGroup={isStepGroup}
                hasStepGroupAncestor={hasStepGroupAncestor}
                ref={advancedConfRef}
              />
            }
          />
        </Tabs>
      </div>
    </div>
  )
}

export const StepCommandsWithRef = React.forwardRef(StepCommands)
