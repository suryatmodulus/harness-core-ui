import React from 'react'
import type { CellProps, Column } from 'react-table'
import { Text, Table, Icon, Radio } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { ASGMinimal } from 'services/lw'

const NameAndIDCell = (cellProps: CellProps<ASGMinimal>): JSX.Element => (
  <Text>
    {cellProps.value} {cellProps.row.original.id}
  </Text>
)

const LaunchTemplateCell = (cellProps: CellProps<ASGMinimal>): JSX.Element => {
  const meta = cellProps.value
  if (!meta) {
    return <></>
  }
  const template = meta.launch_template // eslint-disable-line
  if (!template) {
    return <></>
  }
  if (template.name) {
    return <Text>{template.name}</Text>
  }
  if (template.id) {
    return <Text>{template.id}</Text>
  }
  return <></>
}
const ValueCell = (cellProps: CellProps<ASGMinimal>): JSX.Element => <Text>{cellProps.value}</Text>

const InstancesCell = (cellProps: CellProps<ASGMinimal>): JSX.Element => <Text>{cellProps.row.original.desired}</Text>

const ZoneCell = (cellProps: CellProps<ASGMinimal>): JSX.Element => {
  const zones = cellProps.value
  if (!zones) {
    return <></>
  }
  return <Text>{zones.join()}</Text>
}

const Loading = (): JSX.Element => (
  <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center', marginTop: '10px' }} />
)

const headerDecorator = (headerName: string): string => headerName.toUpperCase()

interface ASGListProps {
  items?: ASGMinimal[]
  loading?: boolean
  selected?: ASGMinimal
  select?: (item: ASGMinimal) => void
}

const ASGList: React.FC<ASGListProps> = props => {
  const { getString } = useStrings()
  const displayColumns: Column<ASGMinimal>[] = [
    {
      accessor: 'name',
      Header: headerDecorator(getString('ce.co.autoStoppingRule.asg.columns.nameAndId')),
      Cell: NameAndIDCell,
      width: '16.5%'
    },
    {
      accessor: 'meta',
      Header: headerDecorator(getString('ce.co.autoStoppingRule.asg.columns.launchTemplate')),
      Cell: LaunchTemplateCell
    },
    {
      Header: headerDecorator(getString('ce.co.autoStoppingRule.asg.columns.instance')),
      Cell: InstancesCell
    },
    {
      accessor: 'status',
      Header: headerDecorator(getString('ce.co.autoStoppingRule.asg.columns.status')),
      Cell: ValueCell
    },
    {
      accessor: 'desired',
      Header: headerDecorator(getString('ce.co.autoStoppingRule.asg.columns.desiredCapacity')),
      Cell: ValueCell
    },
    {
      accessor: 'min',
      Header: headerDecorator(getString('ce.co.autoStoppingRule.asg.columns.min')),
      Cell: ValueCell
    },
    {
      accessor: 'max',
      Header: headerDecorator(getString('ce.co.autoStoppingRule.asg.columns.max')),
      Cell: ValueCell
    },
    {
      accessor: 'availability_zones',
      Header: headerDecorator(getString('ce.co.autoStoppingRule.asg.columns.availabilityZones')),
      Cell: ZoneCell
    }
  ]

  const { items, selected, select, loading } = props
  if (select && loading) {
    return <Loading />
  }
  if (!items || items.length == 0) {
    if (select) {
      return <Text>{getString('ce.co.autoStoppingRule.asg.noASGs')}</Text>
    }
    return <></>
  }
  let cols: Column<ASGMinimal>[] = [...displayColumns]
  if (select) {
    const SelectableCell = (cellProps: CellProps<ASGMinimal>): JSX.Element => (
      <Radio
        checked={selected && cellProps.row.original.id === selected.id}
        onClick={() => select(cellProps.row.original)}
      />
    )
    const selectableColumn: Column<ASGMinimal> = {
      Header: '',
      id: 'selected',
      Cell: SelectableCell
    }
    cols = [selectableColumn, ...displayColumns]
  }
  return <Table<ASGMinimal> bpTableProps={{}} data={items} columns={cols}></Table>
}

export default ASGList
