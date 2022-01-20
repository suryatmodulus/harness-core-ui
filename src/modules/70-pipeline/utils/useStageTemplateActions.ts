/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, isEqual } from 'lodash-es'
import { parse } from 'yaml'
import produce from 'immer'
import { useCallback } from 'react'
import type { StageElementConfig } from 'services/cd-ng'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useTemplateSelector } from '@pipeline/utils/useTemplateSelector'
import { createTemplate, getStageType } from '@pipeline/utils/templateUtils'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'

interface TemplateActionsReturnType {
  onUseTemplate: (template: TemplateSummaryResponse, isCopied?: boolean) => Promise<void>
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
    async (template: TemplateSummaryResponse, isCopied = false) => {
      closeTemplateSelector()
      const node = stage?.stage
      if (
        !isCopied &&
        isEqual(node?.template?.templateRef, template.identifier) &&
        isEqual(node?.template?.versionLabel, template.versionLabel)
      ) {
        return
      }
      const processNode = isCopied
        ? produce(defaultTo(parse(template?.yaml || '')?.template.spec, {}) as StageElementConfig, draft => {
            draft.name = defaultTo(node?.name, '')
            draft.identifier = defaultTo(node?.identifier, '')
          })
        : createTemplate(node, template)
      await updateStage(processNode)
      if (!isCopied && template?.identifier && template?.childType) {
        templateTypes[template.identifier] = template.childType
        setTemplateTypes(templateTypes)
      }
    },
    [closeTemplateSelector, stage?.stage, updateStage]
  )

  const onOpenTemplateSelector = useCallback(() => {
    openTemplateSelector({
      templateType: 'Stage',
      selectedChildType: getStageType(stage?.stage, templateTypes),
      selectedTemplateRef: getIdentifierFromValue(defaultTo(stage?.stage?.template?.templateRef, '')),
      onUseTemplate
    })
  }, [stage?.stage, templateTypes, openTemplateSelector, onUseTemplate])

  const onRemoveTemplate = useCallback(async () => {
    const node = stage?.stage
    const processNode = produce({} as StageElementConfig, draft => {
      draft.name = defaultTo(node?.name, '')
      draft.identifier = defaultTo(node?.identifier, '')
      draft.type = getStageType(stage?.stage, templateTypes)
    })
    await updateStage(processNode)
  }, [stage?.stage, templateTypes, updateStage])

  return { onUseTemplate, onRemoveTemplate, onOpenTemplateSelector }
}
