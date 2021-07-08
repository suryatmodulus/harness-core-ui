import React from 'react'
import { Button } from '@wings-software/uicore'
import { Popover, Menu, Spinner } from '@blueprintjs/core'
import cx from 'classnames'
import { has } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import ExecutionLayout from '@pipeline/components/ExecutionLayout/ExecutionLayout'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import { useUpdateQueryParams } from '@common/hooks'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetExecutionNode } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import factory from '@pipeline/factories/ExecutionFactory'
import { isCDStage, isCIStage, StageType } from '@pipeline/utils/stageHelpers'

import type { StepType } from '../PipelineSteps/PipelineStepInterface'
import css from './ExecutionStepDetails.module.scss'

export default function ExecutionStepDetails(): React.ReactElement {
  const { allNodeMap, addNewNodeToMap, queryParams, selectedStepId, selectedStageId, pipelineStagesMap } =
    useExecutionContext()
  const { retryStep } = queryParams
  const { getString } = useStrings()
  const { updateQueryParams } = useUpdateQueryParams<ExecutionPageQueryParams>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ExecutionPathProps>()
  const { data: executionNode, loading } = useGetExecutionNode({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      nodeExecutionId: retryStep || ''
    },
    /**
     * Do not fetch data:
     * 1. No retry step
     * 2. Already have data for it
     */
    lazy: !retryStep || has(allNodeMap, retryStep)
  })
  const originalStep = allNodeMap?.[selectedStepId] || /* istanbul ignore next */ {}
  const selectedStep = (retryStep ? allNodeMap[retryStep] : originalStep) || /* istanbul ignore next */ {}
  const stepDetails = factory.getStepDetails(selectedStep.stepType as StepType)
  const interruptHistories = (originalStep.interruptHistories || []).filter(
    ({ interruptConfig }) => interruptConfig.retryInterruptConfig
  )
  const selectedStage = pipelineStagesMap.get(selectedStageId)
  let stageType: StageType | undefined

  if (isCDStage(selectedStage)) stageType = StageType.DEPLOY
  else if (isCIStage(selectedStage)) stageType = StageType.BUILD

  function goToRetryStepExecution(id: string): void {
    updateQueryParams({ retryStep: id })
  }

  function goToCurrentExecution(): void {
    updateQueryParams({ retryStep: [] as unknown as string /* this removes the param fro query */ })
  }

  React.useEffect(() => {
    if (executionNode?.data) {
      Object.assign(executionNode.data, { __isInterruptNode: true })
      addNewNodeToMap(executionNode.data.uuid || /* istanbul ignore next */ '', executionNode.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionNode?.data])

  const StepDetails = stepDetails.component

  return (
    <div className={css.main}>
      <div className={css.header}>
        <div className={css.title}>
          {getString('pipeline.execution.stepTitlePrefix')}
          {selectedStep.name}
        </div>
        <div className={css.actions}>
          <ExecutionLayout.Toggle />
          {interruptHistories.length > 0 ? (
            <Popover wrapperTagName="div" targetTagName="div" minimal position="bottom-right">
              <Button minimal className={cx(css.btn, css.more)} icon="more" data-testid="retry-logs" />
              <Menu>
                {interruptHistories.map(({ interruptId, interruptConfig }, i) =>
                  interruptConfig?.retryInterruptConfig ? (
                    <Menu.Item
                      active={retryStep === interruptConfig.retryInterruptConfig.retryId}
                      key={interruptId}
                      text={getString('pipeline.execution.retryStepCount', { num: i + 1 })}
                      onClick={() =>
                        goToRetryStepExecution(
                          interruptConfig.retryInterruptConfig?.retryId || /* istanbul ignore next */ ''
                        )
                      }
                    />
                  ) : /* istanbul ignore next */ null
                )}
                <Menu.Item
                  active={!retryStep}
                  text={getString('pipeline.execution.currentExecution')}
                  onClick={goToCurrentExecution}
                />
              </Menu>
            </Popover>
          ) : null}
        </div>
      </div>
      {loading ? <Spinner /> : <StepDetails step={selectedStep} stageType={stageType} />}
    </div>
  )
}
