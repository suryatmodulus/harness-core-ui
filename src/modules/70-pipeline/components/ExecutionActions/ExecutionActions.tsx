import React from 'react'
import { Button, Popover, ButtonProps } from '@wings-software/uicore'
import { Menu, MenuItem } from '@blueprintjs/core'
import { Link, useHistory } from 'react-router-dom'

import { useHandleInterrupt, useHandleStageInterrupt } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { isExecutionComplete, isExecutionActive, isExecutionPaused } from '@pipeline/utils/statusHelpers'
import { useStrings } from 'framework/exports'

import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import css from './ExecutionActions.module.scss'

const commonButtonProps: ButtonProps = {
  minimal: true,
  small: true,
  tooltipProps: {
    isDark: true
  }
}

export interface ExecutionActionsProps {
  executionStatus?: ExecutionStatus
  params: PipelineType<{
    orgIdentifier: string
    projectIdentifier: string
    pipelineIdentifier: string
    executionIdentifier: string
    accountId: string
  }>
  refetch?(): Promise<void>
  noMenu?: boolean
  stageId?: string
}

export default function ExecutionActions(props: ExecutionActionsProps): React.ReactElement {
  const { executionStatus, params, noMenu, stageId } = props
  const { orgIdentifier, executionIdentifier, accountId, projectIdentifier, pipelineIdentifier, module } = params
  const { mutate: interrupt } = useHandleInterrupt({ planExecutionId: executionIdentifier })
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { mutate: stageInterrupt } = useHandleStageInterrupt({
    planExecutionId: executionIdentifier,
    nodeExecutionId: stageId!
  })
  const { showSuccess } = useToaster()
  const history = useHistory()
  const { getString } = useStrings()

  const reRunPipeline = (): void => {
    history.push(
      `${routes.toRunPipeline({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module
      })}?executionId=${executionIdentifier}`
    )
  }

  const canPause = isExecutionActive(executionStatus) && !isExecutionPaused(executionStatus)
  const canAbort = isExecutionActive(executionStatus)
  const canRerun = isExecutionComplete(executionStatus)
  const canResume = isExecutionPaused(executionStatus)

  async function abortPipleine(): Promise<void> {
    try {
      if (stageId) {
        await stageInterrupt({} as never, {
          queryParams: {
            orgIdentifier,
            accountIdentifier: accountId,
            projectIdentifier,
            interruptType: 'Abort'
          }
        })
      } else {
        await interrupt({} as never, {
          queryParams: {
            orgIdentifier,
            accountIdentifier: accountId,
            projectIdentifier,
            interruptType: 'Abort'
          }
        })
      }
      // await refetch()
      showSuccess(getString('execution.actionMessages.abortedMessage'))
    } catch (_) {
      //
    }
  }

  async function pausePipleine(): Promise<void> {
    try {
      if (stageId) {
        await stageInterrupt({} as never, {
          queryParams: {
            orgIdentifier,
            accountIdentifier: accountId,
            projectIdentifier,
            interruptType: 'Pause'
          }
        })
      } else {
        await interrupt({} as never, {
          queryParams: {
            orgIdentifier,
            accountIdentifier: accountId,
            projectIdentifier,
            interruptType: 'Pause'
          }
        })
      }
      // await refetch()
      showSuccess(getString('execution.actionMessages.pausedMessage'))
    } catch (_) {
      //
    }
  }

  async function resumePipleine(): Promise<void> {
    try {
      if (stageId) {
        await stageInterrupt({} as never, {
          queryParams: {
            orgIdentifier,
            accountIdentifier: accountId,
            projectIdentifier,
            interruptType: 'Resume'
          }
        })
      } else {
        await interrupt({} as never, {
          queryParams: {
            orgIdentifier,
            accountIdentifier: accountId,
            projectIdentifier,
            interruptType: 'Resume'
          }
        })
      }
      // await refetch()
      showSuccess(getString('execution.actionMessages.resumedMessage'))
    } catch (_) {
      //
    }
  }

  function killEvent(e: React.MouseEvent<HTMLDivElement>): void {
    e.preventDefault()
    e.stopPropagation()
  }

  // TODO: disable not implemented features in ci module
  const disableInCIModule = module === 'ci'

  return (
    <div className={css.main} onClick={killEvent}>
      {!disableInCIModule && canResume ? (
        <Button
          icon="play"
          tooltip={getString('execution.actions.resume')}
          onClick={resumePipleine}
          {...commonButtonProps}
        />
      ) : null}
      {canRerun ? (
        <Button
          icon="repeat"
          tooltip={getString('execution.actions.rerun')}
          onClick={reRunPipeline}
          {...commonButtonProps}
        />
      ) : null}
      {!disableInCIModule && canPause ? (
        <Button
          icon="pause"
          tooltip={getString('execution.actions.pause')}
          onClick={pausePipleine}
          {...commonButtonProps}
        />
      ) : null}
      {!disableInCIModule && canAbort ? (
        <Button
          icon="stop"
          tooltip={getString('execution.actions.abort')}
          onClick={abortPipleine}
          {...commonButtonProps}
        />
      ) : null}
      {noMenu ? null : (
        <Popover position="bottom-right" minimal>
          <Button icon="more" {...commonButtonProps} className={css.more} />
          <Menu>
            <Link
              className="bp3-menu-item"
              to={routes.toPipelineStudio({ orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module })}
            >
              {getString('editPipeline')}
            </Link>
            <MenuItem text={getString('execution.actions.rerun')} disabled={!canRerun} onClick={reRunPipeline} />
            <MenuItem
              text={getString('execution.actions.pause')}
              onClick={pausePipleine}
              disabled={disableInCIModule || !canPause}
            />
            <MenuItem
              text={getString('execution.actions.abort')}
              onClick={abortPipleine}
              disabled={disableInCIModule || !canAbort}
            />
            <MenuItem
              text={getString('execution.actions.resume')}
              onClick={resumePipleine}
              disabled={disableInCIModule || !canResume}
            />
            <MenuItem text={getString('execution.actions.downloadLogs')} disabled />
          </Menu>
        </Popover>
      )}
    </div>
  )
}
