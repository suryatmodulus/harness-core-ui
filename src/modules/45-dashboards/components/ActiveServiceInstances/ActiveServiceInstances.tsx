import React, { useMemo } from 'react'
import { Tag } from '@blueprintjs/core'

import { Layout, Container, Text, WeightedStack } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { Column, Renderer, CellProps } from 'react-table'
import Table from '@common/components/Table/Table'

import mockData from './mocks/service-details.json'

interface ActiveServiceInstancesProps {
  id?: string
}

interface InstanceInterface {
  id: string
  name: string
}

interface InstanceDetailsInterface {
  environmentName: string
  buildName: string
  instances: InstanceInterface[]
}

const EnvironmentColumnSecret: Renderer<CellProps<InstanceDetailsInterface>> = ({ row }) => {
  return <Tag key={row.original.environmentName}>{row.original.environmentName}</Tag>
}

const BuildNameColumnSecret: Renderer<CellProps<InstanceDetailsInterface>> = ({ row }) => {
  return <p>{row.original.buildName}</p>
}

const InstanceCountColumnSecret: Renderer<CellProps<InstanceDetailsInterface>> = ({ row }) => {
  return <p>{row.original.instances.length}</p>
}

const InstanceDetailsColumnSecret: Renderer<CellProps<InstanceDetailsInterface>> = ({ row }) => {
  return row.original.instances.map(instance => <p>{instance.name}</p>)
}

const ActiveServiceInstances: React.FC<ActiveServiceInstancesProps> = () => {
  const { getString } = useStrings()
  const columns: Column<InstanceDetailsInterface>[] = useMemo(
    () => [
      {
        Header: getString('environment'),
        accessor: row => row.environmentName,
        id: 'environmentName',
        width: '30%',
        Cell: EnvironmentColumnSecret
      },
      {
        Header: getString('serviceDashboard.buildName'),
        accessor: row => row.buildName,
        id: 'buildName',
        width: '30%',
        Cell: BuildNameColumnSecret
      },
      {
        Header: '',
        accessor: row => row.instances,
        id: 'instanceCount',
        width: '10%',
        Cell: InstanceCountColumnSecret
      },
      {
        Header: getString('pipelineSteps.instanceLabel'),
        accessor: row => row.instances,
        id: 'instanceDetails',
        width: '30%',
        Cell: InstanceDetailsColumnSecret
      }
    ],
    []
  )
  return (
    <Container border={{ color: 'dark' }} style={{ padding: 'large', margin: 'large' }}>
      <Layout.Vertical spacing="medium">
        <Layout.Vertical spacing="medium">
          <Text font="medium">{getString('serviceDashboard.activeServiceInstancesLabel')}</Text>
          <Layout.Horizontal spacing="medium" flex>
            <Text font="large">{mockData.details.total}</Text>
            <WeightedStack
              data={[
                { label: getString('nonProduction'), value: 12, color: 'blue500' },
                { label: getString('production'), value: 2, color: 'blue450' }
              ]}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
        <Table<InstanceDetailsInterface> columns={columns} data={mockData.details.data} />
      </Layout.Vertical>
    </Container>
  )
}

export default ActiveServiceInstances
