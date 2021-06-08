import { useStrings } from 'framework/strings'
import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useHandleInterrupt, useHandleStageInterrupt } from 'services/pipeline-ng'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { Dialog, IDialogProps, Menu, MenuItem } from '@blueprintjs/core'
import { useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'
import {
  isExecutionActive,
  isExecutionComplete,
  isExecutionPaused,
  isExecutionPausing
} from '@pipeline/utils/statusHelpers'
import {
  Button,
  ButtonProps,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  Popover,
  Radio,
  RadioGroup,
  Text,
  useModalHook
} from '@wings-software/uicore'

import css from './ExecutionActions.module.scss'

import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import type { StringKeys } from 'framework/strings'

import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useSendslacknotifications } from 'services/cd-ng'
const commonButtonProps: ButtonProps = {
  minimal: true,
  small: true,
  tooltipProps: {
    isDark: true
  },
  withoutBoxShadow: true
}

export interface ExecutionActionsProps {
  pipelineExecution?: PipelineExecutionSummary
  executionStatus?: ExecutionStatus
  params: PipelineType<{
    orgIdentifier: string
    projectIdentifier: string
    pipelineIdentifier: string
    executionIdentifier: string
    accountId: string
  }> &
    GitQueryParams
  refetch?(): Promise<void>
  noMenu?: boolean
  stageId?: string
  stageName?: string
  canEdit?: boolean
  canExecute?: boolean
}

