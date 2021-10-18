import type { NGTemplateInfoConfig } from 'services/template-ng'

export const DefaultNewTemplateId = '-1'
export const DefaultNewVersionLabel = '-1'

export const DefaultTemplate: NGTemplateInfoConfig = {
  name: '',
  identifier: DefaultNewTemplateId,
  versionLabel: DefaultNewVersionLabel,
  type: 'Step'
}
