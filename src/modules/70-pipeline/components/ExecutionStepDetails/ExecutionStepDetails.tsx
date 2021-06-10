import React from 'react'
import { Button } from '@wings-software/uicore'
import { Popover, Menu, Spinner } from '@blueprintjs/core'
import cx from 'classnames'
import { has, reverse } from 'lodash-es'
import { useParams } from 'react-router-dom'

import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import ExecutionLayout from '@pipeline/components/ExecutionLayout/ExecutionLayout'
import { isExecutionWaitingForApproval } from '@pipeline/utils/statusHelpers'
import { isHarnessApproval } from '@pipeline/utils/stepUtils'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import { useUpdateQueryParams } from '@common/hooks'
import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetExecutionNode } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'

import { REFRESH_APPROVAL } from './Tabs/ApprovalTab/ApprovalTab'
import { StepDetailTabs } from './StepDetailTabs'
import css from './ExecutionStepDetails.module.scss'

export default function ExecutionStepDetails(): React.ReactElement {
  const { allNodeMap, addNewNodeToMap, queryParams, selectedStepId } = useExecutionContext()
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
     * 2. No retry step
     * 3. Already have data for it
     */
    lazy: !retryStep || has(allNodeMap, retryStep)
  })
  const originalStep = allNodeMap?.[selectedStepId] || /* istanbul ignore next */ {}
  const selectedStep = (retryStep ? allNodeMap[retryStep] : originalStep) || /* istanbul ignore next */ {}
  const isWaitingOnApproval = isExecutionWaitingForApproval(selectedStep.status)
  const isHarnessApprovalStep = isHarnessApproval(selectedStep.stepType)
  const interruptHistories = reverse([...(originalStep.interruptHistories || [])]).filter(
    ({ interruptConfig }) => interruptConfig.retryInterruptConfig
  )

  function handleRefresh(): void {
    /* istanbul ignore else */
    if (isHarnessApprovalStep && isWaitingOnApproval) {
      window.dispatchEvent(new CustomEvent(REFRESH_APPROVAL))
    }
  }

  function goToRetryStepExecution(id: string): void {
    updateQueryParams({ retryStep: id })
  }

  function goToCurrentExecution(): void {
    updateQueryParams({ retryStep: ([] as unknown) as string /* this removes the param fro query */ })
  }

  React.useEffect(() => {
    if (executionNode?.data) {
      addNewNodeToMap(executionNode.data.uuid || /* istanbul ignore next */ '', executionNode.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionNode?.data])

  return (
    <div className={css.main}>
      <div className={cx(css.header, { [css.isApproval]: isHarnessApprovalStep && isWaitingOnApproval })}>
        <div className={css.title}>
          {getString('pipeline.execution.stepTitlePrefix')}
          {selectedStep.name}
        </div>
        {isHarnessApprovalStep && isWaitingOnApproval ? (
          <Button minimal small intent="primary" onClick={handleRefresh}>
            {getString('common.refresh')}
          </Button>
        ) : null}
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
      {loading ? <Spinner /> : <StepDetailTabs step={selectedStep} />}
    </div>
  )
}
