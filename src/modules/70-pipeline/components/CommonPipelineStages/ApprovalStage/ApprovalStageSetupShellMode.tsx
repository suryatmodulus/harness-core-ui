import React, { useEffect, useRef } from 'react'
import YAML from 'yaml'
import produce from 'immer'
import { Button, Color, Icon, Layout, Tab, Tabs } from '@wings-software/uicore'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { GetInitialStageYamlSnippetQueryParams, useGetInitialStageYamlSnippet } from 'services/pipeline-ng'
import type { ApprovalStageConfig, StageElementConfig } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ApprovalStageOverview } from './ApprovalStageOverview'
import { ApprovalStageExecution } from './ApprovalStageExecution'
import ApprovalAdvancedSpecifications from './ApprovalStageAdvanced'
import css from './ApprovalStageSetupShellMode.module.scss'

interface ApprovalStageElementConfig extends StageElementConfig {
  approvalType?: string
}

export const ApprovalStageSetupShellMode: React.FC = () => {
  const { getString } = useStrings()
  const tabHeadings = [getString('overview'), getString('executionText'), getString('advancedTitle')]

  const layoutRef = useRef<HTMLDivElement>(null)
  const [selectedTabId, setSelectedTabId] = React.useState<string>(tabHeadings[1])
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId = '', selectedStepId },
      pipelineView
    },
    getStageFromPipeline,
    updatePipeline,
    updateStage,
    updatePipelineView
  } = React.useContext(PipelineContext)

  const [loadGraph, setLoadGraph] = React.useState(false)
  const { stage: selectedStage = {} } = getStageFromPipeline<ApprovalStageElementConfig>(selectedStageId)

  React.useEffect(() => {
    if (selectedStepId) {
      setSelectedTabId(tabHeadings[1])
    }
  }, [selectedStepId])

  const ActionButtons = (): React.ReactElement => {
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

  React.useEffect(() => {
    // To drag and drop the canvas
    if (layoutRef.current) {
      layoutRef.current.scrollTo?.(0, 0)
    }
  }, [selectedTabId])

  const { data: yamlSnippet } = useGetInitialStageYamlSnippet({
    queryParams: {
      approvalType: (selectedStage.stage?.approvalType ||
        StepType.HarnessApproval) as GetInitialStageYamlSnippetQueryParams['approvalType']
    }
  })

  useEffect(() => {
    // error handling if needed
    if (yamlSnippet?.data) {
      // The last part of condition is important, as we only need to add the YAML snippet the first time in the step.
      if (!selectedStage?.stage?.spec?.execution) {
        updateStage(
          produce(selectedStage, draft => {
            const jsonFromYaml = YAML.parse(yamlSnippet?.data || '') as ApprovalStageElementConfig
            if (draft.stage && draft.stage.spec) {
              draft.stage.failureStrategies = jsonFromYaml.failureStrategies
              ;(draft.stage.spec as ApprovalStageConfig).execution =
                (jsonFromYaml.spec as ApprovalStageConfig)?.execution || {}
              // approvalType is just used in the UI, to populate the default steps for different approval types
              // For BE, the stage type is always 'Approval' and approval type is defined inside the step
              delete draft.stage.approvalType
            }
          }).stage as ApprovalStageElementConfig
        ).then(() => {
          setLoadGraph(true)
        })
      } else if (selectedStage?.stage?.spec?.execution) {
        // We're opening an already added approval stage
        setLoadGraph(true)
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
          data-testid={tabHeadings[0]}
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
          id={tabHeadings[1]}
          title={
            <span className={css.tab}>
              <Icon name="deployment-success-legacy" height={20} size={20} />
              {tabHeadings[1]}
            </span>
          }
          panel={
            <>
              {loadGraph ? (
                <ApprovalStageExecution>
                  <ActionButtons />
                </ApprovalStageExecution>
              ) : (
                <PageSpinner
                  className={css.graphLoadingSpinner}
                  message={getString('pipeline.approvalStage.settingUpStage')}
                />
              )}
            </>
          }
          data-testid={tabHeadings[1]}
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
          id={tabHeadings[2]}
          title={
            <span className={css.tab}>
              <Icon name="advanced" height={20} size={20} />
              {tabHeadings[2]}
            </span>
          }
          panel={
            <ApprovalAdvancedSpecifications>
              <ActionButtons />
            </ApprovalAdvancedSpecifications>
          }
          data-testid={tabHeadings[2]}
        />
      </Tabs>
    </section>
  )
}
