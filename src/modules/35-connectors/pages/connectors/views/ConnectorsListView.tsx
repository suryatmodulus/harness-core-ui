/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, useEffect } from 'react'
import {
  Text,
  Link,
  Layout,
  Color,
  Icon,
  Button,
  Popover,
  StepsProgress,
  Container,
  ButtonVariation,
  ButtonSize,
  useToaster,
  TagsPopover,
  TableV2,
  FontVariation,
  useConfirmationDialog
} from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import { Menu, Classes, Position, Intent, PopoverInteractionKind, TextArea, Tooltip } from '@blueprintjs/core'
import { useParams, useHistory } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import classNames from 'classnames'
import { pick } from 'lodash-es'
import { String, useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import {
  ConnectorResponse,
  useDeleteConnector,
  PageConnectorResponse,
  useGetTestConnectionResult,
  ConnectorConnectivityDetails,
  ConnectorInfoDTO,
  ConnectorValidationResult,
  EntityGitDetails
} from 'services/cd-ng'

import { StepIndex, STEP } from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { StepDetails, CredTypeValues } from '@connectors/interfaces/ConnectorInterface'
import { ConnectorStatus, Connectors } from '@connectors/constants'
import type { UseCreateConnectorModalReturn } from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import useTestConnectionErrorModal from '@connectors/common/useTestConnectionErrorModal/useTestConnectionErrorModal'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'
import {
  getIconByType,
  GetTestConnectionValidationTextByType,
  DelegateTypes,
  isSMConnector
} from '../utils/ConnectorUtils'
import css from './ConnectorsListView.module.scss'

interface ConnectorListViewProps {
  data?: PageConnectorResponse
  reload?: () => Promise<void>
  gotoPage: (pageNumber: number) => void
  openConnectorModal: UseCreateConnectorModalReturn['openConnectorModal']
}

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  reload?: () => Promise<void>
}

export type ErrorMessage = ConnectorValidationResult & { useErrorHandler?: boolean }

const stopPropagation = (e: React.MouseEvent<Element, MouseEvent>) => e.stopPropagation()

const linkRenderer = (value: string): JSX.Element =>
  value ? (
    <Link
      margin={{ left: 'xsmall' }}
      className={css.link}
      href={value}
      onClick={stopPropagation}
      target="_blank"
      title={value}
    >
      {value}
    </Link>
  ) : (
    <></>
  )

const textRenderer = (value: string): JSX.Element =>
  value ? (
    <Text inline margin={{ left: 'xsmall' }} color={Color.BLACK}>
      {value}
    </Text>
  ) : (
    <></>
  )

const getConnectorDisplaySummaryLabel = (titleStringId: StringKeys, Element: JSX.Element): JSX.Element | string => {
  return (
    <div className={classNames(css.name, css.flex)}>
      {titleStringId ? (
        <Text inline color={Color.BLACK}>
          <String stringID={titleStringId} />:
        </Text>
      ) : null}
      {Element}
    </div>
  )
}

const displayDelegatesTagsSummary = (delegateSelectors: []): JSX.Element => {
  return (
    <div className={classNames(css.name)}>
      <Text inline color={Color.BLACK}>
        <String stringID={'delegate.delegateTags'} />:
      </Text>
      <Text inline margin={{ left: 'xsmall' }} color={Color.GREY_400}>
        {delegateSelectors?.join?.(', ')}
      </Text>
    </div>
  )
}

const getAWSDisplaySummary = (connector: ConnectorInfoDTO): JSX.Element | string => {
  return connector?.spec?.credential?.type === DelegateTypes.DELEGATE_IN_CLUSTER ||
    connector?.spec?.credential?.type === DelegateTypes.DELEGATE_IN_CLUSTER_IRSA
    ? displayDelegatesTagsSummary(connector.spec.delegateSelectors)
    : getConnectorDisplaySummaryLabel(
        'connectors.aws.accessKey',
        textRenderer(connector?.spec?.credential?.spec?.accessKeyRef || connector?.spec?.credential?.spec?.accessKey)
      )
}

const getGCPDisplaySummary = (connector: ConnectorInfoDTO): JSX.Element | string => {
  return connector?.spec?.credential?.type === DelegateTypes.DELEGATE_IN_CLUSTER
    ? displayDelegatesTagsSummary(connector.spec.delegateSelectors)
    : getConnectorDisplaySummaryLabel(
        'encryptedKeyLabel',
        textRenderer(connector?.spec?.credential?.spec?.secretKeyRef)
      )
}

