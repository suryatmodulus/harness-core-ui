import React from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import {
  Button,
  IconName,
  Formik,
  FormikForm,
  RUNTIME_INPUT_VALUE,
  TextInput,
  FormInput,
  Text,
  Popover,
  Color
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { isEmpty, set } from 'lodash-es'
import { Classes, Dialog, Position } from '@blueprintjs/core'
import flatten from 'lodash-es/flatten'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import {
  ConnectorInfoDTO,
  getConnectorPromise,
  getTestConnectionResultPromise,
  getTestGitRepoConnectionResultPromise,
  PipelineInfoConfig,
  useGetConnector
} from 'services/cd-ng'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerTypes } from '../PipelineContext/PipelineActions'
import { RightDrawer } from '../RightDrawer/RightDrawer'
import { StageTypes } from '../Stages/StageTypes'
import { EnableGitExperience } from '../EnableGitExperience/EnableGitExperience'
import css from './RightBar.module.scss'

interface CodebaseValues {
  connectorRef?: ConnectorReferenceFieldProps['selected']
  repoName?: string
}

enum CodebaseStatuses {
  ZeroState = 'zeroState',
  NotConfigured = 'notConfigured',
  Valid = 'valid',
  Invalid = 'invalid',
  Validating = 'validating'
}

const codebaseIcons: Record<CodebaseStatuses, IconName> = {
  [CodebaseStatuses.ZeroState]: 'codebase-zero-state',
  [CodebaseStatuses.NotConfigured]: 'codebase-not-configured',
  [CodebaseStatuses.Valid]: 'codebase-valid',
  [CodebaseStatuses.Invalid]: 'codebase-invalid',
  [CodebaseStatuses.Validating]: 'codebase-validating'
}

