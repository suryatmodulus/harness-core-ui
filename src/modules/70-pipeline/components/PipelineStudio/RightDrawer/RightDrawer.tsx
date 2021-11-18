import React, { SyntheticEvent } from 'react'
import { Dialog, Drawer, Intent, Position } from '@blueprintjs/core'
import {
  Button,
  Icon,
  Text,
  Color,
  MultiTypeInputType,
  useModalHook,
  useConfirmationDialog
} from '@wings-software/uicore'
import { cloneDeep, defaultTo, get, isEmpty, isNil, merge, omit, set } from 'lodash-es'
import cx from 'classnames'
import produce from 'immer'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { ExecutionElementConfig, StepElementConfig, StepGroupElementConfig } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { StepActions } from '@common/constants/TrackingConstants'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { BuildStageElementConfig, DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type { DependencyElement } from 'services/ci'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import type { TemplateStepData } from '@pipeline/utils/tempates'
import type { NGTemplateInfoConfig, TemplateSummaryResponse } from 'services/template-ng'
import { ModalProps, TemplateConfigModal } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PipelineGovernanceView } from '@governance/views/PipelineGovernanceView/PipelineGovernanceView'
import { DefaultTemplate } from 'framework/Templates/templates'
import { useSaveTemplate } from '@pipeline/utils/useSaveTemplate'
import { useQueryParams } from '@common/hooks'
import { getStepPaletteModuleInfosFromStage } from '@pipeline/utils/stepUtils'
import { getIdentifierFromValue, getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerData, DrawerSizes, DrawerTypes, TemplateDrawerTypes } from '../PipelineContext/PipelineActions'
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
    updatePipeline,
    isReadonly,
    updateStage,
    updatePipelineView,
    updateTemplateView,
    setTemplateTypes,
    getStageFromPipeline,
    stepsFactory,
    setSelectedStepId
  } = usePipelineContext()
  const { type, data, ...restDrawerProps } = drawerData
  const { trackEvent } = useTelemetry()
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const { stage: selectedStage } = getStageFromPipeline(selectedStageId || '')
  const stageType = selectedStage?.stage?.type

  let stepData = (data?.stepConfig?.node as StepElementConfig)?.type
    ? stepsFactory.getStepData((data?.stepConfig?.node as StepElementConfig)?.type)
    : null
  const templateStepTemplate = (data?.stepConfig?.node as TemplateStepData)?.template
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
          <Icon name={stepsFactory.getStepIcon(stepType || '')} />
          <Text
            lineClamp={1}
            color={Color.BLACK}
            tooltipProps={{ dataTooltipId: `${stepType}_stepName${toolTipType}` }}
          >
            {stepData ? stepData?.name : stepsFactory.getStepName(stepType || '')}
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
      case DrawerTypes.PipelineNotifications:
        title = getString('notifications.name')
        break
      default:
        title = null
    }
  }

  const [template, setTemplate] = React.useState<NGTemplateInfoConfig>()
  const [modalProps, setModalProps] = React.useState<ModalProps>()

  const [showConfigModal, hideConfigModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} className={css.configDialog}>
        {modalProps && template && (
          <TemplateConfigModal
            initialValues={merge(template, { repo: defaultTo(repoIdentifier, ''), branch: defaultTo(branch, '') })}
            onClose={hideConfigModal}
            modalProps={modalProps}
          />
        )}
      </Dialog>
    ),
    [template, modalProps, repoIdentifier, branch]
  )

  const { saveAndPublish } = useSaveTemplate(
    {
      template: template as NGTemplateInfoConfig,
      gitDetails: { repoIdentifier, branch },
      isPipelineStudio: true
    },
    hideConfigModal
  )

  const onSaveAsTemplate = (spec: StepOrStepGroupOrTemplateStepData) => {
    setTemplate(
      produce(DefaultTemplate, draft => {
        draft.projectIdentifier = projectIdentifier
        draft.orgIdentifier = orgIdentifier
        draft.spec = omit(spec, 'name', 'identifier')
      })
    )
    setModalProps({
      title: getString('common.template.saveAsNewTemplateHeading'),
      promise: saveAndPublish
    })
    showConfigModal()
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
      const processNode = produce(data.stepConfig.node as StepElementConfig & TemplateStepData, node => {
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

  const updateNode = async (processNode: StepElementConfig | TemplateStepData) => {
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

  const closeTemplatesView = React.useCallback(() => {
    updateTemplateView({
      isTemplateDrawerOpened: false,
      templateDrawerData: { type: TemplateDrawerTypes.UseTemplate }
    })
  }, [updateTemplateView])

  const onUseTemplate = (_step: StepOrStepGroupOrTemplateStepData) => {
    const stepType =
      (data?.stepConfig?.node as StepElementConfig)?.type ||
      get(templateTypes, getIdentifierFromValue((data?.stepConfig?.node as TemplateStepData).template.templateRef))
    updateTemplateView({
      isTemplateDrawerOpened: true,
      templateDrawerData: {
        type: TemplateDrawerTypes.UseTemplate,
        data: {
          selectorData: {
            templateType: 'Step',
            childTypes: [stepType],
            onCopyTemplate: async (copiedTemplate: TemplateSummaryResponse) => {
              closeTemplatesView()
              const node = drawerData.data?.stepConfig?.node as StepOrStepGroupOrTemplateStepData
              const processNode: StepElementConfig = merge(
                produce({} as StepElementConfig, draft => {
                  draft.name = node?.name || ''
                  draft.identifier = node?.identifier || ''
                }),
                parse(copiedTemplate?.yaml || '').template.spec
              )
              await updateNode(processNode)
              formikRef.current?.resetForm()
            },
            onUseTemplate: async (copiedTemplate: TemplateSummaryResponse) => {
              closeTemplatesView()
              set(templateTypes, copiedTemplate.identifier || '', parse(copiedTemplate.yaml || '').template.spec.type)
              setTemplateTypes(templateTypes)
              const node = drawerData.data?.stepConfig?.node as StepOrStepGroupOrTemplateStepData
              const processNode = produce({} as TemplateStepData, draft => {
                draft.name = node?.name || ''
                draft.identifier = node?.identifier || ''
                const scope = getScopeFromDTO(copiedTemplate)
                set(
                  draft,
                  'template.templateRef',
                  scope === Scope.PROJECT ? copiedTemplate.identifier : `${scope}.${copiedTemplate.identifier}`
                )
                set(draft, 'template.versionLabel', copiedTemplate.versionLabel)
              })
              await updateNode(processNode)
            }
          }
        }
      }
    })
  }

  const onRemoveTemplate = async () => {
    const node = drawerData.data?.stepConfig?.node as TemplateStepData
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
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          onUseTemplate={onUseTemplate}
          onRemoveTemplate={onRemoveTemplate}
          onSaveAsTemplate={onSaveAsTemplate}
          isStepGroup={data.stepConfig.isStepGroup}
          hiddenPanels={data.stepConfig.hiddenAdvancedPanels}
          stageType={stageType as StageType}
        />
      )}
      {type === DrawerTypes.AddStep && selectedStageId && data?.paletteData && (
        <StepPalette
          stepsFactory={stepsFactory}
          stepPaletteModuleInfos={getStepPaletteModuleInfosFromStage(stageType)}
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
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          withoutTabs
          stageType={stageType as StageType}
        />
      )}

      {type === DrawerTypes.AddProvisionerStep && selectedStageId && data?.paletteData && (
        <StepPalette
          stepsFactory={stepsFactory}
          stepPaletteModuleInfos={getStepPaletteModuleInfosFromStage(stageType)}
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
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
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
