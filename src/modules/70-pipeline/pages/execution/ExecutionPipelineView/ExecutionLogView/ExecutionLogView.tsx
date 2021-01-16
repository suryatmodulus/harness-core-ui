import React, { useEffect, useState } from 'react'

import { useHistory, useParams } from 'react-router-dom'
import { MenuItem } from '@blueprintjs/core'

import { Container, Icon, Text, Button } from '@wings-software/uicore'
import { Select } from '@blueprintjs/select'
import { useStrings } from 'framework/exports'
import { useUpdateQueryParams } from '@common/hooks'
import { DurationI18n, timeDelta } from '@common/exports'
import type { StageOptions } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import routes from '@common/RouteDefinitions'

import type { ExecutionNode } from 'services/cd-ng'
import type { ExecutionGraph } from 'services/pipeline-ng'
import { ExecutionPathParams, getIconFromStageModule } from '@pipeline/utils/executionUtils'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useExecutionContext } from '../../ExecutionContext/ExecutionContext'
import LogsContent from './LogsContent'
import css from './ExecutionLogView.module.scss'
import 'xterm/css/xterm.css'

const statusIcon: {
  [key: string]: string
} = {
  Failed: 'deployment-failed-new',
  Suspended: 'cross',
  Aborted: 'stop',
  Success: 'deployment-success-legacy',
  Running: 'spinner'
}

interface Node {
  children: string[]
  next: string[]
  data: string
  nestedChild: boolean
}
interface TreeProps {
  node: Node
  isRootNode: boolean
  level: number

  pNode?: Node
}

