import React from 'react'
import { Layout, SelectOption } from '@wings-software/uicore'
import { Toothpick, TimeSelect } from '@common/components'
import { useStrings } from 'framework/exports'
import ExpressionBreakdown, { ActiveInputs } from './ExpressionBreakdown'
import Expression from './Expression'
import Spacer from './Spacer'
import {
  monthOptions,
  nthDayOptions,
  getUpdatedExpression,
  getMilitaryHours,
  getDayOptionsToMonth,
  defaultYearlyValues
} from './ScheduleUtils'
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
          handleStartValueChange={option => {
            const dayOfMonthResetExpression = getUpdatedExpression({
              expression,
              value: defaultYearlyValues.dayOfMonth,
              id: 'dayOfMonth'
            })
            formikProps.setValues({
              ...values,
              month: option.value,
              dayOfMonth: defaultYearlyValues.dayOfMonth,
              expression: getUpdatedExpression({
                expression: dayOfMonthResetExpression,
                value: option.value as string,
                id: 'month'
              })
            })
          }}
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
          endOptions={getDayOptionsToMonth({ monthNo: month, options: nthDayOptions })}
          adjoiningText={getString('pipeline-triggers.schedulePanel.onThe')}
        />
        <TimeSelect
          label={getString('pipeline-triggers.schedulePanel.runAt')}
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
