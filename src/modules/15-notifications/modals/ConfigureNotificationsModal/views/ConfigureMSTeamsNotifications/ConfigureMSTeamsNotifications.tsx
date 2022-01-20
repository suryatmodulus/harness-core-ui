/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  FormikForm,
  FormInput,
  Button,
  Layout,
  Icon,
  Text,
  ButtonProps,
  Formik,
  ButtonVariation,
  getErrorInfoFromErrorObject
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, yupToFormErrors } from 'formik'
import { useToaster } from '@common/exports'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { MSTeamsNotificationConfiguration, NotificationType, TestStatus } from '@notifications/interfaces/Notifications'
import { useStrings } from 'framework/strings'
import { MSTeamSettingDTO, useTestNotificationSetting } from 'services/notifications'
import UserGroupsInput from '@common/components/UserGroupsInput/UserGroupsInput'

import css from '@notifications/modals/ConfigureNotificationsModal/ConfigureNotificationsModal.module.scss'

interface MSTeamsNotificationsData {
  msTeamKeys: string[]
  userGroups: string[]
}

interface ConfigureMSTeamsNotificationsProps {
  onSuccess: (config: MSTeamsNotificationConfiguration) => void
  hideModal: () => void
  withoutHeading?: boolean
  isStep?: boolean
  onBack?: (config?: MSTeamsNotificationConfiguration) => void
  submitButtonText?: string
  config?: MSTeamsNotificationConfiguration
}

export const TestMSTeamsNotifications: React.FC<{
  data: MSTeamsNotificationsData
  errors: FormikErrors<MSTeamsNotificationsData>
  onClick?: () => Promise<boolean>
  buttonProps?: ButtonProps
}> = ({ data, onClick, buttonProps, errors }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.INIT)
  const { mutate: testNotificationSetting } = useTestNotificationSetting({})
  const { showSuccess, showError } = useToaster()

  const handleTest = async (testData: MSTeamsNotificationsData): Promise<void> => {
    if (onClick) {
      const success = await onClick()
      if (!success) return
    }
    try {
      setTestStatus(TestStatus.INIT)
      const resp = await testNotificationSetting({
        accountId,
        type: 'MSTEAMS',
        recipient: testData.msTeamKeys?.join(','),
        notificationId: 'MSTeams'
      } as MSTeamSettingDTO)
      if (resp.status === 'SUCCESS' && resp.data) {
        showSuccess(getString('notifications.msTestSuccess'))
        setTestStatus(TestStatus.SUCCESS)
      } else {
        showError(getString('somethingWentWrong'))
        setTestStatus(TestStatus.FAILED)
      }
    } catch (err) {
      showError(getErrorInfoFromErrorObject(err))
      setTestStatus(TestStatus.ERROR)
    }
  }

  return (
    <>
      <Button
        text={getString('test')}
        disabled={Object.keys(errors).length > 0}
        onClick={() => handleTest(data)}
        {...buttonProps}
      />
      {testStatus === TestStatus.SUCCESS ? <Icon name="tick" className={cx(css.statusIcon, css.green)} /> : null}
      {testStatus === TestStatus.FAILED || testStatus === TestStatus.ERROR ? (
        <Icon name="cross" className={cx(css.statusIcon, css.red)} />
      ) : null}
    </>
  )
}

const ConfigureMSTeamsNotifications: React.FC<ConfigureMSTeamsNotificationsProps> = props => {
  const { getString } = useStrings()

  const handleSubmit = (formData: MSTeamsNotificationConfiguration): void => {
    props.onSuccess(formData)
  }

  return (
    <div className={css.body}>
      <Layout.Vertical spacing="large">
        <Text>{getString('notifications.helpMSTeams')}</Text>

        <a
          href="https://ngdocs.harness.io/article/xcb28vgn82-send-notifications-to-microsoft-teams"
          rel="noreferrer"
          target="_blank"
        >
          {getString('learnMore')}
        </a>
        <Formik<MSTeamsNotificationConfiguration>
          onSubmit={handleSubmit}
          formName="configureMSTeamsNotifications"
          validationSchema={Yup.object({
            msTeamKeys: Yup.array().test({
              test(value: string[]): boolean | Yup.ValidationError {
                if (!value) {
                  return this.createError({ message: getString('notifications.errors.msTeamUrlRequired') })
                }

                if (value.length === 0) {
                  return this.createError({ message: getString('notifications.errors.msTeamUrlRequired') })
                }
                const stringUrlSchema = Yup.object({
                  url: Yup.string().url(getString('notifications.errors.invalidUrl'))
                })
                try {
                  value.forEach(url => {
                    stringUrlSchema.validateSync({ url })
                  })
                } catch (e) {
                  /* istanbul ignore else */
                  if (e instanceof Yup.ValidationError) {
                    const err = yupToFormErrors<{ url: string }>(e)
                    return this.createError({ message: err.url })
                  }
                }

                return true
              }
            })
          })}
          initialValues={{
            msTeamKeys: [],
            userGroups: [],
            type: NotificationType.MsTeams,
            ...props.config
          }}
        >
          {formik => {
            return (
              <FormikForm>
                <FormInput.KVTagInput
                  label={getString('notifications.labelMSTeam')}
                  name={'msTeamKeys'}
                  isArray={true}
                  tagsProps={{ placeholder: getString('notifications.placeholderMSKeys') }}
                />
                <Layout.Horizontal margin={{ bottom: 'xxlarge' }} style={{ alignItems: 'center' }}>
                  <TestMSTeamsNotifications data={formik.values} errors={formik.errors} />
                </Layout.Horizontal>
                <UserGroupsInput name="userGroups" label={getString('notifications.labelMSTeamsUserGroups')} />
                {props.isStep ? (
                  <Layout.Horizontal spacing="large" className={css.buttonGroupSlack}>
                    <Button
                      text={getString('back')}
                      variation={ButtonVariation.SECONDARY}
                      onClick={() => {
                        props.onBack?.(formik.values)
                      }}
                    />
                    <Button
                      text={props.submitButtonText || getString('next')}
                      variation={ButtonVariation.PRIMARY}
                      type="submit"
                    />
                  </Layout.Horizontal>
                ) : (
                  <Layout.Horizontal spacing={'medium'} margin={{ top: 'xxlarge' }}>
                    <Button
                      type={'submit'}
                      variation={ButtonVariation.PRIMARY}
                      text={props.submitButtonText || getString('submit')}
                    />
                    <Button
                      text={getString('cancel')}
                      variation={ButtonVariation.SECONDARY}
                      onClick={props.hideModal}
                    />
                  </Layout.Horizontal>
                )}
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </div>
  )
}

export default ConfigureMSTeamsNotifications
