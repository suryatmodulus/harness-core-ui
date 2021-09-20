import type { ExecutionNode } from 'services/pipeline-ng'

export const getActivityId = (step: ExecutionNode): string => {
  return (step?.outcomes?.output?.activityId || step?.progressData?.activityId) as unknown as string
}
