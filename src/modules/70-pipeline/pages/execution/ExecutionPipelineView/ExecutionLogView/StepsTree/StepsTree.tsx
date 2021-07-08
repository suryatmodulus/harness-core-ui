import React from 'react'
import { Icon, Text, IconName } from '@wings-software/uicore'
import cx from 'classnames'
import { mapKeys } from 'lodash-es'

import type { ExecutionNode } from 'services/pipeline-ng'
import { String } from 'framework/strings'
import type { ExecutionPipelineNode } from '@pipeline/components/ExecutionStageDiagram/ExecutionPipelineModel'
import { Duration } from '@common/components'
import { ExecutionStatusIconMap } from '@pipeline/utils/executionUtils'
import {
  isExecutionRunning,
  isExecutionSuccess,
  isExecutionNotStarted,
  isExecutionQueued
} from '@pipeline/utils/statusHelpers'

import css from './StepsTree.module.scss'

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
  onStepSelect(stepId: string): void
  isRoot?: boolean
}

export function StepsTree(props: StepsTreeProps): React.ReactElement {
  const { nodes, selectedStepId, onStepSelect, isRoot } = props

  function handleStepSelect(identifier: string, status?: string): void {
    if (isExecutionNotStarted(status) || isExecutionQueued(status)) {
      return
    }

    onStepSelect(identifier)
  }

  return (
    <ul className={css.root}>
      {nodes.map((step, i) => {
        if (step.item) {
          const statusLower = step.item.status.toLowerCase()

          return (
            <li
              className={cx(css.item, { [css.active]: selectedStepId === step.item.identifier })}
              key={step.item.identifier}
              data-type="item"
            >
              <div
                className={css.step}
                data-status={statusLower}
                onClick={() => handleStepSelect(step.item?.identifier as string, step.item?.status)}
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
              <StepsTree nodes={step.group.items} selectedStepId={selectedStepId} onStepSelect={onStepSelect} />
            </li>
          )
        }

        if (step.parallel) {
          // here assumption is that parallel steps cannot have nested parallel steps
          const isRunning = step.parallel.some(pStep => isExecutionRunning(pStep.item?.status || pStep.group?.status))
          const isSuccess = step.parallel.every(pStep => isExecutionSuccess(pStep.item?.status || pStep.group?.status))

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
              pStep => !isExecutionSuccess(pStep.item?.status || pStep.group?.status)
            )

            if (nonSuccessStep) {
              const status = (nonSuccessStep.item?.status || nonSuccessStep.group?.status)?.toLowerCase()

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
              <StepsTree nodes={step.parallel} selectedStepId={selectedStepId} onStepSelect={onStepSelect} />
            </li>
          )
        }

        return null
      })}
    </ul>
  )
}
