import React, { useState } from 'react'
import { useParams } from 'react-router'
import cx from 'classnames'
import { Button, ButtonProps, Icon } from '@wings-software/uicore'
import { useToaster } from '@common/exports'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { TestStatus } from '@notifications/interfaces/Notifications'
import { useStrings } from 'framework/strings'
import { MSTeamSettingDTO, useTestNotificationSetting } from 'services/notifications'
import css from '@notifications/modals/ConfigureNotificationsModal/ConfigureNotificationsModal.module.scss'

interface MSTeamsNotificationsData {
  microsoftTeamsWebhookUrl: string
  userGroups: string[]
}

export const TestMSTeamsNotifications: React.FC<{
  data: MSTeamsNotificationsData
  onClick?: () => Promise<boolean>
  buttonProps?: ButtonProps
}> = ({ data, onClick, buttonProps }) => {
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
        recipient: testData.microsoftTeamsWebhookUrl,
        notificationId: 'asd'
      } as MSTeamSettingDTO)
      if (resp.status === 'SUCCESS' && resp.data) {
        showSuccess(getString('notifications.msTestSuccess'))
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

  return (
    <>
      <Button text={getString('test')} onClick={() => handleTest(data)} {...buttonProps} />
      {testStatus === TestStatus.SUCCESS ? <Icon name="tick" className={cx(css.statusIcon, css.green)} /> : null}
      {testStatus === TestStatus.FAILED || testStatus === TestStatus.ERROR ? (
        <Icon name="cross" className={cx(css.statusIcon, css.red)} />
      ) : null}
    </>
  )
}

const ConfigureMSTeamsNotifications: React.FC = () => {
  return <div>Configure MSTeams</div>
  // const { getString } = useStrings()

  // const handleSubmit = (formData: SlackNotificationData): void => {
  //   props.onSuccess(convertFormData(formData))
  // }

  // const convertFormData = (formData: SlackNotificationData) => {
  //   return {
  //     type: NotificationType.Slack,
  //     ...formData
  //   }
  // }

  // return (
  //   <div className={css.body}>
  //     <Layout.Vertical spacing="large">
  //       {props.withoutHeading ? null : (
  //         <>
  //           <Icon name="service-slack" size={24} />
  //           <Heading className={css.title}>{getString('notifications.titleSlack')}</Heading>
  //         </>
  //       )}
  //       <Text>{getString('notifications.helpSlack')}</Text>
  //       <Text>{getString('notifications.infoSlack')}</Text>

  //       <Formik
  //         onSubmit={handleSubmit}
  //         formName="configureSlackNotifications"
  //         validationSchema={Yup.object().shape({
  //           webhookUrl: Yup.string().test('isValidUrl', getString('validation.urlIsNotValid'), _webhookUrl => {
  //             // TODO: Create global validation function for url validation
  //             try {
  //               const url = new URL(_webhookUrl)
  //               return url.protocol === 'http:' || url.protocol === 'https:'
  //             } catch (_) {
  //               return false
  //             }
  //           })
  //         })}
  //         initialValues={{
  //           webhookUrl: '',
  //           userGroups: [],
  //           ...props.config
  //         }}
  //       >
  //         {formik => {
  //           return (
  //             <FormikForm>
  //               <FormInput.Text name={'webhookUrl'} label={getString('notifications.labelWebhookUrl')} />
  //               <Layout.Horizontal margin={{ bottom: 'xxlarge' }} style={{ alignItems: 'center' }}>
  //                 <TestSlackNotifications data={formik.values} />
  //               </Layout.Horizontal>
  //               <UserGroupsInput name="userGroups" label={getString('notifications.labelSlackUserGroups')} />
  //               {props.isStep ? (
  //                 <Layout.Horizontal spacing="large" className={css.buttonGroupSlack}>
  //                   <Button
  //                     text={getString('back')}
  //                     variation={ButtonVariation.SECONDARY}
  //                     onClick={() => {
  //                       props.onBack?.(convertFormData(formik.values))
  //                     }}
  //                   />
  //                   <Button
  //                     text={props.submitButtonText || getString('next')}
  //                     variation={ButtonVariation.PRIMARY}
  //                     type="submit"
  //                   />
  //                 </Layout.Horizontal>
  //               ) : (
  //                   <Layout.Horizontal spacing={'medium'} margin={{ top: 'xxlarge' }}>
  //                     <Button
  //                       type={'submit'}
  //                       variation={ButtonVariation.PRIMARY}
  //                       text={props.submitButtonText || getString('submit')}
  //                     />
  //                     <Button
  //                       text={getString('cancel')}
  //                       variation={ButtonVariation.SECONDARY}
  //                       onClick={props.hideModal}
  //                     />
  //                   </Layout.Horizontal>
  //                 )}
  //             </FormikForm>
  //           )
  //         }}
  //       </Formik>
  //     </Layout.Vertical>
  //   </div>
  // )
}

export default ConfigureMSTeamsNotifications
