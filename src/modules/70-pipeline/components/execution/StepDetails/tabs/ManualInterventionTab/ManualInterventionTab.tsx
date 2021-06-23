import React from 'react'
import { chunk } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { String } from 'framework/strings'
import {
  useHandleManualInterventionInterrupt,
  ExecutionNode,
  HandleManualInterventionInterruptQueryParams
} from 'services/pipeline-ng'
import type { Strategy } from '@pipeline/utils/FailureStrategyUtils'
import { StrategyIcon } from '@pipeline/components/PipelineSteps/AdvancedSteps/FailureStrategyPanel/StrategySelection/StrategyIcon'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/components/Toaster/useToaster'

import css from './ManualInterventionTab.module.scss'

export interface ManualInterventionTabProps {
  step: ExecutionNode
  allowedStrategies: Strategy[]
}

export function ManualInterventionTab(props: ManualInterventionTabProps): React.ReactElement {
  const { allowedStrategies, step } = props
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId } = useParams<
    PipelineType<ExecutionPathProps>
  >()
  const { mutate: handleInterrupt, loading, error } = useHandleManualInterventionInterrupt({
    planExecutionId: executionIdentifier,
    nodeExecutionId: step.uuid || /* istanbul ignore next */ ''
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

  const STRATEGIES: Strategy[][] = React.useMemo(() => chunk(allowedStrategies, 5), [allowedStrategies])

  React.useEffect(() => {
    if (error) {
      showError((error as any).data?.message || error.message, undefined, 'pipeline.error.intervention')
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
              <StrategyIcon key={j} strategy={strategy} name={strategy} onChange={handleChange} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
