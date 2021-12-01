import type { IconName } from '@wings-software/uicore'
import { parse } from 'yaml'
import { get } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import type { TemplateSummaryResponse } from 'services/template-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { NGTemplateInfoConfigWithGitDetails } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'

export const templateColorStyleMap: { [keyof in TemplateType]: React.CSSProperties } = {
  [TemplateType.Step]: {
    color: '#592BAA',
    stroke: '#E1D0FF',
    fill: '#EADEFF'
  },
  [TemplateType.Stage]: {
    color: '#06B7C3',
    stroke: '#C3ECEE',
    fill: '#D3FCFE'
  },
  [TemplateType.Service]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.Pipeline]: {
    color: '#004BA4',
    stroke: '#E4E6EF',
    fill: '#F4F6FF'
  },
  [TemplateType.StepGroup]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.Execution]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.Infrastructure]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  }
}

export const templateStudioColorStyleMap: { [keyof in TemplateType]: React.CSSProperties } = {
  [TemplateType.Step]: {
    color: '#EADEFF',
    stroke: '#6938C0',
    fill: '#7D4DD3'
  },
  [TemplateType.Stage]: {
    color: '#06B7C3',
    stroke: '#C3ECEE',
    fill: '#D3FCFE'
  },
  [TemplateType.Service]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.Pipeline]: {
    color: '#004BA4',
    stroke: '#E4E6EF',
    fill: '#F4F6FF'
  },
  [TemplateType.StepGroup]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.Execution]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  },
  [TemplateType.Infrastructure]: {
    color: '#299B2C',
    stroke: '#D4E7D1',
    fill: '#E4F7E1'
  }
}

export enum Sort {
  DESC = 'DESC',
  ASC = 'ASC'
}

export enum TemplateListType {
  Stable = 'Stable',
  LastUpdated = 'LastUpdated',
  All = 'All'
}

export enum SortFields {
  LastUpdatedAt = 'lastUpdatedAt',
  RecentActivity = 'executionSummaryInfo.lastExecutionTs',
  AZ09 = 'AZ09',
  ZA90 = 'ZA90',
  Name = 'name'
}

export const getTypeForTemplate = (
  template: TemplateSummaryResponse,
  getString: UseStringsReturn['getString']
): string => {
  const entityType = template.templateEntityType as TemplateType
  const type = parse(template.yaml || '')?.template?.spec?.type || ''
  switch (entityType) {
    case TemplateType.Step:
      return factory.getStepName(type) || ''
    case TemplateType.Stage:
      return stagesCollection.getStageAttributes(type, getString)?.name ?? ''
    default:
      return ''
  }
}

export const getIconForTemplate = (
  template: NGTemplateInfoConfigWithGitDetails | TemplateSummaryResponse,
  getString: UseStringsReturn['getString']
): IconName => {
  const entityType =
    (template as TemplateSummaryResponse)?.templateEntityType || (template as NGTemplateInfoConfigWithGitDetails)?.type
  const type =
    parse((template as TemplateSummaryResponse).yaml || '')?.template?.spec?.type ||
    get(template as NGTemplateInfoConfigWithGitDetails, 'spec.type', 'disable')
  switch (entityType) {
    case TemplateType.Step:
      return factory.getStepIcon(type)
    case TemplateType.Stage:
      return stagesCollection.getStageAttributes(type, getString)?.icon ?? 'disable'
    default:
      return 'disable'
  }
}
