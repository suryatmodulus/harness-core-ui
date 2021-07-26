import React, { useState } from 'react'
import { Card, Text, Layout, Container } from '@wings-software/uicore'
import { useHistory, useLocation } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'

import { useStrings } from 'framework/strings'
import { RecommendationItemDto, useRecommendationsQuery, K8sRecommendationFilterDtoInput } from 'services/ce/services'

import { Page } from '@common/exports'
import Table from '@common/components/Table/Table'
import formatCost from '@ce/utils/formatCost'
import RecommendationSavingsCard from '../../components/RecommendationSavingsCard/RecommendationSavingsCard'
import RecommendationFilters from '../../components/RecommendationFilters'

interface RecommendationListProps {
  data: Array<RecommendationItemDto>
  setFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  filters: Record<string, string[]>
  setCostFilters: React.Dispatch<React.SetStateAction<Record<string, number>>>
  costFilters: Record<string, number>
}

const RecommendationsList: React.FC<RecommendationListProps> = ({
  data,
  filters,
  setFilters,
  setCostFilters,
  costFilters
}) => {
  const history = useHistory()
  const { pathname } = useLocation()
  const { getString } = useStrings()

  const NameCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    return <Text>{cell.value}</Text>
  }

  const RecommendationTypeCell: Renderer<CellProps<RecommendationItemDto>> = ({ row }) => {
    const rowData = row.original
    const { resourceType } = rowData
    return (
      <Text>
        {resourceType === 'WORKLOAD' ? getString('ce.recommendation.listPage.recommendationTypes.resizing') : ''}
      </Text>
    )
  }

  const RecommendationDetailsCell: Renderer<CellProps<RecommendationItemDto>> = ({ row }) => {
    const rowData = row.original
    const { resourceType } = rowData
    return (
      <Text>
        {resourceType === 'WORKLOAD' ? getString('ce.recommendation.listPage.recommendationDetails.resize') : ''}
      </Text>
    )
  }

  const ResourceTypeCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    return <Text>{cell.value === 'WORKLOAD' ? getString('pipelineSteps.workload') : ''}</Text>
  }

  const CostCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    return cell.value ? <Text>{formatCost(cell.value)}</Text> : null
  }

  const SavingCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    return cell.value ? (
      <Text color="green500" icon="money-icon" iconProps={{ size: 28 }}>
        {formatCost(cell.value)}
      </Text>
    ) : null
  }

  return data ? (
    <Card elevation={1}>
      <Layout.Vertical spacing="large">
        <Layout.Horizontal>
          <Text style={{ flex: 1 }}>{getString('ce.recommendation.listPage.recommnedationBreakdown')}</Text>
          <RecommendationFilters
            costFilters={costFilters}
            setCostFilters={setCostFilters}
            setFilters={setFilters}
            filters={filters}
          />
        </Layout.Horizontal>

        <Table<RecommendationItemDto>
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
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [costFilters, setCostFilters] = useState<Record<string, number>>({})

  // const [offset, setOffset] = useState<number>(0)
  // const [limit, setLimit] = useState<number>(100)

  const [result] = useRecommendationsQuery({
    variables: {
      filters: {
        ...filters,
        offset: 0,
        limit: 100,
        ...costFilters,
        resourceTypes: ['WORKLOAD']
      } as K8sRecommendationFilterDtoInput
    }
  })

  const { data, fetching } = result

  const { getString } = useStrings()

  const totalMonthlyCost = data?.recommendationStatsV2?.totalMonthlyCost || 0
  const totalSavings = data?.recommendationStatsV2?.totalMonthlySaving || 0

  const recommendationItems = data?.recommendationsV2?.items || []

  return (
    <>
      <Page.Header title="Recommendations"></Page.Header>
      <Page.Body loading={fetching}>
        <Container padding="xlarge" height="100%">
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

              <RecommendationsList
                setFilters={setFilters}
                filters={filters}
                setCostFilters={setCostFilters}
                costFilters={costFilters}
                data={recommendationItems as Array<RecommendationItemDto>}
              />
            </Layout.Vertical>
          ) : null}
        </Container>
      </Page.Body>
    </>
  )
}

export default RecommendationList
