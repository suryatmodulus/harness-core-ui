import type { ExecutionTriggerInfo } from 'services/pipeline-ng'
import type { StringKeys } from 'framework/strings'

export const mapTriggerTypeToStringID = (triggerType: ExecutionTriggerInfo['triggerType']): StringKeys => {
  switch (triggerType) {
    case 'WEBHOOK':
    case 'WEBHOOK_CUSTOM':
      return 'execution.triggerType.WEBHOOK'
    case 'SCHEDULER_CRON':
      return 'pipeline.triggers.scheduledLabel'
    default:
      return 'execution.triggerType.MANUAL'
  }
}
