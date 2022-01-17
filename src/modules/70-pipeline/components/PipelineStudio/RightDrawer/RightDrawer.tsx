/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { SyntheticEvent } from 'react'
import { Drawer, Intent, Position } from '@blueprintjs/core'
import {
  Button,
  Icon,
  Text,
  Color,
  useConfirmationDialog,
  FontVariation,
  ButtonVariation,
  ButtonSize
} from '@wings-software/uicore'
import { cloneDeep, defaultTo, get, isEmpty, isEqual, isNil, set } from 'lodash-es'
import cx from 'classnames'
import produce from 'immer'
import { parse } from 'yaml'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { ExecutionElementConfig, StepElementConfig, StepGroupElementConfig } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { StepActions } from '@common/constants/TrackingConstants'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { BuildStageElementConfig, DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { DependencyElement } from 'services/ci'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { PipelineGovernanceView } from '@governance/PipelineGovernanceView'
import { getStepPaletteModuleInfosFromStage } from '@pipeline/utils/stepUtils'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import { useTemplateSelector } from '@pipeline/utils/useTemplateSelector'
import { createTemplate } from '@pipeline/utils/templateUtils'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerData, DrawerSizes, DrawerTypes } from '../PipelineContext/PipelineActions'
import { StepCommandsWithRef as StepCommands, StepFormikRef } from '../StepCommands/StepCommands'
import {
  StepCommandsViews,
  StepOrStepGroupOrTemplateStepData,
  TabTypes,
  Values
} from '../StepCommands/StepCommandTypes'
import { StepPalette } from '../StepPalette/StepPalette'
import { addService, addStepOrGroup, generateRandomString, getStepFromId } from '../ExecutionGraph/ExecutionGraphUtil'
import PipelineVariables from '../PipelineVariables/PipelineVariables'
import { PipelineNotifications } from '../PipelineNotifications/PipelineNotifications'
import { PipelineTemplates } from '../PipelineTemplates/PipelineTemplates'
import { ExecutionStrategy, ExecutionStrategyRefInterface } from '../ExecutionStrategy/ExecutionStrategy'
import type { StepData } from '../../AbstractSteps/AbstractStepFactory'
import { StepType } from '../../PipelineSteps/PipelineStepInterface'
import { FlowControl } from '../FlowControl/FlowControl'
import { AdvancedOptions } from '../AdvancedOptions/AdvancedOptions'
import css from './RightDrawer.module.scss'

export const FullscreenDrawers: DrawerTypes[] = [
  DrawerTypes.PipelineVariables,
  DrawerTypes.PipelineNotifications,
  DrawerTypes.FlowControl,
  DrawerTypes.AdvancedOptions,
  DrawerTypes.PolicySets
]