export default function ExecutionLogView(): React.ReactElement {
  const { getString } = useStrings()
  const {
    pipelineExecutionDetail,
    selectedStageId: autoSelectedStageId,
    selectedStepId,
    pipelineStagesMap,
    queryParams
  } = useExecutionContext()
  const { replaceQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()

  const [selectedNode, setSelectedNode] = useState<string | undefined>()
  const [selectedStageId, setStageId] = useState(autoSelectedStageId)
  const params = useParams<PipelineType<ExecutionPathParams>>()
  const history = useHistory()
  useEffect(() => {
    setStageId(queryParams.stage || autoSelectedStageId)
  }, [autoSelectedStageId])

  // NOTE: select step only once, after that we keep step/node selection in state
  useEffect(() => {
    if (queryParams.step) {
      setSelectedNode(queryParams.step)
    } else {
      setSelectedNode(selectedStepId)
    }
  }, [selectedStepId])

  if (!pipelineExecutionDetail) {
    return <div />
  }

  const { executionGraph } = pipelineExecutionDetail
  if (!executionGraph) {
    return <div />
  }
  const stagesOptions: StageOptions[] = [...pipelineStagesMap].map(item => ({
    label: item[1].nodeIdentifier || /* istanbul ignore next */ '',
    value: item[1].nodeUuid || /* istanbul ignore next */ ''
  }))

  const stageIds: any = []

  const getNodeDetails = (nodeId: string) => {
    const { nodeMap }: { nodeMap?: ExecutionGraph['nodeMap'] } = executionGraph
    if (!nodeMap) {
      return {}
    }
    return nodeMap[nodeId]
  }

  const getChildren = (nodeId: string) => {
    const { nodeAdjacencyListMap }: { nodeAdjacencyListMap?: ExecutionGraph['nodeAdjacencyListMap'] } = executionGraph
    if (!nodeAdjacencyListMap) {
      return []
    }
    return nodeAdjacencyListMap[nodeId].children
  }

  const getNextIds = (nodeId: string) => {
    const { nodeAdjacencyListMap }: { nodeAdjacencyListMap?: ExecutionGraph['nodeAdjacencyListMap'] } = executionGraph
    if (!nodeAdjacencyListMap) {
      return []
    }
    return nodeAdjacencyListMap[nodeId].nextIds
  }

  const renderTimeDiff = (node: any) => {
    const { startTs, endTs } = node

    if (startTs && endTs) {
      return (
        <Text font={{ size: 'small' }} className={css.timeDiff}>
          {(() => {
            const delta = timeDelta(node?.startTs || 0, node?.endTs || 0)
            return node?.startTs && node?.endTs
              ? DurationI18n.humanizeDuration(delta.w, delta.d, delta.h, delta.m, delta.s)
              : '-'
          })()}
        </Text>
      )
    }
  }

  // TODO: do we need this logic inside UI?
  const isNodeVisible = (_node: ExecutionNode) => {
    return true //['liteEngineTask'].indexOf(node.stepType!) === -1
  }

  // TODO: do we need this logic inside UI?
  const hasNodeLogs = (node: ExecutionNode) => {
    return ['NG_SECTION'].indexOf(node.stepType!) === -1
  }

  const renderNodeDetails = (nodeId: string) => {
    const rootNode = getNodeDetails(nodeId)
    if (!rootNode || !isNodeVisible(rootNode)) {
      return <div />
    }

    const status: string = rootNode?.status || ''
    const icon: string = statusIcon[status]

    const attrs: any = rootNode?.status === 'Running' ? { color: 'blue500' } : {}
    const highlightingClassName = selectedNode && selectedNode === rootNode.uuid ? css.highlighted : ''
    const disabledClassName = !hasNodeLogs(rootNode) ? css.disabled : ''

    const onClickProps = hasNodeLogs(rootNode)
      ? {
          onClick: () => {
            replaceQueryParams({ ...queryParams, stage: selectedStageId, step: rootNode.uuid })
            setSelectedNode(rootNode.uuid)
          }
        }
      : {}

    return (
      <section {...onClickProps} className={`${css.node} ${highlightingClassName} ${disabledClassName}`}>
        <div className={css.nodeInfo}>
          {<Icon name={icon} className={css.icon} {...attrs} />}
          <Text className={css.nodeText}>{rootNode.name}</Text>
        </div>
        {renderTimeDiff(rootNode)}
      </section>
    )
  }

  const StageSelection = Select.ofType<StageOptions>()
  const renderRootNode = () => {
    // const rootNode = getNodeDetails(nodeId)
    return (
      <section className={css.stageRootNode}>
        <StageSelection
          itemRenderer={(item, { handleClick }) => (
            <div>
              <MenuItem key={item.value.toString()} text={item?.label} onClick={handleClick} />
            </div>
          )}
          itemDisabled={item => {
            return item.disabled ?? false
          }}
          itemPredicate={(query, item, _index, exactMatch) => {
            const normalizedValue = item.value.toLowerCase()
            const normalizedQuery = query.toLowerCase()
            /* istanbul ignore if */ if (exactMatch) {
              return normalizedValue === normalizedQuery
            } else {
              return normalizedValue.indexOf(normalizedQuery) > -1
            }
          }}
          items={stagesOptions || /* istanbul ignore next */ []}
          onItemSelect={item => {
            const { value } = item
            setStageId(value)

            const { orgIdentifier, executionIdentifier, pipelineIdentifier, projectIdentifier, accountId } = params
            const logUrl = routes.toExecutionPipelineView({
              orgIdentifier,
              executionIdentifier,
              pipelineIdentifier,
              projectIdentifier,
              accountId,
              module: params.module
            })

            history.push(`${logUrl}?view=log&stage=${value}`)
          }}
        >
          <Button
            minimal
            rightIcon="chevron-down"
            text={pipelineStagesMap.get(selectedStageId)?.nodeIdentifier}
            icon={getIconFromStageModule(pipelineStagesMap.get(selectedStageId)?.module)}
            iconProps={{
              size: 20,
              background: 'linear-gradient(147.14deg, #73DFE7 6.95%, #0095F7 93.05%)'
            }}
            className={css.rootIcon}
          />
        </StageSelection>
      </section>
    )
  }

  const traverseNodeGraph = (activeNode = executionGraph?.rootNodeId, level = 0, isRootNode = true) => {
    const index = stageIds.length

    if (activeNode) {
      stageIds[index] = {
        data: '',
        next: []
      }
      stageIds[index].data = activeNode
      stageIds[index].next = []
      stageIds[index].children = []
      stageIds[index].nestedChild = level > 1

      const children = getChildren(activeNode)

      if (!isRootNode) {
        const nextIds = getNextIds(activeNode)
        if (nextIds && nextIds.length) {
          for (const id of nextIds) {
            stageIds[index].next.push(id)
            traverseNodeGraph(id, level, false)
          }
        }
      }

      if (children && children.length) {
        for (const child of children) {
          stageIds[index].children.push(child)
          traverseNodeGraph(child, level + 1, false)
        }
      }
    }
    return null
  }
  if (!executionGraph) {
    return <div />
  }

  const getByStage = (id: string) => stageIds.find((stg: Node) => stg.data === id)

  const TreeNode = (props: TreeProps) => {
    const {
      node,
      node: { children, next, data, nestedChild },
      isRootNode,
      level
    } = props
    const rootCls = isRootNode ? css.rootNode : ''
    const childCls = level > 0 ? css.childNode : css.rootElement
    const subChildCls = nestedChild ? css.subChild : ''
    // const treeCls = level === 0 ? css.rNode : ''
    return (
      <Container>
        <ul className={`${childCls} ${subChildCls}`} key={data}>
          <li className={rootCls}>
            {!isRootNode && renderNodeDetails(data)}
            {isRootNode && renderRootNode()}
          </li>

          {children &&
            children.map((item: string) => (
              <TreeNode
                {...props}
                node={getByStage(item)}
                isRootNode={false}
                level={level + 1}
                key={item}
                pNode={node}
              />
            ))}
        </ul>
        {next &&
          next.map((item: string) => <TreeNode {...props} node={getByStage(item)} isRootNode={false} key={item} />)}
      </Container>
    )
  }
  if (executionGraph) {
    traverseNodeGraph()
    return (
      <Container className={css.logsContainer}>
        <TreeNode node={stageIds[0]} isRootNode={true} level={0} />

        <LogsContent header={getString('execution.stepLogs')} key={selectedStepId} />
      </Container>
    )
  }
  return <div />
}
