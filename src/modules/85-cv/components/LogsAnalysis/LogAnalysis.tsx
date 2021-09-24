import React, { useCallback } from 'react'
import { Color, Container, Icon, Pagination, Select, Text } from '@wings-software/uicore'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { useStrings } from 'framework/strings'
import { HealthSourceDropDown } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown'
import noDataImage from '@cv/assets/noData.svg'
import { LogAnalysisRow } from './components/LogAnalysisRow/LogAnalysisRow'
import { getClusterTypes } from './LogAnalysis.utils'
import type { LogAnalysisProps } from './LogAnalysis.types'
import ClusterChart from './components/ClusterChart/ClusterChart'
import { VerificationType } from '../HealthSourceDropDown/HealthSourceDropDown.constants'
import styles from './LogAnalysis.module.scss'

export default function LogAnalysis(props: LogAnalysisProps): JSX.Element {
  const {
    data,
    logAnalysisTableData,
    clusterChartData,
    goToPage,
    logsLoading,
    clusterChartLoading,
    setSelectedClusterType,
    serviceIdentifier,
    environmentIdentifier,
    onChangeHealthSource,
    showClusterChart
  } = props
  const { getString } = useStrings()

  const renderLogsData = useCallback(() => {
    if (logsLoading) {
      return (
        <Container>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (!logAnalysisTableData?.length) {
      return (
        <NoDataCard
          className={styles.noData}
          containerClassName={styles.noDataContainer}
          message={getString('cv.monitoredServices.noAvailableData')}
          image={noDataImage}
        />
      )
    } else {
      return <LogAnalysisRow data={logAnalysisTableData} />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsLoading, logAnalysisTableData?.length])

  const renderClusterChart = useCallback(() => {
    if (clusterChartLoading) {
      return (
        <Container>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (!clusterChartData?.resource?.length) {
      return (
        <Container>
          <NoDataCard
            className={styles.noData}
            containerClassName={styles.noDataContainer}
            message={<Text font={{ size: 'small' }}>{getString('cv.monitoredServices.noAvailableData')}</Text>}
            image={noDataImage}
            imageClassName={styles.logClusterNoDataImage}
          />
        </Container>
      )
    } else {
      return <ClusterChart data={clusterChartData?.resource || []} />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterChartData?.resource?.length, clusterChartLoading])

  return (
    <Container className={styles.logsContainer}>
      <Container className={styles.filters}>
        <Select
          items={getClusterTypes(getString)}
          defaultSelectedItem={getClusterTypes(getString)[0]}
          className={styles.logsAnalysisFilters}
          inputProps={{ placeholder: getString('pipeline.verification.logs.filterByClusterType') }}
          onChange={setSelectedClusterType}
        />
        {serviceIdentifier && environmentIdentifier ? (
          <HealthSourceDropDown
            onChange={onChangeHealthSource}
            className={styles.logsAnalysisFilters}
            serviceIdentifier={serviceIdentifier}
            environmentIdentifier={environmentIdentifier}
            verificationType={VerificationType.LOG}
          />
        ) : null}
      </Container>
      {showClusterChart ? (
        <Container className={styles.clusterChartContainer}>
          <Text font={{ weight: 'bold' }}>{getString('pipeline.verification.logs.logCluster')}</Text>
          <Container className={styles.clusterChart}>{renderClusterChart()}</Container>
        </Container>
      ) : null}
      <Container className={styles.logsData}>{renderLogsData()}</Container>
      {!!data?.resource?.totalPages && (
        <Pagination
          pageSize={data.resource.pageSize as number}
          pageCount={data.resource.totalPages}
          itemCount={data.resource.totalItems as number}
          pageIndex={data.resource.pageIndex}
          gotoPage={goToPage}
        />
      )}
    </Container>
  )
}
