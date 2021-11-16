import React from 'react'
import { Button, Popover, ButtonProps, useModalHook } from '@wings-software/uicore'
import { Dialog, IDialogProps, Menu, MenuItem } from '@blueprintjs/core'
import { Link } from 'react-router-dom'

import { useHandleInterrupt, useHandleStageInterrupt } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import RbacButton from '@rbac/components/Button/Button'
import {
  isExecutionComplete,
  isExecutionActive,
  isExecutionPaused,
  isExecutionPausing,
  ExecutionStatus,
  isRetryPipelineAllowed
} from '@pipeline/utils/statusHelpers'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'

import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import RetryPipeline from '../RetryPipeline/RetryPipeline'
import { useRunPipelineModal } from '../RunPipelineModal/useRunPipelineModal'
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
    stagesExecuted?: string[]
  }> &
    GitQueryParams
  refetch?(): Promise<void>
  noMenu?: boolean
  stageId?: string
  stageName?: string
  canEdit?: boolean
  canExecute?: boolean
  canRetry?: boolean
}

export default function ExecutionActions(props: ExecutionActionsProps): React.ReactElement {
  const {
    executionStatus,
    params,
    noMenu,
    stageId,
    canEdit = true,
    canExecute = true,
    stageName,
    canRetry = false
  } = props
  const {
    orgIdentifier,
    executionIdentifier,
    accountId,
    projectIdentifier,
    pipelineIdentifier,
    module,
    branch,
    repoIdentifier,
    stagesExecuted
  } = params
  const isCIModule = module === 'ci'
  const { mutate: interrupt } = useHandleInterrupt({ planExecutionId: executionIdentifier })
  const { mutate: stageInterrupt } = useHandleStageInterrupt({
    planExecutionId: executionIdentifier,
    nodeExecutionId: stageId || ''
  })
  const { showSuccess } = useToaster()
  const { getString } = useStrings()

  const canAbort = isExecutionActive(executionStatus) && canExecute
  const canPause =
    isExecutionActive(executionStatus) &&
    !isExecutionPaused(executionStatus) &&
    !isExecutionPausing(executionStatus) &&
    canExecute
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
            interruptType: 'AbortAll'
          }
        })
        showSuccess(getString('pipeline.execution.stageActionMessages.abortedMessage', { stageName }))
      } else {
        await interrupt({} as never, {
          queryParams: {
            orgIdentifier,
            accountIdentifier: accountId,
            projectIdentifier,
            interruptType: 'AbortAll'
          }
        })
        showSuccess(getString('pipeline.execution.pipelineActionMessages.abortedMessage'))
      }
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
        showSuccess(getString('pipeline.execution.stageActionMessages.pausedMessage', { stageName }))
      } else {
        await interrupt({} as never, {
          queryParams: {
            orgIdentifier,
            accountIdentifier: accountId,
            projectIdentifier,
            interruptType: 'Pause'
          }
        })
        showSuccess(getString('pipeline.execution.pipelineActionMessages.pausedMessage'))
      }
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
        showSuccess(getString('pipeline.execution.stageActionMessages.resumedMessage', { stageName }))
      } else {
        await interrupt({} as never, {
          queryParams: {
            orgIdentifier,
            accountIdentifier: accountId,
            projectIdentifier,
            interruptType: 'Resume'
          }
        })
        showSuccess(getString('pipeline.execution.pipelineActionMessages.resumedMessage'))
      }
    } catch (_) {
      //
    }
  }

  /*--------------------------------------Retry Pipeline---------------------------------------------*/
  const retryPipeline = (): void => {
    showRetryPipelineModal()
  }
  const showRetryPipeline = (): boolean => {
    return isRetryPipelineAllowed(executionStatus) && canRetry
  }

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: false,
    className: css.runPipelineDialog,
    style: { width: 872, height: 'fit-content', overflow: 'auto' }
  }

  const [showRetryPipelineModal, hideRetryPipelineModal] = useModalHook(() => {
    const onClose = (): void => {
      hideRetryPipelineModal()
    }

    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS}>
        <div className={css.modalContent}>
          <RetryPipeline
            onClose={onClose}
            executionIdentifier={executionIdentifier}
            pipelineIdentifier={pipelineIdentifier}
          />
          <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
        </div>
      </Dialog>
    )
  }, [pipelineIdentifier, executionIdentifier])

  /*--------------------------------------Retry Pipeline---------------------------------------------*/

  /*--------------------------------------Run Pipeline---------------------------------------------*/

  const reRunPipeline = (): void => {
    openRunPipelineModal()
  }

  const { openRunPipelineModal } = useRunPipelineModal({
    pipelineIdentifier,
    executionId: executionIdentifier,
    repoIdentifier,
    branch,
    stagesExecuted
  })

  /*--------------------------------------Run Pipeline---------------------------------------------*/

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
        <RbacButton
          icon="repeat"
          tooltip={getString(rerunText)}
          onClick={reRunPipeline}
          {...commonButtonProps}
          disabled={!canExecute}
          featureProps={{
            featureRequest: {
              featureName: isCIModule ? FeatureIdentifier.BUILDS : FeatureIdentifier.DEPLOYMENTS
            }
          }}
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
              className={`bp3-menu-item${!canEdit ? ' bp3-disabled' : ''}`}
              to={routes.toPipelineStudio({
                orgIdentifier,
                projectIdentifier,
                pipelineIdentifier,
                accountId,
                module,
                branch,
                repoIdentifier
              })}
              onClick={e => !canEdit && e.preventDefault()}
            >
              {getString('editPipeline')}
            </Link>
            {stageId ? null : <MenuItem text={getString(rerunText)} disabled={!canRerun} onClick={reRunPipeline} />}
            <MenuItem text={getString(pauseText)} onClick={pausePipeline} disabled={!canPause} />
            <MenuItem text={getString(abortText)} onClick={abortPipeline} disabled={!canAbort} />
            <MenuItem text={getString(resumeText)} onClick={resumePipeline} disabled={!canResume} />
            {showRetryPipeline() && <MenuItem text={getString('pipeline.retryPipeline')} onClick={retryPipeline} />}
            {stageId ? null : <MenuItem text={getString('pipeline.execution.actions.downloadLogs')} disabled />}
          </Menu>
        </Popover>
      )}
    </div>
  )
}
