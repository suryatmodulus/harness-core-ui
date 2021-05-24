import React, { SyntheticEvent } from 'react'
import { Drawer, Position } from '@blueprintjs/core'
import { Button, Icon, Text, Color } from '@wings-software/uicore'
import { get, isEmpty, isNil, set } from 'lodash-es'
import cx from 'classnames'

import produce from 'immer'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { FailureStrategyWithRef } from '@pipeline/components/PipelineStudio/FailureStrategy/FailureStrategy'
import type { ExecutionElementConfig, ExecutionWrapper } from 'services/cd-ng'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerData, DrawerSizes, DrawerTypes } from '../PipelineContext/PipelineActions'
import { StepCommandsWithRef as StepCommands, StepFormikRef } from '../StepCommands/StepCommands'
import { TabTypes } from '../StepCommands/StepCommandTypes'
import { StepPalette } from '../StepPalette/StepPalette'
import { addService, addStepOrGroup, generateRandomString, getStepFromId } from '../ExecutionGraph/ExecutionGraphUtil'
import PipelineVariables from '../PipelineVariables/PipelineVariables'
import { PipelineNotifications } from '../PipelineNotifications/PipelineNotifications'
import { PipelineTemplates } from '../PipelineTemplates/PipelineTemplates'
import { ExecutionStrategy } from '../ExecutionStrategy/ExecutionStategy'
import type { StepData } from '../../AbstractSteps/AbstractStepFactory'
import { StepType } from '../../PipelineSteps/PipelineStepInterface'
import { FlowControl } from '../FlowControl/FlowControl'
import SkipCondition from '../SkipCondition/SkipCondition'
import { StageTypes } from '../Stages/StageTypes'
import { EnableGitExperience } from '../EnableGitExperience/EnableGitExperience'

import css from './RightDrawer.module.scss'

export const AlmostFullScreenDrawers: DrawerTypes[] = [
  DrawerTypes.PipelineVariables,
  DrawerTypes.PipelineNotifications,
  DrawerTypes.FlowControl,
  DrawerTypes.EnableGitExperience
]

export const ConfigureStepScreenDrawers: DrawerTypes[] = [
  DrawerTypes.StepConfig,
  DrawerTypes.ConfigureService,
  DrawerTypes.ProvisionerStepConfig
]
const checkDuplicateStep = (
  formikRef: React.MutableRefObject<StepFormikRef<unknown> | null>,
  data: DrawerData['data'],
  getString: UseStringsReturn['getString']
): boolean => {
  const values = formikRef.current?.getValues()
  if (values && data?.stepConfig?.stepsMap && formikRef.current?.setFieldError) {
    const stepsMap = data.stepConfig.stepsMap
    let duplicate = false
    stepsMap.forEach((_step, key) => {
      if (key === values.identifier && values.identifier !== data?.stepConfig?.node?.identifier) {
        duplicate = true
      }
    })
    if (duplicate) {
      setTimeout(() => {
        formikRef.current?.setFieldError('identifier', getString('pipelineSteps.duplicateStep'))
      }, 300)
      return true
    }
  }
  return false
}

