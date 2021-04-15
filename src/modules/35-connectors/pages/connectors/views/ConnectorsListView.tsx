import React, { useState, useMemo, useEffect } from 'react'
import { Text, Link, Layout, Color, Icon, Button, Popover, StepsProgress } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import { Menu, Classes, Position, Intent, PopoverInteractionKind } from '@blueprintjs/core'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import classNames from 'classnames'
import { String, StringKeys } from 'framework/exports'
import {
  ConnectorResponse,
  useDeleteConnector,
  PageConnectorResponse,
  useGetTestConnectionResult,
  ConnectorConnectivityDetails,
  ConnectorInfoDTO,
  ConnectorValidationResult
} from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import { useConfirmationDialog } from '@common/exports'
import { useToaster } from '@common/components/Toaster/useToaster'
import TagsPopover from '@common/components/TagsPopover/TagsPopover'
import { StepIndex, STEP } from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import type { StepDetails } from '@connectors/interfaces/ConnectorInterface'
import { ConnectorStatus, Connectors } from '@connectors/constants'
import { useStrings } from 'framework/exports'
import type { UseCreateConnectorModalReturn } from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import useTestConnectionErrorModal from '@connectors/common/useTestConnectionErrorModal/useTestConnectionErrorModal'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import { getIconByType, GetTestConnectionValidationTextByType, DelegateTypes } from '../utils/ConnectorUtils'
import css from './ConnectorsListView.module.scss'

interface ConnectorListViewProps {
  data?: PageConnectorResponse
  reload?: () => Promise<void>
  gotoPage: (pageNumber: number) => void
  openConnectorModal: UseCreateConnectorModalReturn['openConnectorModal']
}

type CustomColumn<T extends object> = Column<T> & {
  reload?: () => Promise<void>
}

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
  return connector?.spec?.credential?.type === DelegateTypes.DELEGATE_IN_CLUSTER
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

const getConnectorDisplaySummary = (connector: ConnectorInfoDTO): JSX.Element | string => {
  switch (connector?.type) {
    case Connectors.KUBERNETES_CLUSTER:
      return getK8DisplaySummary(connector)
    case Connectors.HttpHelmRepo:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.helmRepoUrl))
    case Connectors.Jira:
      return getConnectorDisplaySummaryLabel('UrlLabel', linkRenderer(connector?.spec?.jiraUrl))
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
    default:
      return ''
  }
}

export const RenderColumnConnector: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original
  const tags = data.connector?.tags || {}
  return (
    <Layout.Horizontal spacing="small">
      <Icon name={getIconByType(data.connector?.type)} size={30}></Icon>
      <div className={css.wrapper}>
        <Layout.Horizontal spacing="small">
          <div className={css.name} color={Color.BLACK} title={data.connector?.name}>
            {data.connector?.name}
          </div>
          {tags && Object.keys(tags).length ? <TagsPopover tags={tags} /> : null}
        </Layout.Horizontal>
        <div className={css.identifier} title={data.connector?.identifier}>
          {data.connector?.identifier}
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
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const [testing, setTesting] = useState(false)
  const [lastTestedAt, setLastTestedAt] = useState<number>()
  const [status, setStatus] = useState<ConnectorConnectivityDetails['status']>(data.status?.status)

  const [errorMessage, setErrorMessage] = useState<ConnectorValidationResult>()
  const { getString } = useStrings()

  const [stepDetails, setStepDetails] = useState<StepDetails>({
    step: 1,
    intent: Intent.WARNING,
    status: 'PROCESS' // Replace when enum is added in uikit
  })

  const { openErrorModal } = useTestConnectionErrorModal({})
  const { mutate: reloadTestConnection } = useGetTestConnectionResult({
    identifier: data.connector?.identifier || '',
    queryParams: { accountIdentifier: accountId, orgIdentifier: orgIdentifier, projectIdentifier: projectIdentifier },
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
            setErrorMessage(result.data)
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
          setErrorMessage(err.message)
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
            {data.status?.status || errorMessage ? (
              <Text
                inline
                icon={isStatusSuccess ? 'full-circle' : 'warning-sign'}
                iconProps={{
                  size: isStatusSuccess ? 6 : 12,
                  color: isStatusSuccess ? Color.GREEN_500 : Color.RED_500
                }}
                tooltip={
                  !isStatusSuccess ? (
                    errorMessage?.errorSummary || data.status?.errorSummary ? (
                      <Layout.Vertical font={{ size: 'small' }} spacing="small" padding="small">
                        <Text font={{ size: 'small' }} color={Color.WHITE}>
                          {errorMessage?.errorSummary || data.status?.errorSummary}
                        </Text>
                        {errorMessage?.errors || data.status?.errors ? (
                          <Text
                            color={Color.BLUE_400}
                            onClick={e => {
                              e.stopPropagation()
                              openErrorModal((errorMessage as ConnectorValidationResult) || data.status)
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
                tooltipProps={{ isDark: true, position: 'bottom' }}
              >
                {isStatusSuccess ? getString('active').toLowerCase() : getString('error').toLowerCase()}
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
          font="small"
          className={css.testBtn}
          text={getString('test').toUpperCase()}
          onClick={e => {
            e.stopPropagation()
            setTesting(true)
            setStepDetails({
              step: 1,
              intent: Intent.WARNING,
              status: 'PROCESS' // Replace when enum is added in uikit
            })
          }}
        />
      ) : null}
    </Layout.Horizontal>
  )
}

const RenderColumnMenu: Renderer<CellProps<ConnectorResponse>> = ({ row, column }) => {
  const data = row.original
  const isHarnessManaged = data.harnessManaged
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const { getString } = useStrings()
  const { mutate: deleteConnector } = useDeleteConnector({
    queryParams: { accountIdentifier: accountId, orgIdentifier: orgIdentifier, projectIdentifier: projectIdentifier }
  })

  const [canUpdate, canDelete] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: data.connector?.identifier || ''
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR, PermissionIdentifier.DELETE_CONNECTOR]
    },
    []
  )

  const { openDialog } = useConfirmationDialog({
    contentText: `${getString('connectors.confirmDelete')} ${data.connector?.name}`,
    titleText: getString('connectors.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
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
    e.stopPropagation()
    setMenuOpen(false)
    if (!data?.connector?.identifier) return
    ;(column as any).openConnectorModal(
      true,
      row?.original?.connector?.type as ConnectorInfoDTO['type'],
      row.original.connector
    )
  }

  return (
    !isHarnessManaged && (
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
  const history = useHistory()
  const { getString } = useStrings()
  const listData: ConnectorResponse[] = useMemo(() => data?.content || [], [data?.content])
  const { pathname } = useLocation()
  const columns: CustomColumn<ConnectorResponse>[] = useMemo(
    () => [
      {
        Header: getString('connector').toUpperCase(),
        accessor: row => row.connector?.name,
        id: 'name',
        width: '25%',
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
        Header: getString('lastActivity').toUpperCase(),
        accessor: 'activityDetails',
        id: 'activity',
        width: '15%',
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
        width: '15%',
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
    [props.openConnectorModal, reload]
  )
  return (
    <Table<ConnectorResponse>
      className={css.table}
      columns={columns}
      data={listData}
      onRowClick={connector => {
        history.push(`${pathname}/${connector.connector?.identifier}`)
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
