import React from 'react'
import { chunk } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { String } from 'framework/exports'
import {
  useHandleManualInterventionInterrupt,
  ExecutionNode,
  HandleManualInterventionInterruptQueryParams
} from 'services/pipeline-ng'
import { Strategy } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyConfig'
import { StrategyIcon } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyIcon'
import type { ExecutionPathParams } from '@pipeline/utils/executionUtils'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/components/Toaster/useToaster'

import css from './ManualInterventionTab.module.scss'

export interface ManualInterventionTabProps {
  step: ExecutionNode
}

export const STRATEGIES: Strategy[][] = chunk(
  [Strategy.Retry, Strategy.Ignore, Strategy.MarkAsSuccess, Strategy.Abort],
  5
)

export function ManualInterventionTab(props: ManualInterventionTabProps): React.ReactElement {
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId } = useParams<
    PipelineType<ExecutionPathParams>
  >()
  const { mutate: handleInterrupt, loading, error } = useHandleManualInterventionInterrupt({
    planExecutionId: executionIdentifier,
    nodeExecutionId: props.step.uuid || /* istanbul ignore next */ ''
  })
  const { showError } = useToaster()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const interruptType = e.target.value as HandleManualInterventionInterruptQueryParams['interruptType']
    handleInterrupt(undefined, {
      queryParams: {
        interruptType,
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      headers: { 'content-type': 'application/json' }
    })
  }

  React.useEffect(() => {
    if (error) {
      showError((error as any).data?.message || error.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  return (
    <div className={cx(css.manualInterventionTab, { [css.loading]: loading })}>
      <String tagName="div" className={css.title} stringID="common.PermissibleActions" />
      {STRATEGIES.map((layer, i) => {
        return (
          <div key={i} className={css.actionRow}>
            {layer.map((strategy, j) => (
              <StrategyIcon key={j} strategy={strategy} onChange={handleChange} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
