import React from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { Icon } from '@wings-software/uicore'

import { isNil } from 'lodash-es'
import FailureStrategy from '@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy'

import { PipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerTypes, DrawerSizes } from '../PipelineContext/PipelineActions'
import { StepCommands } from '../StepCommands/StepCommands'
import { TabTypes } from '../StepCommands/StepCommandTypes'
import { StepPalette } from '../StepPalette/StepPalette'
import { addService, addStepOrGroup, generateRandomString } from '../ExecutionGraph/ExecutionGraphUtil'
import { getStageFromPipeline } from '../StageBuilder/StageBuilderUtil'
import PipelineVariables from '../PipelineVariables/PipelineVariables'
import { PipelineTemplates } from '../PipelineTemplates/PipelineTemplates'
import { ExecutionStrategy } from '../ExecutionStrategy/ExecutionStategy'
import type { StepData } from '../../AbstractSteps/AbstractStepFactory'
import { StepType } from '../../PipelineSteps/PipelineStepInterface'
import { StepWidget } from '../../AbstractSteps/StepWidget'

import css from './RightDrawer.module.scss'

export const RightDrawer: React.FC = (): JSX.Element => {
  const {
    state: {
      pipeline,
      pipelineView: {
        drawerData,
        isDrawerOpened,
        splitViewData: { selectedStageId, stageType }
      },
      pipelineView
    },
    updatePipeline,
    updatePipelineView,
    stepsFactory
  } = React.useContext(PipelineContext)
  const { type, data, ...restDrawerProps } = drawerData
  const { stage: selectedStage } = getStageFromPipeline(pipeline, selectedStageId || '')
  const stepData = data?.stepConfig?.node?.type ? stepsFactory.getStepData(data?.stepConfig?.node?.type) : null

  return (
    <Drawer
      onClose={() => {
        updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
      }}
      usePortal={false}
      autoFocus={true}
      canEscapeKeyClose={type === DrawerTypes.ExecutionStrategy ? false : true}
      canOutsideClickClose={type === DrawerTypes.ExecutionStrategy ? false : true}
      enforceFocus={true}
      hasBackdrop={false}
      size={DrawerSizes[type]}
      isOpen={isDrawerOpened}
      position={Position.RIGHT}
      title={
        stepData ? (
          <div className={css.title}>
            <Icon name={stepsFactory.getStepIcon(stepData?.type || /* istanbul ignore next */ '')} />
            {stepData?.name}
          </div>
        ) : null
      }
      className={css.main}
      {...restDrawerProps}
    >
      {type === DrawerTypes.StepConfig && data?.stepConfig?.node && (
        <StepCommands
          step={data.stepConfig.node}
          stepsFactory={stepsFactory}
          hasStepGroupAncestor={!!data?.stepConfig?.isUnderStepGroup}
          onChange={item => {
            const node = data?.stepConfig?.node
            if (node) {
              // Add/replace values only if they are presented
              if (item.name && item.tab !== TabTypes.Advanced) node.name = item.name
              if (item.identifier && item.tab !== TabTypes.Advanced) node.identifier = item.identifier
              if (item.description && item.tab !== TabTypes.Advanced) node.description = item.description
              if (item.skipCondition && item.tab === TabTypes.Advanced) node.skipCondition = item.skipCondition
              if (item.timeout && item.tab !== TabTypes.Advanced) node.timeout = item.timeout
              if (item.failureStrategies && item.tab === TabTypes.Advanced)
                node.failureStrategies = item.failureStrategies

              // Delete values if they were already added and now removed
              if (node.timeout && !item.timeout && item.tab !== TabTypes.Advanced) delete node.timeout
              if (node.description && !item.description && item.tab !== TabTypes.Advanced) delete node.description
              if (node.skipCondition && !item.skipCondition && item.tab === TabTypes.Advanced) delete node.skipCondition
              if (node.failureStrategies && !item.failureStrategies && item.tab === TabTypes.Advanced)
                delete node.failureStrategies

              if (item.spec && item.tab !== TabTypes.Advanced) {
                node.spec = { ...item.spec }
              }
              data?.stepConfig?.onUpdate?.(item)
              updatePipeline(pipeline)
            }

            if (!item.shouldKeepOpen) {
              updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
            }
          }}
          isStepGroup={data.stepConfig.isStepGroup}
          hiddenPanels={data.stepConfig.hiddenAdvancedPanels}
        />
      )}
      {type === DrawerTypes.AddStep && selectedStageId && data?.paletteData && (
        <StepPalette
          selectedStage={selectedStage || {}}
          stepsFactory={stepsFactory}
          stageType={stageType as string}
          onSelect={(item: StepData) => {
            const paletteData = data.paletteData
            if (paletteData?.entity) {
              const { stage: pipelineStage } = getStageFromPipeline(pipeline, selectedStageId)
              const newStepData = {
                step: {
                  type: item.type,
                  name: item.name,
                  identifier: generateRandomString(item.name)
                }
              }
              if (pipelineStage && isNil(pipelineStage.stage.spec.execution)) {
                if (paletteData.isRollback) {
                  pipelineStage.stage.spec.execution = {
                    rollbackSteps: []
                  }
                } else {
                  pipelineStage.stage.spec.execution = {
                    steps: []
                  }
                }
              }
              data?.paletteData?.onUpdate?.(newStepData.step)
              addStepOrGroup(
                paletteData.entity,
                pipelineStage?.stage.spec.execution,
                newStepData,
                paletteData.isParallelNodeClicked,
                paletteData.isRollback
              )
              updatePipeline(pipeline).then(() => {
                updatePipelineView({
                  ...pipelineView,
                  isDrawerOpened: true,
                  drawerData: {
                    type: DrawerTypes.StepConfig,
                    data: {
                      stepConfig: {
                        node: newStepData.step,
                        onUpdate: data?.paletteData?.onUpdate,
                        isStepGroup: false,
                        addOrEdit: 'edit',
                        hiddenAdvancedPanels: data.paletteData?.hiddenAdvancedPanels
                      }
                    }
                  }
                })
              })
              return
            }
            updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
          }}
          onClose={() =>
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: false,
              drawerData: { type: DrawerTypes.AddStep }
            })
          }
        />
      )}
      {/* TODO */}
      {type === DrawerTypes.PipelineVariables && <PipelineVariables />}
      {type === DrawerTypes.Templates && <PipelineTemplates />}
      {type === DrawerTypes.ExecutionStrategy && <ExecutionStrategy selectedStage={selectedStage || {}} />}
      {type === DrawerTypes.FailureStrategy && selectedStageId ? (
        <FailureStrategy
          selectedStage={selectedStage || {}}
          onUpdate={({ failureStrategies }) => {
            const { stage: pipelineStage } = getStageFromPipeline(pipeline, selectedStageId)
            if (pipelineStage && pipelineStage.stage) {
              pipelineStage.stage.failureStrategies = failureStrategies
              updatePipeline(pipeline)
            }

            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: false,
              drawerData: { type: DrawerTypes.ConfigureService }
            })
          }}
        />
      ) : null}
      {type === DrawerTypes.ConfigureService && selectedStageId && data?.stepConfig && data?.stepConfig.node && (
        <StepWidget
          initialValues={data.stepConfig.node}
          type={data.stepConfig.node.type}
          factory={stepsFactory}
          onUpdate={item => {
            if (data.stepConfig?.addOrEdit === 'add') {
              const { stage: pipelineStage } = getStageFromPipeline(pipeline, selectedStageId)
              const newServiceData = {
                identifier: item.identifier,
                name: item.name,
                type: StepType.Dependency,
                ...(item.description && { description: item.description }),
                spec: item.spec
              }
              addService(pipelineStage?.stage.spec.serviceDependencies, newServiceData)
              updatePipeline(pipeline)
              updatePipelineView({
                ...pipelineView,
                isDrawerOpened: false,
                drawerData: { type: DrawerTypes.ConfigureService }
              })
              data.stepConfig?.onUpdate?.(newServiceData)
            } else if (data.stepConfig?.addOrEdit === 'edit') {
              const node = data?.stepConfig?.node
              if (node) {
                if (item.identifier) node.identifier = item.identifier
                if (item.name) node.name = item.name
                if (item.description) node.description = item.description
                if (item.spec) node.spec = item.spec

                // Delete values if they were already added and now removed
                if (node.description && !item.description) delete node.description

                updatePipeline(pipeline)
              }
              updatePipelineView({
                ...pipelineView,
                isDrawerOpened: false,
                drawerData: { type: DrawerTypes.ConfigureService }
              })
            }
          }}
        />
      )}
    </Drawer>
  )
}
