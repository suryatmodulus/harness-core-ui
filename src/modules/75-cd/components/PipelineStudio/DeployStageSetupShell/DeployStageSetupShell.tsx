import React from 'react'
import { Layout, Tabs, Tab, Button, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import type { HarnessIconName } from '@wings-software/uicore/dist/icons/HarnessIcons'
import type {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { PipelineContext, ExecutionGraph } from '@pipeline/exports'

import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { useStrings } from 'framework/exports'
import DeployInfraSpecifications from '../DeployInfraSpecifications/DeployInfraSpecifications'
import DeployServiceSpecifications from '../DeployServiceSpecifications/DeployServiceSpecifications'
import DeployStageSpecifications from '../DeployStageSpecifications/DeployStageSpecifications'
import i18n from './DeployStageSetupShell.i18n'
import css from './DeployStageSetupShell.module.scss'

export const MapStepTypeToIcon: { [key: string]: HarnessIconName } = {
  Deployment: 'pipeline-deploy',
  CI: 'pipeline-build-select',
  Approval: 'pipeline-approval',
  Pipeline: 'pipeline',
  Custom: 'pipeline-custom'
}

export default function DeployStageSetupShell(): JSX.Element {
  const stageNames: string[] = [i18n.serviceLabel, i18n.infraLabel, i18n.executionLabel]
  const [selectedTabId, setSelectedTabId] = React.useState<string>(i18n.serviceLabel)
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const {
    state: {
      pipeline,
      pipelineView: {
        splitViewData: { selectedStageId = '', stageType },
        isSplitViewOpen
      },
      pipelineView
    },
    stagesMap,
    stepsFactory,
    updatePipeline,
    getStageFromPipeline,
    updatePipelineView
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()

  React.useEffect(() => {
    if (stageNames.indexOf(selectedStageId) !== -1) {
      setSelectedTabId(selectedStageId)
    }
  }, [selectedStageId, pipeline, isSplitViewOpen, stageNames])

  const handleTabChange = (data: string): void => {
    setSelectedTabId(data)
  }

  function openFailureStrategyPanel(): void {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: true,
      drawerData: {
        type: DrawerTypes.FailureStrategy
      }
    })
  }

  function openSkipConditionPanel(): void {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: true,
      drawerData: {
        type: DrawerTypes.SkipCondition
      }
    })
  }

  React.useEffect(() => {
    if (layoutRef.current) {
      layoutRef.current.scrollTo(0, 0)
    }
  }, [selectedTabId])

  React.useEffect(() => {
    if (selectedTabId === i18n.executionLabel) {
      const { stage: data } = getStageFromPipeline(selectedStageId)
      if (data?.stage) {
        if (!data?.stage?.spec?.execution) {
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

  const selectedStage = getStageFromPipeline(selectedStageId).stage
  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const navBtns = (
    <Layout.Horizontal spacing="medium" padding="medium" className={css.footer}>
      <Button
        text={i18n.previous}
        icon="chevron-left"
        disabled={selectedTabId === i18n.defaultId}
        onClick={() => {
          updatePipeline(pipeline)
          setSelectedTabId(
            selectedTabId === i18n.executionLabel
              ? i18n.infraLabel
              : selectedTabId === i18n.infraLabel
              ? i18n.serviceLabel
              : i18n.defaultId
          )
        }}
      />

      <Button
        text={selectedTabId === i18n.executionLabel ? i18n.save : i18n.next}
        intent="primary"
        rightIcon="chevron-right"
        onClick={() => {
          updatePipeline(pipeline)
          if (selectedTabId === i18n.executionLabel) {
            updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
          } else {
            setSelectedTabId(
              selectedTabId === i18n.defaultId
                ? i18n.serviceLabel
                : selectedTabId === i18n.serviceLabel
                ? i18n.infraLabel
                : i18n.executionLabel
            )
          }
        }}
      />
    </Layout.Horizontal>
  )

  return (
    <section
      ref={layoutRef}
      key={selectedStageId}
      // className={cx(css.setupShell, { [css.tabsFullHeight]: selectedTabId === i18n.executionLabel })}
      className={cx(css.setupShell)}
    >
      <Tabs id="stageSetupShell" onChange={handleTabChange} selectedTabId={selectedTabId} data-tabId={selectedTabId}>
        <Tab
          panelClassName="tabsfoo"
          id={i18n.defaultId}
          panel={<DeployStageSpecifications>{navBtns}</DeployStageSpecifications>}
          title={
            <span className={css.tab}>
              <Icon name="cd-main" height={20} size={20} />
              Stage Overview
            </span>
          }
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
          id={i18n.serviceLabel}
          title={
            <span className={css.tab}>
              <Icon name="service" height={20} size={20} />
              {i18n.serviceLabel}
            </span>
          }
          panel={<DeployServiceSpecifications>{navBtns}</DeployServiceSpecifications>}
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
          id={i18n.infraLabel}
          title={
            <span className={css.tab}>
              <Icon name="yaml-builder-stages" height={20} size={20} />
              {i18n.infraLabel}
            </span>
          }
          panel={<DeployInfraSpecifications>{navBtns}</DeployInfraSpecifications>}
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
          id={i18n.executionLabel}
          title={
            <span className={css.tab}>
              <Icon name="yaml-builder-steps" height={20} size={20} />
              {i18n.executionLabel}
            </span>
          }
          className={css.fullHeight}
          panel={
            <ExecutionGraph
              allowAddGroup={true}
              hasRollback={true}
              hasDependencies={false}
              stepsFactory={stepsFactory}
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
            />
          }
        />
        <React.Fragment>
          <div className={css.spacer} />
          <Button
            minimal
            onClick={openSkipConditionPanel}
            iconProps={{ margin: 'xsmall' }}
            className={css.failureStrategy}
            icon="conditional-skip"
          >
            {getString('skipConditionTitle')}
          </Button>
          <Button
            minimal
            iconProps={{ size: 28, margin: 'xsmall' }}
            className={css.failureStrategy}
            onClick={openFailureStrategyPanel}
            icon="failure-strategy"
          >
            {getString('failureStrategy.title')}
          </Button>
        </React.Fragment>
      </Tabs>
    </section>
  )
}
