import { defaultTo, set } from 'lodash-es'
import { parse } from 'yaml'
import produce from 'immer'
import { useCallback } from 'react'
import type { StageElementConfig, TemplateLinkConfig } from 'services/cd-ng'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useTemplateSelector } from '@pipeline/utils/useTemplateSelector'
import { getScopeBasedTemplateRef, getStageType } from '@pipeline/utils/templateUtils'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'

interface TemplateActionsReturnType {
  onUseTemplate: (templateConfig: TemplateLinkConfig) => Promise<void>
  onCopyTemplate: (copiedTemplate: TemplateSummaryResponse) => Promise<void>
  onRemoveTemplate: () => Promise<void>
  onOpenTemplateSelector: () => void
}

export function useStageTemplateActions(): TemplateActionsReturnType {
  const {
    state: {
      selectionState: { selectedStageId = '' },
      templateTypes
    },
    setTemplateTypes,
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()
  const { openTemplateSelector, closeTemplateSelector } = useTemplateSelector()
  const { stage } = getStageFromPipeline(selectedStageId)

  const onUseTemplate = useCallback(
    async (template: TemplateSummaryResponse) => {
      closeTemplateSelector()
      const processNode = produce(stage?.stage as StageElementConfig, draft => {
        delete draft.template
        set(draft, 'template.templateRef', getScopeBasedTemplateRef(template))
        if (template.versionLabel) {
          set(draft, 'template.versionLabel', template.versionLabel)
        }
      })
      await updateStage(processNode)
      if (template?.identifier && template?.childType) {
        templateTypes[template.identifier] = template.childType
        setTemplateTypes(templateTypes)
      }
    },
    [closeTemplateSelector, stage?.stage, updateStage]
  )

  const onCopyTemplate = useCallback(
    async (template: TemplateSummaryResponse) => {
      closeTemplateSelector()
      const node = stage?.stage
      const processNode = produce(
        defaultTo(parse(template?.yaml || '')?.template.spec, {}) as StageElementConfig,
        draft => {
          draft.name = defaultTo(node?.name, '')
          draft.identifier = defaultTo(node?.identifier, '')
        }
      )
      await updateStage(processNode)
    },
    [closeTemplateSelector, stage?.stage, updateStage]
  )

  const onOpenTemplateSelector = useCallback(() => {
    openTemplateSelector({
      templateType: 'Stage',
      childTypes: [getStageType(stage?.stage, templateTypes)],
      selectedTemplateRef: getIdentifierFromValue(defaultTo(stage?.stage?.template?.templateRef, '')),
      onUseTemplate,
      onCopyTemplate
    })
  }, [stage?.stage, templateTypes, openTemplateSelector, onUseTemplate, onCopyTemplate])

  const onRemoveTemplate = useCallback(async () => {
    const node = stage?.stage
    const processNode = produce({} as StageElementConfig, draft => {
      draft.name = defaultTo(node?.name, '')
      draft.identifier = defaultTo(node?.identifier, '')
      draft.type = getStageType(stage?.stage, templateTypes)
    })
    await updateStage(processNode)
  }, [stage?.stage, templateTypes, updateStage])

  return { onUseTemplate, onCopyTemplate, onRemoveTemplate, onOpenTemplateSelector }
}
