import React from 'react'
import { Card, Text, Layout, Container, Color } from '@wings-software/uicore'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'

import { useStrings } from 'framework/strings'
import FETCH_ALL_RECOMMENDATIONS from 'queries/ce/fetch_all_recommendations.gql'
import type { RecommendationsQuery, NodeDto } from 'services/ce/services'

import { useGraphQLQuery } from '@common/hooks/useGraphQLQuery'
import { Page } from '@common/exports'
import Table from '@common/components/Table/Table'
import formatCost from '@ce/utils/formatCost'
import RecommendationSavingsCard from '../../components/RecommendationSavingsCard/RecommendationSavingsCard'

interface RecommendationListProps {
  data: Array<NodeDto>
}

const RecommendationsList: React.FC<RecommendationListProps> = ({ data }) => {
  const history = useHistory()
  const { pathname } = useLocation()
  const { getString } = useStrings()

  const NameCell: Renderer<CellProps<NodeDto>> = cell => {
    return <Text>{cell.value}</Text>
  }

  const RecommendationTypeCell: Renderer<CellProps<NodeDto>> = ({ row }) => {
    const rowData = row.original
    const { resourceType } = rowData
    return (
      <Text>
        {resourceType === 'WORKLOAD' ? getString('ce.recommendation.listPage.recommendationTypes.resizing') : ''}
      </Text>
    )
  }

  const RecommendationDetailsCell: Renderer<CellProps<NodeDto>> = ({ row }) => {
    const rowData = row.original
    const { resourceType } = rowData
    return (
      <Text>
        {resourceType === 'WORKLOAD' ? getString('ce.recommendation.listPage.recommendationDetails.resize') : ''}
      </Text>
    )
  }

  const ResourceTypeCell: Renderer<CellProps<NodeDto>> = cell => {
    return <Text>{cell.value === 'WORKLOAD' ? getString('pipelineSteps.workload') : ''}</Text>
  }

  const CostCell: Renderer<CellProps<NodeDto>> = cell => {
    return <Text>{formatCost(cell.value)}</Text>
  }

  const SavingCell: Renderer<CellProps<NodeDto>> = cell => {
    return (
      <Text color="green500" icon="money-icon" iconProps={{ size: 28 }}>
        {formatCost(cell.value)}
      </Text>
    )
  }

  return data ? (
    <Card elevation={1}>
      <Layout.Vertical spacing="large">
        <Text>{getString('ce.recommendation.listPage.recommnedationBreakdown')}</Text>
        <Table<NodeDto>
          onRowClick={row => {
            history.push(`${pathname}/${row.id}/details`)
          }}
          data={data}
          columns={[
            {
              accessor: 'monthlySaving',
              Header: getString('ce.recommendation.listPage.listTableHeaders.monthlySavings'),
              Cell: SavingCell,
              width: '15%'
            },
            {
              accessor: 'resourceName',
              Header: getString('ce.recommendation.listPage.listTableHeaders.resourceName'),
              Cell: NameCell,
              width: '20%'
            },
            {
              accessor: 'resourceType',
              Header: getString('ce.recommendation.listPage.listTableHeaders.resourceType'),
              Cell: ResourceTypeCell,
              width: '15%'
            },
            {
              accessor: 'monthlyCost',
              Header: getString('ce.recommendation.listPage.listTableHeaders.monthlyCost'),
              Cell: CostCell,
              width: '15%'
            },
            {
              Header: getString('ce.recommendation.listPage.listTableHeaders.recommendationType'),
              Cell: RecommendationTypeCell,
              width: '15%'
            },
            {
              Header: getString('ce.recommendation.listPage.listTableHeaders.details'),
              Cell: RecommendationDetailsCell,
              width: '15%'
            }
          ]}
        ></Table>
      </Layout.Vertical>
    </Card>
  ) : null
}

const RecommendationList: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>()

  const { data, initLoading } = useGraphQLQuery<{ data: RecommendationsQuery }>({
    path: `/ccm/api/graphql?accountIdentifier=${accountId}`,
    body: { query: FETCH_ALL_RECOMMENDATIONS }
  })

  const { getString } = useStrings()

  const totalMonthlyCost = data?.data.recommendations?.totalMonthlyCost || 0
  const totalSavings = data?.data.recommendations?.totalMonthlySaving || 0

  const recommendationItems = data?.data.recommendations?.items || []

  return (
    <>
      <Page.Header title="Recommendations"></Page.Header>
      <Page.Body loading={initLoading}>
        <Container padding="xlarge" background={Color.WHITE} height="100%">
          {recommendationItems.length ? (
            <Layout.Vertical spacing="large">
              <Layout.Horizontal spacing="medium">
                <RecommendationSavingsCard
                  title={getString('ce.recommendation.listPage.monthlySavingsText')}
                  amount={formatCost(totalMonthlyCost)}
                  iconName="money-icon"
                />
                <RecommendationSavingsCard
                  title={getString('ce.recommendation.listPage.monthlyForcastedCostText')}
                  amount={formatCost(totalSavings)}
                  subTitle={getString('ce.recommendation.listPage.forecatedCostSubText')}
                />
              </Layout.Horizontal>

              <RecommendationsList data={recommendationItems as Array<NodeDto>} />
            </Layout.Vertical>
          ) : null}
        </Container>
      </Page.Body>
    </>
  )
}

export default RecommendationList
