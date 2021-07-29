import React from 'react'
import { noop, set } from 'lodash-es'
import produce from 'immer'
import { Drawer, Position } from '@blueprintjs/core'
import { Button } from '@wings-software/uicore'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateDrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { updateStepWithinStage } from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer'
import { TemplateSelector } from '../TemplateSelector/TemplateSelector'

import css from './TemplateDrawer.module.scss'

export const TemplateDrawer: React.FC = (): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId },
      templateView: { isTemplateDrawerOpened, templateDrawerData },
      pipelineView: { drawerData },
      pipelineView
    },
    updateTemplateView,
    getStageFromPipeline,
    updatePipelineView,
    updateStage
  } = React.useContext(PipelineContext)
  const { type } = templateDrawerData
  const { data } = drawerData

  const { stage: selectedStage } = getStageFromPipeline(selectedStageId || '')

  /* 
  const {
    state: {
      pipelineView: { drawerData, isDrawerOpened },
      pipelineView,
      selectionState: { selectedStageId, selectedStepId }
    },
    isReadonly,
    updateStage,
    updatePipelineView,
    updateTemplateView,
    getStageFromPipeline,
    stepsFactory,
    setSelectedStepId
  } = React.useContext(PipelineContext)
  const { type, data, ...restDrawerProps } = drawerData
  */

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
      size={'calc(100% - 540px)'}
      isOpen={isTemplateDrawerOpened}
      position={Position.RIGHT}
      data-type={type}
      isCloseButtonShown={false}
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

      <TemplateSelector
        onClose={noop}
        onSelect={noop}
        onUseTemplate={async _templateId => {
          updateTemplateView({
            isTemplateDrawerOpened: false,
            templateDrawerData: { type: TemplateDrawerTypes.UseTemplate }
          })

          if (data?.stepConfig?.node) {
            const node = data?.stepConfig?.node

            // TODO: HARDCODED PART
            const processNode = {
              identifier: node.identifier,
              name: node.name,
              type: (node as any).type,
              'step-template': 'project1.echo-directory:1',
              inputs: {
                'file-directory': '/opt',
                timeout: '120s'
              }
            }

            if (data?.stepConfig?.node?.identifier) {
              if (selectedStage?.stage?.spec?.execution) {
                const processingNodeIdentifier = data?.stepConfig?.node?.identifier
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

                data?.stepConfig?.onUpdate?.(processNode)
              }
            }
          }
        }}
      />
    </Drawer>
  )
}
