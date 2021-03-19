import React from 'react'
import { Tabs } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'

import { useExecutionContext } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import ExecutionLayout from '@pipeline/components/ExecutionLayout/ExecutionLayout'

import ExecutionStepDetailsTab from './ExecutionStepDetailsTab'
import ExecutionStepInputOutputTab from './ExecutionStepInputOutputTab'

import css from './ExecutionStepDetails.module.scss'

export interface ExecutionStepDetailsProps {
  selectedStep: string
  closeDetails(): void
}

export default function ExecutionStepDetails(props: ExecutionStepDetailsProps): React.ReactElement {
  const { selectedStep, closeDetails } = props
  const { allNodeMap } = useExecutionContext()

  const step = allNodeMap?.[selectedStep] || {}

  return (
    <div className={css.main}>
      <div className={css.header}>
        <div className={css.title}>Step: {step.name}</div>
        <div className={css.actions}>
          <ExecutionLayout.Toggle />
          <Button minimal icon="cross" onClick={closeDetails} />
        </div>
      </div>
      <Tabs id="step-details" className={css.tabs} renderActiveTabPanelOnly>
        <Tabs.Tab id="details" title="Details" panel={<ExecutionStepDetailsTab step={step} />} />
        <Tabs.Tab
          id="input"
          title="Input"
          panel={
            <ExecutionStepInputOutputTab baseFqn={step.baseFqn} mode="input" data={[(step as any).stepParameters]} />
          }
        />
        <Tabs.Tab
          id="output"
          title="Output"
          panel={
            <ExecutionStepInputOutputTab baseFqn={step.baseFqn} mode="output" data={(step as any).outcomes || []} />
          }
        />
      </Tabs>
    </div>
  )
}
