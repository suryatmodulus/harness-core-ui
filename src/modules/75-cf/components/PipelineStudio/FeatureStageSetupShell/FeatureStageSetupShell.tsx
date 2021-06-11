import React from 'react'
import { Layout, Tabs, Tab, Button, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import { set } from 'lodash-es'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { useStrings } from 'framework/strings'
//import { useStrings } from 'framework/strings'
import FeatureInfraSpecifications from '../FeatureInfraSpecifications/FeatureInfraSpecifications'
import FeatureStageSpecifications from '../FeatureStageSpecifications/FeatureStageSpecifications'
import css from './FeatureStageSetupShell.module.scss'

export default function FeatureStageSetupShell(): JSX.Element {
  const { getString } = useStrings()
  const stageNames: string[] = [
    getString('cf.pipeline.stages.setup.title'),
    getString('cf.pipeline.stages.execution.title')
  ]
  const [selectedTabId, setSelectedTabId] = React.useState<string>(getString('cf.pipeline.stages.setup.title'))
  const layoutRef = React.useRef<HTMLDivElement>(null)
  const {
    state: {
      pipeline,
      originalPipeline,
      pipelineView: { isSplitViewOpen },
      pipelineView,
      selectionState: { selectedStageId = '' }
    },
    stepsFactory,
    isReadonly,
    updatePipeline,
    getStageFromPipeline,
    updatePipelineView,
    setSelectedStepId,
    getStagePathFromPipeline
  } = React.useContext(PipelineContext)

  //const { getString } = useStrings()

  const stagePath = getStagePathFromPipeline(selectedStageId || '', 'pipeline.stages')

  React.useEffect(() => {
    if (stageNames.indexOf(selectedStageId) !== -1) {
      setSelectedTabId(selectedStageId)
    }
  }, [selectedStageId, pipeline, isSplitViewOpen, stageNames])

  const handleTabChange = (data: string): void => {
    setSelectedTabId(data)
  }

  React.useEffect(() => {
    if (layoutRef.current) {
      layoutRef.current.scrollTo(0, 0)
    }
  }, [selectedTabId])

  React.useEffect(() => {
    const { stage: data } = getStageFromPipeline(selectedStageId)
    if (data) {
      let shouldUpdate = false
      if (!data?.stage?.spec?.execution?.steps) {
        set(data, 'stage.spec.execution.steps', [])
        shouldUpdate = true
      }

      if (shouldUpdate) {
        updatePipeline(pipeline)
      }
    }
  }, [pipeline, selectedStageId])

  const selectedStage = getStageFromPipeline(selectedStageId).stage
  const originalStage = getStageFromPipeline(selectedStageId, originalPipeline).stage
  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const navBtns = (
    <Layout.Horizontal spacing="medium" padding="medium" className={css.footer}>
      <Button
        text={getString('previous')}
        icon="chevron-left"
        disabled={selectedTabId === getString('cf.pipeline.default')}
        onClick={() => {
          updatePipeline(pipeline)
          setSelectedTabId(
            selectedTabId === getString('cf.pipeline.stages.execution.title')
              ? getString('cf.pipeline.stages.setup.title')
              : getString('cf.pipeline.default')
          )
        }}
      />

      <Button
        text={selectedTabId === getString('cf.pipeline.stages.execution.title') ? getString('save') : getString('next')}
        intent="primary"
        rightIcon="chevron-right"
        onClick={() => {
          updatePipeline(pipeline)
          if (selectedTabId === getString('cf.pipeline.stages.execution.title')) {
            updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
          } else {
            setSelectedTabId(
              selectedTabId === getString('cf.pipeline.default')
                ? getString('cf.pipeline.stages.setup.title')
                : getString('cf.pipeline.stages.execution.title')
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
      className={cx(css.setupShell, {
        [css.tabsFullHeight]: selectedTabId === getString('cf.pipeline.stages.execution.title')
      })}
    >
      <Tabs id="stageSetupShell" onChange={handleTabChange} selectedTabId={selectedTabId} data-tabId={selectedTabId}>
        <Tab
          panelClassName="tabsfoo"
          id={getString('cf.pipeline.default')}
          panel={<FeatureStageSpecifications>{navBtns}</FeatureStageSpecifications>}
          title={
            <span className={css.tab}>
              <Icon name="cd-main" height={20} size={20} />
              Stage Overview
            </span>
          }
        />
        <Tab
          id={getString('cf.pipeline.stages.setup.title')}
          title={
            <span className={css.tab}>
              <Icon name="yaml-builder-stages" height={20} size={20} />
              {getString('cf.pipeline.stages.setup.title')}
            </span>
          }
          panel={<FeatureInfraSpecifications>{navBtns}</FeatureInfraSpecifications>}
        />
        <Tab
          id={getString('cf.pipeline.stages.execution.title')}
          title={
            <span className={css.tab}>
              <Icon name="yaml-builder-steps" height={20} size={20} />
              {getString('cf.pipeline.stages.execution.title')}
            </span>
          }
          className={css.fullHeight}
          panel={
            <ExecutionGraph
              allowAddGroup={false}
              hasRollback={false}
              isReadonly={isReadonly}
              hasDependencies={false}
              stepsFactory={stepsFactory}
              ref={executionRef}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              stage={selectedStage!}
              originalStage={originalStage}
              updateStage={() => {
                updatePipeline(pipeline)
              }}
              // Check and update the correct stage path here
              pathToStage={`${stagePath}.stage.spec.execution`}
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
                        hiddenAdvancedPanels: [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
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
                        hiddenAdvancedPanels: [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
                      }
                    }
                  }
                })
              }}
              onSelectStep={(stepId: string) => {
                setSelectedStepId(stepId)
              }}
            />
          }
        />
      </Tabs>
    </section>
  )
}
