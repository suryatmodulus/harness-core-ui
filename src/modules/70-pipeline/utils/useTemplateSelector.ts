/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
