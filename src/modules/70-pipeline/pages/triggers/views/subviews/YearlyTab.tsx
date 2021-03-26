import React from 'react'
import { Layout } from '@wings-software/uicore'
import { Toothpick, TimeSelect } from '@common/components'
import { useStrings } from 'framework/exports'
import ExpressionBreakdown, { ActiveInputs } from './ExpressionBreakdown'
import Expression from './Expression'
import Spacer from './Spacer'
import { monthOptions, nthDayOptions, getUpdatedExpression, AmPmMap, getPmHours } from './ScheduleUtils'
import css from './YearlyTab.module.scss'

interface YearlyTabInterface {
  formikProps: any
}

export default function YearlyTab(props: YearlyTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { dayOfMonth, month, minutes, hours, amPm, expression },
      values
    },
    formikProps
  } = props
  const { getString } = useStrings()

  return (
    <div className={css.yearlyTab}>
      <Layout.Vertical>
        <Toothpick
          label={getString('pipeline-triggers.schedulePanel.runOnSpecificDayMonth')}
          startValue={month}
          handleStartValueChange={option =>
            formikProps.setValues({
              ...values,
              month: option.value,
              expression: getUpdatedExpression({
                expression,
                value: option.value as string,
                id: 'month'
              })
            })
          }
          endValue={dayOfMonth}
          handleEndValueChange={option =>
            formikProps.setValues({
              ...values,
              dayOfMonth: option.value,
              expression: getUpdatedExpression({
                expression,
                value: option.value as string,
                id: 'dayOfMonth'
              })
            })
          }
          startOptions={monthOptions}
          endOptions={nthDayOptions}
          adjoiningText={getString('pipeline-triggers.schedulePanel.onThe')}
        />
        <TimeSelect
          label={getString('pipeline-triggers.schedulePanel.runAt')}
          hoursValue={hours}
          minutesValue={minutes}
          amPmValue={amPm}
          handleHoursSelect={option =>
            formikProps.setValues({
              ...values,
              hours: option.value,
              expression: getUpdatedExpression({
                expression,
                value: amPm === AmPmMap.PM ? getPmHours(option.value as string) : (option.value as string),
                id: 'hours'
              })
            })
          }
          handleMinutesSelect={option =>
            formikProps.setValues({
              ...values,
              minutes: option.value,
              expression: getUpdatedExpression({ expression, value: option.value as string, id: 'minutes' })
            })
          }
          handleAmPmSelect={option => {
            if (option.value === AmPmMap.PM && values.amPm === AmPmMap.AM) {
              const newHours = getPmHours(values.hours)
              formikProps.setValues({
                ...values,
                amPm: option.value,
                expression: getUpdatedExpression({ expression, value: newHours, id: 'hours' })
              })
            } else if (option.value === AmPmMap.AM && values.amPm === AmPmMap.PM) {
              formikProps.setValues({
                ...values,
                amPm: option.value,
                expression: getUpdatedExpression({ expression, value: hours, id: 'hours' })
              })
            }
          }}
          hideSeconds={true}
        />
        <Spacer paddingTop="var(--spacing-large)" />
        <ExpressionBreakdown
          formikValues={values}
          activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS, ActiveInputs.DAY_OF_MONTH, ActiveInputs.MONTH]}
        />
        <Spacer />
        <Expression formikProps={formikProps} />
      </Layout.Vertical>
    </div>
  )
}
