import React, { useEffect, useRef } from 'react'
import YAML from 'yaml'
import { Button, Color, Icon, Layout, Tab, Tabs } from '@wings-software/uicore'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/exports'
import { useGetInitialStageYamlSnippet } from 'services/pipeline-ng'
import type { StageElementConfig, StageElementWrapper } from 'services/cd-ng'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ApprovalStageOverview } from './ApprovalStageOverview'
import { ApprovalStageExecution } from './ApprovalStageExecution'
import css from './ApprovalStageSetupShellMode.module.scss'

export const ApprovalStageSetupShellMode: React.FC = () => {
  const { getString } = useStrings()
  const tabHeadings = [getString('approvalStage.setupShellOverview'), getString('approvalStage.setupShellExecution')]

  const layoutRef = useRef<HTMLDivElement>(null)
  const [selectedTabId, setSelectedTabId] = React.useState<string>(tabHeadings[1])
  const {
    state: {
      pipeline,
      pipelineView: {
        splitViewData: { selectedStageId = '' }
      },
      pipelineView
    },
    getStageFromPipeline,
    updatePipeline,
    updateStage,
    updatePipelineView
  } = React.useContext(PipelineContext)

  const { stage: selectedStage = {} } = getStageFromPipeline(selectedStageId) as StageElementWrapper

  const ActionButtons = () => {
    return (
      <Layout.Horizontal spacing="medium" padding="medium" className={css.footer}>
        <Button
          text={getString('next')}
          intent="primary"
          rightIcon="chevron-right"
          onClick={() => {
            updatePipeline(pipeline)
            if (selectedTabId === tabHeadings[1]) {
              updatePipelineView({ ...pipelineView, isSplitViewOpen: false, splitViewData: {} })
            } else {
              setSelectedTabId(tabHeadings[1])
            }
          }}
        />
      </Layout.Horizontal>
    )
  }

  function openDrawer(drawerType: DrawerTypes): void {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: true,
      drawerData: {
        type: drawerType
      }
    })
  }

  React.useEffect(() => {
    // To drag and drop the canvas
    if (layoutRef.current) {
      layoutRef.current.scrollTo?.(0, 0)
    }
  }, [selectedTabId])

  const { data: yamlSnippet } = useGetInitialStageYamlSnippet({
    queryParams: {
      approvalType: selectedStage.stage.approvalType || StepType.HarnessApproval
    }
  })

  useEffect(() => {
    // error handling if needed
    if (yamlSnippet?.data) {
      // The last part of condition is important, as we only need to add the YAML snippet the first time in the step.
      if (selectedStage && selectedStage.stage.spec && !selectedStage.stage.spec.execution) {
        const jsonFromYaml = YAML.parse(yamlSnippet?.data || '') as StageElementConfig
        selectedStage.stage.failureStrategies = jsonFromYaml.failureStrategies || []
        selectedStage.stage.spec.execution = jsonFromYaml?.spec?.execution
        updateStage(selectedStage.stage)
      }
    }
  }, [yamlSnippet?.data])

  return (
    <section ref={layoutRef} key={selectedStageId} className={css.approvalStageSetupShellWrapper}>
      <Tabs
        id="approvalStageSetupShell"
        onChange={(tabId: string) => setSelectedTabId(tabId)}
        selectedTabId={selectedTabId}
        data-tabId={selectedTabId}
      >
        <Tab
          id={tabHeadings[0]}
          panel={
            <ApprovalStageOverview>
              <ActionButtons />
            </ApprovalStageOverview>
          }
          title={
            <span className={css.tab}>
              <Icon name="tick" height={20} size={20} color={Color.GREEN_800} />
              {tabHeadings[0]}
            </span>
          }
        />
        <Tab
          id={tabHeadings[1]}
          title={
            <span className={css.tab}>
              <Icon name="deployment-success-legacy" height={20} size={20} />
              {tabHeadings[1]}
            </span>
          }
          panel={
            <ApprovalStageExecution>
              <ActionButtons />
            </ApprovalStageExecution>
          }
        />
        <React.Fragment>
          <div className={css.spacer} />
          <Button
            minimal
            onClick={() => openDrawer(DrawerTypes.SkipCondition)}
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
            onClick={() => openDrawer(DrawerTypes.FailureStrategy)}
            icon="failure-strategy"
          >
            {getString('pipeline.failureStrategies.title')}
          </Button>
        </React.Fragment>
      </Tabs>
    </section>
  )
}
