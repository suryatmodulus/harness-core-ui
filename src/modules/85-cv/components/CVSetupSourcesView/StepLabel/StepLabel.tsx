import React from 'react'
import { Text, Container } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import css from './StepLabel.module.scss'

export interface StepLabelProps {
  stepNumber: number
  totalSteps: number
}

const StepNumberColoring = [
  {
    backgroundColor: 'var(--green-300)',
    color: '#1E5C1F'
  },
  {
    backgroundColor: 'var(--blue-300)',
    color: 'var(--blue-700)'
  },
  {
    backgroundColor: '#E1D0FF',
    color: '#592BAA'
  }
]

export function StepLabel(props: StepLabelProps): JSX.Element {
  const { stepNumber, totalSteps } = props
  const { getString } = useStrings()
  if (stepNumber > StepNumberColoring.length) return <Container className="invalidIndex" />
  return (
    <Text className={css.main} style={StepNumberColoring[stepNumber - 1]}>{`${getString(
      'step'
    )} ${stepNumber} ${getString('of')} ${totalSteps}`}</Text>
  )
}
