import moment from 'moment'
import type { ChangeEventMetadata, ChangeEventDTO } from 'services/cv'
import type { CustomChangeEventDTO } from './ChangeCard.types'

export const createChangeDetailsData = (resource: ChangeEventDTO | undefined) => {
  const { type, category, serviceName = '', environmentName = '', metadata } = resource || {}
  return {
    type,
    category,
    status: metadata?.status,
    details: {
      service: { name: serviceName },
      environment: { name: environmentName },
      source: type
    }
  }
}

export const createChangeInfoData = (metadata: ChangeEventMetadata | undefined) => {
  const { triggeredAt = 0, priority, eventId, urgency, escalationPolicy } = metadata || {}
  return {
    triggerAt: moment(new Date(triggeredAt * 1000)).format('Do MMM hh:mm A'),
    summary: {
      priority: priority,
      assignee: eventId,
      urgency: urgency,
      policy: escalationPolicy
    }
  }
}

export const createChangeTitleData = (resource: CustomChangeEventDTO | undefined) => {
  const { name, id = '', type } = resource || {}
  return {
    name,
    type,
    executionId: id
  }
}
