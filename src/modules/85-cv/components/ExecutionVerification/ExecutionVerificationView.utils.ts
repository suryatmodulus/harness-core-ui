import type { ExecutionNode } from 'services/pipeline-ng'
import type { StringsMap } from 'stringTypes'

export const getActivityId = (step: ExecutionNode): string => {
  return (step?.outcomes?.output?.activityId || step?.progressData?.activityId) as unknown as string
}

export const getDefaultTabId = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string,
  tabName?: string
): string => (tabName ? tabName : getString('pipeline.verification.analysisTab.metrics'))
