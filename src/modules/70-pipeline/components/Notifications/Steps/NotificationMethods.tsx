import { Color, Layout, Select, SelectOption, StepProps, Text } from '@wings-software/uicore'
import React, { useState } from 'react'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { NotificationType } from '@notifications/interfaces/Notifications'
import type { NotificationRules, PmsEmailChannel, PmsPagerDutyChannel, PmsSlackChannel } from 'services/pipeline-ng'
import { NotificationTypeSelectOptions } from '@notifications/constants'
import ConfigureEmailNotifications from '@notifications/modals/ConfigureNotificationsModal/views/ConfigureEmailNotifications/ConfigureEmailNotifications'
import ConfigureSlackNotifications from '@notifications/modals/ConfigureNotificationsModal/views/ConfigureSlackNotifications/ConfigureSlackNotifications'
import ConfigurePagerDutyNotifications from '@notifications/modals/ConfigureNotificationsModal/views/ConfigurePagerDutyNotifications/ConfigurePagerDutyNotifications'

type NotificationMethodsProps = StepProps<NotificationRules> & {
  typeOptions?: SelectOption[]
}

const NotificationMethods: React.FC<NotificationMethodsProps> = ({
  prevStepData,
  nextStep,
  previousStep,
  typeOptions
}) => {
  const { getString } = useStrings()
  const [method, setMethod] = useState<SelectOption | undefined>(
    prevStepData?.notificationMethod?.type
      ? {
          label: prevStepData?.notificationMethod?.type,
          value: prevStepData?.notificationMethod?.type
        }
      : undefined
  )
  return (
    <Layout.Vertical spacing="xxlarge" padding="small">
      <Text font="medium" color={Color.BLACK}>
        {getString('notifications.notificationMethod')}
      </Text>

      <Layout.Vertical height={500} width={500} spacing="large">
        <Layout.Vertical spacing="xsmall">
          <Text tooltipProps={{ dataTooltipId: 'notifications.notificationMethod' }}>
            {getString('notifications.notificationMethod')}
          </Text>
          <Select
            items={typeOptions || NotificationTypeSelectOptions}
            value={method}
            onChange={item => {
              setMethod(item)
            }}
          />
        </Layout.Vertical>
        {method?.value === NotificationType.Email ? (
          <>
            <ConfigureEmailNotifications
              withoutHeading={true}
              submitButtonText={getString('finish')}
              onSuccess={data => {
                nextStep?.({
                  ...prevStepData,
                  notificationMethod: {
                    type: method.value.toString(),
                    spec: {
                      userGroups: data.userGroups,
                      recipients: data.emailIds
                    }
                  }
                })
              }}
              hideModal={noop}
              isStep={true}
              onBack={data =>
                previousStep?.({
                  ...prevStepData,
                  notificationMethod: {
                    type: method.value.toString(),
                    spec: {
                      userGroups: data?.userGroups,
                      recipients: data?.emailIds
                    }
                  }
                })
              }
              config={{
                type: NotificationType.Email,
                emailIds: (prevStepData?.notificationMethod?.spec as PmsEmailChannel)?.recipients || [],
                userGroups: (prevStepData?.notificationMethod?.spec as PmsEmailChannel)?.userGroups || []
              }}
            />
          </>
        ) : null}

        {method?.value === NotificationType.Slack ? (
          <ConfigureSlackNotifications
            withoutHeading={true}
            submitButtonText={getString('finish')}
            onSuccess={data => {
              nextStep?.({
                ...prevStepData,
                notificationMethod: {
                  type: method.value.toString(),
                  spec: {
                    userGroups: data.userGroups,
                    webhookUrl: data.webhookUrl
                  }
                }
              })
            }}
            hideModal={noop}
            isStep={true}
            onBack={data =>
              previousStep?.({
                ...prevStepData,
                notificationMethod: {
                  type: method.value.toString(),
                  spec: {
                    userGroups: data?.userGroups,
                    webhookUrl: data?.webhookUrl
                  }
                }
              })
            }
            config={{
              type: NotificationType.Slack,
              webhookUrl: (prevStepData?.notificationMethod?.spec as PmsSlackChannel)?.webhookUrl || '',
              userGroups: (prevStepData?.notificationMethod?.spec as PmsSlackChannel)?.userGroups || []
            }}
          />
        ) : null}
        {method?.value === NotificationType.PagerDuty ? (
          <ConfigurePagerDutyNotifications
            withoutHeading={true}
            submitButtonText={getString('finish')}
            onSuccess={data => {
              nextStep?.({
                ...prevStepData,
                notificationMethod: {
                  type: method.value.toString(),
                  spec: {
                    userGroups: data.userGroups,
                    integrationKey: data.key
                  }
                }
              })
            }}
            hideModal={() => undefined}
            isStep={true}
            onBack={() => previousStep?.({ ...prevStepData })}
            config={{
              type: NotificationType.PagerDuty,
              key: (prevStepData?.notificationMethod?.spec as PmsPagerDutyChannel)?.integrationKey?.toString() || '',
              userGroups: (prevStepData?.notificationMethod?.spec as PmsPagerDutyChannel)?.userGroups || []
            }}
          />
        ) : null}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
export default NotificationMethods
