import React from 'react'
import { Toothpick } from '@common/components'
import { useStrings } from 'framework/exports'
import { zeroFiftyNineDDOptions } from '@common/components/TimeSelect/TimeSelectUtils'
import ExpressionBreakdown, { ActiveInputs } from './ExpressionBreakdown'
import Expression from './Expression'
import Spacer from './Spacer'
import { oneTwentyThreeOptions, getUpdatedExpression, getBackslashValue } from './ScheduleUtils'
import css from './HourlyTab.module.scss'

interface HourlyTabInterface {
  formikProps: any
}

export default function HourlyTab(props: HourlyTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { hours, minutes, expression, selectedScheduleTab },
      values
    },
    formikProps
  } = props
  const { getString } = useStrings()

  return (
    <div className={css.hourlyTab}>
      <Toothpick
        label={getString('pipeline-triggers.schedulePanel.runEvery')}
        startValue={hours}
        endValue={minutes}
        startOptions={oneTwentyThreeOptions}
        handleStartValueChange={val =>
          formikProps.setValues({
            ...values,
            hours: val.value,
            expression: getUpdatedExpression({
              expression,
              value: getBackslashValue({ selectedScheduleTab, id: 'hours', value: val.value as string }),
              id: 'hours'
            })
          })
        }
        endOptions={zeroFiftyNineDDOptions}
        handleEndValueChange={val =>
          formikProps.setValues({
            ...values,
            minutes: val.value,
            expression: getUpdatedExpression({ expression, value: val.value as string, id: 'minutes' })
          })
        }
        adjoiningText={getString('pipeline-triggers.schedulePanel.hoursAnd')}
        endingText={getString('pipeline-triggers.schedulePanel.minutesParentheses')}
      />
      <Spacer paddingTop={'var(--spacing-large)'} />
      <ExpressionBreakdown formikValues={values} activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS]} />
      <Spacer />
      <Expression formikProps={formikProps} />
    </div>
  )
}
