import React, { useState } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { FormikForm, FormInput, Button, Layout, Container, Icon, Heading } from '@wings-software/uicore'
import { Popover, Spinner } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { useToaster } from '@common/components'
import type { EmailNotificationConfiguration } from '@notifications/interfaces/Notifications'
import { TestStatus } from '@notifications/interfaces/Notifications'
import { NotificationType } from '@notifications/interfaces/Notifications'
import { useTestNotificationSetting, EmailSettingDTO } from 'services/notifications'
import { useStrings } from 'framework/exports'
import i18n from '../../ConfigureNotifications.i18n'
import css from '../../ConfigureNotificationsModal.module.scss'

interface EmailTestConfigData {
  to: string
  subject: string
  body: string
}

interface ConfigureEmailNotificationsProps {
  onSuccess: (notificationConfiguration: EmailNotificationConfiguration) => void
  hideModal: () => void
  isStep?: boolean
  onBack?: (config?: EmailNotificationConfiguration) => void
  withoutHeading?: boolean
  submitButtonText?: string
  config?: EmailNotificationConfiguration
}

interface TestEmailConfigProps {
  handleTest: (formData: EmailTestConfigData) => void
}

export const TestEmailConfig: React.FC<TestEmailConfigProps> = props => {
  const handleSubmit = (_formData: EmailTestConfigData): void => {
    props.handleTest(_formData)
    // call test api
  }

  return (
    <Container padding={'large'}>
      <Formik<EmailTestConfigData>
        onSubmit={handleSubmit}
        validationSchema={Yup.object().shape({
          to: Yup.string().trim().required(i18n.validationTo),
          subject: Yup.string().trim().required(i18n.validationSubject),
          body: Yup.string().trim().required(i18n.validationBody)
        })}
        initialValues={{
          to: '',
          subject: '',
          body: ''
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <FormInput.Text name={'to'} label={i18n.labelTo} />
              <FormInput.Text name={'subject'} label={i18n.labelSubject} />
              <FormInput.Text name={'body'} label={i18n.labelBody} />
              <Button
                text={i18n.buttonSend}
                onClick={event => {
                  event.stopPropagation()
                  formik.submitForm()
                }}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

interface EmailNotificationData {
  emailIds: string
  userGroups: string[]
}

const ConfigureEmailNotifications: React.FC<ConfigureEmailNotificationsProps> = props => {
  const [isOpen, setIsOpen] = useState(false)
  const { accountId }: any = useParams()
  const { getString } = useStrings()
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.INIT)
  const { showSuccess, showError } = useToaster()

  const { mutate: testNotificationSetting, loading } = useTestNotificationSetting({})

  const handleTest = async (testData: EmailTestConfigData): Promise<void> => {
    setIsOpen(false)
    setTestStatus(TestStatus.LOADING)
    try {
      const resp = await testNotificationSetting({
        accountId,
        type: 'EMAIL',
        recipient: testData.to,
        notificationId: 'asd',
        subject: testData.subject,
        body: testData.body
      } as EmailSettingDTO)
      if (resp.status === 'SUCCESS' && resp.data) {
        showSuccess(getString('pipeline-notifications.emailTestSuccess'))
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

  const handleSubmit = (formData: EmailNotificationData): void => {
    props.onSuccess(convertFormData(formData))
    props.hideModal()
  }

  const convertFormData = (formData: EmailNotificationData) => {
    return {
      type: NotificationType.Email,
      emailIds: formData.emailIds
        .split(',')
        .map(email => email.trim())
        .filter(email => email),
      userGroups: formData.userGroups
    }
  }
  return (
    <div className={css.body}>
      <Layout.Vertical spacing="large">
        {props.withoutHeading ? null : <Heading className={css.title}>{i18n.titleEmail}</Heading>}
        <Formik
          onSubmit={handleSubmit}
          validationSchema={Yup.object().shape({
            emailIds: Yup.string().trim().required()
          })}
          initialValues={{
            emailIds: props.config?.emailIds.toString() || '',
            userGroups: props.config?.userGroups || []
          }}
          enableReinitialize={true}
        >
          {formik => {
            return (
              <FormikForm>
                <FormInput.TextArea name={'emailIds'} label={i18n.labelEmailIds} />
                <FormInput.MultiInput
                  name={'userGroups'}
                  label={i18n.labelEmailUserGroups}
                  tagsProps={{ placeholder: getString('pipeline-notifications.userGroupsPlaceholder') }}
                />
                <Layout.Horizontal style={{ alignItems: 'center' }}>
                  <Popover isOpen={isOpen} onInteraction={setIsOpen}>
                    <Button
                      text={loading ? <Spinner size={Spinner.SIZE_SMALL} /> : i18n.buttonTest}
                      disabled={loading}
                    />
                    <TestEmailConfig handleTest={handleTest} />
                  </Popover>
                  {testStatus === TestStatus.SUCCESS ? (
                    <Icon name="tick" className={cx(css.statusIcon, css.green)} />
                  ) : null}
                  {testStatus === TestStatus.FAILED || testStatus === TestStatus.ERROR ? (
                    <Icon name="cross" className={cx(css.statusIcon, css.red)} />
                  ) : null}
                </Layout.Horizontal>
                {props.isStep ? (
                  <Layout.Horizontal spacing="medium" margin={{ top: 'huge' }}>
                    <Button
                      text={getString('back')}
                      onClick={() => {
                        props.onBack?.(convertFormData(formik.values))
                      }}
                    />
                    <Button text={props.submitButtonText || getString('next')} intent="primary" type="submit" />
                  </Layout.Horizontal>
                ) : (
                  <Layout.Horizontal spacing={'medium'} margin={{ top: 'huge' }}>
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

export default ConfigureEmailNotifications
