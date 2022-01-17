import React from 'react'
import { SelectorData, TemplateDrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

interface TemplateActionsReturnType {
  openTemplateSelector: (selectorData: SelectorData) => void
  closeTemplateSelector: () => void
}

export function useTemplateSelector(): TemplateActionsReturnType {
  const { updateTemplateView } = usePipelineContext()

  const closeTemplateSelector = React.useCallback(() => {
    updateTemplateView({
      isTemplateDrawerOpened: false,
      templateDrawerData: { type: TemplateDrawerTypes.UseTemplate }
    })
  }, [updateTemplateView])

  const openTemplateSelector = React.useCallback(
    (selectorData: SelectorData) => {
      updateTemplateView({
        isTemplateDrawerOpened: true,
        templateDrawerData: {
          type: TemplateDrawerTypes.UseTemplate,
          data: {
            selectorData
          }
        }
      })
    },
    [updateTemplateView]
  )

  return { openTemplateSelector, closeTemplateSelector }
}