const getK8DisplaySummary = (connector: ConnectorInfoDTO): JSX.Element | string => {
  return connector?.spec?.credential?.type === DelegateTypes.DELEGATE_IN_CLUSTER
    ? displayDelegatesTagsSummary(connector.spec.delegateSelectors)
    : getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.credential?.spec?.masterUrl))
}

const getAWSSecretManagerSummary = (connector: ConnectorInfoDTO): JSX.Element | string => {
  return connector?.spec?.credential?.type !== CredTypeValues.ManualConfig
    ? displayDelegatesTagsSummary(connector.spec.delegateSelectors)
    : getConnectorDisplaySummaryLabel(
        'connectors.aws.accessKey',
        textRenderer(connector?.spec?.credential?.spec?.accessKey)
      )
}

const getConnectorDisplaySummary = (connector: ConnectorInfoDTO): JSX.Element | string => {
  switch (connector?.type) {
    case Connectors.KUBERNETES_CLUSTER:
      return getK8DisplaySummary(connector)
    case Connectors.HttpHelmRepo:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.helmRepoUrl))
    case Connectors.Jira:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.jiraUrl))
    case Connectors.SERVICE_NOW:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.serviceNowUrl))
    case Connectors.GIT:
    case Connectors.GITHUB:
    case Connectors.GITLAB:
    case Connectors.BITBUCKET:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.url))
    case Connectors.DOCKER:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.dockerRegistryUrl))
    case Connectors.NEXUS:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.nexusServerUrl))
    case Connectors.ARTIFACTORY:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.artifactoryServerUrl))
    case Connectors.AWS:
      return getAWSDisplaySummary(connector)
    case Connectors.GCP:
      return getGCPDisplaySummary(connector)
    case Connectors.NEW_RELIC:
    case Connectors.DATADOG:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.url))
    case Connectors.APP_DYNAMICS:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.controllerUrl))
    case Connectors.SPLUNK:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.splunkUrl))
    case Connectors.AWS_SECRET_MANAGER:
      return getAWSSecretManagerSummary(connector)
    default:
      return ''
  }
}

export const RenderColumnConnector: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original
  const tags = data.connector?.tags || {}
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="small">
      <Icon name={getIconByType(data.connector?.type)} size={30}></Icon>
      <div className={css.wrapper}>
        <Layout.Horizontal spacing="small">
          <div className={css.name} color={Color.BLACK} title={data.connector?.name}>
            {data.connector?.name}
          </div>
          {tags && Object.keys(tags).length ? <TagsPopover tags={tags} /> : null}
          {data.entityValidityDetails?.valid === false ? (
            <Tooltip
              position="bottom"
              content={
                <Layout.Horizontal flex={{ alignItems: 'baseline' }}>
                  <Icon name="warning-sign" color={Color.RED_600} size={12} margin={{ right: 'small' }} />
                  <Layout.Vertical>
                    <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                      {getString('common.gitSync.outOfSync', { entityType: 'Connector', name: data.connector?.name })}
                    </Text>
                    <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                      {getString('common.gitSync.fixAllErrors')}
                    </Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
              }
            >
              <Icon name="warning-sign" color={Color.RED_600} size={16} padding={{ left: 'xsmall' }} />
            </Tooltip>
          ) : (
            <></>
          )}
        </Layout.Horizontal>
        <div className={css.identifier} title={data.connector?.identifier}>
          {`${getString('common.ID')}: ${data.connector?.identifier}`}
        </div>
      </div>
    </Layout.Horizontal>
  )
}
export const RenderColumnDetails: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original

  return data.connector ? (
    <div className={css.wrapper}>
      <div color={Color.BLACK}>{getConnectorDisplaySummary(data.connector)}</div>
    </div>
  ) : null
}

