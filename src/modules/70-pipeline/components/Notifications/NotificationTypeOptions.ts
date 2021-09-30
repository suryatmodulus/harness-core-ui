import type { SelectOption } from '@wings-software/uicore'
import { NotificationType } from '@notifications/interfaces/Notifications'

export const getAllNotificationTypeSelectOption = (getString: any): SelectOption => ({
  label: getString('allNotificationFormat'),
  value: ''
})

export const NotificationTypeSelectOptions: SelectOption[] = [
  {
    label: NotificationType.Slack,
    value: NotificationType.Slack
  },
  {
    label: NotificationType.Email,
    value: NotificationType.Email
  },
  {
    label: NotificationType.PagerDuty,
    value: NotificationType.PagerDuty
  },
  {
    label: 'Microsoft Teams',
    value: NotificationType.MsTeams
  }
]
