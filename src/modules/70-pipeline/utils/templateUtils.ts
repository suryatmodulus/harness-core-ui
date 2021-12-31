import { defaultTo, get } from 'lodash-es'
import type { StageElementConfig, TemplateLinkConfig } from 'services/cd-ng'
import type { TemplateConfig } from '@pipeline/utils/tempates'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { getIdentifierFromValue, getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'

export const getTemplateNameWithLabel = (
  template?: TemplateLinkConfig | TemplateConfig | TemplateSummaryResponse
): string => {
  return `${
    (template as TemplateSummaryResponse)?.name || (template as TemplateLinkConfig | TemplateConfig)?.templateRef
  } (${defaultTo(template?.versionLabel, 'Stable')})`
}

export const getScopeBasedTemplateRef = (template: TemplateSummaryResponse): string => {
  const templateIdentifier = defaultTo(template.identifier, '')
  const scope = getScopeFromDTO(defaultTo(template, {}))
  return scope === Scope.PROJECT ? templateIdentifier : `${scope}.${templateIdentifier}`
}

export const getStageType = (stage?: StageElementConfig, templateTypes?: { [key: string]: string }) => {
  return defaultTo(
    stage?.template
      ? get(templateTypes, getIdentifierFromValue(defaultTo(stage?.template?.templateRef, '')), '')
      : stage?.type,
    ''
  )
}
