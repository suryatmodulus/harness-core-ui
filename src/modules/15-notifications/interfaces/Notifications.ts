export enum NotificationType {
  Slack = 'Slack',
  Email = 'Email',
  PagerDuty = 'PagerDuty',
  MSTeams = 'MSTeams'
}

interface NotificationConfiguration {
  type: NotificationType
  userGroups: string[]
}

export interface EmailNotificationConfiguration extends NotificationConfiguration {
  emailIds: string[]
}

export interface SlackNotificationConfiguration extends NotificationConfiguration {
  webhookUrl: string
}

export interface PagerDutyNotificationConfiguration extends NotificationConfiguration {
  key: string
}

export enum TestStatus {
  INIT,
  LOADING,
  SUCCESS,
  FAILED,
  ERROR
}
