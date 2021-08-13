import React from 'react'
import { Icon, Text, IconName } from '@wings-software/uicore'
import cx from 'classnames'
import { get, mapKeys, omit, defaultTo } from 'lodash-es'

import type { ExecutionNode } from 'services/pipeline-ng'
import { String, useStrings } from 'framework/strings'
import type {
  ExecutionPipelineItem,
  ExecutionPipelineNode
} from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { Duration } from '@common/components'
import { ExecutionStatusIconMap } from '@pipeline/utils/executionUtils'
import {
  isExecutionRunning,
  isExecutionSuccess,
  isExecutionNotStarted,
  isExecutionQueued,
  ExecutionStatusEnum
} from '@pipeline/utils/statusHelpers'

import css from './StepsTree.module.scss'

function hasInterruptHistories(step: ExecutionPipelineNode<ExecutionNode>): boolean {
  return (
    Array.isArray(step?.item?.data?.interruptHistories) &&
    (step?.item?.data?.interruptHistories.length || /* istanbul ignore next */ 0) > 0
  )
}

const IconMap: Record<string, IconName> = {
  ...mapKeys(ExecutionStatusIconMap, (_value, key) => key.toLowerCase()),
  running: 'spinner',
  asyncwaiting: 'spinner',
  timedwaiting: 'spinner',
  taskwaiting: 'spinner'
}

export interface StepsTreeProps {
  nodes: Array<ExecutionPipelineNode<ExecutionNode>>
  selectedStepId?: string
  onStepSelect(stepId: string, retryId?: string): void
  isRoot?: boolean
  retryStep?: string
  allNodeMap: Record<string, ExecutionNode>
}

export function StepsTree(props: StepsTreeProps): React.ReactElement {
  const { nodes, selectedStepId, onStepSelect, isRoot, retryStep, allNodeMap } = props
  const { getString } = useStrings()
  const commonProps: Omit<StepsTreeProps, 'nodes' | 'isRoot'> = {
    selectedStepId,
    onStepSelect,
    retryStep,
    allNodeMap
  }

  function handleStepSelect(identifier: string, status?: string, retryId?: string): void {
    if (isExecutionNotStarted(status) || isExecutionQueued(status)) {
      return
    }

    onStepSelect(identifier, retryId)
  }

  return (
    <ul className={css.root}>
      {nodes.map((step, i) => {
        if (step.item) {
          const statusLower = step.item.status.toLowerCase()

          if (hasInterruptHistories(step)) {
            const retryNodes: Array<ExecutionPipelineNode<ExecutionNode>> = defaultTo(
              step.item.data?.interruptHistories,
              []
            )
              .filter(node => node?.interruptConfig?.retryInterruptConfig)
              .map((node, k): { item: ExecutionPipelineItem<ExecutionNode> } => ({
                item: {
                  ...(step.item as ExecutionPipelineItem<ExecutionNode>),
                  name: getString('pipeline.execution.retryStepCount', { num: k + 1 }),
                  retryId: defaultTo(node.interruptConfig.retryInterruptConfig?.retryId, ''),
                  status: ExecutionStatusEnum.Failed,
                  // override data in order to stop infinite loop
                  data: defaultTo(
                    omit(
                      get(allNodeMap, defaultTo(node.interruptConfig.retryInterruptConfig?.retryId, '')),
                      'interruptHistories'
                    ),
                    {}
                  )
                }
              }))

            const num = retryNodes.length + 1

            retryNodes.push({
              item: {
                ...(step.item as ExecutionPipelineItem<ExecutionNode>),
                name: getString('pipeline.execution.retryStepCount', { num }),
                data: omit(step.item.data, 'interruptHistories') // override data in order to stop infinite loop
              }
            })

            return (
              <li key={step.item.identifier} className={css.item} data-type="retry-item">
                <div className={css.step} data-status={statusLower}>
                  <Icon className={css.icon} name={IconMap[statusLower]} />
                  <Text lineClamp={1} className={css.name}>
                    {step.item.name}
                  </Text>
                </div>
                <StepsTree nodes={retryNodes} {...commonProps} />
              </li>
            )
          }

          return (
            <li
              className={cx(css.item, {
                [css.active]: step.item?.retryId === retryStep && selectedStepId === step.item.identifier
              })}
              key={defaultTo(step.item.retryId, step.item.identifier)}
              data-type="item"
            >
              <div
                className={css.step}
                data-status={statusLower}
                onClick={() => handleStepSelect(step.item?.identifier as string, step.item?.status, step.item?.retryId)}
              >
                <Icon className={css.icon} name={IconMap[statusLower]} />
                <Text lineClamp={1} className={css.name}>
                  {step.item.name}
                </Text>
                <Duration
                  className={css.duration}
                  startTime={step.item.data?.startTs}
                  endTime={step.item.data?.endTs}
                  durationText={' '}
                  icon={null}
                />
              </div>
            </li>
          )
        }

        if (step.group) {
          const statusLower = step.group.status.toLowerCase()

          return (
            <li className={css.item} key={step.group.identifier} data-type="group">
              <div className={css.step} data-status={statusLower}>
                <Icon className={css.icon} name={IconMap[statusLower]} />
                <div className={css.nameWrapper}>
                  {isRoot ? null : <div className={css.groupIcon} />}
                  {step.group.name ? (
                    <Text lineClamp={1} className={css.name}>
                      {step.group.name}
                    </Text>
                  ) : (
                    <String className={css.name} stringID="stepGroup" />
                  )}
                </div>

                <Duration
                  className={css.duration}
                  startTime={step.group.data?.startTs}
                  endTime={step.group.data?.endTs}
                  durationText={' '}
                  icon={null}
                />
              </div>
              <StepsTree nodes={step.group.items} {...commonProps} />
            </li>
          )
        }

        /* istanbul ignore else */
        if (step.parallel) {
          // here assumption is that parallel steps cannot have nested parallel steps
          const isRunning = step.parallel.some(pStep =>
            isExecutionRunning(defaultTo(pStep.item?.status, pStep.group?.status))
          )
          const isSuccess = step.parallel.every(pStep =>
            isExecutionSuccess(defaultTo(pStep.item?.status, pStep.group?.status))
          )

          let icon: IconName = IconMap.notstarted
          let statusLower = ''

          if (isRunning) {
            icon = IconMap.running
            statusLower = 'running'
          } else if (isSuccess) {
            icon = IconMap.success
            statusLower = 'success'
          } else {
            // find first non success state
            const nonSuccessStep = step.parallel.find(
              pStep => !isExecutionSuccess(defaultTo(pStep.item?.status, pStep.group?.status))
            )

            /* istanbul ignore else */
            if (nonSuccessStep) {
              const status = defaultTo(nonSuccessStep.item?.status, nonSuccessStep.group?.status)?.toLowerCase()

              /* istanbul ignore else */
              if (status) {
                statusLower = status
                icon = IconMap[status]
              }
            }
          }

          return (
            <li className={css.item} key={i} data-type="parallel">
              <div className={css.step} data-status={statusLower}>
                <Icon className={css.icon} name={icon} />
                <div className={css.nameWrapper}>
                  {isRoot ? null : <div className={css.parallelIcon} />}
                  <String className={css.name} stringID="parallelSteps" />
                </div>
              </div>
              <StepsTree nodes={step.parallel} {...commonProps} />
            </li>
          )
        }

        /* istanbul ignore next */
        return null
      })}
    </ul>
  )
}
