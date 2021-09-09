import React, { useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import moment from 'moment'
import type { CellProps, Renderer, Column } from 'react-table'
import { Icon, Text, Layout, Button, Popover, Container, IconName } from '@wings-software/uicore'
import { Menu, Position } from '@blueprintjs/core'
import Table from '@common/components/Table/Table'
import routes from '@common/RouteDefinitions'
import { QlceView, ViewTimeRangeType, ViewState, ViewType } from 'services/ce/services'
import { SOURCE_ICON_MAPPING } from '@ce/utils/perspectiveUtils'
import formatCost from '@ce/utils/formatCost'
import { useStrings } from 'framework/strings'
import css from './PerspectiveListView.module.scss'

interface PerspectiveListViewProps {
  pespectiveData: QlceView[]
  navigateToPerspectiveDetailsPage: (perspectiveId: string, viewState: ViewState) => void
  deletePerpsective: (perspectiveId: string) => void
  clonePerspective: (values: QlceView | Record<string, string>, isClone: boolean) => void
}

const PerspectiveListView: React.FC<PerspectiveListViewProps> = ({
  pespectiveData,
  navigateToPerspectiveDetailsPage,
  deletePerpsective,
  clonePerspective
}) => {
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { getString } = useStrings()

  const dateLabelToDisplayText: Record<string, string> = {
    [ViewTimeRangeType.Last_7]: getString('ce.perspectives.timeRangeConstants.last7Days'),
    [ViewTimeRangeType.Last_30]: getString('projectsOrgs.landingDashboard.last30Days'),
    [ViewTimeRangeType.LastMonth]: getString('ce.perspectives.timeRangeConstants.lastMonth')
  }

  const TimePeriodCell: Renderer<CellProps<QlceView>> = cell => {
    return cell.value ? (
      <Text>{dateLabelToDisplayText[cell.value] || getString('common.repo_provider.customLabel')}</Text>
    ) : null
  }

  const DataSourcesCell: Renderer<CellProps<QlceView>> = cell => {
    const dataSources = (cell.value || []) as string[]
    return (
      <Layout.Horizontal
        spacing="small"
        style={{
          alignItems: 'center'
        }}
      >
        {dataSources.map(source => (
          <Icon key={source} size={22} name={SOURCE_ICON_MAPPING[source]} />
        ))}
      </Layout.Horizontal>
    )
  }

  const CostCell: Renderer<CellProps<QlceView>> = cell => {
    return !isNaN(cell.value) ? (
      <Text font={{ weight: 'semi-bold' }} color="grey800">
        {formatCost(cell.value)}
      </Text>
    ) : null
  }

  const LastEditedCell: Renderer<CellProps<QlceView>> = cell => {
    return cell.value ? moment(cell.value).format('LLL') : null
  }

  const onEditClick: (perspectiveId: string) => void = perspectiveId => {
    history.push(
      routes.toCECreatePerspective({
        accountId: accountId,
        perspectiveId: perspectiveId
      })
    )
  }

  const NameCell: Renderer<CellProps<QlceView>> = cell => {
    const viewState = (cell as any).row?.original?.viewState
    const viewType = (cell as any).row?.original?.viewType
    let iconName: IconName | undefined
    if (viewState === ViewState.Draft) {
      iconName = 'deployment-incomplete-new'
    }
    if (viewType === ViewType.Default) {
      iconName = 'harness'
    }
    return cell.value ? (
      <Container className={css.nameContainer}>
        <Text icon={iconName} color="grey800">
          {cell.value}
        </Text>
        {viewType === ViewType.Default && <Container className={css.sampleRibbon}></Container>}
      </Container>
    ) : null
  }

  const RenderColumnMenu: Renderer<CellProps<QlceView>> = ({ row }) => {
    const [menuOpen, setMenuOpen] = useState(false)

    const viewType = row?.original?.viewType
    const disableActions = viewType === ViewType.Default ? true : false

    const editClick: () => void = () => {
      row.original.id && onEditClick(row.original.id)
    }

    const onDeleteClick: () => void = () => {
      row.original.id && deletePerpsective(row.original.id)
    }

    const onCloneClick: () => void = () => {
      clonePerspective(row.original, true)
    }

    return (
      <Layout.Horizontal
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          position={Position.BOTTOM_RIGHT}
        >
          <Button
            minimal
            icon="Options"
            onClick={() => {
              setMenuOpen(true)
            }}
          />
          <Container>
            <Menu>
              <Menu.Item disabled={disableActions} onClick={editClick} icon="edit" text="Edit" />
              <Menu.Item onClick={onCloneClick} icon="duplicate" text="Clone" />
              <Menu.Item disabled={disableActions} onClick={onDeleteClick} icon="trash" text="Delete" />
            </Menu>
          </Container>
        </Popover>
      </Layout.Horizontal>
    )
  }

  const columns: Column<QlceView>[] = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        width: '30%',
        Cell: NameCell
      },
      {
        Header: 'Data Sources',
        accessor: 'dataSources',
        width: '15%',
        Cell: DataSourcesCell
      },
      {
        Header: 'Total Cost',
        accessor: 'totalCost',
        width: '20%',
        Cell: CostCell
      },
      {
        Header: 'Time Period',
        accessor: 'timeRange',
        width: '15%',
        Cell: TimePeriodCell
      },
      { Header: 'Last Edit', accessor: 'lastUpdatedAt', width: '15%', Cell: LastEditedCell },
      {
        Header: '',
        id: 'menu',
        width: '5%',
        Cell: RenderColumnMenu,
        onEditClick: onEditClick
      }
    ],
    []
  )
  return (
    <Table<QlceView>
      onRowClick={row => {
        row.id && row.viewState && navigateToPerspectiveDetailsPage(row.id, row.viewState)
      }}
      columns={columns}
      data={pespectiveData}
    />
  )
}

export default PerspectiveListView
