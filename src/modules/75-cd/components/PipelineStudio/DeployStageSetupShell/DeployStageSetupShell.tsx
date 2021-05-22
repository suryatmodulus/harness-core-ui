import React from 'react'
import { Layout, Tabs, Tab, Button, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import { get } from 'lodash-es'
import type { HarnessIconName } from '@wings-software/uicore/dist/icons/HarnessIcons'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { useStrings } from 'framework/strings'
import type { StageElementWrapper } from 'services/cd-ng'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import DeployInfraSpecifications from '../DeployInfraSpecifications/DeployInfraSpecifications'
import DeployServiceSpecifications from '../DeployServiceSpecifications/DeployServiceSpecifications'
import DeployStageSpecifications from '../DeployStageSpecifications/DeployStageSpecifications'
import DeployAdvancedSpecifications from '../DeployAdvancedSpecifications/DeployAdvancedSpecifications'
import css from './DeployStageSetupShell.module.scss'

export const MapStepTypeToIcon: { [key: string]: HarnessIconName } = {
  Deployment: 'pipeline-deploy',
  CI: 'pipeline-build-select',
  Approval: 'pipeline-approval',
  Pipeline: 'pipeline',
  Custom: 'pipeline-custom'
}

export enum DeployTabs {
  OVERVIEW = 'OVERVIEW',
  SERVICE = 'SERVICE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  EXECUTION = 'EXECUTION',
  ADVANCED = 'ADVANCED'
}

const TabsOrder = [
  DeployTabs.OVERVIEW,
  DeployTabs.SERVICE,
  DeployTabs.INFRASTRUCTURE,
  DeployTabs.EXECUTION,
  DeployTabs.ADVANCED
]

export default function DeployStageSetupShell(): JSX.Element {
  const { getString } = useStrings()
  const [isTabNavigationAllowed, setTabNavigationAllowed] = React.useState<boolean>(false)
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const { errorMap } = useValidationErrors()

  const {
    state: {
      pipeline,
      originalPipeline,
      pipelineView: { isSplitViewOpen },
      pipelineView,
      selectionState: { selectedStageId, selectedStepId }
    },
    stagesMap,
    isReadonly,
    stepsFactory,
    updatePipeline,
    getStageFromPipeline,
    updatePipelineView,
    setSelectedStepId,
    getStagePathFromPipeline
  } = React.useContext(PipelineContext)
  const [selectedTabId, setSelectedTabId] = React.useState<DeployTabs>(
    selectedStepId ? DeployTabs.EXECUTION : DeployTabs.SERVICE
  )

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(DeployTabs.EXECUTION)
    }
  }, [selectedStepId])

  React.useEffect(() => {
    const { stage } = getStageFromPipeline(selectedStageId || '')
    updateTabNavigation(stage as StageElementWrapper, selectedTabId)
  }, [selectedStageId, pipeline, isSplitViewOpen, selectedTabId])

  const handleTabChange = (data: DeployTabs): void => {
    setSelectedTabId(data)
  }

  const updateTabNavigation = (stage: StageElementWrapper, selectedTab: DeployTabs): void => {
    if (selectedTab === DeployTabs.SERVICE) {
      const hasService = get(stage, 'stage.spec.serviceConfig.service.identifier', false)
      const hasServiceRef = get(stage, 'stage.spec.serviceConfig.serviceRef', false)
      const hasUseFromStage = get(stage, 'stage.spec.serviceConfig.useFromStage.stage', false)
      if (!!hasService || !!hasServiceRef || !!hasUseFromStage) {
        setTabNavigationAllowed(true)
      } else {
        isTabNavigationAllowed && setTabNavigationAllowed(false)
      }
    }

    if (selectedTab === DeployTabs.INFRASTRUCTURE) {
      const hasEnvironment = get(stage, 'stage.spec.infrastructure.environment.identifier', false)
      let hasEnvironmentRef = get(stage, 'stage.spec.infrastructure.environmentRef', false)
      hasEnvironmentRef = hasEnvironmentRef?.value !== undefined ? !!hasEnvironmentRef?.value : hasEnvironmentRef
      if (!!hasEnvironment || !!hasEnvironmentRef) {
        !isTabNavigationAllowed && setTabNavigationAllowed(true)
      } else {
        isTabNavigationAllowed && setTabNavigationAllowed(false)
      }
    }
    if (selectedTab === DeployTabs.OVERVIEW) {
      const stageName = get(stage, 'stage.name', null)
      if (!stageName) {
        isTabNavigationAllowed && setTabNavigationAllowed(false)
      } else {
        !isTabNavigationAllowed && setTabNavigationAllowed(true)
      }
    }
  }

  React.useEffect(() => {
    /* istanbul ignore else */
    if (layoutRef.current) {
      layoutRef.current.scrollTo(0, 0)
    }
  }, [selectedTabId])

  React.useEffect(() => {
    if (selectedTabId === DeployTabs.EXECUTION) {
      const { stage: data } = getStageFromPipeline(selectedStageId || '')
      if (data?.stage) {
        if (!data?.stage?.spec?.execution) {
          const stageType = data?.stage?.type
          const openExecutionStrategy = stageType ? stagesMap[stageType].openExecutionStrategy : true
          // if !data?.stage?.spec?.execution and openExecutionStrategy===true show ExecutionStrategy drawer
          if (openExecutionStrategy) {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: {
                type: DrawerTypes.ExecutionStrategy,
                hasBackdrop: true
              }
            })
          }
        } else {
          // set default (empty) values
          // NOTE: this cannot be set in advance as data.stage.spec.execution===undefined is a trigger to open ExecutionStrategy for CD stage
          if (data?.stage?.spec?.execution) {
            if (!data.stage.spec.execution.steps) {
              data.stage.spec.execution.steps = []
            }
            if (!data.stage.spec.execution.rollbackSteps) {
              data.stage.spec.execution.rollbackSteps = []
            }
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline, selectedTabId, selectedStageId])

  const selectedStage = selectedStageId ? getStageFromPipeline(selectedStageId).stage : undefined
  const originalStage = selectedStageId ? getStageFromPipeline(selectedStageId, originalPipeline).stage : undefined
  const stagePath = getStagePathFromPipeline(selectedStageId || '', 'pipeline.stages')
  const deploymentType = selectedStage?.stage?.spec?.serviceConfig?.serviceDefinition.type

  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const navBtns = (
    <Layout.Horizontal spacing="medium" padding="medium" className={css.footer}>
      <Button
        text={getString('previous')}
        icon="chevron-left"
        disabled={selectedTabId === DeployTabs.OVERVIEW}
        onClick={() => {
          updatePipeline(pipeline)
          setSelectedTabId(TabsOrder[Math.max(0, TabsOrder.indexOf(selectedTabId) - 1)])
        }}
      />
      {selectedTabId === DeployTabs.ADVANCED ? (
        <Button
          text={getString('done')}
          intent="primary"
          onClick={() => {
            updatePipelineView({ ...pipelineView, isSplitViewOpen: false })
          }}
        />
      ) : (
        <Button
          text={selectedTabId === DeployTabs.EXECUTION ? getString('save') : getString('next')}
          intent="primary"
          rightIcon="chevron-right"
          onClick={() => {
            updatePipeline(pipeline)
            if (selectedTabId === DeployTabs.EXECUTION) {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
            } else {
              setSelectedTabId(TabsOrder[Math.min(TabsOrder.length, TabsOrder.indexOf(selectedTabId) + 1)])
            }
          }}
        />
      )}
    </Layout.Horizontal>
  )
  const errorKeys = [...errorMap.keys()]
  const servicesHasWarning = errorKeys.some(key => stagePath && key.startsWith(`${stagePath}.stage.spec.serviceConfig`))
  const infraHasWarning = errorKeys.some(key => stagePath && key.startsWith(`${stagePath}.stage.spec.infrastructure`))
  const executionHasWarning = errorKeys.some(key => stagePath && key.startsWith(`${stagePath}.stage.spec.execution`))

  return (
    <section ref={layoutRef} key={selectedStageId} className={cx(css.setupShell)}>
      <Tabs id="stageSetupShell" onChange={handleTabChange} selectedTabId={selectedTabId} data-tabId={selectedTabId}>
        <Tab
          id={DeployTabs.OVERVIEW}
          panel={<DeployStageSpecifications>{navBtns}</DeployStageSpecifications>}
          title={
            <span className={css.title}>
              <Icon name="cd-main" height={20} size={20} />
              {getString('overview')}
            </span>
          }
          data-testid="overview"
        />

        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={DeployTabs.SERVICE}
          title={
            <span className={css.title} data-warning={servicesHasWarning}>
              <Icon name={servicesHasWarning ? 'warning-sign' : 'services'} size={servicesHasWarning ? 16 : 20} />
              {getString('service')}
            </span>
          }
          disabled={!isTabNavigationAllowed}
          panel={<DeployServiceSpecifications>{navBtns}</DeployServiceSpecifications>}
          data-testid="service"
        />
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={DeployTabs.INFRASTRUCTURE}
          title={
            <span className={css.title} data-warning={infraHasWarning}>
              <Icon name={infraHasWarning ? 'warning-sign' : 'infrastructure'} size={infraHasWarning ? 16 : 20} />
              {getString('infrastructureText')}
            </span>
          }
          disabled={!isTabNavigationAllowed || deploymentType === ''}
          panel={<DeployInfraSpecifications>{navBtns}</DeployInfraSpecifications>}
          data-testid="infrastructure"
        />
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={DeployTabs.EXECUTION}
          title={
            <span className={css.title} data-warning={executionHasWarning}>
              <Icon name={executionHasWarning ? 'warning-sign' : 'execution'} size={executionHasWarning ? 16 : 20} />
              {getString('executionText')}
            </span>
          }
          className={css.fullHeight}
          disabled={!isTabNavigationAllowed || deploymentType === ''}
          panel={
            <ExecutionGraph
              allowAddGroup={true}
              hasRollback={true}
              isReadonly={isReadonly}
              hasDependencies={false}
              stepsFactory={stepsFactory}
              originalStage={originalStage}
              ref={executionRef}
              pathToStage={`${stagePath}.stage.spec.execution`}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              stage={selectedStage!}
              updateStage={() => {
                updatePipeline(pipeline)
              }}
              onAddStep={(event: ExecutionGraphAddStepEvent) => {
                updatePipelineView({
                  ...pipelineView,
                  isDrawerOpened: true,
                  drawerData: {
                    type: DrawerTypes.AddStep,
                    data: {
                      paletteData: {
                        entity: event.entity,
                        stepsMap: event.stepsMap,
                        onUpdate: executionRef.current?.stepGroupUpdated,
                        // isAddStepOverride: true,
                        isRollback: event.isRollback,
                        isParallelNodeClicked: event.isParallel,
                        hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                      }
                    }
                  }
                })
              }}
              onEditStep={(event: ExecutionGraphEditStepEvent) => {
                updatePipelineView({
                  ...pipelineView,
                  isDrawerOpened: true,
                  drawerData: {
                    type: DrawerTypes.StepConfig,
                    data: {
                      stepConfig: {
                        node: event.node,
                        stepsMap: event.stepsMap,
                        onUpdate: executionRef.current?.stepGroupUpdated,
                        isStepGroup: event.isStepGroup,
                        isUnderStepGroup: event.isUnderStepGroup,
                        addOrEdit: event.addOrEdit,
                        hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                      }
                    }
                  }
                })
              }}
              onSelectStep={(stepId: string) => {
                setSelectedStepId(stepId)
              }}
              selectedStepId={selectedStepId}
            />
          }
          data-testid="execution"
        />
        <Icon
          name="chevron-right"
          height={20}
          size={20}
          margin={{ right: 'small', left: 'small' }}
          color={'grey400'}
          style={{ alignSelf: 'center' }}
        />
        <Tab
          id={DeployTabs.ADVANCED}
          title={
            <span className={css.title}>
              <Icon name="advanced" height={20} size={20} />
              Advanced
            </span>
          }
          className={css.fullHeight}
          disabled={!isTabNavigationAllowed}
          panel={<DeployAdvancedSpecifications>{navBtns}</DeployAdvancedSpecifications>}
          data-testid="advanced"
        />
      </Tabs>
    </section>
  )
}
