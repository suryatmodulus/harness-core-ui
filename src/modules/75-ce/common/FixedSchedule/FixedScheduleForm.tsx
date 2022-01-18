/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { TimePicker } from '@blueprintjs/datetime'
import { defaultTo as _defaultTo, isEmpty as _isEmpty } from 'lodash-es'
import * as Yup from 'yup'
import {
  Button,
  Color,
  Container,
  DateInput,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Label,
  Layout,
  Select,
  SelectOption,
  Text,
  PillToggle
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import DaysOfWeekSelector, { days as weekDays } from '@ce/common/DaysOfWeekSelector/DaysOfWeekSelector'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import {
  ALL_TIME_ZONES,
  getStaticSchedulePeriodString,
  getStaticSchedulePeriodTime,
  getUserTimeZone
} from '@ce/utils/momentUtils'
import type { FixedScheduleClient, ScheduleTime } from '@ce/components/COCreateGateway/models'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useValidateStaticScheduleList } from 'services/lw'
import { Utils } from '../Utils'
import { ScheduleDescription } from '../FixedSchedulesList/FixedSchedulesList'
import css from './FixedScheduleForm.module.scss'

interface FixedScheduleFormProps {
  schedule?: FixedScheduleClient
  closeDialog: () => void
  isEdit?: boolean
  addSchedule: (schedule: FixedScheduleClient) => void
}

