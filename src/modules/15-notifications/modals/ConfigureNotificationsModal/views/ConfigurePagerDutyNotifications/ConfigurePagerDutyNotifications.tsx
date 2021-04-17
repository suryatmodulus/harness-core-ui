import React, { useState } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { FormikForm, FormInput, Button, Layout, Icon, Text, Heading } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { useToaster } from '@common/components'
import { useStrings } from 'framework/exports'
import { useTestNotificationSetting, PagerDutySettingDTO } from 'services/notifications'
import type { PagerDutyNotificationConfiguration } from '@notifications/interfaces/Notifications'
import { TestStatus } from '@notifications/interfaces/Notifications'
import { NotificationType } from '@notifications/interfaces/Notifications'

import i18n from '../../ConfigureNotifications.i18n'
import css from '../../ConfigureNotificationsModal.module.scss'

interface ConfigurePagerDutyNotificationsProps {
  onSuccess: (config: PagerDutyNotificationConfiguration) => void
  hideModal: () => void
  isStep?: boolean
  withoutHeading?: boolean
  onBack?: () => void
  submitButtonText?: string
  config?: PagerDutyNotificationConfiguration
}

interface PagerDutyNotificationData {
  key: string
  userGroups: string[]
}

const ConfigurePagerDutyNotifications: React.FC<ConfigurePagerDutyNotificationsProps> = props => {
  const { accountId }: any = useParams()
  const { getString } = useStrings()
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.INIT)
  const { mutate: testNotificationSetting } = useTestNotificationSetting({})
  const { showSuccess, showError } = useToaster()

  const handleTest = async (testData: PagerDutyNotificationData): Promise<void> => {
    try {
      setTestStatus(TestStatus.INIT)
      const resp = await testNotificationSetting({
        accountId,
        type: 'PAGERDUTY',
        recipient: testData.key,
        notificationId: 'asd'
      } as PagerDutySettingDTO)
      if (resp.status === 'SUCCESS' && resp.data) {
        showSuccess(getString('pipeline-notifications.pagerDutyTestSuccess'))
        setTestStatus(TestStatus.SUCCESS)
      } else {
        showError(getString('somethingWentWrong'))
        setTestStatus(TestStatus.FAILED)
      }
    } catch (err) {
      showError(err.data.message)
      setTestStatus(TestStatus.ERROR)
    }
  }

  const handleSubmit = (formData: PagerDutyNotificationData): void => {
    props.onSuccess({
      type: NotificationType.PagerDuty,
      ...formData
    })
  }

  return (
    <div className={css.body}>
      <Layout.Vertical spacing="large">
        {props.withoutHeading ? null : (
          <>
            <Icon name="service-pagerduty" size={24} />
            <Heading className={css.title}>{i18n.titlePagerDuty}</Heading>
          </>
        )}
        <Text>{i18n.helpPagerDuty}</Text>
        <Text>{i18n.infoPagerDuty}</Text>
        <Formik
          onSubmit={handleSubmit}
          validationSchema={Yup.object().shape({
            key: Yup.string().trim().required(i18n.validationPDKey)
          })}
          initialValues={{
            key: '',
            userGroups: [],
            ...props.config
          }}
        >
          {formik => {
            return (
              <FormikForm>
                <FormInput.Text name={'key'} label={i18n.labelPDKey} />
                <Layout.Horizontal margin={{ bottom: 'xxlarge' }} style={{ alignItems: 'center' }}>
                  <Button text={i18n.buttonTest} onClick={() => handleTest(formik.values)} />
                  {testStatus === TestStatus.SUCCESS ? (
                    <Icon name="tick" className={cx(css.statusIcon, css.green)} />
                  ) : null}
                  {testStatus === TestStatus.FAILED || testStatus === TestStatus.ERROR ? (
                    <Icon name="cross" className={cx(css.statusIcon, css.red)} />
                  ) : null}
                </Layout.Horizontal>
                <FormInput.MultiInput
                  name={'userGroups'}
                  label={i18n.labelPDUserGroups}
                  tagsProps={{ placeholder: getString('pipeline-notifications.userGroupsPlaceholder') }}
                />
                {props.isStep ? (
                  <Layout.Horizontal spacing="medium" margin={{ top: 'xlarge' }}>
                    <Button text={getString('back')} onClick={props.onBack} />
                    <Button text={props.submitButtonText || getString('next')} intent="primary" type="submit" />
                  </Layout.Horizontal>
                ) : (
                  <Layout.Horizontal spacing={'medium'} margin={{ top: 'xxlarge' }}>
                    <Button type={'submit'} intent={'primary'} text={props.submitButtonText || i18n.buttonSubmit} />
                    <Button text={i18n.buttonCancel} onClick={props.hideModal} />
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

export default ConfigurePagerDutyNotifications