const checkDuplicateStep = (
  formikRef: React.MutableRefObject<StepFormikRef<unknown> | null>,
  data: DrawerData['data'],
  getString: UseStringsReturn['getString']
): boolean => {
  const values = formikRef.current?.getValues() as Values
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

export const updateStepWithinStage = (
  execution: ExecutionElementConfig,
  processingNodeIdentifier: string,
  processedNode: StepElementConfig
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
      stepWithinStage.parallel.forEach(parallelStep => {
        if (parallelStep?.stepGroup?.identifier === processingNodeIdentifier) {
          parallelStep.stepGroup = processedNode as any
        } else if (parallelStep.step?.identifier === processingNodeIdentifier) {
          parallelStep.step = processedNode
        } else if (parallelStep?.stepGroup) {
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

export const RightDrawer: React.FC = (): JSX.Element => {
  const {
    state: {
      templateTypes,
      pipelineView: { drawerData, isDrawerOpened, isSplitViewOpen },
      pipelineView,
      selectionState: { selectedStageId, selectedStepId },
      pipeline
    },
    allowableTypes,
    updatePipeline,
    isReadonly,
    updateStage,
    updatePipelineView,
    getStageFromPipeline,
    stepsFactory,
    setSelectedStepId,
    setTemplateTypes
  } = usePipelineContext()
  const { type, data, ...restDrawerProps } = drawerData
  const { trackEvent } = useTelemetry()
  const { openTemplateSelector, closeTemplateSelector } = useTemplateSelector()

  const { stage: selectedStage } = getStageFromPipeline(selectedStageId || '')
  const stageType = selectedStage?.stage?.type

  let stepData = (data?.stepConfig?.node as StepElementConfig)?.type
    ? stepsFactory.getStepData((data?.stepConfig?.node as StepElementConfig)?.type || '')
    : null
  const templateStepTemplate = (data?.stepConfig?.node as TemplateStepNode)?.template
  const formikRef = React.useRef<StepFormikRef | null>(null)
  const executionStrategyRef = React.useRef<ExecutionStrategyRefInterface | null>(null)
  const { getString } = useStrings()
  const isFullScreenDrawer = FullscreenDrawers.includes(type)
  let title: React.ReactNode | null = null
  if (data?.stepConfig?.isStepGroup) {
    stepData = stepsFactory.getStepData(StepType.StepGroup)
  }

  const applyChanges = async (): Promise<void> => {
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
      if (data?.stepConfig?.isStepGroup) {
        trackEvent(StepActions.AddEditStepGroup, {
          name: (formikRef?.current?.getValues?.() as Values).name || ''
        })
      } else {
        trackEvent(StepActions.AddEditStep, {
          name: data?.stepConfig?.node?.name || '',
          type: (data?.stepConfig?.node as StepElementConfig)?.type || ''
        })
      }
    }
  }
  const discardChanges = (): void => {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: false,
      drawerData: {
        type: DrawerTypes.AddStep
      }
    })
    setSelectedStepId(undefined)
  }

  if (stepData || templateStepTemplate) {
    const stepType = stepData
      ? stepData?.type
      : get(templateTypes, getIdentifierFromValue(templateStepTemplate.templateRef))
    const toolTipType = type ? `_${type}` : ''
    title = (
      <div className={css.stepConfig}>
        <div className={css.title}>
          <Icon
            name={stepsFactory.getStepIcon(stepType || '')}
            {...(stepsFactory.getStepIconColor(stepType || '')
              ? { color: stepsFactory.getStepIconColor(stepType || '') }
              : {})}
            style={{ color: stepsFactory.getStepIconColor(stepType || '') }}
            size={24}
          />
          <Text
            lineClamp={1}
            color={Color.BLACK}
            tooltipProps={{ dataTooltipId: `${stepType}_stepName${toolTipType}` }}
            font={{ variation: FontVariation.H4 }}
          >
            {stepData ? stepData?.name : stepsFactory.getStepName(stepType || '')}
          </Text>
        </div>
        <div>
          <Button
            variation={ButtonVariation.SECONDARY}
            size={ButtonSize.SMALL}
            className={css.applyChanges}
            text={getString('applyChanges')}
            onClick={applyChanges}
          />
          <Button minimal className={css.discard} text={getString('pipeline.discard')} onClick={discardChanges} />
        </div>
      </div>
    )
  } else {
    switch (type) {
      case DrawerTypes.PipelineNotifications:
        title = getString('notifications.name')
        break
      default:
        title = null
    }
  }

  React.useEffect(() => {
    if (selectedStepId && selectedStage && !pipelineView.isDrawerOpened && isSplitViewOpen) {
      let step
      let drawerType = DrawerTypes.StepConfig
      // 1. search for step in execution
      const execStep = getStepFromId(selectedStage?.stage?.spec?.execution, selectedStepId, false, false)
      step = execStep.node
      if (!step) {
        drawerType = DrawerTypes.ConfigureService
        // 2. search for step in serviceDependencies
        const depStep = (selectedStage?.stage as BuildStageElementConfig)?.spec?.serviceDependencies?.find(
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
                node: step as any,
                stepsMap: data?.paletteData?.stepsMap || data?.stepConfig?.stepsMap || new Map(),
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
  }, [selectedStepId, selectedStage, isSplitViewOpen])

  const onSubmitStep = async (item: Partial<Values>, drawerType: DrawerTypes): Promise<void> => {
    if (data?.stepConfig?.node) {
      const processNode = produce(data.stepConfig.node as StepElementConfig & TemplateStepNode, node => {
        // Add/replace values only if they are presented
        if (item.name && item.tab !== TabTypes.Advanced) node.name = item.name
        if (item.identifier && item.tab !== TabTypes.Advanced) node.identifier = item.identifier
        if ((item as StepElementConfig).description && item.tab !== TabTypes.Advanced)
          node.description = (item as StepElementConfig).description
        if (item.when && item.tab === TabTypes.Advanced) node.when = item.when
        if ((item as StepElementConfig).timeout && item.tab !== TabTypes.Advanced)
          node.timeout = (item as StepElementConfig).timeout
        // default strategies can be present without having the need to click on Advanced Tab. For eg. in CV step.
        if (Array.isArray(item.failureStrategies)) {
          node.failureStrategies = item.failureStrategies
          const telemetryData = item.failureStrategies.map(strategy => ({
            onError: strategy.onFailure?.errors?.join(', '),
            action: strategy.onFailure?.action?.type
          }))
          telemetryData.length &&
            trackEvent(StepActions.AddEditFailureStrategy, { data: JSON.stringify(telemetryData) })
        }
        if (item.delegateSelectors && item.tab === TabTypes.Advanced) {
          set(node, 'spec.delegateSelectors', item.delegateSelectors)
        }

        // Delete values if they were already added and now removed
        if (node.timeout && !(item as StepElementConfig).timeout && item.tab !== TabTypes.Advanced) delete node.timeout
        if (node.description && !(item as StepElementConfig).description && item.tab !== TabTypes.Advanced)
          delete node.description
        if (node.failureStrategies && !item.failureStrategies && item.tab === TabTypes.Advanced)
          delete node.failureStrategies
        if (
          node.spec?.delegateSelectors &&
          (!item.delegateSelectors || item.delegateSelectors?.length === 0) &&
          item.tab === TabTypes.Advanced
        ) {
          delete node.spec.delegateSelectors
        }
        if (item.template) {
          node.template = item.template
        }
        if ((item as StepElementConfig).spec && item.tab !== TabTypes.Advanced) {
          node.spec = { ...(item as StepElementConfig).spec }
        }
      })
      if (data?.stepConfig?.node?.identifier) {
        const provisioner = (selectedStage?.stage as DeploymentStageElementConfig)?.spec?.infrastructure
          ?.infrastructureDefinition?.provisioner
        if (drawerType === DrawerTypes.StepConfig && selectedStage?.stage?.spec?.execution) {
          const processingNodeIdentifier = data?.stepConfig?.node?.identifier
          const stageData = produce(selectedStage, draft => {
            if (draft.stage?.spec?.execution) {
              updateStepWithinStage(draft.stage.spec.execution, processingNodeIdentifier, processNode)
            }
          })
          // update view data before updating pipeline because its async
          updatePipelineView(
            produce(pipelineView, draft => {
              set(draft, 'drawerData.data.stepConfig.node', processNode)
            })
          )

          if (stageData.stage) {
            await updateStage(stageData.stage)
          }

          data?.stepConfig?.onUpdate?.(processNode)
        } else if (drawerType === DrawerTypes.ProvisionerStepConfig && provisioner) {
          const processingNodeIdentifier = data?.stepConfig?.node?.identifier
          updateStepWithinStage(provisioner, processingNodeIdentifier, processNode)

          if (selectedStage?.stage) {
            await updateStage(selectedStage.stage)
          }
          data?.stepConfig?.onUpdate?.(processNode)
        }
      }
    }

    // TODO: temporary fix for FF
    // can be removed once the unified solution across modules is implemented
    if (stageType === StageType.FEATURE) {
      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: false,
        drawerData: { type: DrawerTypes.StepConfig }
      })
      setSelectedStepId(undefined)
    }
  }

  const onServiceDependencySubmit = async (item: Partial<Values>): Promise<void> => {
    const { stage: pipelineStage } = (selectedStageId && cloneDeep(getStageFromPipeline(selectedStageId))) || {}
    if (data?.stepConfig?.addOrEdit === 'add' && pipelineStage) {
      const newServiceData: DependencyElement = {
        identifier: item.identifier || '',
        name: item.name,
        type: StepType.Dependency,
        ...((item as StepElementConfig).description && { description: (item as StepElementConfig).description }),
        spec: (item as StepElementConfig).spec
      }
      if (!(pipelineStage.stage as BuildStageElementConfig)?.spec?.serviceDependencies?.length) {
        set(pipelineStage, 'stage.spec.serviceDependencies', [])
      }
      addService((pipelineStage.stage as BuildStageElementConfig)?.spec?.serviceDependencies || [], newServiceData)
      if (pipelineStage.stage) {
        await updateStage(pipelineStage.stage)
      }
      updatePipelineView({
        ...pipelineView,
        isDrawerOpened: false,
        drawerData: { type: DrawerTypes.ConfigureService }
      })
      data.stepConfig?.onUpdate?.(newServiceData)
    } else if (data?.stepConfig?.addOrEdit === 'edit' && pipelineStage) {
      const node = data?.stepConfig?.node as DependencyElement
      if (node) {
        const serviceDependency = (pipelineStage.stage as BuildStageElementConfig)?.spec?.serviceDependencies?.find(
          // NOTE: "node.identifier" is used as item.identifier may contain changed identifier
          dep => dep.identifier === node.identifier
        )

        if (serviceDependency) {
          if (item.identifier) serviceDependency.identifier = item.identifier
          if (item.name) serviceDependency.name = item.name
          if ((item as StepElementConfig).description)
            serviceDependency.description = (item as StepElementConfig).description
          if ((item as StepElementConfig).spec) serviceDependency.spec = (item as StepElementConfig).spec
        }

        // Delete values if they were already added and now removed
        if (node.description && !(item as StepElementConfig).description) delete node.description

        if (pipelineStage.stage) {
          await updateStage(pipelineStage.stage)
        }
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
    intent: Intent.WARNING,
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        applyChanges()
      }
    }
  })

  const closeDrawer = (e?: SyntheticEvent<HTMLElement, Event> | undefined): void => {
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
  const { onSearchInputChange } = usePipelineVariables()

  const onStepSelection = async (item: StepData): Promise<void> => {
    const paletteData = data?.paletteData
    if (paletteData?.entity) {
      const { stage: pipelineStage } = cloneDeep(getStageFromPipeline(selectedStageId || ''))
      const newStepData = {
        step: {
          type: item.type,
          name: item.name,
          identifier: generateRandomString(item.name),
          spec: {}
        }
      }
      if (pipelineStage && !pipelineStage.stage?.spec) {
        set(pipelineStage, 'stage.spec', {})
      }
      if (pipelineStage && isNil(pipelineStage.stage?.spec?.execution)) {
        if (paletteData.isRollback) {
          set(pipelineStage, 'stage.spec.execution', { rollbackSteps: [] })
        } else {
          set(pipelineStage, 'stage.spec.execution', { steps: [] })
        }
      }
      data?.paletteData?.onUpdate?.(newStepData.step)
      addStepOrGroup(
        paletteData.entity,
        pipelineStage?.stage?.spec?.execution as any,
        newStepData,
        paletteData.isParallelNodeClicked,
        paletteData.isRollback
      )

      if (pipelineStage?.stage) {
        await updateStage(pipelineStage?.stage)
      }
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
              hiddenAdvancedPanels: data?.paletteData?.hiddenAdvancedPanels
            }
          }
        }
      })

      return
    }
    updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
  }

  const updateNode = async (processNode: StepElementConfig | TemplateStepNode) => {
    const newPipelineView = produce(pipelineView, draft => {
      set(draft, 'drawerData.data.stepConfig.node', processNode)
    })
    updatePipelineView(newPipelineView)
    const processingNodeIdentifier = drawerData.data?.stepConfig?.node?.identifier || ''
    const stageData = produce(selectedStage, draft => {
      if (draft?.stage?.spec?.execution) {
        updateStepWithinStage(draft.stage.spec.execution, processingNodeIdentifier, processNode as any)
      }
    })
    if (stageData?.stage) {
      await updateStage(stageData.stage)
    }
    drawerData.data?.stepConfig?.onUpdate?.(processNode)
  }

  const onUseTemplate = () => {
    const stepType =
      (data?.stepConfig?.node as StepElementConfig)?.type ||
      get(templateTypes, getIdentifierFromValue((data?.stepConfig?.node as TemplateStepNode).template.templateRef))
    openTemplateSelector({
      templateType: 'Step',
      childTypes: [stepType],
      selectedTemplateRef: getIdentifierFromValue(
        defaultTo((data?.stepConfig?.node as TemplateStepNode)?.template?.templateRef, '')
      ),
      onUseTemplate: async (template: TemplateSummaryResponse, isCopied = false) => {
        closeTemplateSelector()
        const node = drawerData.data?.stepConfig?.node as StepOrStepGroupOrTemplateStepData
        if (
          !isCopied &&
          isEqual((node as TemplateStepNode)?.template?.templateRef, template.identifier) &&
          isEqual((node as TemplateStepNode)?.template?.versionLabel, template.versionLabel)
        ) {
          return
        }
        const processNode = isCopied
          ? produce(defaultTo(parse(template?.yaml || '').template.spec, {}) as StepElementConfig, draft => {
              draft.name = defaultTo(node?.name, '')
              draft.identifier = defaultTo(node?.identifier, '')
            })
          : createTemplate<TemplateStepNode>(node as unknown as TemplateStepNode, template)
        await updateNode(processNode)
        if (!isCopied && template?.identifier && template?.childType) {
          templateTypes[template.identifier] = template.childType
          setTemplateTypes(templateTypes)
        }
      }
    })
  }

  const onRemoveTemplate = async () => {
    const node = drawerData.data?.stepConfig?.node as TemplateStepNode
    const processNode = produce({} as StepElementConfig, draft => {
      draft.name = node.name
      draft.identifier = node.identifier
      draft.type = get(templateTypes, getIdentifierFromValue(node.template.templateRef))
    })
    await updateNode(processNode)
  }

  return (
    <Drawer
      onClose={async e => {
        if (type === DrawerTypes.PipelineVariables) {
          onSearchInputChange?.('')
        }
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
      className={cx(css.main, css.almostFullScreen, css.fullScreen, { [css.showRighDrawer]: isFullScreenDrawer })}
      {...restDrawerProps}
      // {...(type === DrawerTypes.FlowControl ? { style: { right: 60, top: 64 }, hasBackdrop: false } : {})}
      isCloseButtonShown={false}
      // BUG: https://github.com/palantir/blueprint/issues/4519
      // you must pass only a single classname, not even an empty string, hence passing a dummy class
      // "classnames" package cannot be used here because it returns an empty string when no classes are applied
      portalClassName={isFullScreenDrawer ? css.almostFullScreenPortal : 'pipeline-studio-right-drawer'}
    >
      <Button
        minimal
        className={css.almostFullScreenCloseBtn}
        icon="cross"
        withoutBoxShadow
        onClick={() => {
          if (type === DrawerTypes.ExecutionStrategy) {
            executionStrategyRef.current?.cancelExecutionStrategySelection()
          } else {
            if (type === DrawerTypes.PipelineVariables) {
              onSearchInputChange?.('')
            }
            updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
            setSelectedStepId(undefined)
          }
        }}
      />

      {type === DrawerTypes.StepConfig && data?.stepConfig?.node && (
        <StepCommands
          step={data.stepConfig.node as StepElementConfig | StepGroupElementConfig}
          isReadonly={isReadonly}
          ref={formikRef}
          checkDuplicateStep={checkDuplicateStep.bind(null, formikRef, data, getString)}
          isNewStep={!data.stepConfig.stepsMap.get(data.stepConfig.node.identifier)?.isSaved}
          stepsFactory={stepsFactory}
          hasStepGroupAncestor={!!data?.stepConfig?.isUnderStepGroup}
          onUpdate={value => onSubmitStep(value, DrawerTypes.StepConfig)}
          viewType={StepCommandsViews.Pipeline}
          allowableTypes={allowableTypes}
          onUseTemplate={onUseTemplate}
          onRemoveTemplate={onRemoveTemplate}
          isStepGroup={data.stepConfig.isStepGroup}
          hiddenPanels={data.stepConfig.hiddenAdvancedPanels}
          stageType={stageType as StageType}
        />
      )}
      {type === DrawerTypes.AddStep && selectedStageId && data?.paletteData && (
        <StepPalette
          stepsFactory={stepsFactory}
          stepPaletteModuleInfos={getStepPaletteModuleInfosFromStage(stageType, selectedStage?.stage)}
          stageType={stageType as StageType}
          onSelect={onStepSelection}
        />
      )}
      {/* TODO */}
      {type === DrawerTypes.PipelineVariables && <PipelineVariables />}
      {type === DrawerTypes.Templates && <PipelineTemplates />}
      {type === DrawerTypes.ExecutionStrategy && (
        <ExecutionStrategy selectedStage={selectedStage || {}} ref={executionStrategyRef} />
      )}
      {type === DrawerTypes.PipelineNotifications && <PipelineNotifications />}
      {type === DrawerTypes.FlowControl && <FlowControl />}
      {type === DrawerTypes.AdvancedOptions && (
        <AdvancedOptions
          pipeline={cloneDeep(pipeline)}
          onApplyChanges={async updatedPipeline => {
            await updatePipeline(updatedPipeline)
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: false,
              drawerData: {
                type: DrawerTypes.AddStep
              }
            })
          }}
          onDiscard={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: false,
              drawerData: {
                type: DrawerTypes.AddStep
              }
            })
          }}
        />
      )}
      {type === DrawerTypes.PolicySets && <PipelineGovernanceView pipelineName={pipeline.name} />}
      {type === DrawerTypes.ConfigureService && selectedStageId && data?.stepConfig && data?.stepConfig.node && (
        <StepCommands
          key={`step-form-${data.stepConfig.node.identifier}`}
          step={data.stepConfig.node as StepElementConfig}
          isReadonly={isReadonly}
          ref={formikRef}
          isNewStep={!data.stepConfig.stepsMap.get(data.stepConfig.node.identifier)?.isSaved}
          stepsFactory={stepsFactory}
          onUpdate={onServiceDependencySubmit}
          isStepGroup={false}
          allowableTypes={allowableTypes}
          withoutTabs
          stageType={stageType as StageType}
        />
      )}

      {type === DrawerTypes.AddProvisionerStep && selectedStageId && data?.paletteData && (
        <StepPalette
          stepsFactory={stepsFactory}
          stepPaletteModuleInfos={getStepPaletteModuleInfosFromStage(stageType, undefined, 'Provisioner')}
          stageType={stageType as StageType}
          isProvisioner={true}
          onSelect={async (item: StepData) => {
            const paletteData = data.paletteData
            if (paletteData?.entity) {
              const { stage: pipelineStage } = cloneDeep(getStageFromPipeline(selectedStageId))
              const newStepData = {
                step: {
                  type: item.type,
                  name: item.name,
                  identifier: generateRandomString(item.name),
                  spec: {}
                }
              }

              data?.paletteData?.onUpdate?.(newStepData.step)

              if (
                pipelineStage &&
                !get(pipelineStage?.stage, 'spec.infrastructure.infrastructureDefinition.provisioner')
              ) {
                set(pipelineStage, 'stage.spec.infrastructure.infrastructureDefinition.provisioner', {
                  steps: [],
                  rollbackSteps: []
                })
              }

              const provisioner = get(pipelineStage?.stage, 'spec.infrastructure.infrastructureDefinition.provisioner')
              // set empty arrays
              if (!paletteData.isRollback && !provisioner.steps) provisioner.steps = []
              if (paletteData.isRollback && !provisioner.rollbackSteps) provisioner.rollbackSteps = []

              addStepOrGroup(
                paletteData.entity,
                provisioner,
                newStepData,
                paletteData.isParallelNodeClicked,
                paletteData.isRollback
              )

              if (pipelineStage?.stage) {
                await updateStage(pipelineStage?.stage)
              }

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

              return
            }
            updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
          }}
        />
      )}
      {type === DrawerTypes.ProvisionerStepConfig && data?.stepConfig?.node && (
        <StepCommands
          key={`step-form-${data.stepConfig.node.identifier}`}
          step={data.stepConfig.node as StepElementConfig}
          ref={formikRef}
          isReadonly={isReadonly}
          allowableTypes={allowableTypes}
          checkDuplicateStep={checkDuplicateStep.bind(null, formikRef, data, getString)}
          isNewStep={!data.stepConfig.stepsMap.get(data.stepConfig.node.identifier)?.isSaved}
          stepsFactory={stepsFactory}
          hasStepGroupAncestor={!!data?.stepConfig?.isUnderStepGroup}
          onUpdate={value => onSubmitStep(value, DrawerTypes.ProvisionerStepConfig)}
          isStepGroup={data.stepConfig.isStepGroup}
          hiddenPanels={data.stepConfig.hiddenAdvancedPanels}
          stageType={stageType as StageType}
        />
      )}
    </Drawer>
  )
}
