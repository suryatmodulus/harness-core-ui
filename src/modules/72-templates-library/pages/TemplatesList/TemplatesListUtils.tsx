import type { IconName } from '@wings-software/uicore'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import type { TemplatesSummaryResponse } from '@templates-library/temporary-mock/model'

export const templateColorStyleMap: { [keyof in TemplateType]: React.CSSProperties } = {
  [TemplateType.pipeline]: {
    color: '#004BA4',
    borderBottomColor: '#F4F6FF'
  },
  [TemplateType.stage]: {
    color: '#06B7C3',
    borderBottomColor: '#D3FCFE'
  },
  [TemplateType.service]: {
    color: '#299B2C',
    borderBottomColor: '#E4F7E1'
  },
  [TemplateType.step]: {
    color: '#299B2C',
    borderBottomColor: '#E4F7E1'
  },
  [TemplateType.stepGroup]: {
    color: '#299B2C',
    borderBottomColor: '#E4F7E1'
  },
  [TemplateType.execution]: {
    color: '#299B2C',
    borderBottomColor: '#E4F7E1'
  },
  [TemplateType.infrastructure]: {
    color: '#299B2C',
    borderBottomColor: '#E4F7E1'
  }
}

interface IconProps {
  icon: IconName
  size: number
}

export const getIconsForTemplate = (data: TemplatesSummaryResponse): IconProps[] => {
  const icons: IconProps[] = []
  if (data.modules?.includes('cd')) {
    icons.push({ icon: 'cd-main', size: 20 })
  }
  if (data.modules?.includes('ci')) {
    icons.push({ icon: 'ci-main', size: 16 })
  }
  return icons
}

export enum Sort {
  DESC = 'DESC',
  ASC = 'ASC'
}

export enum SortFields {
  LastUpdatedAt = 'lastUpdatedAt',
  RecentActivity = 'executionSummaryInfo.lastExecutionTs',
  AZ09 = 'AZ09',
  ZA90 = 'ZA90',
  Name = 'name'
}
