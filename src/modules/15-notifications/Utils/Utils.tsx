import React from 'react'
import type { IconName } from '@wings-software/uicore'
import { NotificationType } from '@notifications/interfaces/Notifications'
import type {
  EmailConfigDTO,
  MicrosoftTeamsConfigDTO,
  NotificationSettingConfigDTO,
  PagerDutyConfigDTO,
  SlackConfigDTO
} from 'services/cd-ng'
import { String } from 'framework/strings'

interface NotificationItemDTO {
  label: React.ReactElement
  icon: IconName
  value?: string
}

export enum NotificationTypes {
  EMAIL = 'EMAIL',
  PAGERDUTY = 'PAGERDUTY',
  SLACK = 'SLACK',
  MSTEAMS = 'MSTEAMS'
}

export const getIconByNotificationMethod = (option: NotificationType): IconName => {
  switch (option) {
    case NotificationType.Email:
      return 'main-email'
    case NotificationType.PagerDuty:
      return 'service-pagerduty'
    case NotificationType.Slack:
      return 'service-slack'
    default:
      return 'main-email'
  }
}

export const getNotificationByConfig = (option: NotificationSettingConfigDTO | null): NotificationItemDTO => {
  switch (option?.type) {
    case NotificationTypes.EMAIL:
      return {
        label: <String stringID="notifications.emailOrAlias" />,
        icon: 'main-email',
        value: (option as EmailConfigDTO)?.groupEmail
      }
    case NotificationTypes.PAGERDUTY:
      return {
        label: <String stringID="common.pagerDuty" />,
        icon: 'service-pagerduty',
        value: (option as PagerDutyConfigDTO)?.pagerDutyKey
      }
    case NotificationTypes.SLACK:
      return {
        label: <String stringID="common.slack" />,
        icon: 'service-slack',
        value: (option as SlackConfigDTO)?.slackWebhookUrl
      }
    case NotificationTypes.MSTEAMS:
      return {
        label: <String stringID="notifications.labelMS" />,
        icon: 'service-msteams',
        value: (option as MicrosoftTeamsConfigDTO)?.microsoftTeamsWebhookUrl
      }
    default:
      return {
        label: <String stringID="notifications.emailOrAlias" />,
        icon: 'main-email',
        value: ''
      }
  }
}