export const RightBar = (): JSX.Element => {
  const {
    state: {
      pipeline,
      pipelineView,
      pipelineView: {
        drawerData: { type }
      }
    },
    updatePipeline,
    updatePipelineView
  } = React.useContext(PipelineContext)
  const isFlowControlEnabled = useFeatureFlag('NG_BARRIERS')
  const isGitSyncFeatureFlag = useFeatureFlag('GIT_SYNC_NG')
  const { isGitSyncEnabled } = useAppStore()
  const codebase = (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase
  const [codebaseStatus, setCodebaseStatus] = React.useState<CodebaseStatuses>(CodebaseStatuses.ZeroState)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const [isCodebaseDialogOpen, setIsCodebaseDialogOpen] = React.useState(false)
  const codebaseInitialValues: CodebaseValues = {
    repoName: codebase?.repoName
  }

  const connectorId = getIdentifierFromValue((codebase?.connectorRef as string) || '')
  const initialScope = getScopeFromValue((codebase?.connectorRef as string) || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true,
    debounce: 300
  })

  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')

  if (connector?.data?.connector) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    codebaseInitialValues.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  }

  React.useEffect(() => {
    if (!isEmpty(codebase?.connectorRef)) {
      refetch()
    }
  }, [codebase?.connectorRef])

  React.useEffect(() => {
    if (connector?.data?.connector) {
      setConnectionType(
        connector?.data?.connector?.type === 'Git'
          ? connector?.data?.connector.spec.connectionType
          : connector?.data?.connector.spec.type
      )
      setConnectorUrl(connector?.data?.connector.spec.url)
    }
  }, [
    connector?.data?.connector,
    connector?.data?.connector?.spec.type,
    connector?.data?.connector?.spec.url,
    setConnectionType,
    setConnectorUrl
  ])

  const { selectedProject } = useAppStore()

  const pipelineStages = flatten(pipeline?.stages?.map(s => s?.parallel || s))

  const ciStageExists = pipelineStages?.some?.(stage => {
    if (stage?.stage?.type) {
      return stage?.stage?.type === StageTypes.BUILD
    } else {
      return false
    }
  })

  const isCodebaseEnabled =
    typeof codebaseStatus !== 'undefined' &&
    selectedProject?.modules &&
    selectedProject.modules.indexOf?.('CI') > -1 &&
    ciStageExists

  const atLeastOneCloneCodebaseEnabled = pipelineStages?.some?.(stage => (stage?.stage?.spec as any)?.cloneCodebase)

  React.useEffect(() => {
    if (atLeastOneCloneCodebaseEnabled) {
      if (!codebase?.connectorRef) {
        setCodebaseStatus(CodebaseStatuses.NotConfigured)
      } else {
        const validate = async () => {
          setCodebaseStatus(CodebaseStatuses.Validating)

          const connectorResult = await getConnectorPromise({
            identifier: connectorId,
            queryParams: {
              accountIdentifier: accountId,
              orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
              projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
            }
          })

          if (connectorResult?.data?.connector?.spec.type === 'Account') {
            try {
              const response = await getTestGitRepoConnectionResultPromise({
                identifier: connectorId,
                queryParams: {
                  accountIdentifier: accountId,
                  orgIdentifier:
                    initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
                  projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
                  repoURL:
                    (connectorResult?.data?.connector?.spec.url[
                      connectorResult?.data?.connector?.spec.url.length - 1
                    ] === '/'
                      ? connectorResult?.data?.connector?.spec.url
                      : connectorResult?.data?.connector?.spec.url + '/') + codebase?.repoName
                },
                body: undefined
              })

              if (response?.data?.status === 'SUCCESS') {
                setCodebaseStatus(CodebaseStatuses.Valid)
              } else {
                setCodebaseStatus(CodebaseStatuses.Invalid)
              }
            } catch (error) {
              setCodebaseStatus(CodebaseStatuses.Invalid)
            }
          } else {
            try {
              const response = await getTestConnectionResultPromise({
                identifier: connectorId,
                queryParams: {
                  accountIdentifier: accountId,
                  orgIdentifier:
                    initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
                  projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
                },
                body: undefined
              })

              if (response?.data?.status === 'SUCCESS') {
                setCodebaseStatus(CodebaseStatuses.Valid)
              } else {
                setCodebaseStatus(CodebaseStatuses.Invalid)
              }
            } catch (error) {
              setCodebaseStatus(CodebaseStatuses.Invalid)
            }
          }
        }

        validate()
      }
    } else {
      setCodebaseStatus(CodebaseStatuses.ZeroState)
    }
  }, [codebase?.connectorRef, codebase?.repoName, atLeastOneCloneCodebaseEnabled])

  const openCodebaseDialog = React.useCallback(() => {
    setIsCodebaseDialogOpen(true)
  }, [setIsCodebaseDialogOpen])

  const closeCodebaseDialog = React.useCallback(() => {
    setIsCodebaseDialogOpen(false)

    if (!connector?.data?.connector?.spec.type && !connector?.data?.connector?.spec.url) {
      setConnectionType('')
      setConnectorUrl('')
    }
  }, [
    connector?.data?.connector?.spec.type,
    connector?.data?.connector?.spec.url,
    setIsCodebaseDialogOpen,
    setConnectionType,
    setConnectorUrl
  ])

  const { getString } = useStrings()
  const [isGitExpOpen, setIsGitExpOpen] = React.useState(false)

  return (
    <div className={css.rightBar}>
      {!isGitSyncEnabled && isGitSyncFeatureFlag && (
        <Popover
          position={Position.LEFT}
          onOpening={() => setIsGitExpOpen(true)}
          onClosing={() => setIsGitExpOpen(false)}
          popoverClassName={css.gitSyncPopover}
        >
          <Button
            className={cx(css.iconButton, css.enableGitExpIcon, {
              [css.selected]: isGitExpOpen
            })}
            font={{ weight: 'semi-bold', size: 'xsmall' }}
            icon="service-github"
            text={getString('gitsync.label')}
            iconProps={{ size: 22, color: Color.RED_500 }}
            onClick={() => {
              updatePipelineView({
                ...pipelineView,
                isDrawerOpened: false,
                drawerData: { type: DrawerTypes.AddStep }
              })
            }}
            withoutCurrentColor={true}
          />
          <EnableGitExperience />
        </Popover>
      )}
      {isCodebaseEnabled && (
        <Button
          className={cx(css.iconButton)}
          text={getString('codebase')}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon={codebaseIcons[codebaseStatus] as IconName}
          iconProps={{ size: 20 }}
          minimal
          withoutCurrentColor
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: false,
              drawerData: { type: DrawerTypes.AddStep },
              isSplitViewOpen: false,
              splitViewData: {}
            })
            openCodebaseDialog()
          }}
        />
      )}

      <Button
        className={cx(css.iconButton, css.notificationsIcon, {
          [css.selected]: type === DrawerTypes.PipelineNotifications
        })}
        onClick={() => {
          updatePipelineView({
            ...pipelineView,
            isDrawerOpened: true,
            drawerData: { type: DrawerTypes.PipelineNotifications },
            isSplitViewOpen: false,
            splitViewData: {}
          })
        }}
        font={{ weight: 'semi-bold', size: 'xsmall' }}
        icon="right-bar-notification"
        iconProps={{ size: 28 }}
        text={getString('notifications.notificationRules')}
        withoutCurrentColor={true}
      />
      {isFlowControlEnabled && (
        <Button
          className={cx(css.iconButton, css.flowControlIcon, {
            [css.selected]: type === DrawerTypes.FlowControl
          })}
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: { type: DrawerTypes.FlowControl },
              isSplitViewOpen: false,
              splitViewData: {}
            })
          }}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="settings"
          iconProps={{ size: 20 }}
          text={getString('pipeline.barriers.flowControl')}
        />
      )}

      <Button
        className={cx(css.iconButton, css.variablesIcon, { [css.selected]: type === DrawerTypes.PipelineVariables })}
        onClick={() =>
          updatePipelineView({
            ...pipelineView,
            isDrawerOpened: true,
            drawerData: { type: DrawerTypes.PipelineVariables },
            isSplitViewOpen: false,
            splitViewData: {}
          })
        }
        font={{ weight: 'semi-bold', size: 'xsmall' }}
        icon="pipeline-variables"
        iconProps={{ size: 20 }}
        text={getString('variablesText')}
        data-testid="input-variable"
      />
      <div />
      {isCodebaseDialogOpen && (
        <Dialog
          isOpen={true}
          title={
            // TODO: Move to strings
            codebaseStatus === CodebaseStatuses.NotConfigured ? 'Configure Codebase' : 'Edit Codebase Configuration'
          }
          onClose={closeCodebaseDialog}
        >
          <Formik
            enableReinitialize
            initialValues={codebaseInitialValues}
            validationSchema={Yup.object().shape({
              connectorRef: Yup.mixed().required(getString('fieldRequired', { field: getString('connector') })),
              ...(connectionType === 'Account' && {
                repoName: Yup.string().required(getString('validation.repositoryName'))
              })
            })}
            onSubmit={(values): void => {
              set(pipeline, 'properties.ci.codebase', {
                connectorRef:
                  typeof values.connectorRef === 'string' ? values.connectorRef : values.connectorRef?.value,
                ...(values.repoName && { repoName: values.repoName }),
                build: RUNTIME_INPUT_VALUE
              })

              // Repo level connectors should not have repoName
              if (connectionType === 'Repo' && (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName) {
                delete (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName
              }

              updatePipeline(pipeline)

              closeCodebaseDialog()
            }}
          >
            {({ values, setFieldValue, submitForm, errors }) => (
              <>
                <div className={Classes.DIALOG_BODY}>
                  <FormikForm>
                    <ConnectorReferenceField
                      name="connectorRef"
                      type={['Git', 'Github', 'Gitlab', 'Bitbucket', 'Codecommit']}
                      selected={values.connectorRef}
                      width={460}
                      error={errors?.connectorRef}
                      label={getString('connector')}
                      placeholder={loading ? getString('loading') : getString('select')}
                      disabled={loading}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      onChange={(value, scope) => {
                        setConnectionType(value.type === 'Git' ? value.spec.connectionType : value.spec.type)
                        setConnectorUrl(value.spec.url)

                        setFieldValue('connectorRef', {
                          label: value.name || '',
                          value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
                          scope: scope,
                          live: value?.status?.status === 'SUCCESS',
                          connector: value
                        })
                      }}
                    />
                    {connectionType === 'Repo' ? (
                      <>
                        <Text margin={{ bottom: 'xsmall' }}>
                          {getString('pipelineSteps.build.create.repositoryNameLabel')}
                        </Text>
                        <TextInput name="repoName" value={connectorUrl} style={{ flexGrow: 1 }} disabled />
                      </>
                    ) : (
                      <>
                        <FormInput.Text
                          // TODO: Move to strings, in EditStageView too
                          label={'Repository Name'}
                          name="repoName"
                          style={{ flexGrow: 1 }}
                        />
                        {connectorUrl.length > 0 ? (
                          <div className={css.predefinedValue}>
                            {(connectorUrl[connectorUrl.length - 1] === '/' ? connectorUrl : connectorUrl + '/') +
                              (values.repoName ? values.repoName : '')}
                          </div>
                        ) : null}
                      </>
                    )}
                  </FormikForm>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                  <Button intent="primary" text={getString('save')} onClick={submitForm} /> &nbsp; &nbsp;
                  <Button text={getString('cancel')} onClick={closeCodebaseDialog} />
                </div>
              </>
            )}
          </Formik>
        </Dialog>
      )}
      <RightDrawer />
    </div>
  )
}
