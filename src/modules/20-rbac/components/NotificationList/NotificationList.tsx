/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import {
  Button,
  ButtonVariation,
  Container,
  Formik,
  FormInput,
  Icon,
  Layout,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { Form, FormikProps } from 'formik'
import produce from 'immer'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { NotificationSettingConfigDTO, usePutUserGroup, UserGroupDTO } from 'services/cd-ng'
import { TestEmailNotifications } from '@notifications/modals/ConfigureNotificationsModal/views/ConfigureEmailNotifications/ConfigureEmailNotifications'
import { TestPagerDutyNotifications } from '@notifications/modals/ConfigureNotificationsModal/views/ConfigurePagerDutyNotifications/ConfigurePagerDutyNotifications'
import { TestSlackNotifications } from '@notifications/modals/ConfigureNotificationsModal/views/ConfigureSlackNotifications/ConfigureSlackNotifications'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { TestMSTeamsNotifications } from '@notifications/modals/ConfigureNotificationsModal/views/ConfigureMSTeamsNotifications/ConfigureMSTeamsNotifications'
import { getNotificationByConfig } from '@notifications/Utils/Utils'
import { EmailSchema, URLValidationSchema } from '@common/utils/Validation'
import css from './NotificationList.module.scss'

interface NotificationListProps {
  userGroup: UserGroupDTO
  onSubmit: () => void
}

interface RowData extends NotificationSettingConfigDTO {
  groupEmail?: string
  recipient?: string
  slackWebhookUrl?: string
  pagerDutyKey?: string
  msTeamKeys?: string
}
export interface NotificationOption {
  label: string
  value: NonNullable<NotificationSettingConfigDTO['type']>
}

interface FieldDetails {
  name: keyof RowData
  textPlaceholder: string
}

interface ChannelRow {
  data: NotificationSettingConfigDTO | null
  userGroup: UserGroupDTO
  onSubmit: () => void
  options: SelectOption[]
  onRowDelete?: () => void
  notificationItems: SelectOption[]
}

const ChannelRow: React.FC<ChannelRow> = ({ data, userGroup, onSubmit, notificationItems, options, onRowDelete }) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [isCreate, setIsCreate] = useState<boolean>(data ? false : true)
  const { getString } = useStrings()
  const [edit, setEdit] = useState<boolean>(false)
  const enableEdit = isCreate || edit
  const { showSuccess, showError } = useToaster()

  const { mutate: updateNotifications, loading } = usePutUserGroup({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const getFieldDetails = (type: NotificationSettingConfigDTO['type']): FieldDetails => {
    switch (type) {
      case 'EMAIL':
        return {
          name: 'groupEmail',
          textPlaceholder: getString('notifications.emailOrAlias')
        }
      case 'SLACK':
        return {
          name: 'slackWebhookUrl',
          textPlaceholder: getString('notifications.labelWebhookUrl')
        }
      case 'PAGERDUTY':
        return {
          name: 'pagerDutyKey',
          textPlaceholder: getString('notifications.labelPagerDuty')
        }
      case 'MSTEAMS':
        return {
          name: 'msTeamKeys',
          textPlaceholder: getString('notifications.labelMSTeam')
        }
      default:
        return {
          name: 'recipient',
          textPlaceholder: ''
        }
    }
  }

  const handleSubmit = async (values: RowData): Promise<void> => {
    const recipient = getFieldDetails(values.type).name
    if (isCreate) {
      userGroup.notificationConfigs?.push({
        type: values.type,
        [recipient]: values[recipient]
      })
    }
    if (edit) {
      userGroup.notificationConfigs = userGroup.notificationConfigs?.map(val => {
        return val.type === values.type ? values : val
      })
    }
    try {
      const edited = await updateNotifications(userGroup)
      /* istanbul ignore else */ if (edited) {
        showSuccess(getString('rbac.updateNotificationSuccess'))
        onSubmit()
        setEdit(false)
        setIsCreate(false)
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.data?.message || e.message)
    }
  }

  const handleTest = async (formikProps: FormikProps<RowData>): Promise<boolean> => {
    const errors = await formikProps.validateForm()
    if (Object.keys(errors).length) {
      formikProps.setFieldTouched(getFieldDetails(formikProps.values.type).name, true)
      return false
    }
    return true
  }

  const handleDelete = async (values: RowData): Promise<void> => {
    userGroup.notificationConfigs = userGroup.notificationConfigs?.filter(val => val.type != values.type)
    try {
      const deleted = await updateNotifications(userGroup)
      /* istanbul ignore else */ if (deleted) {
        showSuccess(getString('rbac.updateNotificationSuccess'))
        onSubmit()
        setEdit(false)
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.data?.message || e.message)
    }
  }

  return (
    <>
      <Formik<RowData>
        initialValues={{ ...data }}
        validationSchema={Yup.object().shape({
          type: Yup.string().required(),
          groupEmail: Yup.string().when(['type'], {
            is: 'EMAIL',
            then: EmailSchema()
          }),
          slackWebhookUrl: Yup.string().when(['type'], {
            is: 'SLACK',
            then: URLValidationSchema()
          }),
          pagerDutyKey: Yup.string().when(['type'], {
            is: 'PAGERDUTY',
            then: Yup.string().trim().required(getString('notifications.validationPDKey'))
          }),
          msTeamKeys: Yup.string().when(['type'], {
            is: 'MSTEAMS',
            then: URLValidationSchema()
          })
        })}
        formName="NotificationForm"
        onSubmit={values => {
          handleSubmit(values)
        }}
      >
        {formikProps => {
          return (
            <Form>
              <Layout.Horizontal spacing="small" className={cx(css.card, { [css.centerAlign]: !enableEdit })}>
                {enableEdit ? (
                  <>
                    <Container width="35%">
                      <FormInput.Select
                        name="type"
                        placeholder={getString('common.selectAChannel')}
                        items={edit ? options : notificationItems}
                        disabled={edit}
                      />
                    </Container>
                    <Container width="40%">
                      <FormInput.Text
                        name={getFieldDetails(formikProps.values.type).name}
                        placeholder={getFieldDetails(formikProps.values.type).textPlaceholder}
                      />
                    </Container>
                  </>
                ) : (
                  <>
                    <Container width="35%">
                      <Layout.Horizontal spacing="small">
                        <Icon name={getNotificationByConfig(data).icon} />
                        <Text>{getNotificationByConfig(data).label}</Text>
                      </Layout.Horizontal>
                    </Container>
                    <Container width="40%">
                      <Text lineClamp={1} className={css.overflow}>
                        {getNotificationByConfig(data).value}
                      </Text>
                    </Container>
                  </>
                )}
                <Container width="25%">
                  <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} spacing="xsmall">
                    {formikProps.values.type == 'EMAIL' ? (
                      <TestEmailNotifications
                        onClick={() => handleTest(formikProps)}
                        buttonProps={{
                          minimal: true
                        }}
                      />
                    ) : null}
                    {formikProps.values.type == 'SLACK' ? (
                      <TestSlackNotifications
                        data={formikProps.values as any}
                        onClick={() => handleTest(formikProps)}
                        buttonProps={{
                          minimal: true
                        }}
                      />
                    ) : null}
                    {formikProps.values.type == 'PAGERDUTY' ? (
                      <TestPagerDutyNotifications
                        data={formikProps.values as any}
                        onClick={() => handleTest(formikProps)}
                        buttonProps={{
                          minimal: true
                        }}
                      />
                    ) : null}
                    {formikProps.values.type == 'MSTEAMS' ? (
                      <TestMSTeamsNotifications
                        data={formikProps.values as any}
                        buttonProps={{
                          minimal: true
                        }}
                        errors={{}}
                        onClick={() => handleTest(formikProps)}
                      />
                    ) : null}
                    {enableEdit ? (
                      <Button text={getString('save')} minimal type="submit" disabled={loading} />
                    ) : (
                      <>
                        <Button icon="edit" minimal onClick={() => setEdit(true)} className={css.button} />
                        <Button
                          icon="trash"
                          minimal
                          onClick={() => handleDelete(formikProps.values)}
                          className={css.button}
                        />
                      </>
                    )}
                    {isCreate ? (
                      <Button icon="trash" minimal onClick={() => onRowDelete?.()} className={css.button} />
                    ) : null}
                  </Layout.Horizontal>
                </Container>
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </>
  )
}

const NotificationList: React.FC<NotificationListProps> = ({ userGroup, onSubmit }) => {
  const notifications = userGroup.notificationConfigs
  const [values, setValues] = useState<(NotificationSettingConfigDTO | null)[]>(notifications || [])
  const { getString } = useStrings()

  const EmailNotification: NotificationOption = {
    label: getString('notifications.emailOrAlias'),
    value: 'EMAIL'
  }

  const SlackNotification: NotificationOption = {
    label: getString('notifications.labelWebhookUrl'),
    value: 'SLACK'
  }

  const PDNotification: NotificationOption = {
    label: getString('notifications.labelPagerDuty'),
    value: 'PAGERDUTY'
  }

  const MSNotification: NotificationOption = {
    label: getString('notifications.labelMSTeam'),
    value: 'MSTEAMS'
  }

  const options = [EmailNotification, SlackNotification, PDNotification, MSNotification]

  const getNotificationOption = (type: NotificationSettingConfigDTO['type']): NotificationOption => {
    switch (type) {
      case 'EMAIL':
        return EmailNotification
      case 'SLACK':
        return SlackNotification
      case 'PAGERDUTY':
        return PDNotification
      case 'MSTEAMS':
        return MSNotification
      default:
        return EmailNotification
    }
  }

  const onRowDelete = (index: number): void => {
    setValues(
      produce(values, draft => {
        draft.splice(index, 1)
      })
    )
  }

  const getNotificationItems = (): SelectOption[] => {
    const existingOptions = values?.map(value => (value?.type ? getNotificationOption(value.type) : null))
    return options.filter(val => !existingOptions.includes(val))
  }

  return (
    <>
      {values?.map((item, index) => (
        <div key={index}>
          <ChannelRow
            data={item}
            onSubmit={onSubmit}
            onRowDelete={() => onRowDelete(index)}
            notificationItems={getNotificationItems()}
            options={options}
            userGroup={userGroup}
          />
        </div>
      ))}
      <Layout.Horizontal padding={{ top: 'small' }}>
        {values.length < 4 && !values.includes(null) ? (
          <Button
            text={getString('plusNumber', { number: getString('common.channel') })}
            data-testid="addChannel"
            variation={ButtonVariation.LINK}
            onClick={() => {
              setValues(
                produce(values, draft => {
                  draft.push(null)
                })
              )
            }}
          />
        ) : null}
      </Layout.Horizontal>
    </>
  )
}

export default NotificationList