export const RenderGitDetails: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original

  return data.gitDetails ? (
    <div className={css.wrapper}>
      <Layout.Horizontal>
        <Container
          className={css.name}
          color={Color.BLACK}
          title={data.gitDetails?.repoIdentifier}
          padding={{ top: 'xsmall' }}
          margin={{ right: 'small' }}
        >
          {data.gitDetails?.repoIdentifier}
        </Container>
        {data.gitDetails?.branch && (
          <Layout.Horizontal
            border
            spacing="xsmall"
            padding={'xsmall'}
            background={Color.GREY_100}
            width={'fit-content'}
          >
            <Icon
              inline
              name="git-new-branch"
              size={12}
              margin={{ left: 'xsmall', top: 'xsmall' }}
              color={Color.GREY_700}
            ></Icon>
            <Text lineClamp={1} className={classNames(css.name, css.listingGitBranch)} color={Color.BLACK}>
              {data.gitDetails?.branch}
            </Text>
          </Layout.Horizontal>
        )}
      </Layout.Horizontal>
    </div>
  ) : null
}

export const RenderColumnActivity: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      <Icon name="activity" />
      {data.activityDetails?.lastActivityTime ? <ReactTimeago date={data.activityDetails?.lastActivityTime} /> : null}
    </Layout.Horizontal>
  )
}
export const RenderColumnLastUpdated: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      {data.lastModifiedAt ? <ReactTimeago date={data.lastModifiedAt} /> : null}
    </Layout.Horizontal>
  )
}
const RenderColumnStatus: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [testing, setTesting] = useState(false)
  const [lastTestedAt, setLastTestedAt] = useState<number>()
  const [status, setStatus] = useState<ConnectorConnectivityDetails['status']>(data.status?.status)

  const [errorMessage, setErrorMessage] = useState<ErrorMessage>()
  const { getString } = useStrings()
  const { branch, repoIdentifier } = data.gitDetails || {}
  const [stepDetails, setStepDetails] = useState<StepDetails>({
    step: 1,
    intent: Intent.WARNING,
    status: 'PROCESS' // Replace when enum is added in uikit
  })

  const { openErrorModal } = useTestConnectionErrorModal({})
  const { mutate: reloadTestConnection } = useGetTestConnectionResult({
    identifier: data.connector?.identifier || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      branch,
      repoIdentifier
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const executeStepVerify = async (): Promise<void> => {
    if (stepDetails.step === StepIndex.get(STEP.TEST_CONNECTION)) {
      if (stepDetails.status === 'PROCESS') {
        try {
          const result = await reloadTestConnection()
          setStatus(result?.data?.status)
          setLastTestedAt(new Date().getTime())
          if (result?.data?.status === 'SUCCESS') {
            setStepDetails({
              step: 2,
              intent: Intent.SUCCESS,
              status: 'DONE'
            })
          } else {
            setErrorMessage({ ...result.data, useErrorHandler: false })
            setStepDetails({
              step: 1,
              intent: Intent.DANGER,
              status: 'ERROR'
            })
          }
          setTesting(false)
        } catch (err) {
          setLastTestedAt(new Date().getTime())
          setStatus('FAILURE')
          if (err?.data?.responseMessages) {
            setErrorMessage({
              errorSummary: err?.data?.message,
              errors: err?.data?.responseMessages || [],
              useErrorHandler: true
            })
          } else {
            setErrorMessage({ ...err.message, useErrorHandler: false })
          }
          setStepDetails({
            step: 1,
            intent: Intent.DANGER,
            status: 'ERROR'
          })
          setTesting(false)
        }
      }
    }
  }
  const stepName = GetTestConnectionValidationTextByType(data.connector?.type)

  useEffect(() => {
    if (testing) executeStepVerify()
  }, [testing])

  const isStatusSuccess = status === ConnectorStatus.SUCCESS || data.status?.status === ConnectorStatus.SUCCESS

  return (
    <Layout.Horizontal>
      {!testing ? (
        <Layout.Vertical width="100px">
          <Layout.Horizontal spacing="small">
            {status || data.status?.status || errorMessage ? (
              <Text
                inline
                icon={isStatusSuccess ? 'full-circle' : 'warning-sign'}
                iconProps={{
                  size: isStatusSuccess ? 6 : 12,
                  color: isStatusSuccess ? Color.GREEN_500 : Color.RED_500
                }}
                tooltip={
                  !isStatusSuccess ? (
                    errorMessage?.errorSummary || data?.status?.errorSummary ? (
                      <Layout.Vertical font={{ size: 'small' }} spacing="small" padding="small">
                        <Text font={{ size: 'small' }} color={Color.WHITE}>
                          {errorMessage?.errorSummary || data.status?.errorSummary}
                        </Text>
                        {errorMessage?.errors || data?.status?.errors ? (
                          <Text
                            color={Color.BLUE_400}
                            onClick={e => {
                              e.stopPropagation()
                              openErrorModal((errorMessage as ErrorMessage) || data?.status)
                            }}
                            className={css.viewDetails}
                          >
                            {getString('connectors.testConnectionStep.errorDetails')}
                          </Text>
                        ) : null}
                      </Layout.Vertical>
                    ) : (
                      <Text padding="small" color={Color.WHITE}>
                        {getString('noDetails')}
                      </Text>
                    )
                  ) : (
                    ''
                  )
                }
                tooltipProps={{ isDark: true, position: 'bottom', popoverClassName: css.tooltip }}
              >
                {isStatusSuccess ? getString('success').toLowerCase() : getString('failed').toLowerCase()}
              </Text>
            ) : null}
          </Layout.Horizontal>
          {status || data.status?.status ? (
            <Text font={{ size: 'small' }} color={Color.GREY_400}>
              {<ReactTimeago date={lastTestedAt || data.status?.testedAt || ''} />}
            </Text>
          ) : null}
        </Layout.Vertical>
      ) : (
        <Layout.Horizontal>
          <Popover interactionKind={PopoverInteractionKind.HOVER} position={Position.LEFT_TOP}>
            <Button intent="primary" minimal loading />
            <div className={css.testConnectionPop}>
              <StepsProgress
                steps={[stepName]}
                intent={stepDetails.intent}
                current={stepDetails.step}
                currentStatus={stepDetails.status}
              />
            </div>
          </Popover>
          <Text style={{ margin: 8 }}>{getString('connectors.testInProgress')}</Text>
        </Layout.Horizontal>
      )}
      {!testing && !isStatusSuccess ? (
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          text={getString('test')}
          className={css.testBtn}
          onClick={e => {
            e.stopPropagation()
            setTesting(true)
            setStepDetails({
              step: 1,
              intent: Intent.WARNING,
              status: 'PROCESS' // Replace when enum is added in uikit
            })
          }}
          withoutBoxShadow
        />
      ) : null}
    </Layout.Horizontal>
  )
}

const RenderColumnMenu: Renderer<CellProps<ConnectorResponse>> = ({ row, column }) => {
  const history = useHistory()
  const params = useParams<PipelineType<ProjectPathProps>>()
  const data = row.original
  const gitDetails = data?.gitDetails ?? {}
  const isHarnessManaged = data.harnessManaged
  const { isGitSyncEnabled: gitSyncAppStoreEnabled } = useAppStore()
  const isGitSyncEnabled = gitSyncAppStoreEnabled && !isSMConnector(row.original.connector?.type)
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [commitMsg, setCommitMsg] = useState<string>(
    `${getString('connectors.confirmDeleteTitle')} ${data.connector?.name}`
  )
  const gitParams = gitDetails?.objectId
    ? {
        ...pick(gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
        commitMsg,
        lastObjectId: gitDetails.objectId
      }
    : {}
  const { mutate: deleteConnector } = useDeleteConnector({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      ...gitParams
    }
  })

  const [canUpdate, canDelete] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: data.connector?.identifier || ''
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR, PermissionIdentifier.DELETE_CONNECTOR]
    },
    []
  )

  const getConfirmationDialogContent = (): JSX.Element => {
    return (
      <div className={'connectorDeleteDialog'}>
        <Text margin={{ bottom: 'medium' }} className={css.confirmText} title={data.connector?.name}>{`${getString(
          'connectors.confirmDelete'
        )} ${data.connector?.name}?`}</Text>
        {gitDetails?.objectId && (
          <>
            <Text>{getString('common.git.commitMessage')}</Text>
            <TextArea
              value={commitMsg}
              onInput={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                setCommitMsg(event.target.value)
              }}
            />
          </>
        )}
      </div>
    )
  }

  const { openDialog } = useConfirmationDialog({
    contentText: getConfirmationDialogContent(),
    titleText: getString('connectors.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteConnector(data.connector?.identifier || '', {
            headers: { 'content-type': 'application/json' }
          })

          if (deleted) showSuccess(`Connector ${data.connector?.name} deleted`)
          ;(column as any).reload?.()
        } catch (err) {
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!data?.connector?.identifier) return
    openDialog()
  }

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    const isEntityInvalid = data.entityValidityDetails?.valid === false
    e.stopPropagation()
    setMenuOpen(false)
    if (!data?.connector?.identifier) return
    if (!isEntityInvalid) {
      ;(column as any).openConnectorModal(true, row?.original?.connector?.type as ConnectorInfoDTO['type'], {
        connectorInfo: row.original.connector,
        gitDetails: row.original?.gitDetails
      })
    } else {
      history.push(routes.toConnectorDetails({ ...params, connectorId: data.connector?.identifier }))
    }
  }

  return (
    !isHarnessManaged && // if isGitSyncEnabled then gitobjectId should also be there to support edit/delete
    !isGitSyncEnabled === !gitDetails?.objectId && (
      <Layout.Horizontal className={css.layout}>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          className={Classes.DARK}
          position={Position.RIGHT_TOP}
        >
          <Button
            minimal
            icon="Options"
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(true)
            }}
          />
          <Menu style={{ minWidth: 'unset' }}>
            <Menu.Item icon="edit" text="Edit" onClick={handleEdit} disabled={!canUpdate} />
            <Menu.Item icon="trash" text="Delete" onClick={handleDelete} disabled={!canDelete} />
          </Menu>
        </Popover>
      </Layout.Horizontal>
    )
  )
}

