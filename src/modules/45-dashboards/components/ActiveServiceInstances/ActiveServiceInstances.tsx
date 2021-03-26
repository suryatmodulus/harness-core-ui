import React, { useMemo } from 'react'
import { Tag } from '@blueprintjs/core'

import { Layout, Container, Text, WeightedStack, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { Column, Renderer, CellProps } from 'react-table'
import Table from '@common/components/Table/Table'

import mockData from './mocks/service-details.json'

import css from './ActiveServiceInstances.module.scss'

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
  return (
    <Container padding="small">
      <Tag key={row.original.environmentName}>{row.original.environmentName}</Tag>
    </Container>
  )
}

const BuildNameColumnSecret: Renderer<CellProps<InstanceDetailsInterface>> = ({ row }) => {
  return <Container padding="small">{row.original.buildName}</Container>
}

const InstanceCountColumnSecret: Renderer<CellProps<InstanceDetailsInterface>> = ({ row }) => {
  return <Container padding="small">{row.original.instances.length}</Container>
}

const InstanceDetailsColumnSecret: Renderer<CellProps<InstanceDetailsInterface>> = ({ row }) => {
  return (
    <Container className={css.instances}>
      {row.original.instances.map(_instance => (
        <Container padding="xsmall" className={css.hexagon}></Container>
      ))}
    </Container>
  )
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
        Cell: EnvironmentColumnSecret,
        disableSortBy: true
      },
      {
        Header: getString('serviceDashboard.buildName'),
        accessor: row => row.buildName,
        id: 'buildName',
        width: '30%',
        Cell: BuildNameColumnSecret,
        disableSortBy: true
      },
      {
        Header: '',
        accessor: row => row.instances,
        id: 'instanceCount',
        width: '10%',
        Cell: InstanceCountColumnSecret,
        disableSortBy: true
      },
      {
        Header: getString('pipelineSteps.instanceLabel'),
        accessor: row => row.instances,
        id: 'instanceDetails',
        width: '30%',
        Cell: InstanceDetailsColumnSecret,
        disableSortBy: true
      }
    ],
    []
  )
  return (
    <Container border={{ color: Color.GREY_300 }} style={{ padding: 'large', margin: 'large' }}>
      <Layout.Vertical spacing="medium" padding="xlarge">
        <Layout.Vertical spacing="medium" border={{ bottom: true, color: Color.GREY_300 }}>
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
        <Table<InstanceDetailsInterface>
          columns={columns}
          data={mockData.details.data}
          className={css.instanceDetails}
        />
      </Layout.Vertical>
    </Container>
  )
}

export default ActiveServiceInstances
