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

export default function DeployStageSetupShell(): JSX.Element {
  const { getString } = useStrings()
  const stageNames: string[] = [getString('service'), getString('infrastructureText'), getString('executionText')]
  const [selectedTabId, setSelectedTabId] = React.useState<string>(getString('service'))
  const [isTabNavigationAllowed, setTabNavigationAllowed] = React.useState<boolean>(false)
  const layoutRef = React.useRef<HTMLDivElement>(null)
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
    setSelectedStepId
  } = React.useContext(PipelineContext)

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(getString('executionText'))
    }
  }, [selectedStepId])

  React.useEffect(() => {
    if (selectedStageId && stageNames.indexOf(selectedStageId) !== -1) {
      setSelectedTabId(selectedStageId)
    }
    const { stage } = getStageFromPipeline(selectedStageId || '', pipeline)
    updateTabNavigation(stage as StageElementWrapper, selectedTabId)
  }, [selectedStageId, pipeline, isSplitViewOpen, stageNames])

  const handleTabChange = (data: string): void => {
    setSelectedTabId(data)
  }

  const updateTabNavigation = (stage: StageElementWrapper, selectedTab: string): void => {
    if (selectedTab === getString('service')) {
      const hasService = get(stage, 'stage.spec.serviceConfig.service.identifier', false)
      const hasServiceRef = get(stage, 'stage.spec.serviceConfig.serviceRef', false)
      const hasUseFromStage = get(stage, 'stage.spec.serviceConfig.useFromStage.stage', false)
      if (!!hasService || !!hasServiceRef || !!hasUseFromStage) {
        setTabNavigationAllowed(true)
      } else {
        isTabNavigationAllowed && setTabNavigationAllowed(false)
      }
    }
    if (selectedTabId === getString('infrastructureText')) {
      const hasEnvironment = get(stage, 'stage.spec.infrastructure.environment.identifier', false)
      let hasEnvironmentRef = get(stage, 'stage.spec.infrastructure.environmentRef', false)
      hasEnvironmentRef = hasEnvironmentRef?.value !== undefined ? !!hasEnvironmentRef?.value : hasEnvironmentRef
      if (!!hasEnvironment || !!hasEnvironmentRef) {
        !isTabNavigationAllowed && setTabNavigationAllowed(true)
      } else {
        isTabNavigationAllowed && setTabNavigationAllowed(false)
      }
    }
  }
  React.useEffect(() => {
    if (layoutRef.current) {
      layoutRef.current.scrollTo(0, 0)
    }
  }, [selectedTabId])

  React.useEffect(() => {
    if (selectedTabId === getString('executionText')) {
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

  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const navBtns = (
    <Layout.Horizontal spacing="medium" padding="medium" className={css.footer}>
      <Button
        text={getString('previous')}
        icon="chevron-left"
        disabled={selectedTabId === 'default'}
        onClick={() => {
          updatePipeline(pipeline)
          setSelectedTabId(
            selectedTabId === 'advanced'
              ? getString('executionText')
              : selectedTabId === getString('executionText')
              ? getString('infrastructureText')
              : selectedTabId === getString('infrastructureText')
              ? getString('service')
              : 'default'
          )
        }}
      />
      {selectedTabId === 'advanced' ? (
        <Button
          text="Done"
          intent="primary"
          onClick={() => {
            updatePipelineView({ ...pipelineView, isSplitViewOpen: false })
          }}
        />
      ) : (
        <Button
          text={selectedTabId === getString('executionText') ? getString('save') : getString('next')}
          intent="primary"
          rightIcon="chevron-right"
          onClick={() => {
            updatePipeline(pipeline)
            if (selectedTabId === getString('executionText')) {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
            } else {
              setSelectedTabId(
                selectedTabId === 'default'
                  ? getString('service')
                  : selectedTabId === getString('service')
                  ? getString('infrastructureText')
                  : getString('executionText')
              )
            }
          }}
        />
      )}
    </Layout.Horizontal>
  )

  return (
    <section
      ref={layoutRef}
      key={selectedStageId}
      // className={cx(css.setupShell, { [css.tabsFullHeight]: selectedTabId === getString('executionText') })}
      className={cx(css.setupShell)}
    >
      <Tabs id="stageSetupShell" onChange={handleTabChange} selectedTabId={selectedTabId} data-tabId={selectedTabId}>
        <Tab
          panelClassName="tabsfoo"
          id={'default'}
          panel={<DeployStageSpecifications>{navBtns}</DeployStageSpecifications>}
          title={
            <span className={css.tab}>
              <Icon name="cd-main" height={20} size={20} />
              Overview
            </span>
          }
          data-testid="default"
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
          id={getString('service')}
          title={
            <span className={css.tab}>
              <Icon name="services" height={20} size={20} />
              {getString('service')}
            </span>
          }
          disabled={!isTabNavigationAllowed}
          panel={<DeployServiceSpecifications>{navBtns}</DeployServiceSpecifications>}
          data-testid={getString('service')}
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
          id={getString('infrastructureText')}
          title={
            <span className={css.tab}>
              <Icon name="infrastructure" height={20} size={20} />
              {getString('infrastructureText')}
            </span>
          }
          disabled={!isTabNavigationAllowed}
          panel={<DeployInfraSpecifications>{navBtns}</DeployInfraSpecifications>}
          data-testid={getString('infrastructureText')}
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
          id={getString('executionText')}
          title={
            <span className={css.tab}>
              <Icon name="execution" height={20} size={20} />
              {getString('executionText')}
            </span>
          }
          className={css.fullHeight}
          disabled={!isTabNavigationAllowed}
          panel={
            <ExecutionGraph
              allowAddGroup={true}
              hasRollback={true}
              isReadonly={isReadonly}
              hasDependencies={false}
              stepsFactory={stepsFactory}
              originalStage={originalStage}
              ref={executionRef}
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
          data-testid={getString('executionText')}
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
          id="advanced"
          title={
            <span className={css.tab}>
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
