import React, { useState } from 'react'
import {
  Container,
  ExpandingSearchInput,
  Select,
  Pagination,
  PageError,
  NoDataCard,
  Layout,
  Icon,
  Color
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetTimeSeriesMetricData } from 'services/cv'
import { HealthSourceDropDown } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown'
import { TimelineBar } from '@cv/components/TimelineView/TimelineBar'
import { VerificationType } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown.constants'
import noDataImage from '@cv/assets/noData.svg'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { metricTypeOptions, PAGE_SIZE } from './MetricsAnalysisContainer.constants'
import { generatePointsForTimeSeries } from './MetricsAnalysisContainer.utils'
import { MetricsAnalysisContentProps, MetricsAnalysisProps, MetricTypes } from './MetricsAnalysisContainer.types'
import MetricAnalysisRow from './components/MetricsAnalysisRow/MetricAnalysisRow'
import css from './MetricsAnalysisContainer.module.scss'

const MetricsAnalysisContent: React.FC<MetricsAnalysisContentProps> = ({
  startTime,
  endTime,
  serviceIdentifier,
  environmentIdentifier,
  isAnomalous,
  healthSource,
  filterString
}) => {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()

  const [page, setPage] = useState(0)

  const { data, refetch, loading, error } = useGetTimeSeriesMetricData({
    queryParams: {
      page,
      size: PAGE_SIZE,
      accountId,
      orgIdentifier,
      projectIdentifier,
      serviceIdentifier,
      environmentIdentifier,
      startTime,
      endTime,
      healthSources: healthSource ? [healthSource] : undefined,
      filter: filterString,
      anomalous: isAnomalous
    }
  })

  if (loading) {
    return (
      <Container flex={{ align: 'center-center' }} className={css.loadingContainer}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
  }

  if (!data?.resource?.content?.length) {
    return <NoDataCard message={getString('cv.monitoredServices.noAvailableData')} image={noDataImage} />
  }

  const { pageSize = 0, totalPages = 0, totalItems = 0, pageIndex = 0 } = data.resource

  const timeSeriesInfo = generatePointsForTimeSeries(data.resource.content, startTime, endTime)

  return (
    <div className={css.content}>
      <div>
        {timeSeriesInfo.map(({ groupName, metricName, metricDataList, dataSourceType }) => {
          return (
            metricName &&
            groupName &&
            metricDataList && (
              <MetricAnalysisRow
                key={`$${groupName}-${metricName}`}
                metricName={metricName}
                dataSourceType={dataSourceType}
                startTime={startTime}
                endTime={endTime}
                transactionName={groupName}
                analysisData={metricDataList}
              />
            )
          )
        })}
        <TimelineBar startDate={startTime} className={css.timeline} endDate={endTime} columnWidth={70} />
      </div>
      <Pagination
        pageSize={pageSize}
        pageCount={totalPages}
        itemCount={totalItems}
        pageIndex={pageIndex}
        gotoPage={setPage}
      />
    </div>
  )
}

const MetricsAnalysisContainer: React.FC<MetricsAnalysisProps> = ({
  serviceIdentifier,
  environmentIdentifier,
  startTime,
  endTime
}) => {
  const { getString } = useStrings()

  const [isAnomalous, setIsAnomalous] = useState<boolean>(true)
  const [healthSource, setHealthSource] = useState<string>()
  const [filterString, setFilterString] = useState<string>()

  return (
    <div className={css.container}>
      <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium' }}>
        <Select
          items={metricTypeOptions(getString)}
          className={css.maxDropDownWidth}
          defaultSelectedItem={metricTypeOptions(getString)[1]}
          onChange={item => setIsAnomalous(item.value === MetricTypes.ANOMALOUS)}
        />
        <HealthSourceDropDown
          verificationType={VerificationType.TIME_SERIES}
          onChange={setHealthSource}
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
        />
        <ExpandingSearchInput
          width={250}
          throttle={500}
          onChange={setFilterString}
          placeholder={getString('pipeline.verification.metricViewPlaceholder')}
        />
      </Layout.Horizontal>

      <MetricsAnalysisContent
        serviceIdentifier={serviceIdentifier}
        environmentIdentifier={environmentIdentifier}
        startTime={startTime}
        endTime={endTime}
        isAnomalous={isAnomalous}
        healthSource={healthSource}
        filterString={filterString}
      />
    </div>
  )
}

export default MetricsAnalysisContainer
