import React from 'react'
import { Layout, Tabs, Tab, Button, Icon } from '@wings-software/uicore'
import cx from 'classnames'
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
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import { useQueryParams } from '@common/hooks'
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

const TabsOrder = [
  DeployTabs.OVERVIEW,
  DeployTabs.SERVICE,
  DeployTabs.INFRASTRUCTURE,
  DeployTabs.EXECUTION,
  DeployTabs.ADVANCED
]

export default function DeployStageSetupShell(): JSX.Element {
  const { getString } = useStrings()
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const { errorMap } = useValidationErrors()

  const {
    state: {
      originalPipeline,
      pipelineView,
      selectionState: { selectedStageId, selectedStepId }
    },
    stagesMap,
    isReadonly,
    stepsFactory,
    updateStage,
    getStageFromPipeline,
    updatePipelineView,
    setSelectedStepId,
    getStagePathFromPipeline,
    setSelectedSectionId
  } = React.useContext(PipelineContext)
  const [selectedTabId, setSelectedTabId] = React.useState<DeployTabs>(
    selectedStepId ? DeployTabs.EXECUTION : DeployTabs.SERVICE
  )
  const query = useQueryParams()
  React.useEffect(() => {
    const sectionId = (query as any).sectionId || ''
    if (sectionId?.length && TabsOrder.includes(sectionId)) {
      setSelectedTabId(sectionId)
    } else {
      setSelectedSectionId(DeployTabs.SERVICE)
    }
  }, [])

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(DeployTabs.EXECUTION)
    }
  }, [selectedStepId])

  const { checkErrorsForTab } = React.useContext(StageErrorContext)

  const handleTabChange = (nextTab: DeployTabs): void => {
    checkErrorsForTab(selectedTabId).then(_ => {
      setSelectedTabId(nextTab)
      setSelectedSectionId(nextTab)
    })
  }

  React.useEffect(() => {
    /* istanbul ignore else */
    if (layoutRef.current) {
      layoutRef.current.scrollTo(0, 0)
    }
  }, [selectedTabId])

  const { stage: data } = getStageFromPipeline(selectedStageId || '')

  React.useEffect(() => {
    if (selectedTabId === DeployTabs.EXECUTION) {
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
  }, [data, selectedTabId, selectedStageId])

  const selectedStage = selectedStageId ? getStageFromPipeline(selectedStageId).stage : undefined
  const originalStage = selectedStageId ? getStageFromPipeline(selectedStageId, originalPipeline).stage : undefined
  const stagePath = getStagePathFromPipeline(selectedStageId || '', 'pipeline.stages')

  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const navBtns = (
    <Layout.Horizontal spacing="medium" padding="medium" className={css.footer}>
      <Button
        text={getString('previous')}
        icon="chevron-left"
        disabled={selectedTabId === DeployTabs.OVERVIEW}
        onClick={() => {
          handleTabChange(TabsOrder[Math.max(0, TabsOrder.indexOf(selectedTabId) - 1)])
        }}
      />
      {selectedTabId === DeployTabs.ADVANCED ? (
        <Button
          text={getString('done')}
          intent="primary"
          onClick={() => {
            checkErrorsForTab(selectedTabId).then(_ => {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false })
            })
          }}
        />
      ) : (
        <Button
          text={selectedTabId === DeployTabs.EXECUTION ? getString('save') : getString('next')}
          intent="primary"
          rightIcon="chevron-right"
          onClick={() => {
            if (selectedTabId === DeployTabs.EXECUTION) {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
            } else {
              handleTabChange(TabsOrder[Math.min(TabsOrder.length, TabsOrder.indexOf(selectedTabId) + 1)])
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
  const failureHasWarning = errorKeys.some(key => stagePath && key.startsWith(`${stagePath}.stage.failureStrategies`))

  return (
    <section ref={layoutRef} key={selectedStageId} className={cx(css.setupShell)}>
      <Tabs id="stageSetupShell" onChange={handleTabChange} selectedTabId={selectedTabId} data-tabId={selectedTabId}>
        <Tab
          id={DeployTabs.OVERVIEW}
          panel={<DeployStageSpecifications>{navBtns}</DeployStageSpecifications>}
          title={
            <span className={css.title}>
              <Icon name="cd-main" height={20} size={20} className="hover" />
              {getString('overview')}
            </span>
          }
          data-testid="overview"
        />
        <Tab
          id={DeployTabs.SERVICE}
          title={
            <span className={css.title} data-warning={servicesHasWarning}>
              <Icon
                name={servicesHasWarning ? 'warning-sign' : 'services'}
                size={servicesHasWarning ? 16 : 20}
                className={servicesHasWarning ? '' : 'hover'}
              />
              {getString('service')}
            </span>
          }
          panel={<DeployServiceSpecifications>{navBtns}</DeployServiceSpecifications>}
          data-testid="service"
        />
        <Tab
          id={DeployTabs.INFRASTRUCTURE}
          title={
            <span className={css.title} data-warning={infraHasWarning}>
              <Icon
                name={infraHasWarning ? 'warning-sign' : 'infrastructure'}
                size={infraHasWarning ? 16 : 20}
                className={infraHasWarning ? '' : 'hover'}
              />
              {getString('infrastructureText')}
            </span>
          }
          panel={<DeployInfraSpecifications>{navBtns}</DeployInfraSpecifications>}
          data-testid="infrastructure"
        />
        <Tab
          id={DeployTabs.EXECUTION}
          title={
            <span className={css.title} data-warning={executionHasWarning}>
              <Icon
                name={executionHasWarning ? 'warning-sign' : 'execution'}
                size={executionHasWarning ? 16 : 20}
                className={executionHasWarning ? '' : 'hover'}
              />
              {getString('executionText')}
            </span>
          }
          className={css.fullHeight}
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
              updateStage={stageData => {
                if (stageData.stage) updateStage(stageData.stage)
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
                        node: event.node as any,
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
        <Tab
          id={DeployTabs.ADVANCED}
          title={
            <span className={css.title} data-warning={failureHasWarning}>
              <Icon
                name={failureHasWarning ? 'warning-sign' : 'advanced'}
                size={failureHasWarning ? 16 : 20}
                className={failureHasWarning ? '' : 'hover'}
              />
              Advanced
            </span>
          }
          className={css.fullHeight}
          panel={<DeployAdvancedSpecifications>{navBtns}</DeployAdvancedSpecifications>}
          data-testid="advanced"
        />
      </Tabs>
    </section>
  )
}
