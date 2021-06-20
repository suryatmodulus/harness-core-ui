import React, { useMemo } from 'react'
import type { CellProps, Renderer } from 'react-table'
import type { GetDataError } from 'restful-react'
import ReactTimeago from 'react-timeago'
import { Tooltip } from '@blueprintjs/core'
import { Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import DelegateEmptyState from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/icons/DelegateEmptyState.svg'
import Table from '@common/components/Table/Table'
import type { TableProps } from '@common/components/Table/Table'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import { useStrings } from 'framework/strings'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type {
  DelegateInnerCustom,
  DelegateGroupDetailsCustom
} from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector'
import { useTroubleshootModal } from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/TroubleshootModal'
import { PageError } from '@common/components/Page/PageError'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import css from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector.module.scss'

export interface DelegateSelectorTableProps {
  data: (DelegateGroupDetailsCustom | DelegateInnerCustom)[] | null
  loading: boolean
  error: GetDataError<unknown> | null
  refetch: () => Promise<void>
  showMatchesSelectorColumn?: boolean
}

const RenderDelegateIcon: Renderer<CellProps<DelegateGroupDetailsCustom | DelegateInnerCustom>> = ({ row }) => {
  const { checked } = row.original
  return checked ? (
    <Container flex={{ justifyContent: 'center' }}>
      <Icon name={'tick'} color={Color.GREEN_700} size={24} />
    </Container>
  ) : (
    <></>
  )
}

const RenderDelegateName: Renderer<CellProps<DelegateGroupDetailsCustom | DelegateInnerCustom>> = ({ row }) => {
  const {
    delegateType = '',
    groupHostName,
    groupName,
    delegateInstanceDetails,
    sizeDetails
  } = row.original as DelegateGroupDetailsCustom
  const { delegateName } = row.original as DelegateInnerCustom
  const { name } = row.values
  const { getString } = useStrings()
  const { NG_CG_TASK_ASSIGNMENT_ISOLATION } = useFeatureFlags()
  let nameText = ''
  let subText = ''
  if (NG_CG_TASK_ASSIGNMENT_ISOLATION) {
    const groupNameSubText = getString('delegates.delegateInstances', {
      current: delegateInstanceDetails?.length,
      total: sizeDetails?.replicas
    })
    nameText = `${groupName} ${groupNameSubText}`
    subText = groupHostName || ''
  } else {
    nameText = delegateName || name
    subText = name
  }
  return (
    <Layout.Horizontal>
      <Icon name={delegateTypeToIcon(delegateType)} size={24} />
      <Layout.Vertical padding={{ left: 'small' }} width="85%" className={css.delegateNameContainer}>
        <Tooltip position="top" content={nameText}>
          <Text color={Color.BLACK} className={css.delegateName}>
            {nameText}
          </Text>
        </Tooltip>
        <Tooltip position="top" content={subText}>
          <Text color={Color.GREY_400} className={css.delegateName}>
            {subText}
          </Text>
        </Tooltip>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const RenderHeartbeat: Renderer<CellProps<DelegateGroupDetailsCustom | DelegateInnerCustom>> = ({ row, column }) => {
  const { activelyConnected, lastHeartBeat } = row.original
  const { getString } = useStrings()
  const { NG_CG_TASK_ASSIGNMENT_ISOLATION } = useFeatureFlags()
  const { onClick } = (column as unknown) as { onClick: () => void }
  if (!lastHeartBeat) {
    return (
      <Layout.Vertical>
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} margin={{ bottom: 'xsmall' }}>
          <Icon name="spinner" size={10} margin={{ right: 'xsmall' }} />
          <Text font={{ size: 'small', weight: 'bold' }}>{getString('connectors.delegate.waitingForConnection')}</Text>
        </Layout.Horizontal>
        <Text
          font={{ size: 'xsmall', weight: 'semi-bold' }}
          color={Color.PRIMARY_6}
          className={css.troubleshoot}
          onClick={() => onClick?.()}
        >{`(${getString('delegate.delegateNotInstalled.tabs.commonProblems.troubleshoot')})`}</Text>
      </Layout.Vertical>
    )
  }
  if (NG_CG_TASK_ASSIGNMENT_ISOLATION) {
    const color: Color = activelyConnected ? Color.GREEN_600 : Color.GREY_400
    return (
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Icon name="full-circle" size={10} color={color} margin={{ right: 'small' }} />
        <ReactTimeago date={lastHeartBeat} live />
      </Layout.Horizontal>
    )
  } else {
    const { status, connections = [] } = row.original as DelegateInnerCustom
    const isApprovalRequired = status === 'WAITING_FOR_APPROVAL'
    const isConnected = connections?.length > 0
    return (
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Icon
          name="full-circle"
          size={10}
          color={isApprovalRequired ? Color.YELLOW_500 : isConnected ? Color.GREEN_600 : Color.GREY_400}
          margin={{ right: 'small' }}
        />
        <ReactTimeago date={lastHeartBeat} live />
      </Layout.Horizontal>
    )
  }
}

const RenderTags: Renderer<CellProps<DelegateGroupDetailsCustom | DelegateInnerCustom>> = ({ row }) => {
  let delegateTags = []
  const { NG_CG_TASK_ASSIGNMENT_ISOLATION } = useFeatureFlags()
  if (NG_CG_TASK_ASSIGNMENT_ISOLATION) {
    delegateTags = Object.keys((row.original as DelegateGroupDetailsCustom).groupImplicitSelectors || {})
  } else {
    const { tags, implicitSelectors } = row.original as DelegateInnerCustom
    delegateTags = [...(tags || []), ...Object.keys(implicitSelectors || {})]
  }
  return <TagsViewer tags={delegateTags} />
}

export const DelegateSelectorTable: React.FC<DelegateSelectorTableProps> = props => {
  const { data, error, loading, refetch, showMatchesSelectorColumn = true } = props
  const { getString } = useStrings()
  const { showModal } = useTroubleshootModal()
  const columns: TableProps<DelegateGroupDetailsCustom | DelegateInnerCustom>['columns'] = useMemo(
    () => {
      const cols = [
        {
          Header: getString('delegate.DelegateName').toLocaleUpperCase(),
          id: 'name',
          width: '35%',
          accessor: (row: DelegateInnerCustom) => row.delegateName || row.hostName,
          Cell: RenderDelegateName
        },
        {
          Header: getString('connectors.delegate.hearbeat').toLocaleUpperCase(),
          id: 'connectivity',
          width: '20%',
          Cell: RenderHeartbeat,
          onClick: showModal
        },
        {
          Header: getString('tagsLabel').toLocaleUpperCase(),
          id: 'tags',
          width: showMatchesSelectorColumn ? '35%' : '45%',
          Cell: RenderTags
        }
      ]
      if (showMatchesSelectorColumn) {
        cols.push({
          Header: getString('connectors.delegate.matchesSelectors').toLocaleUpperCase(),
          id: 'delegateIcon',
          width: '10%',
          Cell: RenderDelegateIcon
        })
      }
      return cols
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, showMatchesSelectorColumn]
  )
  const getContent = (): React.ReactElement => {
    if (data && data.length) {
      return <Table columns={columns} data={data} className={css.table} />
    }
    if (!data && loading) {
      return <ContainerSpinner data-name="delegateTableLoadingState" />
    }
    if (error) {
      return <PageError message={error?.message} onClick={() => refetch()} data-name="delegateTableErrorState" />
    }
    return (
      <Layout.Vertical height="100%" flex={{ align: 'center-center' }} data-name="delegateTableEmptyState">
        <img width="100%" height="100%" src={DelegateEmptyState} style={{ alignSelf: 'center' }} />
        <Text>{getString('connectors.delegate.noDelegates')}</Text>
      </Layout.Vertical>
    )
  }
  return (
    <Container
      padding={{ left: 'small', right: 'small', top: 'small' }}
      background={Color.WHITE}
      height={265}
      data-name="delegateContentContainer"
    >
      {getContent()}
    </Container>
  )
}
