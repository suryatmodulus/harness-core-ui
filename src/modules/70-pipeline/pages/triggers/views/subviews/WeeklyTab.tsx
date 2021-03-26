import React, { useState } from 'react'
import { Text, Container, Color, Layout, Icon, Button } from '@wings-software/uicore'
import cx from 'classnames'
import { TimeSelect } from '@common/components'
import { useStrings } from 'framework/exports'
import ExpressionBreakdown, { ActiveInputs } from './ExpressionBreakdown'
import Expression from './Expression'
import Spacer from './Spacer'
import {
  defaultScheduleValues,
  shortDays,
  DaysOfWeek,
  getUpdatedExpression,
  getDayOfWeekStr,
  getPmHours,
  AmPmMap
} from './ScheduleUtils'
import css from './WeeklyTab.module.scss'
interface DailyTabInterface {
  formikProps: any
}

export default function WeeklyTab(props: DailyTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { minutes, hours, amPm, dayOfWeek, expression },
      values
    },
    formikProps
  } = props
  const { getString } = useStrings()
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<DaysOfWeek[]>(
    dayOfWeek || defaultScheduleValues.DAYS_OF_WEEK
  )

  return (
    <div className={css.weeklyTab}>
      <Layout.Vertical style={{ alignItems: 'flex-start' }}>
        <Container>
          <Text className={css.label}> {getString('pipeline-triggers.schedulePanel.runOn')}</Text>
          {shortDays.map(day => (
            <Button
              key={day}
              className={cx(css.weekday, (selectedDaysOfWeek.includes(day) && css.activeDay) || '')}
              onClick={() => {
                const filteredDays = selectedDaysOfWeek.filter(selectedDay => selectedDay !== day)
                if (filteredDays.length === 0) {
                  const newDayOfWeek = selectedDaysOfWeek.length === 0 ? [day] : []
                  if (newDayOfWeek.length) {
                    filteredDays.push(day)
                  }
                  formikProps.setValues({
                    ...values,
                    dayOfWeek: newDayOfWeek,
                    expression: getUpdatedExpression({
                      expression,
                      value: getDayOfWeekStr(newDayOfWeek),
                      id: 'dayOfWeek'
                    })
                  })
                } else {
                  if (filteredDays.length === selectedDaysOfWeek.length) {
                    // add new day
                    filteredDays.push(day)
                  }
                  const newDayOfWeek = getDayOfWeekStr(filteredDays)
                  formikProps.setValues({
                    ...values,
                    dayOfWeek: filteredDays,
                    expression: getUpdatedExpression({ expression, value: newDayOfWeek, id: 'dayOfWeek' })
                  })
                }
                setSelectedDaysOfWeek(filteredDays)
              }}
            >
              <Layout.Horizontal className={css.weekdayText}>
                <Icon
                  style={{
                    visibility: selectedDaysOfWeek.includes(day) ? 'visible' : 'hidden',
                    marginRight: 'var(--spacing-xsmall)'
                  }}
                  background={Color.WHITE}
                  color={Color.WHITE}
                  size={16}
                  name="deployment-success-new"
                />
                <Text>{getString(`pipeline-triggers.schedulePanel.${day}`)}</Text>
              </Layout.Horizontal>
            </Button>
          ))}
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
        </Container>
        <Spacer paddingTop="var(--spacing-large)" />
        <ExpressionBreakdown
          formikValues={values}
          activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS, ActiveInputs.DAY_OF_WEEK]}
        />
        <Spacer />
        <Expression formikProps={formikProps} />
      </Layout.Vertical>
    </div>
  )
}