const FixedScheduleForm: React.FC<FixedScheduleFormProps> = props => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo } = useAppStore()

  const [errorString, setErrorString] = useState<string>('')

  const { mutate: validateSchedules } = useValidateStaticScheduleList({ account_id: accountId })

  const getInitialValues = () => {
    return (
      props.schedule ||
      ({
        name: '',
        type: 'uptime',
        beginsOn: '',
        endsOn: '',
        startTime: null,
        endTime: null,
        allDay: false,
        repeats: [],
        everyday: false,
        timezone: getUserTimeZone(),
        isDeleted: false
      } as FixedScheduleClient)
    )
  }

  const getUpdatedScheduleData = (data: FixedScheduleClient) => {
    const updatedData = { ...data }
    if (data.everyday || !_isEmpty(data.repeats)) {
      const date = getTime(null)
      if (_isEmpty(data.startTime)) {
        updatedData.startTime = { hour: date.getHours(), min: date.getMinutes() }
      }
      if (_isEmpty(data.endTime)) {
        updatedData.endTime = { hour: date.getHours(), min: date.getMinutes() }
      }
    }
    return updatedData
  }

  const handleSubmit = async (data: FixedScheduleClient): Promise<FixedScheduleClient> => {
    const updatedData = getUpdatedScheduleData(data)
    try {
      await validateSchedules(
        {
          schedules: [
            Utils.convertScheduleClientToSchedule(updatedData, {
              accountId,
              userId: _defaultTo(currentUserInfo.uuid, ''),
              ruleId: 0
            })
          ]
        },
        {
          queryParams: { accountIdentifier: accountId }
        }
      )
      props.addSchedule(updatedData)
    } catch (e) {
      setErrorString(e?.data?.errors?.join('\n'))
    }
    return updatedData
  }

  const getTime = (timeVal: ScheduleTime | null) => {
    const date = new Date()
    date.setHours(_defaultTo(timeVal?.hour, 0))
    date.setMinutes(_defaultTo(timeVal?.min, 0))
    return date
  }

  return (
    <Layout.Vertical spacing="xlarge" className={css.fixedScheduleFormContainer}>
      <Heading color={Color.GREY_800} level={2}>
        {getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.newScheduleTitle')}
      </Heading>
      {!_isEmpty(errorString) && <Text className={css.errorDisplayContainer}>{errorString}</Text>}
      <Formik
        initialValues={getInitialValues()}
        enableReinitialize
        onSubmit={handleSubmit}
        formName={'newScheduleForm'}
        validationSchema={Yup.object().shape({
          name: Yup.string().max(25).required(),
          type: Yup.string().required(),
          repeats: Yup.array().when('beginsOn', {
            is: val => !val,
            then: Yup.array().min(1).required()
          })
        })}
      >
        {_formikProps => (
          <FormikForm>
            <Layout.Vertical spacing={'large'}>
              <FormInput.Text name="name" label="Name*" />
              <Container>
                <Label>{'Type*'}</Label>
                <PillToggle
                  selectedView={_formikProps.values.type}
                  options={[
                    {
                      label: getString(
                        'ce.co.autoStoppingRule.configuration.step4.tabs.schedules.uptime'
                      ).toUpperCase(),
                      value: getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.uptime')
                    },
                    {
                      label: getString(
                        'ce.co.autoStoppingRule.configuration.step4.tabs.schedules.downtime'
                      ).toUpperCase(),
                      value: getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.downtime')
                    }
                  ]}
                  onChange={val => {
                    _formikProps.setFieldValue('type', val)
                  }}
                  className={css.typeToggle}
                />
              </Container>
              <Container>
                <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
                  <div>
                    <Label>{getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.beginsOn')}</Label>
                    <DateInput
                      timePrecision="minute"
                      disabled={true}
                      dateProps={{
                        timePickerProps: { useAmPm: true },
                        minDate: new Date()
                      }}
                      value={
                        _formikProps.values.beginsOn
                          ? `${getStaticSchedulePeriodTime(_formikProps.values.beginsOn)}`
                          : undefined
                      }
                      onChange={(value, _err) => {
                        _formikProps.setFieldValue('beginsOn', getStaticSchedulePeriodString(Number(value)))
                      }}
                      data-testid="beginsOn"
                    />
                  </div>
                  <div>
                    <Label>{getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.endsOn')}</Label>
                    <DateInput
                      timePrecision="minute"
                      disabled={true}
                      dateProps={{
                        timePickerProps: { useAmPm: true },
                        defaultValue: !_isEmpty(_formikProps.values.beginsOn)
                          ? new Date(_formikProps.values.beginsOn)
                          : new Date(),
                        minDate: !_isEmpty(_formikProps.values.beginsOn)
                          ? new Date(_formikProps.values.beginsOn)
                          : new Date()
                      }}
                      value={
                        _formikProps.values.endsOn
                          ? `${getStaticSchedulePeriodTime(_formikProps.values.endsOn)}`
                          : undefined
                      }
                      onChange={(value, _err) => {
                        _formikProps.setFieldValue('endsOn', getStaticSchedulePeriodString(Number(value)))
                      }}
                      data-testid="endsOn"
                    />
                  </div>
                </Layout.Horizontal>
              </Container>

              <Container>
                <Label>{getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.repeats')}</Label>
                <DaysOfWeekSelector
                  selection={_formikProps.values.repeats}
                  onChange={days => {
                    _formikProps.setFieldValue(
                      'repeats',
                      days.map(d => d.id)
                    )
                    _formikProps.setFieldValue('everyday', days.length === 7)
                    if (days.length === 0) {
                      _formikProps.setFieldValue('startTime', null)
                      _formikProps.setFieldValue('endTime', null)
                      _formikProps.setFieldValue('allDay', false)
                    }
                  }}
                />
                <div className={css.allDayCheckbox}>
                  <FormInput.CheckBox
                    name={'everyday'}
                    label={getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.everyday')}
                    onChange={e => {
                      if (e.currentTarget.checked) {
                        _formikProps.setFieldValue(
                          'repeats',
                          weekDays.map(d => d.id)
                        )
                      } else {
                        _formikProps.setFieldValue('repeats', [])
                        _formikProps.setFieldValue('startTime', null)
                        _formikProps.setFieldValue('endTime', null)
                        _formikProps.setFieldValue('allDay', false)
                      }
                    }}
                  />
                </div>
              </Container>
              {(_formikProps.values.everyday || !_isEmpty(_formikProps.values.repeats)) && (
                <Container>
                  <Label>{'Time'}</Label>
                  <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }} spacing="medium">
                    <TimePicker
                      useAmPm
                      value={getTime(_formikProps.values.startTime)}
                      disabled={_formikProps.values.allDay}
                      onChange={d => {
                        _formikProps.setFieldValue('startTime', { hour: d.getHours(), min: d.getMinutes() })
                      }}
                    />
                    <Text>{'to'}</Text>
                    <TimePicker
                      useAmPm
                      value={getTime(_formikProps.values.endTime)}
                      disabled={_formikProps.values.allDay}
                      onChange={d => {
                        _formikProps.setFieldValue('endTime', { hour: d.getHours(), min: d.getMinutes() })
                        if (_isEmpty(_formikProps.values.startTime)) {
                          _formikProps.setFieldValue('startTime', { hour: 0, min: 0 })
                        }
                      }}
                    />
                  </Layout.Horizontal>
                  <div className={css.allDayCheckbox}>
                    <FormInput.CheckBox
                      name={'allDay'}
                      label={getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.allDay')}
                    />
                  </div>
                </Container>
              )}
              <Container>
                <Label>{getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.timezone')}</Label>
                <TimeZonesSelect
                  value={_formikProps.values.timezone}
                  onChange={d => {
                    _formikProps.setFieldValue('timezone', d)
                  }}
                />
              </Container>
            </Layout.Vertical>
            {(_formikProps.values.beginsOn || !_isEmpty(_formikProps.values.repeats)) && (
              <ScheduleDescription schedule={getUpdatedScheduleData(_formikProps.values)} />
            )}
            <Layout.Horizontal className={css.ctaContainer} spacing="medium">
              <Button
                text={getString('common.apply')}
                intent="primary"
                // onClick={_formikProps.submitForm}
                type="submit"
              />
              <Button text={getString('cancel')} onClick={props.closeDialog} />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

interface TimeZonesSelectProps {
  value?: string
  onChange: (timezone: string) => void
}

const TimeZonesSelect: React.FC<TimeZonesSelectProps> = props => {
  const [data, setData] = useState<SelectOption[]>([])
  const value = props.value ? { label: props.value, value: props.value } : null

  useEffect(() => {
    const filteredData = ALL_TIME_ZONES.map(d => ({ label: d, value: d }))
    setData(filteredData)
  }, [])

  return <Select value={value} items={data} onChange={d => props.onChange?.(d.value as string)} />
}

export default FixedScheduleForm
