import React from 'react'
import { Card, Text, Layout, Container, Color } from '@wings-software/uicore'
import { useHistory, useLocation } from 'react-router-dom'

import { Page } from '@common/exports'
import Table from '@common/components/Table/Table'
import formatCost from '@ce/utils/formatCost'
import RecommendationSavingsCard from '../../components/RecommendationSavingsCard/RecommendationSavingsCard'

import Data from './MockData.json'

const RecommendationsList = ({ data }) => {
  const history = useHistory()
  const { pathname } = useLocation()

  function NameCell(tableProps): JSX.Element {
    return <Text>{tableProps.value}</Text>
  }

  const CostCell: (tableProps: any) => JSX.Element = tableProps => {
    return <Text>{formatCost(tableProps.value)}</Text>
  }

  return (
    <Card>
      <Layout.Vertical spacing="large">
        <Text>Recommendations Breakdown</Text>
        <Table
          onRowClick={row => {
            history.push(`${pathname}/${row.workloadName}/details`)
          }}
          data={data}
          columns={[
            {
              accessor: 'resourceType',
              Header: 'Resource Type'.toUpperCase(),
              Cell: NameCell
            },
            {
              accessor: 'workloadName',
              Header: 'Resource Name'.toUpperCase(),
              Cell: NameCell
            },
            {
              accessor: 'totalCost',
              Header: 'Total Cost'.toUpperCase(),
              Cell: CostCell
            },
            {
              accessor: 'recommendationType',
              Header: 'Recommendation Type'.toUpperCase(),
              Cell: NameCell,
              width: '20%'
            },
            {
              accessor: 'estimatedSavings',
              Header: 'Savings'.toUpperCase(),
              Cell: CostCell
            },
            {
              accessor: 'details',
              Header: 'Details'.toUpperCase(),
              Cell: NameCell
            }
          ]}
        ></Table>
      </Layout.Vertical>
    </Card>
  )
}

const RecommendationList: React.FC = () => {
  const { k8sWorkloadRecommendations } = Data

  const totalSavings = k8sWorkloadRecommendations.nodes.reduce(
    (acc, currentNode) => acc + currentNode.estimatedSavings,
    0
  )

  return (
    <>
      <Page.Header title="Recommendations"></Page.Header>
      <Page.Body>
        <Container padding="xlarge" background={Color.WHITE} height="100%">
          <Layout.Vertical spacing="large">
            <Layout.Horizontal spacing="medium">
              <RecommendationSavingsCard
                title="Potential Savings"
                amount={formatCost(totalSavings)}
                iconName="money-icon"
                subTitle="Up from previous month"
              />
              <RecommendationSavingsCard
                title="Total Resource Cost"
                amount={formatCost(totalSavings)}
                subTitle="Up from previous month"
              />
            </Layout.Horizontal>

            <RecommendationsList data={k8sWorkloadRecommendations.nodes} />
          </Layout.Vertical>
        </Container>
      </Page.Body>
    </>
  )
}

export default RecommendationList