export default function ExecutionActions(props: ExecutionActionsProps): React.ReactElement {
  const { executionStatus, params, noMenu, stageId, canEdit = true, canExecute = true, stageName } = props
  const {
    orgIdentifier,
    executionIdentifier,
    accountId,
    projectIdentifier,
    pipelineIdentifier,
    module,
    branch,
    repoIdentifier
  } = params
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
        module,
        branch,
        repoIdentifier,
        executionId: executionIdentifier
      })}`
    )
  }

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
            interruptType: 'Abort'
          }
        })
        showSuccess(getString('pipeline.execution.stageActionMessages.abortedMessage', { stageName }))
      } else {
        await interrupt({} as never, {
          queryParams: {
            orgIdentifier,
            accountIdentifier: accountId,
            projectIdentifier,
            interruptType: 'Abort'
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

  function killEvent(e: React.MouseEvent<HTMLDivElement>): void {
    e.preventDefault()
    e.stopPropagation()
  }

  const confirmDialogProps: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    style: { width: 600, height: 300 }
  }

  const nonHarnessOptions = [
    { label: 'meenakshi.raikwar@harness.io', value: 'meenakshi.raikwar@harness.io' },
    { label: 'akhilesh.pandey@harness.io', value: 'akhilesh.pandey@harness.io' },
    { label: 'sainath.batthala@harness.io', value: 'sainath.batthala@harness.io' },
    { label: 'prashant.batra@harness.io', value: 'prashant.batra@harness.io' }
  ]

  const harnessOptions = [
    { label: 'meenakshi.raikwar@harness.io', value: 'meenakshi.raikwar@harness.io' },
    { label: 'akhilesh.pandey@harness.io', value: 'akhilesh.pandey@harness.io' },
    { label: 'sainath.batthala@harness.io', value: 'sainath.batthala@harness.io' },
    { label: 'prashant.batra@harness.io', value: 'prashant.batra@harness.io' }
  ]
  const { loading: loadingSlack, mutate: sentSlackInvite } = useSendslacknotifications({})

  // const handleSendNonHarnessInvitation = payload => {}
  // const handleSendHarnessInvitation = payload => {}

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog title={'Invite Users'} {...confirmDialogProps} onClose={hideModal}>
        <Container padding="small" height="310px">
          <Formik
            initialValues={{
              accountType: 'NON_HARNESS',
              emailInvites: [{ label: 'All', value: 'All' }],
              slackNotification: [{ label: 'All', value: 'All' }]
            }}
            formName="sendInvite"
            enableReinitialize={true}
            onSubmit={data => {
              let payloadHarness = {}
              let payloadNonHarness = {}
              if (data.accountType === 'NON_HARNESS') {
                let userData = null
                if (data.emailInvites.includes({ label: 'All', value: 'All' })) {
                  userData = nonHarnessOptions.map(item => {
                    return {
                      name: item.value,
                      hasHarnessAccount: false,
                      hasSlackAccount: false
                    }
                  })
                } else {
                  userData = data.emailInvites.map(item => {
                    return {
                      name: item.value,
                      hasHarnessAccount: false,
                      hasSlackAccount: false
                    }
                  })
                }
                payloadNonHarness = {
                  deploymentDetails: {
                    deploymentType: 'Production',
                    deploymentStatus: executionStatus,
                    triggeredBy: 'sainath.batthala',
                    triggeredOn: props.pipelineExecution?.createdAt,
                    pipelineExecutionLink: props.pipelineExecution?.planExecutionId
                  },
                  users: userData
                }
              } else if (data.accountType === 'HARNESS') {
                let userData = null
                if (data.slackNotification.includes({ label: 'All', value: 'All' })) {
                  userData = nonHarnessOptions.map(item => {
                    return {
                      name: item.value,
                      hasHarnessAccount: true,
                      hasSlackAccount: true
                    }
                  })
                } else {
                  userData = data.slackNotification.map(item => {
                    return {
                      name: item.value,
                      hasHarnessAccount: true,
                      hasSlackAccount: true
                    }
                  })
                }
                payloadHarness = {
                  deploymentDetails: {
                    deploymentType: 'Production',
                    deploymentStatus: executionStatus,
                    triggeredBy: 'sainath.batthala',
                    triggeredOn: props.pipelineExecution?.createdAt,
                    pipelineExecutionLink: `${window.location.origin}#${routes.toExecutionPipelineView({
                      orgIdentifier,
                      pipelineIdentifier: props.pipelineExecution?.pipelineIdentifier || '',
                      executionIdentifier: props.pipelineExecution?.planExecutionId || '',
                      projectIdentifier,
                      accountId,
                      module
                    })}`
                  },
                  users: userData
                }
              }
              sentSlackInvite(payloadHarness)
            }}
          >
            {formikProps => {
              return (
                <Container margin={{ right: 'large', left: 'large' }}>
                  <FormikForm>
                    <FormInput.RadioGroup
                      name="accountType"
                      label={''}
                      items={[
                        { label: 'Non Harness Accounts', value: 'NON_HARNESS' },
                        { label: 'Harness Accounts', value: 'HARNESS' }
                      ]}
                      radioGroup={{ inline: true }}
                    />
                    {formikProps.values.accountType === 'NON_HARNESS' ? (
                      <>
                        <FormInput.MultiSelect
                          items={[{ label: 'All', value: 'All' }].concat(nonHarnessOptions)}
                          label={'Email Invitations'}
                          name="emailInvites"
                        />
                        <Text>Invite users to harness who have their commits as part of this build</Text>
                      </>
                    ) : null}

                    {formikProps.values.accountType === 'HARNESS' ? (
                      <>
                        <FormInput.MultiSelect
                          items={[{ label: 'All', value: 'All' }].concat(harnessOptions)}
                          label={'Slack Notifications'}
                          name="slackNotification"
                        />
                        <Text>
                          Send slack notifications to harness accounts who have their commits as part of this build
                        </Text>
                      </>
                    ) : null}
                    <Button
                      style={{ marginTop: '40px' }}
                      intent="primary"
                      type="submit"
                      text={loadingSlack ? 'Sending Invites' : 'Send'}
                      margin={{ top: 'large' }}
                    />
                  </FormikForm>
                </Container>
              )
            }}
          </Formik>
        </Container>
      </Dialog>
    )
  }, [])

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
            <MenuItem text={'Invite'} onClick={() => showModal()} />
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
            {stageId ? null : <MenuItem text={getString('pipeline.execution.actions.downloadLogs')} disabled />}
          </Menu>
        </Popover>
      )}
    </div>
  )
}
