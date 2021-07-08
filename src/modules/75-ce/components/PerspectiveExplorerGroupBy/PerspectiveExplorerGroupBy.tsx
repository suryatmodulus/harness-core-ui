import React from 'react'
import { Layout, Container, Icon } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { CCM_CHART_TYPES } from '@ce/constants'
import {
  useFetchViewFieldsQuery,
  QlceViewFilterWrapperInput,
  useFetchPerspectiveFiltersValueQuery,
  QlceViewFieldInputInput
} from 'services/ce/services'
import GroupByView from './GroupByView'
import css from './PersepectiveExplorerGroupBy.module.scss'

interface ChartTypeSwitcherProps {
  chartType: CCM_CHART_TYPES
  setChartType: React.Dispatch<React.SetStateAction<CCM_CHART_TYPES>>
}

const ChartTypeSwitcher: React.FC<ChartTypeSwitcherProps> = ({ chartType, setChartType }) => {
  return (
    <Layout.Horizontal
      spacing="small"
      style={{
        alignItems: 'center',
        justifyContent: 'flex-end'
      }}
    >
      <Icon
        name="timeline-area-chart"
        onClick={() => {
          setChartType(CCM_CHART_TYPES.AREA)
        }}
        size={20}
        color={chartType === CCM_CHART_TYPES.AREA ? 'primary7' : 'grey400'}
      />
      <Icon
        name="timeline-bar-chart"
        onClick={() => {
          setChartType(CCM_CHART_TYPES.COLUMN)
        }}
        size={18}
        color={chartType === CCM_CHART_TYPES.COLUMN ? 'primary7' : 'grey400'}
      />
    </Layout.Horizontal>
  )
}

interface PerspectiveExplorerGroupByProps {
  setChartType: React.Dispatch<React.SetStateAction<CCM_CHART_TYPES>>
  chartType: CCM_CHART_TYPES
  groupBy: QlceViewFieldInputInput
  setGroupBy: React.Dispatch<React.SetStateAction<QlceViewFieldInputInput>>
}

const PerspectiveExplorerGroupBy: React.FC<PerspectiveExplorerGroupByProps> = ({
  chartType,
  setChartType,
  groupBy,
  setGroupBy
}) => {
  const { perspectiveId } = useParams<{ perspectiveId: string }>()

  const [result] = useFetchViewFieldsQuery({
    variables: {
      filters: [{ viewMetadataFilter: { viewId: perspectiveId, isPreview: false } } as QlceViewFilterWrapperInput]
    }
  })
  const { data } = result

  const [labelResult] = useFetchPerspectiveFiltersValueQuery({
    variables: {
      filters: [
        {
          idFilter: {
            field: {
              fieldId: 'labels.key',
              fieldName: '',
              identifier: 'LABEL'
            },
            operator: 'IN',
            values: []
          }
        } as unknown as QlceViewFilterWrapperInput
      ],
      offset: 0,
      limit: 100
    }
  })

  const { data: labelResData } = labelResult

  const labelData = labelResData?.perspectiveFilters?.values

  const fieldIdentifierData = data?.perspectiveFields?.fieldIdentifierData || []

  return (
    <Container background="white" padding="small" className={css.groupByContainer}>
      <GroupByView
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        labelData={labelData || []}
        fieldIdentifierData={fieldIdentifierData}
      />
      <ChartTypeSwitcher chartType={chartType} setChartType={setChartType} />
    </Container>
  )
}

export default PerspectiveExplorerGroupBy
