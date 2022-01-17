/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Text, Container, Layout, Icon, Button, SelectOption } from '@wings-software/uicore'
import cx from 'classnames'
import { TimeSelect } from '@common/components'
import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import ExpressionBreakdown, { ActiveInputs } from './ExpressionBreakdown'
import Expression from './Expression'
import Spacer from './Spacer'
import {
  defaultScheduleValues,
  shortDays,
  DaysOfWeek,
  getUpdatedExpression,
  getDayOfWeekStr,
  getMilitaryHours
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
          <Text className={css.label}> {getString('pipeline.triggers.schedulePanel.runOn')}</Text>
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
                    visibility: selectedDaysOfWeek.includes(day) ? 'visible' : 'hidden'
                  }}
                  className={css.checked}
                  size={16}
                  name="execution-success"
                />
                <Text>
                  {getString(
                    `pipeline.triggers.schedulePanel.${day}` as StringKeys /* TODO: fix this by using a map */
                  )}
                </Text>
              </Layout.Horizontal>
            </Button>
          ))}
          <TimeSelect
            label={getString('pipeline.triggers.schedulePanel.runAt')}
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
