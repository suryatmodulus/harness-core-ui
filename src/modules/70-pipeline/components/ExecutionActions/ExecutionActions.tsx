import React from 'react'
import { Button, Popover, ButtonProps } from '@wings-software/uicore'
import { Menu, MenuItem } from '@blueprintjs/core'
import { Link, useHistory } from 'react-router-dom'

import { useHandleInterrupt, useHandleStageInterrupt } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { isExecutionComplete, isExecutionActive, isExecutionPaused } from '@pipeline/utils/statusHelpers'
import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'

import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import css from './ExecutionActions.module.scss'

const commonButtonProps: ButtonProps = {
  minimal: true,
  small: true,
  tooltipProps: {
    isDark: true
  },
  withoutBoxShadow: true
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
  canEdit?: boolean
  canExecute?: boolean
}

export default function ExecutionActions(props: ExecutionActionsProps): React.ReactElement {
  const { executionStatus, params, noMenu, stageId, canEdit = true, canExecute = true } = props
  const { orgIdentifier, executionIdentifier, accountId, projectIdentifier, pipelineIdentifier, module } = params
  const { mutate: interrupt } = useHandleInterrupt({ planExecutionId: executionIdentifier })
  const { mutate: stageInterrupt } = useHandleStageInterrupt({
    planExecutionId: executionIdentifier,
    nodeExecutionId: stageId || ''
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

  const canPause = isExecutionActive(executionStatus) && !isExecutionPaused(executionStatus) && canExecute
  const canAbort = isExecutionActive(executionStatus) && canExecute
  const canRerun = isExecutionComplete(executionStatus) && canExecute
  const canResume = isExecutionPaused(executionStatus) && canExecute

  async function abortPipeline(): Promise<void> {
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

  async function pausePipeline(): Promise<void> {
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

  async function resumePipeline(): Promise<void> {
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

  const resumeText: StringKeys = stageId
    ? 'pipeline.execution.actions.resumeStage'
    : 'pipeline.execution.actions.resumePipeline'
  const rerunText: StringKeys = stageId
    ? 'pipeline.execution.actions.rerunStage'
    : 'pipeline.execution.actions.rerunPipeline'
  const pauseText: StringKeys = stageId
    ? 'pipeline.execution.actions.pauseStage'
    : 'pipeline.execution.actions.pausePipeline'
  const abortText: StringKeys = stageId
    ? 'pipeline.execution.actions.abortStage'
    : 'pipeline.execution.actions.abortPipeline'

  return (
    <div className={css.main} onClick={killEvent}>
      {canResume ? (
        <Button
          icon="play"
          tooltip={getString(resumeText)}
          onClick={resumePipeline}
          {...commonButtonProps}
          disabled={!canExecute}
        />
      ) : null}
      {!stageId && canRerun ? (
        <Button
          icon="repeat"
          tooltip={getString(rerunText)}
          onClick={reRunPipeline}
          {...commonButtonProps}
          disabled={!canExecute}
        />
      ) : null}
      {canPause ? (
        <Button
          icon="pause"
          tooltip={getString(pauseText)}
          onClick={pausePipeline}
          {...commonButtonProps}
          disabled={!canExecute}
        />
      ) : null}
      {canAbort ? (
        <Button
          icon="stop"
          tooltip={getString(abortText)}
          onClick={abortPipeline}
          {...commonButtonProps}
          disabled={!canExecute}
        />
      ) : null}
      {noMenu ? null : (
        <Popover position="bottom-right" minimal>
          <Button icon="more" {...commonButtonProps} className={css.more} />
          <Menu>
            <Link
              className="bp3-menu-item"
              to={routes.toPipelineStudio({ orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module })}
              onClick={e => !canEdit && e.preventDefault()}
            >
              {getString('editPipeline')}
            </Link>
            {stageId ? null : <MenuItem text={getString(rerunText)} disabled={!canRerun} onClick={reRunPipeline} />}
            <MenuItem text={getString(pauseText)} onClick={pausePipeline} disabled={!canPause} />
            <MenuItem text={getString(abortText)} onClick={abortPipeline} disabled={!canAbort} />
            <MenuItem text={getString(resumeText)} onClick={resumePipeline} disabled={!canResume} />
            {stageId ? null : <MenuItem text={getString('pipeline.execution.actions.downloadLogs')} disabled />}
          </Menu>
        </Popover>
      )}
    </div>
  )
}
