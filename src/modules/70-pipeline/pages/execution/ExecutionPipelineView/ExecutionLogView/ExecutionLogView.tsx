import React from 'react'
import { Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo, get, has } from 'lodash-es'

import { useUpdateQueryParams } from '@common/hooks'
import { processExecutionData } from '@pipeline/utils/executionUtils'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { StageSelection, StageSelectOption } from '@pipeline/components/StageSelection/StageSelection'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import { isExecutionNotStarted, isExecutionSkipped } from '@pipeline/utils/statusHelpers'
import { LogsContent } from '@pipeline/components/LogsContent/LogsContent'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ExecutionVerificationView } from '@pipeline/components/ExecutionVerification/ExecutionVerificationView'
import { ExecutionNode, useGetExecutionNode } from 'services/pipeline-ng'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { StepsTree } from './StepsTree/StepsTree'
import css from './ExecutionLogView.module.scss'

export interface LogViewerViewProps {
  selectedStep?: ExecutionNode
  errorMessage?: string
  isSkipped?: boolean
  loading?: boolean
}

function LogViewerView(props: LogViewerViewProps): React.ReactElement {
  const { selectedStep, errorMessage, isSkipped } = props

  if (selectedStep?.stepType === StepType.Verify) {
    return <ExecutionVerificationView step={selectedStep} />
  }
  return (
    <div className={css.logViewer}>
      <LogsContent mode="console-view" errorMessage={errorMessage} isWarning={isSkipped} />
    </div>
  )
}

export default function ExecutionLogView(): React.ReactElement {
  const {
    pipelineStagesMap,
    allNodeMap,
    pipelineExecutionDetail,
    selectedStageId,
    selectedStepId,
    queryParams,
    addNewNodeToMap
  } = useExecutionContext()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ExecutionPathProps>()
  const { updateQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()
  const { data: executionNode, loading } = useGetExecutionNode({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      nodeExecutionId: defaultTo(queryParams.retryStep, '')
    },
    /**
     * Do not fetch data:
     * 1. No retry step
     * 2. Already have data for it
     */
    lazy: !queryParams.retryStep || has(allNodeMap, queryParams.retryStep)
  })

  const tree = React.useMemo(
    () => processExecutionData(pipelineExecutionDetail?.executionGraph),
    [pipelineExecutionDetail?.executionGraph]
  )
  const selectOptions: StageSelectOption[] = React.useMemo(() => {
    return [...pipelineStagesMap.entries()].map(([identifier, stage]) => ({
      label: defaultTo(stage.nodeIdentifier, ''),
      value: identifier,
      node: stage,
      type: defaultTo(stage.nodeType, '')
    }))
  }, [pipelineStagesMap])

  const selectedStep = allNodeMap[selectedStepId]
  const errorMessage =
    get(selectedStep, 'failureInfo.message') || get(selectedStep, 'executableResponses[0].skipTask.message')
  const isSkipped = isExecutionSkipped(selectedStep?.status)

  function handleStageChange(item: StageSelectOption): void {
    updateQueryParams({ stage: item.value as string })
  }

  function handleStepSelect(stepId: string, retryStep?: string): void {
    updateQueryParams({ step: stepId, stage: selectedStageId, retryStep })
  }

  React.useEffect(() => {
    if (executionNode?.data) {
      Object.assign(executionNode.data, { __isInterruptNode: true })
      addNewNodeToMap(defaultTo(executionNode.data.uuid, ''), executionNode.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionNode?.data])

  return (
    <Container className={css.logsContainer}>
      <div className={css.stepsContainer}>
        <StageSelection
          selectOptions={selectOptions}
          onStageChange={handleStageChange}
          selectedStageId={selectedStageId}
          className={css.stageSelector}
          chevronIcon="chevron-down"
          itemDisabled={item => isExecutionNotStarted(item.node.status)}
          popoverProps={{ popoverClassName: css.stageSelectionMenu }}
        />
        <div className={css.stageTree}>
          <StepsTree
            nodes={tree}
            selectedStepId={selectedStepId}
            onStepSelect={handleStepSelect}
            retryStep={queryParams.retryStep}
            allNodeMap={allNodeMap}
            isRoot
          />
        </div>
      </div>
      <LogViewerView selectedStep={selectedStep} errorMessage={errorMessage} isSkipped={isSkipped} loading={loading} />
    </Container>
  )
}