export const RightDrawer: React.FC = (): JSX.Element => {
  const {
    state: {
      pipeline,
      pipelineView: { drawerData, isDrawerOpened },
      pipelineView,
      selectionState: { selectedStageId, selectedStepId }
    },
    isReadonly,
    updatePipeline,
    updateStage,
    updatePipelineView,
    getStageFromPipeline,
    stepsFactory,
    setSelectedStepId
  } = React.useContext(PipelineContext)
  const { type, data, ...restDrawerProps } = drawerData

  const { stage: selectedStage } = getStageFromPipeline(selectedStageId || '')
  const domain = selectedStage?.stage?.type
  const stageType = selectedStage?.stage?.type

  let stepData = data?.stepConfig?.node?.type ? stepsFactory.getStepData(data?.stepConfig?.node?.type) : null
  const formikRef = React.useRef<StepFormikRef | null>(null)
  const { getString } = useStrings()
  const isAlmostFullscreen = AlmostFullScreenDrawers.includes(type) || ConfigureStepScreenDrawers.includes(type)
  let title: React.ReactNode | null = null
  if (data?.stepConfig?.isStepGroup) {
    stepData = stepsFactory.getStepData(StepType.StepGroup)
  }

  const applyChanges = async () => {
    if (checkDuplicateStep(formikRef, data, getString)) {
      return
    }
    await formikRef?.current?.submitForm()
    if (!isEmpty(formikRef.current?.getErrors())) {
      return
    } else {
      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: false,
        drawerData: {
          type: DrawerTypes.AddStep
        }
      })
      setSelectedStepId(undefined)
    }
  }
  const discardChanges = () => {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: false,
      drawerData: {
        type: DrawerTypes.AddStep
      }
    })
    setSelectedStepId(undefined)
  }

  if (stepData) {
    title = (
      <div className={css.stepConfig}>
        <div className={css.title}>
          <Icon name={stepsFactory.getStepIcon(stepData?.type || /* istanbul ignore next */ '')} />
          <Text lineClamp={1} color={Color.BLACK}>
            {stepData?.name}
          </Text>
        </div>
        <div>
          <Button minimal className={css.applyChanges} text={getString('applyChanges')} onClick={applyChanges} />
          <Button minimal className={css.discard} text={getString('pipeline.discard')} onClick={discardChanges} />
        </div>
      </div>
    )
  } else {
    switch (type) {
      case DrawerTypes.FailureStrategy:
        title = (
          <div className={css.title}>
            <Icon name="failure-strategy" size={40} />
            {getString('stageName', selectedStage?.stage)} / {getString('pipeline.failureStrategies.title')}
          </div>
        )
        break
      case DrawerTypes.SkipCondition:
        title = (
          <div className={css.title}>
            <Icon name="conditional-skip" size={20} />
            {getString('stageName', selectedStage?.stage)} / {getString('skipConditionTitle')}
          </div>
        )
        break
      case DrawerTypes.PipelineNotifications:
        title = getString('notifications.name')
        break
      case DrawerTypes.EnableGitExperience:
        title = getString('enableGitExperience')
        break
      default:
        title = null
    }
  }

  React.useEffect(() => {
    if (selectedStepId && selectedStage) {
      let step: ExecutionWrapper | undefined
      let drawerType = DrawerTypes.StepConfig
      // 1. search for step in execution
      const execStep = getStepFromId(selectedStage?.stage?.spec?.execution, selectedStepId, false, false)
      step = execStep.node
      if (!step) {
        drawerType = DrawerTypes.ConfigureService
        // 2. search for step in serviceDependencies
        const depStep = selectedStage?.stage?.spec?.serviceDependencies?.find(
          (item: any) => item.identifier === selectedStepId
        )
        step = depStep
      }

      // 3. if we find step open right drawer
      if (step) {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: true,
          drawerData: {
            type: drawerType,
            data: {
              stepConfig: {
                node: step,
                stepsMap: data?.paletteData?.stepsMap || new Map(),
                onUpdate: data?.paletteData?.onUpdate,
                isStepGroup: false,
                addOrEdit: 'edit',
                hiddenAdvancedPanels: data?.paletteData?.hiddenAdvancedPanels
              }
            }
          }
        })
      } else {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: false,
          drawerData: {
            type: DrawerTypes.AddStep
          }
        })
      }
    }
  }, [selectedStepId, selectedStage])

  const updateStepWithinStage = (
    execution: ExecutionElementConfig,
    processingNodeIdentifier: string,
    processedNode: ExecutionWrapper
  ): void => {
    // Finds the step in the stage, and updates with the processed node
    execution?.steps?.forEach(stepWithinStage => {
      if (stepWithinStage.stepGroup) {
        // If stage has a step group, loop over the step group steps and update the matching identifier with node
        if (stepWithinStage.stepGroup?.identifier === processingNodeIdentifier) {
          stepWithinStage.stepGroup = processedNode as any
        } else {
          updateStepWithinStage(stepWithinStage.stepGroup, processingNodeIdentifier, processedNode)
        }
      } else if (stepWithinStage.parallel) {
        // If stage has a parallel steps, loop over and update the matching identifier with node
        stepWithinStage.parallel.forEach((parallelStep: ExecutionWrapper) => {
          if (parallelStep?.stepGroup?.identifier === processingNodeIdentifier) {
            parallelStep.stepGroup = processedNode as any
          } else if (parallelStep.step?.identifier === processingNodeIdentifier) {
            parallelStep.step = processedNode
          } else {
            updateStepWithinStage(parallelStep?.stepGroup, processingNodeIdentifier, processedNode)
          }
        })
      } else if (stepWithinStage.step?.identifier === processingNodeIdentifier) {
        // Else simply find the matching step ad update the node
        stepWithinStage.step = processedNode
      }
    })
    if (execution?.rollbackSteps) {
      updateStepWithinStage({ steps: execution.rollbackSteps }, processingNodeIdentifier, processedNode)
    }
  }

  const onSubmitStep = async (item: ExecutionWrapper, drawerType: DrawerTypes): Promise<void> => {
    if (data?.stepConfig?.node) {
      const processNode = produce<ExecutionWrapper>(data.stepConfig.node, node => {
        // Add/replace values only if they are presented
        if (item.name && item.tab !== TabTypes.Advanced) node.name = item.name
        if (item.identifier && item.tab !== TabTypes.Advanced) node.identifier = item.identifier
        if (item.description && item.tab !== TabTypes.Advanced) node.description = item.description
        if (item.skipCondition && item.tab === TabTypes.Advanced) node.skipCondition = item.skipCondition
        if (item.when && item.tab === TabTypes.Advanced) node.when = item.when
        if (item.timeout && item.tab !== TabTypes.Advanced) node.timeout = item.timeout
        // default strategies can be present without having the need to click on Advanced Tab. For eg. in CV step.
        if (item.failureStrategies) node.failureStrategies = item.failureStrategies
        if (
          item.delegateSelectors &&
          item.delegateSelectors.length > 0 &&
          Array.isArray(item.delegateSelectors) &&
          item.tab === TabTypes.Advanced
        ) {
          node.spec = {
            ...(node.spec ? node.spec : {}),
            delegateSelectors: item.delegateSelectors
          }
        }

        // Delete values if they were already added and now removed
        if (node.timeout && !item.timeout && item.tab !== TabTypes.Advanced) delete node.timeout
        if (node.description && !item.description && item.tab !== TabTypes.Advanced) delete node.description
        if (node.skipCondition && !item.skipCondition && item.tab === TabTypes.Advanced) delete node.skipCondition
        if (node.failureStrategies && !item.failureStrategies && item.tab === TabTypes.Advanced)
          delete node.failureStrategies
        if (
          node.spec?.delegateSelectors &&
          node.spec.delegateSelectors.length > 0 &&
          Array.isArray(item.delegateSelectors) &&
          (!item.delegateSelectors || item.delegateSelectors?.length === 0) &&
          item.tab === TabTypes.Advanced
        ) {
          delete node.spec.delegateSelectors
        }

        if (item.spec && item.tab !== TabTypes.Advanced) {
          node.spec = { ...item.spec }
        }
      })
      if (data?.stepConfig?.node?.identifier) {
        if (drawerType === DrawerTypes.StepConfig && selectedStage?.stage?.spec?.execution) {
          const processingNodeIdentifier = data?.stepConfig?.node?.identifier
          updateStepWithinStage(selectedStage.stage.spec.execution, processingNodeIdentifier, processNode)
          await updateStage(selectedStage.stage)
          data?.stepConfig?.onUpdate?.(processNode)
        } else if (
          drawerType === DrawerTypes.ProvisionerStepConfig &&
          selectedStage?.stage?.spec?.infrastructure?.infrastructureDefinition?.provisioner
        ) {
          const processingNodeIdentifier = data?.stepConfig?.node?.identifier
          updateStepWithinStage(
            selectedStage.stage.spec.infrastructure.infrastructureDefinition.provisioner,
            processingNodeIdentifier,
            processNode
          )
          await updateStage(selectedStage.stage)
          data?.stepConfig?.onUpdate?.(processNode)
        }
      }
    }

    // TODO: temporary fix for FF
    // can be removed once the unified solution across modules is implemented
    if (stageType === StageTypes.FEATURE) {
      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: false,
        drawerData: { type: DrawerTypes.StepConfig }
      })
      setSelectedStepId(undefined)
    }
  }

  const onServiceDependencySubmit = (item: ExecutionWrapper): void => {
    if (data?.stepConfig?.addOrEdit === 'add' && selectedStageId) {
      const { stage: pipelineStage } = getStageFromPipeline(selectedStageId)
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
    } else if (data?.stepConfig?.addOrEdit === 'edit') {
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
  }
  const { openDialog: openConfirmBEUpdateError } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('pipeline.stepConfigHasChanges'),
    titleText: stepData?.name || getString('pipeline.closeStepConfig'),
    confirmButtonText: getString('applyChanges'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        applyChanges()
      }
    }
  })

  const closeDrawer = (e?: SyntheticEvent<HTMLElement, Event> | undefined) => {
    e?.persist()
    if (checkDuplicateStep(formikRef, data, getString)) {
      return
    }
    if (formikRef.current?.isDirty()) {
      openConfirmBEUpdateError()
      return
    }
    updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
    setSelectedStepId(undefined)
  }

  return (
    <Drawer
      onClose={async e => {
        closeDrawer(e)
      }}
      usePortal={true}
      autoFocus={true}
      canEscapeKeyClose={type !== DrawerTypes.ExecutionStrategy}
      canOutsideClickClose={type !== DrawerTypes.ExecutionStrategy}
      enforceFocus={false}
      hasBackdrop={true}
      size={DrawerSizes[type]}
      isOpen={isDrawerOpened}
      position={Position.RIGHT}
      title={title}
      data-type={type}
      className={cx(
        css.main,
        { [css.almostFullScreen]: isAlmostFullscreen },
        { [css.fullScreen]: ConfigureStepScreenDrawers.includes(type) }
      )}
      {...restDrawerProps}
      // {...(type === DrawerTypes.FlowControl ? { style: { right: 60, top: 64 }, hasBackdrop: false } : {})}
      isCloseButtonShown={title ? !isAlmostFullscreen : undefined}
      // BUG: https://github.com/palantir/blueprint/issues/4519
      // you must pass only a single classname, not even an empty string, hence passing a dummy class
      // "classnames" package cannot be used here because it returns an empty string when no classes are applied
      portalClassName={isAlmostFullscreen ? css.almostFullScreenPortal : 'pipeline-studio-right-drawer'}
    >
      {isAlmostFullscreen ? (
        <Button
          minimal
          className={css.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={() => {
            updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
            setSelectedStepId(undefined)
          }}
        />
      ) : null}
      {type === DrawerTypes.StepConfig && data?.stepConfig?.node && (
        <StepCommands
          key={`step-form-${data.stepConfig.node.identifier}`}
          step={data.stepConfig.node}
          isReadonly={isReadonly}
          ref={formikRef}
          isNewStep={!data.stepConfig.stepsMap.get(data.stepConfig.node.identifier)?.isSaved}
          stepsFactory={stepsFactory}
          hasStepGroupAncestor={!!data?.stepConfig?.isUnderStepGroup}
          onChange={value => onSubmitStep(value, DrawerTypes.StepConfig)}
          isStepGroup={data.stepConfig.isStepGroup}
          hiddenPanels={data.stepConfig.hiddenAdvancedPanels}
          domain={domain}
        />
      )}
      {type === DrawerTypes.AddStep && selectedStageId && data?.paletteData && (
        <StepPalette
          selectedStage={selectedStage || {}}
          stepsFactory={stepsFactory}
          stageType={stageType as StageTypes}
          onSelect={(item: StepData) => {
            const paletteData = data.paletteData
            if (paletteData?.entity) {
              const { stage: pipelineStage } = getStageFromPipeline(selectedStageId)
              const newStepData = {
                step: {
                  type: item.type,
                  name: item.name,
                  identifier: generateRandomString(item.name),
                  spec: {}
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
                        stepsMap: paletteData.stepsMap,
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
      {type === DrawerTypes.PipelineNotifications && <PipelineNotifications />}
      {type === DrawerTypes.FlowControl && <FlowControl />}
      {type === DrawerTypes.FailureStrategy && selectedStageId ? (
        <FailureStrategyWithRef
          selectedStage={selectedStage}
          isReadonly={isReadonly}
          ref={formikRef}
          onUpdate={({ failureStrategies }) => {
            const { stage: pipelineStage } = getStageFromPipeline(selectedStageId)
            if (pipelineStage && pipelineStage.stage) {
              pipelineStage.stage.failureStrategies = failureStrategies
              updatePipeline(pipeline)
            }
          }}
        />
      ) : null}

      {type === DrawerTypes.SkipCondition && selectedStageId ? (
        <SkipCondition
          isReadonly={isReadonly}
          selectedStage={selectedStage || {}}
          onUpdate={({ skipCondition }) => {
            const { stage: pipelineStage } = getStageFromPipeline(selectedStageId)
            if (pipelineStage && pipelineStage.stage) {
              pipelineStage.stage.skipCondition = skipCondition?.trim()
              updatePipeline(pipeline)
            }
          }}
        />
      ) : null}
      {type === DrawerTypes.ConfigureService && selectedStageId && data?.stepConfig && data?.stepConfig.node && (
        <StepCommands
          key={`step-form-${data.stepConfig.node.identifier}`}
          step={data.stepConfig.node}
          isReadonly={isReadonly}
          ref={formikRef}
          isNewStep={!data.stepConfig.stepsMap.get(data.stepConfig.node.identifier)?.isSaved}
          stepsFactory={stepsFactory}
          onChange={onServiceDependencySubmit}
          isStepGroup={false}
          withoutTabs
          domain={domain}
        />
      )}

      {type === DrawerTypes.AddProvisionerStep && selectedStageId && data?.paletteData && (
        <StepPalette
          selectedStage={selectedStage || {}}
          stepsFactory={stepsFactory}
          stageType={stageType as StageTypes}
          isProvisioner={true}
          onSelect={(item: StepData) => {
            const paletteData = data.paletteData
            if (paletteData?.entity) {
              const { stage: pipelineStage } = getStageFromPipeline(selectedStageId)
              const newStepData = {
                step: {
                  type: item.type,
                  name: item.name,
                  identifier: generateRandomString(item.name),
                  spec: {}
                }
              }

              data?.paletteData?.onUpdate?.(newStepData.step)

              if (!get(pipelineStage?.stage, 'spec.infrastructure.infrastructureDefinition.provisioner')) {
                set(pipelineStage?.stage, 'spec.infrastructure.infrastructureDefinition.provisioner', {
                  steps: [],
                  rollbackSteps: []
                })
              }

              addStepOrGroup(
                paletteData.entity,
                get(pipelineStage?.stage, 'spec.infrastructure.infrastructureDefinition.provisioner'),
                newStepData,
                paletteData.isParallelNodeClicked,
                paletteData.isRollback
              )

              updatePipeline(pipeline).then(() => {
                updatePipelineView({
                  ...pipelineView,
                  isDrawerOpened: true,
                  drawerData: {
                    type: DrawerTypes.ProvisionerStepConfig,
                    data: {
                      stepConfig: {
                        node: newStepData.step,
                        stepsMap: paletteData.stepsMap,
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
      {type === DrawerTypes.ProvisionerStepConfig && data?.stepConfig?.node && (
        <StepCommands
          key={`step-form-${data.stepConfig.node.identifier}`}
          step={data.stepConfig.node}
          ref={formikRef}
          isReadonly={isReadonly}
          isNewStep={!data.stepConfig.stepsMap.get(data.stepConfig.node.identifier)?.isSaved}
          stepsFactory={stepsFactory}
          hasStepGroupAncestor={!!data?.stepConfig?.isUnderStepGroup}
          onChange={value => onSubmitStep(value, DrawerTypes.ProvisionerStepConfig)}
          isStepGroup={data.stepConfig.isStepGroup}
          hiddenPanels={data.stepConfig.hiddenAdvancedPanels}
          domain={domain}
        />
      )}
      {type === DrawerTypes.EnableGitExperience && <EnableGitExperience closeDrawer={closeDrawer} />}
    </Drawer>
  )
}
