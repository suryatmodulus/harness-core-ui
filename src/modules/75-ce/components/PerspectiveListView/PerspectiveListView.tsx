import React, { useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import moment from 'moment'
import type { CellProps, Renderer, Column } from 'react-table'
import { Icon, Text, Layout, Button, Popover, Container } from '@wings-software/uicore'
import { Classes, Menu, Position } from '@blueprintjs/core'
import Table from '@common/components/Table/Table'
import routes from '@common/RouteDefinitions'
import { QlceView, Maybe, ViewTimeRangeType } from 'services/ce/services'
import { SOURCE_ICON_MAPPING } from '@ce/utils/perspectiveUtils'
import formatCost from '@ce/utils/formatCost'
import { useStrings } from 'framework/strings'

interface PerspectiveListViewProps {
  pespectiveData: Maybe<QlceView>[]
  navigateToPerspectiveDetailsPage: (perspectiveId: string) => void
}

const PerspectiveListView: React.FC<PerspectiveListViewProps> = ({
  pespectiveData,
  navigateToPerspectiveDetailsPage
}) => {
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { getString } = useStrings()

  const dateLabelToDisplayText: Record<string, string> = {
    [ViewTimeRangeType.Last_7]: getString('ce.perspectives.timeRangeConstants.last7Days'),
    [ViewTimeRangeType.Last_30]: getString('ce.perspectives.timeRangeConstants.last30Days'),
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
    return !isNaN(cell.value) ? <Text>{formatCost(cell.value)}</Text> : null
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

  const RenderColumnMenu: Renderer<CellProps<QlceView>> = ({ row }) => {
    const [menuOpen, setMenuOpen] = useState(false)

    const onActionButtonsClick: (e: React.MouseEvent<Element, MouseEvent>) => void = e => {
      e.stopPropagation()
    }

    return (
      <Layout.Horizontal>
        <Popover
          isOpen={menuOpen}
          onInteraction={nextOpenState => {
            setMenuOpen(nextOpenState)
          }}
          className={Classes.DARK}
          position={Position.BOTTOM_RIGHT}
        >
          <Button
            minimal
            icon="Options"
            onClick={e => {
              e.stopPropagation()
              setMenuOpen(true)
            }}
          />
          <Container>
            <Menu>
              <Menu.Item
                onClick={e => {
                  e.stopPropagation()
                  row.original.id && onEditClick(row.original.id)
                }}
                icon="edit"
                text="Edit"
              />
              <Menu.Item onClick={onActionButtonsClick} icon="duplicate" text="Clone" />
              <Menu.Item onClick={onActionButtonsClick} icon="trash" text="Delete" />
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
        width: '30%'
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
        row.id && navigateToPerspectiveDetailsPage(row.id)
      }}
      columns={columns}
      data={pespectiveData}
    />
  )
}

export default PerspectiveListView
