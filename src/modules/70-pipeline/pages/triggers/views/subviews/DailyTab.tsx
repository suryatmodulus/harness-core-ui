import React, { useState } from 'react'
import { FormInput, Text, Container, Color, Layout, Icon, Button } from '@wings-software/uicore'
import cx from 'classnames'
import { TimeSelect } from '@common/components'
import { useStrings } from 'framework/exports'
import ExpressionBreakdown, { ActiveInputs } from './ExpressionBreakdown'
import Expression from './Expression'
import Spacer from './Spacer'
import {
  oneThirtyOneOptions,
  AmPmMap,
  defaultDailyNthDaysValues,
  getCronExpression,
  defaultDailyEveryWeekDayValues,
  getUpdatedExpression,
  DailyTypes,
  getPmHours,
  defaultScheduleValues,
  getBackslashValue
} from './ScheduleUtils'
import css from './DailyTab.module.scss'

interface DailyTabInterface {
  formikProps: any
}

interface DailyValuesInterface {
  hours?: string
  minutes?: string
  amPm?: string
  dayOfMonth?: string
}

const getDailyTimeValue = ({
  isActiveType,
  persistedValue,
  formikValue,
  defaultValue
}: {
  isActiveType: boolean
  persistedValue?: string
  formikValue?: string
  defaultValue: string
}): string => {
  const res = (isActiveType ? formikValue : persistedValue) || defaultValue
  return res
}

