import React from 'react'
import { useStrings } from 'framework/strings'

import css from './Steps.module.scss'

interface StepDetail {
  header: string
  description: string
}

interface StepsByType {
  [key: string]: StepDetail[]
}

interface StepsProps {
  strategy: string
}

export default function Steps(props: StepsProps): React.ReactElement {
  const { strategy } = props

  const { getString } = useStrings()

  const stepsByType: StepsByType = {
    Rolling: [
      {
        header: getString('pipeline.executionStrategy.strategies.common.steps.step1.title'),
        description: getString('pipeline.executionStrategy.strategies.rolling.steps.step1.description')
      },
      {
        header: getString('pipeline.executionStrategy.strategies.common.steps.step2.title'),
        description: getString('pipeline.executionStrategy.strategies.rolling.steps.step2.description')
      },
      {
        header: getString('pipeline.executionStrategy.strategies.common.steps.step3.title'),
        description: getString('pipeline.executionStrategy.strategies.rolling.steps.step3.description')
      }
    ],
    BlueGreen: [
      {
        header: getString('pipeline.executionStrategy.strategies.common.steps.step1.title'),
        description: getString('pipeline.executionStrategy.strategies.blueGreen.steps.step1.description')
      },
      {
        header: getString('pipeline.executionStrategy.strategies.common.steps.step2.title'),
        description: getString('pipeline.executionStrategy.strategies.blueGreen.steps.step2.description')
      },
      {
        header: getString('pipeline.executionStrategy.strategies.common.steps.step3.title'),
        description: getString('pipeline.executionStrategy.strategies.blueGreen.steps.step3.description')
      }
    ],
    Canary: [
      {
        header: getString('pipeline.executionStrategy.strategies.canary.steps.step1.title'),
        description: getString('pipeline.executionStrategy.strategies.canary.steps.step1.description')
      },
      {
        header: getString('pipeline.executionStrategy.strategies.canary.steps.step2.title'),
        description: getString('pipeline.executionStrategy.strategies.canary.steps.step2.description')
      },
      {
        header: getString('pipeline.executionStrategy.strategies.canary.steps.step3.title'),
        description: getString('pipeline.executionStrategy.strategies.canary.steps.step3.description')
      }
    ]
  }

  return (
    <div className={css.steps}>
      {stepsByType[strategy].map((step: StepDetail) => {
        return (
          <div key={step.header} className={css.stepCard} data-testid="step-card">
            <div className={css.header} data-testid="step-header">
              {step.header}
            </div>
            <div className={css.description} data-testid="step-description">
              {step.description}
            </div>
          </div>
        )
      })}
    </div>
  )
}
