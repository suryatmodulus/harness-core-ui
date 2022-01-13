import React, { useState } from 'react'
import { TimePicker } from '@blueprintjs/datetime'
import { Radio } from '@blueprintjs/core'
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
  Text,
  PillToggle
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import DaysOfWeekSelector from '@ce/common/DaysOfWeekSelector/DaysOfWeekSelector'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { getStaticSchedulePeriodString, getStaticSchedulePeriodTime, getUserTimeZone } from '@ce/utils/momentUtils'
import type { FixedScheduleClient, ScheduleTime } from '@ce/components/COCreateGateway/models'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useValidateStaticScheduleList } from 'services/lw'
import { Utils } from '../Utils'
import { ScheduleDescription } from '../FixedSchedulesList/FixedSchedulesList'
import TimezoneSelector from '../TimeZoneSelector/TimeZoneSelector'
import css from './FixedScheduleForm.module.scss'

interface FixedScheduleFormProps {
  schedule?: FixedScheduleClient
  closeDialog: () => void
  isEdit?: boolean
  addSchedule: (schedule: FixedScheduleClient) => void
}

interface DaysAndTimeSelectorProps {
  formikProps: FormikProps<FixedScheduleClient>
}

interface PeriodSelectionProps {
  formikProps: FormikProps<FixedScheduleClient>
}

const getTime = (timeVal: ScheduleTime | null) => {
  const date = new Date()
  date.setHours(_defaultTo(timeVal?.hour, 0))
  date.setMinutes(_defaultTo(timeVal?.min, 0))
  return date
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
        allDay: true,
        repeats: [],
        everyday: true,
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
              <Container className={css.inputRow}>
                <Layout.Horizontal spacing={'large'}>
                  <Container style={{ flex: 1 }}>
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
                  <Container style={{ flex: 1 }}>
                    <Label>{'Timezone*'}</Label>
                    <TimezoneSelector
                      onTimezoneSelect={val => {
                        _formikProps.setFieldValue('timezone', val)
                      }}
                      timezone={_formikProps.values.timezone}
                    />
                  </Container>
                </Layout.Horizontal>
              </Container>
              <PeriodSelection formikProps={_formikProps} />
              <DaysAndTimeSelector formikProps={_formikProps} />
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

const PeriodSelection = ({ formikProps }: PeriodSelectionProps) => {
  const { getString } = useStrings()
  return (
    <Container className={css.inputRow}>
      <Heading level={3} className={css.heading}>
        {getString('ce.co.gatewayConfig.setSchedulePeriodHeader')}
      </Heading>
      <Layout.Horizontal spacing={'large'}>
        <div style={{ flex: 1 }}>
          <Label>{getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.beginsOn')}</Label>
          <DateInput
            timePrecision="minute"
            disabled={true}
            dateProps={{
              timePickerProps: { useAmPm: true },
              minDate: new Date()
            }}
            value={
              formikProps.values.beginsOn ? `${getStaticSchedulePeriodTime(formikProps.values.beginsOn)}` : undefined
            }
            onChange={(value, _err) => {
              formikProps.setFieldValue('beginsOn', getStaticSchedulePeriodString(Number(value)))
            }}
            data-testid="beginsOn"
          />
        </div>
        <div style={{ flex: 1 }}>
          <Label>{getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.endsOn')}</Label>
          <DateInput
            timePrecision="minute"
            disabled={true}
            dateProps={{
              timePickerProps: { useAmPm: true },
              defaultValue: !_isEmpty(formikProps.values.beginsOn) ? new Date(formikProps.values.beginsOn) : new Date(),
              minDate: !_isEmpty(formikProps.values.beginsOn) ? new Date(formikProps.values.beginsOn) : new Date()
            }}
            value={formikProps.values.endsOn ? `${getStaticSchedulePeriodTime(formikProps.values.endsOn)}` : undefined}
            onChange={(value, _err) => {
              formikProps.setFieldValue('endsOn', getStaticSchedulePeriodString(Number(value)))
            }}
            data-testid="endsOn"
          />
        </div>
      </Layout.Horizontal>
      <FormInput.CheckBox name={'neverEnds'} label={'Never ends'} />
    </Container>
  )
}

const DaysAndTimeSelector = ({ formikProps }: DaysAndTimeSelectorProps) => {
  const { getString } = useStrings()

  return (
    <Container>
      <Heading level={3} className={css.heading}>
        {getString('ce.co.gatewayConfig.setScheduleTimeHeader')}
      </Heading>
      <Layout.Horizontal spacing="large">
        <Container style={{ flex: 1 }}>
          <Label>{getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.repeats')}</Label>
          <Radio
            label={getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.everyday')}
            value="everyday"
            checked={formikProps.values.everyday}
            onChange={_ => {
              formikProps.setFieldValue('everyday', true)
              formikProps.setFieldValue('repeats', [])
            }}
          />
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }}>
            <Radio
              label=""
              value="somedays"
              checked={!formikProps.values.everyday}
              onChange={_ => formikProps.setFieldValue('everyday', false)}
            />
            <DaysOfWeekSelector
              disable={formikProps.values.everyday}
              selection={formikProps.values.repeats}
              onChange={days => {
                formikProps.setFieldValue(
                  'repeats',
                  days.map(d => d.id)
                )
                formikProps.setFieldValue('everyday', days.length === 7)
                if (days.length === 0) {
                  formikProps.setFieldValue('startTime', null)
                  formikProps.setFieldValue('endTime', null)
                  // formikProps.setFieldValue('allDay', false)
                }
              }}
            />
          </Layout.Horizontal>
        </Container>
        <Container style={{ flex: 1 }}>
          <Label>{'Time'}</Label>
          <Radio
            label={getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.allDay')}
            value={'allDay'}
            checked={formikProps.values.allDay}
            onChange={_ => formikProps.setFieldValue('allDay', true)}
          />
          <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'start' }}>
            <Radio
              label=""
              value={'sometime'}
              checked={!formikProps.values.allDay}
              onChange={_ => formikProps.setFieldValue('allDay', false)}
            />
            <Container>
              <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }}>
                <Text>{'from'}</Text>
                <TimePicker
                  useAmPm
                  value={getTime(formikProps.values.startTime)}
                  disabled={formikProps.values.allDay}
                  onChange={d => {
                    formikProps.setFieldValue('startTime', { hour: d.getHours(), min: d.getMinutes() })
                  }}
                />
              </Layout.Horizontal>
              <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }}>
                <Text>{'to'}</Text>
                <TimePicker
                  useAmPm
                  value={getTime(formikProps.values.endTime)}
                  disabled={formikProps.values.allDay}
                  onChange={d => {
                    formikProps.setFieldValue('endTime', { hour: d.getHours(), min: d.getMinutes() })
                    if (_isEmpty(formikProps.values.startTime)) {
                      formikProps.setFieldValue('startTime', { hour: 0, min: 0 })
                    }
                  }}
                />
              </Layout.Horizontal>
            </Container>
          </Layout.Horizontal>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export default FixedScheduleForm
