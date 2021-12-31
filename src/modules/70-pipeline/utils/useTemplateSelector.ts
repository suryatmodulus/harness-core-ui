import React from 'react'
import { TemplateDrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

interface TemplateActionsReturnType {
  openTemplateSelector: (selectorData: any) => void
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
    (selectorData: any) => {
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
