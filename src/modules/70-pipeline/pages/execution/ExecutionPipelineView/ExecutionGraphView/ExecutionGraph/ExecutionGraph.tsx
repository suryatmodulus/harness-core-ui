import React from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, debounce, get } from 'lodash-es'
import { useExecutionLayoutContext, ExecutionStageDiagram } from '@pipeline/exports'
import { ExecutionPipeline, ExecutionPipelineNode, ExecutionPipelineNodeType } from '@pipeline/exports'
import { GraphLayoutNode, useGetBarriersExecutionInfo } from 'services/pipeline-ng'
import {
  getIconFromStageModule,
  processLayoutNodeMap,
  ProcessLayoutNodeMapResponse,
  ExecutionPathParams
} from '@pipeline/utils/executionUtils'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import type { DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import { DynamicPopover } from '@common/exports'
import HoverCard from '@pipeline/components/HoverCard/HoverCard'
import { useExecutionContext } from '../../../ExecutionContext/ExecutionContext'
import CDInfo from './components/CD/CDInfo'
import css from './ExecutionGraph.module.scss'

const processExecutionData = (
  stages?: ProcessLayoutNodeMapResponse[]
): Array<ExecutionPipelineNode<GraphLayoutNode>> => {
  const items: Array<ExecutionPipelineNode<GraphLayoutNode>> = []
  stages?.forEach(item => {
    if (item.parallel) {
      const parallel: Array<ExecutionPipelineNode<GraphLayoutNode>> = []
      item.parallel.forEach(node => {
        parallel.push({
          item: {
            icon: getIconFromStageModule(node?.module),
            identifier: node?.nodeUuid || /* istanbul ignore next */ '',
            name: node?.name || node?.nodeIdentifier || /* istanbul ignore next */ '',
            status: node?.status as any,
            barrierFound: node?.barrierFound,
            type: ExecutionPipelineNodeType.NORMAL,
            skipCondition: node?.skipInfo?.evaluatedCondition ? node.skipInfo.skipCondition : undefined,
            data: node
          }
        })
      })
      items.push({ parallel })
    } else {
      const stage = item.stage
      items.push({
        item: {
          icon: getIconFromStageModule(stage?.module),
          identifier: stage?.nodeUuid || /* istanbul ignore next */ '',
          name: stage?.name || stage?.nodeIdentifier || /* istanbul ignore next */ '',
          status: stage?.status as any,
          barrierFound: stage?.barrierFound,
          type: ExecutionPipelineNodeType.NORMAL,
          skipCondition: stage?.skipInfo?.evaluatedCondition ? stage.skipInfo.skipCondition : undefined,
          data: stage
        }
      })
    }
  })
  return items
}

export interface ExecutionGraphProps {
  selectedStage: string
  onSelectedStage(stage: string): void
}

export default function ExecutionGraph(props: ExecutionGraphProps): React.ReactElement {
  const { executionIdentifier } = useParams<ExecutionPathParams>()
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<{}> | undefined
  >()
  const [stageSetupId, setStageSetupIdId] = React.useState('')
  const { pipelineExecutionDetail } = useExecutionContext()
  const { primaryPaneSize } = useExecutionLayoutContext()
  const nodeData = processLayoutNodeMap(pipelineExecutionDetail?.pipelineExecutionSummary)
  const data: ExecutionPipeline<GraphLayoutNode> = {
    items: processExecutionData(nodeData),
    identifier: pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier || /* istanbul ignore next */ '',
    status: pipelineExecutionDetail?.pipelineExecutionSummary?.status as any,
    allNodes: Object.keys(pipelineExecutionDetail?.pipelineExecutionSummary?.layoutNodeMap || {})
  }

  const { data: barrierInfoData, refetch, loading: barrierInfoLoading } = useGetBarriersExecutionInfo({
    queryParams: {
      stageSetupId: stageSetupId || '',
      planExecutionId: executionIdentifier
    },
    lazy: true
  })

  const fetchBarrierInfo = debounce(refetch, 1000)
  React.useEffect(() => {
    !barrierInfoLoading && stageSetupId && fetchBarrierInfo()
  }, [stageSetupId])

  const onMouseEnter = (event: any) => {
    const stage = event.stage
    dynamicPopoverHandler?.show(
      event.stageTarget,
      {
        event,
        data: stage
      },
      { useArrows: true, darkMode: false }
    )
    const isFinished = stage?.data?.endTs
    const hasStarted = stage?.data?.startTs
    if (!isFinished && hasStarted) {
      setStageSetupIdId(stage?.data?.nodeUuid)
    }
  }

  const renderPopover = ({
    data: popoverData
  }: {
    data: {
      identifier: string
      stepType: string
      name: string
      status: ExecutionStatus
      data: { failureInfo?: { message: string } }
    }
  }): JSX.Element => {
    return (
      <HoverCard barrier={{ barrierInfoLoading, barrierData: barrierInfoData }} data={popoverData}>
        {get(popoverData, 'data.module', '') === 'cd' && (
          <CDInfo barrier={{ barrierInfoLoading, barrierData: barrierInfoData }} data={popoverData} />
        )}
      </HoverCard>
    )
  }

  return (
    <div className={css.main}>
      {!isEmpty(pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier) && data.items?.length > 0 && (
        <>
          <ExecutionStageDiagram
            itemMouseEnter={onMouseEnter}
            itemMouseLeave={() => {
              dynamicPopoverHandler?.hide()
              setStageSetupIdId('')
            }}
            selectedIdentifier={props.selectedStage}
            itemClickHandler={e => props.onSelectedStage(e.stage.identifier)}
            diagramContainerHeight={primaryPaneSize}
            data={data}
            nodeStyle={{
              width: 114,
              height: 50
            }}
            gridStyle={{
              startX: 50,
              startY: 50
            }}
          />
          <DynamicPopover darkMode={true} render={renderPopover} bind={setDynamicPopoverHandler as any} />
        </>
      )}
    </div>
  )
}
