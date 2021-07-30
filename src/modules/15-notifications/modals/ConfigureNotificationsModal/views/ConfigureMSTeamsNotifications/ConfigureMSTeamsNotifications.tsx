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
