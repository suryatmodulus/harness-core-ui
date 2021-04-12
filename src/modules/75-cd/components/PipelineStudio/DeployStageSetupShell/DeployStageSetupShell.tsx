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
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import DeployInfraSpecifications from '../DeployInfraSpecifications/DeployInfraSpecifications'
import DeployServiceSpecifications from '../DeployServiceSpecifications/DeployServiceSpecifications'
import DeployStageSpecifications from '../DeployStageSpecifications/DeployStageSpecifications'
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
  const layoutRef = React.useRef<HTMLDivElement>(null)

  const {
    state: {
      pipeline,
      originalPipeline,
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

  const { errorMap } = useValidationErrors()

  function isStageError(stageName: string): { isError: boolean; errors: [string, string[]][] } {
    const { stage, parent } = getStageFromPipeline(selectedStageId)
    const { stages } = pipeline

    const path =
      stages!.indexOf(stage!) > -1
        ? `pipeline.stages.${stages?.indexOf(stage!)}`
        : parent!.parallel
        ? `pipeline.stages.${stages?.indexOf(parent!)}.parallel.${parent?.parallel.indexOf(stage)}`
        : ''

    if (errorMap) {
      return {
        isError:
          Array.from(errorMap.keys()).filter(item => item.indexOf(`${path}.stage.spec.${stageName}`) > -1).length > 0,
        errors: Array.from(errorMap).filter(item => {
          return item[0].indexOf(`${path}.stage.spec.${stageName}`) > -1
        })
      }
    } else {
      return { isError: false, errors: [] }
    }
  }

  React.useEffect(() => {
    if (layoutRef.current) {
      layoutRef.current.scrollTo(0, 0)
    }
  }, [selectedTabId])

  React.useEffect(() => {
    if (selectedTabId === getString('executionText')) {
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
  }, [pipeline, selectedTabId, selectedStageId, errorMap])

  const selectedStage = getStageFromPipeline(selectedStageId).stage
  const originalStage = getStageFromPipeline(selectedStageId, originalPipeline).stage
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
            selectedTabId === getString('executionText')
              ? getString('infrastructureText')
              : selectedTabId === getString('infrastructureText')
              ? getString('service')
              : 'default'
          )
        }}
      />

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
    </Layout.Horizontal>
  )

  const errors = {
    serviceConfig: {
      ...isStageError('serviceConfig')
    },
    infrastructure: {
      ...isStageError('infrastructure')
    },

    execution: {
      ...isStageError('execution')
    }
  }

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
          id={getString('service')}
          title={
            <span className={css.tab}>
              <Icon name="service" height={20} size={20} />
              {getString('service')}
              {errors.serviceConfig.isError ? (
                <Icon
                  name="warning-sign"
                  height={10}
                  size={10}
                  color={'orange500'}
                  margin={{ left: 'small', right: 0 }}
                  style={{ verticalAlign: 'baseline' }}
                />
              ) : null}
            </span>
          }
          panel={<DeployServiceSpecifications errors={errors.serviceConfig}>{navBtns}</DeployServiceSpecifications>}
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
              <Icon name="yaml-builder-stages" height={20} size={20} />
              {getString('infrastructureText')}
              {errors.infrastructure.isError ? (
                <Icon
                  name="warning-sign"
                  height={10}
                  size={10}
                  color={'orange500'}
                  margin={{ left: 'small', right: 0 }}
                  style={{ verticalAlign: 'baseline' }}
                />
              ) : null}
            </span>
          }
          panel={<DeployInfraSpecifications errors={errors.infrastructure}>{navBtns}</DeployInfraSpecifications>}
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
              <Icon name="yaml-builder-steps" height={20} size={20} />
              {getString('executionText')}
              {errors.execution.isError ? (
                <Icon
                  name="warning-sign"
                  height={10}
                  size={10}
                  color={'orange500'}
                  margin={{ left: 'small', right: 0 }}
                  style={{ verticalAlign: 'baseline' }}
                />
              ) : null}
            </span>
          }
          className={css.fullHeight}
          panel={
            <ExecutionGraph
              allowAddGroup={true}
              hasRollback={true}
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
              errors={errors.execution}
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
            {getString('pipeline.failureStrategies.title')}
          </Button>
        </React.Fragment>
      </Tabs>
    </section>
  )
}
