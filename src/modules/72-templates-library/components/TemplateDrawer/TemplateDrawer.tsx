import React from 'react'
import { noop, set } from 'lodash-es'
import produce from 'immer'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateDrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { updateStepWithinStage } from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer'
import type { TemplateType } from '@templates-library/utils/templatesUtils'
import type { TemplateStepData } from '@pipeline/utils/tempates'
import type { StepElementConfig } from 'services/cd-ng'
import { TemplateSelector } from '../TemplateSelector/TemplateSelector'
import css from './TemplateDrawer.module.scss'

export const TemplateDrawer: React.FC = (): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId },
      templateView: {
        isTemplateDrawerOpened,
        templateDrawerData: { type, data }
      },
      pipelineView: { drawerData },
      pipelineView
    },
    updateTemplateView,
    getStageFromPipeline,
    updatePipelineView,
    updateStage
  } = usePipelineContext()
  const { stage: selectedStage } = getStageFromPipeline(selectedStageId || '')
  const templateTypes = data?.selectorData?.templateTypes
  const childTypes = data?.selectorData?.childTypes

  return (
    <Drawer
      onClose={() => {
        noop()
      }}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={false}
      hasBackdrop={true}
      size={'1260px'}
      isOpen={isTemplateDrawerOpened}
      position={Position.RIGHT}
      data-type={type}
    >
      <Button
        minimal
        className={css.almostFullScreenCloseBtn}
        icon="cross"
        withoutBoxShadow
        onClick={() => {
          updateTemplateView({
            isTemplateDrawerOpened: false,
            templateDrawerData: { type: TemplateDrawerTypes.UseTemplate }
          })
        }}
      />
      {templateTypes && childTypes && (
        <TemplateSelector
          onClose={noop}
          onSelect={noop}
          templateTypes={templateTypes as TemplateType[]}
          childTypes={childTypes}
          onUseTemplate={async template => {
            updateTemplateView({
              isTemplateDrawerOpened: false,
              templateDrawerData: { type: TemplateDrawerTypes.UseTemplate }
            })

            if (drawerData.data?.stepConfig?.node) {
              const node = drawerData.data?.stepConfig?.node

              const processNode: TemplateStepData = {
                identifier: node.identifier,
                name: node.name || '',
                template: {
                  templateRef: template.identifier || '',
                  versionLabel: template.versionLabel || '',
                  templateInputs: {
                    type: (node as StepElementConfig).type
                  }
                }
              }

              if (drawerData.data?.stepConfig?.node?.identifier) {
                if (selectedStage?.stage?.spec?.execution) {
                  const processingNodeIdentifier = drawerData.data?.stepConfig?.node?.identifier
                  const stageData = produce(selectedStage, draft => {
                    updateStepWithinStage(draft.stage!.spec!.execution!, processingNodeIdentifier, processNode as any)
                  })

                  // update view data before updating pipeline because its async
                  updatePipelineView(
                    produce(pipelineView, draft => {
                      set(draft, 'drawerData.data.stepConfig.node', processNode)
                    })
                  )
                  await updateStage(stageData.stage!)

                  // drawerData.data?.stepConfig?.onUpdate?.(processNode)
                }
              }
            }
          }}
        />
      )}
    </Drawer>
  )
}