const ConnectorsListView: React.FC<ConnectorListViewProps> = props => {
  const { data, reload, gotoPage } = props
  const params = useParams<PipelineType<ProjectPathProps>>()
  const history = useHistory()
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const listData: ConnectorResponse[] = useMemo(() => data?.content || [], [data?.content])
  const columns: CustomColumn<ConnectorResponse>[] = useMemo(
    () => [
      {
        Header: getString('connector').toUpperCase(),
        accessor: row => row.connector?.name,
        id: 'name',
        width: isGitSyncEnabled ? '19%' : '25%',
        Cell: RenderColumnConnector
      },
      {
        Header: getString('details').toUpperCase(),
        accessor: row => row.connector?.description,
        id: 'details',
        width: '25%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('common.gitSync.repoDetails').toUpperCase(),
        accessor: row => row.connector?.identifier,
        id: 'gitDetails',
        width: '20%',
        Cell: RenderGitDetails
      },
      {
        Header: getString('lastActivity').toUpperCase(),
        accessor: 'activityDetails',
        id: 'activity',
        width: isGitSyncEnabled ? '10%' : '15%',
        Cell: RenderColumnActivity
      },
      {
        Header: getString('connectivityStatus').toUpperCase(),
        accessor: 'status',
        id: 'status',
        width: '15%',
        Cell: RenderColumnStatus
      },
      {
        Header: getString('lastUpdated').toUpperCase(),
        accessor: 'lastModifiedAt',
        id: 'lastModifiedAt',
        width: isGitSyncEnabled ? '6%' : '15%',
        Cell: RenderColumnLastUpdated
      },
      {
        Header: '',
        accessor: row => row.connector?.identifier,
        width: '5%',
        id: 'action',
        Cell: RenderColumnMenu,
        openConnectorModal: props.openConnectorModal,
        reload: reload,
        disableSortBy: true
      }
    ],
    [props.openConnectorModal, reload, isGitSyncEnabled]
  )

  if (!isGitSyncEnabled) {
    columns.splice(2, 1)
  }

  return (
    <TableV2<ConnectorResponse>
      className={css.table}
      columns={columns}
      data={listData}
      name="ConnectorsListView"
      onRowClick={connector => {
        const url = routes.toConnectorDetails({ ...params, connectorId: connector.connector?.identifier })
        const gitInfo: EntityGitDetails = connector.gitDetails ?? {}
        const urlForGit = `${url}?repoIdentifier=${gitInfo.repoIdentifier}&branch=${gitInfo.branch}`
        history.push(gitInfo?.objectId ? urlForGit : url)
      }}
      pagination={{
        itemCount: data?.totalItems || 0,
        pageSize: data?.pageSize || 10,
        pageCount: data?.totalPages || -1,
        pageIndex: data?.pageIndex || 0,
        gotoPage
      }}
    />
  )
}

export default ConnectorsListView
