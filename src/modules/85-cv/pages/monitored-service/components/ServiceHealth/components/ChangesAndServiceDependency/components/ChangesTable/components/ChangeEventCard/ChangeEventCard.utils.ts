import moment from 'moment'
import type { ChangeEventMetadata, ChangeEventDTO } from 'services/cv'
import type { CustomChangeEventDTO } from './ChangeEventCard.types'

export const createChangeDetailsData = (resource: ChangeEventDTO | undefined) => {
  const { type, category, serviceName = '', environmentName = '', metadata } = resource || {}
  return {
    type,
    category,
    status: metadata?.status,
    details: {
      service: { name: serviceName },
      environment: { name: environmentName },
      source: { name: type, url: metadata?.htmlUrl }
    }
  }
}

export const createChangeInfoData = (metadata: ChangeEventMetadata | undefined) => {
  const {
    triggeredAt = 0,
    priority,
    urgency,
    assignment,
    assignmentUrl,
    escalationPolicy,
    escalationPolicyUrl
  } = metadata || {}
  return {
    triggerAt: moment(new Date(triggeredAt * 1000)).format('Do MMM hh:mm A'),
    summary: {
      priority: priority,
      assignee: { name: assignment, url: assignmentUrl },
      urgency: urgency,
      policy: { name: escalationPolicy, url: escalationPolicyUrl }
    }
  }
}

export const createChangeTitleData = (resource: CustomChangeEventDTO | undefined) => {
  const { name, id = '', type, metadata } = resource || {}
  return {
    name,
    type,
    executionId: id,
    url: metadata?.pipelinePath
  }
}
