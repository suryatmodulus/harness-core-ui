import { Color, IconName } from '@wings-software/uicore'
import type { PMSPipelineSummaryResponse } from 'services/pipeline-ng'

export const getStatusColor = (data: PMSPipelineSummaryResponse): string => {
  switch (data.executionSummaryInfo?.lastExecutionStatus) {
    case 'Success':
      return Color.GREEN_800
    case 'Failed':
      return Color.RED_800
    case 'Running':
      return Color.BLUE_800
    default:
      return Color.GREEN_800
  }
}

interface IconProps {
  icon: IconName
  size: number
}

export const getIconsForPipeline = (data: PMSPipelineSummaryResponse): IconProps[] => {
  const icons: IconProps[] = []
  if (data.modules?.includes('cd')) {
    icons.push({ icon: 'cd-main', size: 20 })
  }
  if (data.modules?.includes('ci')) {
    icons.push({ icon: 'ci-main', size: 16 })
  }
  if (data.modules?.includes('cv')) {
    icons.push({ icon: 'cv-main', size: 16 })
  }
  return icons
}
