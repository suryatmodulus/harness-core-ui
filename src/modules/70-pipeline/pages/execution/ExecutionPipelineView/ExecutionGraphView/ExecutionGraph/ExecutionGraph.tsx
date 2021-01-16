import React from 'react'
import { isEmpty } from 'lodash-es'
import { useExecutionLayoutContext, ExecutionStageDiagram } from '@pipeline/exports'
import { ExecutionPipeline, ExecutionPipelineNode, ExecutionPipelineNodeType } from '@pipeline/exports'
import type { GraphLayoutNode } from 'services/pipeline-ng'
import {
  getIconFromStageModule,
  processLayoutNodeMap,
  ProcessLayoutNodeMapResponse
} from '@pipeline/utils/executionUtils'
import { useExecutionContext } from '../../../ExecutionContext/ExecutionContext'
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
            name: node?.nodeIdentifier || /* istanbul ignore next */ '',
            status: node?.status as any,
            type: ExecutionPipelineNodeType.NORMAL,
            data: node
          }
        })
      })
      items.push({ parallel })
    } else {
      const cdStage = item.stage
      items.push({
        item: {
          icon: getIconFromStageModule(cdStage?.module),
          identifier: cdStage?.nodeUuid || /* istanbul ignore next */ '',
          name: cdStage?.nodeIdentifier || /* istanbul ignore next */ '',
          status: cdStage?.status as any,
          type: ExecutionPipelineNodeType.NORMAL,
          data: cdStage
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
  const { pipelineExecutionDetail } = useExecutionContext()
  const { primaryPaneSize } = useExecutionLayoutContext()

  const nodeData = processLayoutNodeMap(pipelineExecutionDetail?.pipelineExecutionSummary)
  const data: ExecutionPipeline<GraphLayoutNode> = {
    items: processExecutionData(nodeData),
    identifier: pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier || /* istanbul ignore next */ '',
    status: pipelineExecutionDetail?.pipelineExecutionSummary?.status as any
  }
  return (
    <div className={css.main}>
      {!isEmpty(pipelineExecutionDetail?.pipelineExecutionSummary?.pipelineIdentifier) && data.items?.length > 0 && (
        <ExecutionStageDiagram
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
      )}
    </div>
  )
}