export default function DailyTab(props: DailyTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { minutes, hours, amPm, dayOfMonth, dailyRadios, expression, selectedScheduleTab },
      values
    },
    formikProps
  } = props
  const [dailyType, setDailyType] = useState<DailyTypes>(
    expression?.includes(defaultScheduleValues.MON_TO_FRI) ? DailyTypes.EVERY_WEEK_DAY : DailyTypes.NTH_DAYS
  )
  const [persistedValues, setPersistedValues] = useState<{
    NTH_DAYS: DailyValuesInterface
    EVERY_WEEK_DAY: DailyValuesInterface
  }>({ NTH_DAYS: defaultDailyNthDaysValues, EVERY_WEEK_DAY: defaultDailyEveryWeekDayValues })
  const {
    NTH_DAYS: { minutes: persistedNthDaysMinutes, hours: persistedNthDaysHours, amPm: persistedNthDaysAmPm },
    EVERY_WEEK_DAY: { minutes: persistedWeekdayMinutes, hours: persistedWeekdayHours, amPm: persistedWeekdayAmPm }
  } = persistedValues
  const { getString } = useStrings()

  // default values
  const { minutes: nthDayMinutes, hours: nthDayHours, amPm: nthDayAmPm } = dailyRadios?.NTH_DAYS || {}
  const { minutes: weekdayMinutes, hours: weekdayHours, amPm: weekdayAmPm } = dailyRadios?.EVERY_WEEK_DAY || {}

  return (
    <div className={css.dailyTab}>
      <Layout.Vertical style={{ alignItems: 'flex-start' }}>
        <Container
          className={cx(css.radioContainer, dailyType === DailyTypes.NTH_DAYS ? css.activeRadio : css.inactiveRadio)}
        >
          <Button
            minimal
            onClick={() => {
              const newFormikValues = { ...values, ...defaultDailyNthDaysValues, ...persistedValues.NTH_DAYS }
              const newCronExpression = getCronExpression(newFormikValues)
              setDailyType(DailyTypes.NTH_DAYS)
              setPersistedValues({ ...persistedValues, EVERY_WEEK_DAY: { minutes, hours, amPm, dayOfMonth } })
              formikProps.setValues({
                ...newFormikValues,
                expression: newCronExpression
              })
            }}
          >
            <Layout.Horizontal spacing="medium">
              <Icon name={dailyType === DailyTypes.NTH_DAYS ? 'selection' : 'circle'} />
              <Text className={css.radioOption}>{getString('pipeline-triggers.schedulePanel.runEvery')}</Text>
            </Layout.Horizontal>
          </Button>
          <Layout.Horizontal className={css.everyContainer} spacing="medium">
            <FormInput.Select
              name="dayOfMonth"
              items={oneThirtyOneOptions}
              disabled={dailyType !== DailyTypes.NTH_DAYS}
              placeholder="Select"
              onChange={option => {
                formikProps.setValues({
                  ...values,
                  dayOfMonth: option.value,
                  expression: getUpdatedExpression({
                    expression,
                    id: 'dayOfMonth',
                    value: getBackslashValue({ selectedScheduleTab, id: 'dayOfMonth', value: option.value as string })
                  })
                })
              }}
            />
            <Text style={{ marginBottom: 'var(--spacing-medium)' }} color={Color.GREY_800}>
              {getString('pipeline-triggers.schedulePanel.daysParentheses')}
            </Text>
          </Layout.Horizontal>
          <TimeSelect
            label={getString('pipeline-triggers.schedulePanel.runAt')}
            className={css.everyContainer}
            disabled={dailyType !== DailyTypes.NTH_DAYS}
            hoursValue={getDailyTimeValue({
              isActiveType: dailyType === DailyTypes.NTH_DAYS,
              formikValue: hours,
              persistedValue: persistedNthDaysHours,
              defaultValue: nthDayHours
            })}
            minutesValue={getDailyTimeValue({
              isActiveType: dailyType === DailyTypes.NTH_DAYS,
              formikValue: minutes,
              persistedValue: persistedNthDaysMinutes,
              defaultValue: nthDayMinutes
            })}
            amPmValue={getDailyTimeValue({
              isActiveType: dailyType === DailyTypes.NTH_DAYS,
              formikValue: amPm,
              persistedValue: persistedNthDaysAmPm,
              defaultValue: nthDayAmPm
            })}
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
        <Spacer marginLeft="var(--spacing-xxxlarge)" width="675px" />
        <Container
          style={{ paddingTop: 'var(--spacing-small)' }}
          className={cx(
            css.radioContainer,
            dailyType === DailyTypes.EVERY_WEEK_DAY ? css.activeRadio : css.inactiveRadio
          )}
        >
          <Button
            minimal
            onClick={() => {
              const newFormikValues = {
                ...values,
                ...defaultDailyEveryWeekDayValues,
                ...persistedValues.EVERY_WEEK_DAY
              }
              const newCronExpression = getCronExpression(newFormikValues)
              setDailyType(DailyTypes.EVERY_WEEK_DAY)
              setPersistedValues({ ...persistedValues, NTH_DAYS: { minutes, hours, amPm, dayOfMonth } })
              formikProps.setValues({
                ...newFormikValues,
                expression: newCronExpression
              })
            }}
          >
            <Layout.Horizontal>
              <Icon
                style={{ marginRight: 'var(--spacing-medium)' }}
                name={dailyType === DailyTypes.EVERY_WEEK_DAY ? 'selection' : 'circle'}
              />
              <>
                <Text className={css.radioOption} style={{ marginRight: 'var(--spacing-xsmall)' }}>
                  {getString('pipeline-triggers.schedulePanel.runEveryWeekday')}
                </Text>
                <Text>{getString('pipeline-triggers.schedulePanel.mondayToFridayParentheses')}</Text>
              </>
            </Layout.Horizontal>
          </Button>
          <TimeSelect
            label={getString('pipeline-triggers.schedulePanel.runAt')}
            className={css.everyContainer}
            disabled={dailyType === DailyTypes.NTH_DAYS}
            hoursValue={getDailyTimeValue({
              isActiveType: dailyType === DailyTypes.EVERY_WEEK_DAY,
              formikValue: hours,
              persistedValue: persistedWeekdayHours,
              defaultValue: weekdayHours
            })}
            minutesValue={getDailyTimeValue({
              isActiveType: dailyType === DailyTypes.EVERY_WEEK_DAY,
              formikValue: minutes,
              persistedValue: persistedWeekdayMinutes,
              defaultValue: weekdayMinutes
            })}
            amPmValue={getDailyTimeValue({
              isActiveType: dailyType === DailyTypes.EVERY_WEEK_DAY,
              formikValue: amPm,
              persistedValue: persistedWeekdayAmPm,
              defaultValue: weekdayAmPm
            })}
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
        <Spacer marginLeft="var(--spacing-xxxlarge)" width="675px" />
        <ExpressionBreakdown
          formikValues={values}
          activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS, ActiveInputs.DAY_OF_MONTH, ActiveInputs.DAY_OF_WEEK]}
        />
        <Spacer marginLeft="var(--spacing-xxxlarge)" width="675px" />
        <Expression formikProps={formikProps} />
      </Layout.Vertical>
    </div>
  )
}
