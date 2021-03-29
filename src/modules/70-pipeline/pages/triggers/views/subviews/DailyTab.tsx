import React from 'react'
import type { SelectOption } from '@wings-software/uicore'
import { TimeSelect } from '@common/components'
import { useStrings } from 'framework/exports'
import ExpressionBreakdown, { ActiveInputs } from './ExpressionBreakdown'
import Expression from './Expression'
import Spacer from './Spacer'
import { getUpdatedExpression, getMilitaryHours } from './ScheduleUtils'
import css from './DailyTab.module.scss'

interface DailyTabInterface {
  formikProps: any
}

export default function DailyTab(props: DailyTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { minutes, hours, amPm, expression },
      values
    },
    formikProps
  } = props
  const { getString } = useStrings()

  return (
    <div className={css.dailyTab}>
      <TimeSelect
        label={getString('pipeline-triggers.schedulePanel.runDailyAt')}
        hoursValue={hours}
        minutesValue={minutes}
        amPmValue={amPm}
        handleHoursSelect={(option: SelectOption) =>
          formikProps.setValues({
            ...values,
            hours: option.value,
            expression: getUpdatedExpression({
              expression,
              value: getMilitaryHours({ hours: option.value as string, amPm }),
              id: 'hours'
            })
          })
        }
        handleMinutesSelect={(option: SelectOption) =>
          formikProps.setValues({
            ...values,
            minutes: option.value,
            expression: getUpdatedExpression({ expression, value: option.value as string, id: 'minutes' })
          })
        }
        handleAmPmSelect={(option: SelectOption) => {
          const newHours = getMilitaryHours({ hours: values.hours, amPm: option.value as string })
          formikProps.setValues({
            ...values,
            amPm: option.value,
            expression: getUpdatedExpression({ expression, value: newHours, id: 'hours' })
          })
        }}
        hideSeconds={true}
      />
      <Spacer paddingTop={'var(--spacing-large)'} />
      <ExpressionBreakdown formikValues={values} activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS]} />
      <Spacer />
      <Expression formikProps={formikProps} />
    </div>
  )
}
