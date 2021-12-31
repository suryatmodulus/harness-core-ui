import React from 'react'
import { defaultTo } from 'lodash-es'
import { useDeepCompareEffect } from '@common/hooks'
import type { PipelineInfoConfig } from 'services/cd-ng'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { AddStageView } from './views/AddStageView'
import type { PipelineStageProps } from './PipelineStage'

export interface PipelineStagesProps<T = Record<string, unknown>> {
  children: Array<React.ReactElement<PipelineStageProps> | null>
  minimal?: boolean
  stageType?: string
  isParallel?: boolean
  getNewStageFromType?: (type: string, clearDefaultValues?: boolean) => T
  getNewStageFromTemplate?: (template: TemplateSummaryResponse, clearDefaultValues?: boolean) => T
  stageProps?: T
  onSelectStage?: (stageType: string, stage?: T, pipeline?: PipelineInfoConfig) => void
  showSelectMenu?: boolean
  contextType?: string
  templateTypes: { [key: string]: string }
  setTemplateTypes: (data: { [key: string]: string }) => void
  openTemplateSelector: (selectorData: any) => void
  closeTemplateSelector: () => void
}

interface PipelineStageMap extends Omit<PipelineStageProps, 'minimal'> {
  index: number
}

export function PipelineStages<T = Record<string, unknown>>({
  children,
  showSelectMenu,
  isParallel = false,
  contextType,
  onSelectStage,
  getNewStageFromType,
  getNewStageFromTemplate,
  stageType,
  stageProps,
  minimal = false,
  templateTypes,
  setTemplateTypes,
  openTemplateSelector,
  closeTemplateSelector
}: PipelineStagesProps<T>): JSX.Element {
  const [stages, setStages] = React.useState<Map<string, PipelineStageMap>>(new Map())
  const [template, setTemplate] = React.useState<TemplateSummaryResponse>()

  React.useLayoutEffect(() => {
    const stagesLocal: Map<string, PipelineStageMap> = new Map()
    const steps = React.Children.toArray(children) as React.ReactElement<PipelineStageProps>[]
    steps.forEach((child, i: number) => {
      stagesLocal.set(child.props.type, {
        ...child.props,
        index: i
      })
    })
    setStages(stagesLocal)
  }, [children])

  const [showMenu, setShowMenu] = React.useState(showSelectMenu)
  const [type, setType] = React.useState(stageType)
  const [stageData, setStageData] = React.useState<T>()

  React.useEffect(() => {
    if (stageType) {
      setType(stageType)
    }
  }, [stageType])

  React.useEffect(() => {
    if (showSelectMenu) {
      setShowMenu(true)
    }
  }, [showSelectMenu])
  const selected = stages.get(type || '')

  // We are using this to deep compare the selected var and run forceUpdate from popper js to recompute the position of the popover.
  // This stops an expanding popover from overflowing

  useDeepCompareEffect(() => {
    window.dispatchEvent(new CustomEvent('UPDATE_POPOVER_POSITION'))
  }, [selected])

  const onUseTemplate = React.useCallback(
    (templateSummary: TemplateSummaryResponse) => {
      closeTemplateSelector?.()
      if (getNewStageFromType) {
        setTemplate(templateSummary)
        setShowMenu(false)
        setType(templateSummary.childType)
        setStageData(getNewStageFromType?.(templateSummary.childType || '', true))
      } else {
        onSelectStage?.(defaultTo(templateSummary.childType, ''))
      }
    },
    [closeTemplateSelector, onSelectStage]
  )

  const onCopyTemplate = React.useCallback(
    (templateSummary: TemplateSummaryResponse) => {
      closeTemplateSelector?.()
      if (getNewStageFromType) {
        setShowMenu(false)
        setType(templateSummary.childType)
        setStageData(getNewStageFromTemplate?.(templateSummary, true))
      } else {
        onSelectStage?.(defaultTo(templateSummary.childType, ''))
      }
    },
    [closeTemplateSelector, onSelectStage]
  )

  const onOpenTemplateSelector = React.useCallback(() => {
    openTemplateSelector?.({
      templateType: 'Stage',
      onUseTemplate,
      onCopyTemplate
    })
  }, [openTemplateSelector, onUseTemplate, onCopyTemplate])

  const selectedStageIndex = selected?.index || 0
  const stage = React.Children.toArray(children)[selectedStageIndex] as React.ReactElement<PipelineStageProps>
  return (
    <>
      {showSelectMenu && showMenu && (
        <AddStageView
          stages={[...stages].map(item => item[1])}
          isParallel={isParallel}
          contextType={contextType}
          callback={selectedType => {
            if (getNewStageFromType) {
              setShowMenu(false)
              setType(selectedType)
              setStageData(getNewStageFromType?.(selectedType, true))
            } else {
              onSelectStage?.(selectedType)
            }
          }}
          onOpenTemplateSelector={onOpenTemplateSelector}
        />
      )}
      {!showSelectMenu && selected && stage && (
        <>
          {React.cloneElement(stage, {
            ...selected,
            key: selected.type,
            minimal,
            stageProps: stageProps as Record<string, unknown>
          })}
        </>
      )}
      {!showMenu && showSelectMenu && type && stage && stageData && (
        <>
          {React.cloneElement(stage, {
            ...selected,
            minimal: true,
            stageProps: {
              data: stageData,
              template: template,
              templateTypes,
              setTemplateTypes,
              onSubmit: (data: T, _id?: string, pipeline?: PipelineInfoConfig) => {
                onSelectStage?.(type, data, pipeline)
              }
            }
          })}
        </>
      )}
    </>
  )
}
