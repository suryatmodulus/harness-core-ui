import React, { useCallback } from 'react'
import { Color, Container, Icon, Pagination, Select, Text } from '@wings-software/uicore'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { useStrings } from 'framework/strings'
import { HealthSourceDropDown } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown'
import { LogAnalysisRow } from './components/LogAnalysisRow/LogAnalysisRow'
import { getClusterTypes } from './LogAnalysis.utils'
import type { LogAnalysisProps } from './LogAnalysis.types'
import ClusterChart from './components/ClusterChart/ClusterChart'
import styles from './LogAnalysis.module.scss'

export default function LogAnalysis(props: LogAnalysisProps): JSX.Element {
  const {
    data,
    logAnalysisTableData,
    clusterChartData,
    goToPage,
    logsLoading,
    clusterChartLoading,
    selectedClusterType,
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
        <Container className={styles.loading}>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (!logAnalysisTableData?.length) {
      return (
        <Container className={styles.noData}>
          <NoDataCard message={getString('pipeline.verification.logs.noAnalysis')} icon="warning-sign" />
        </Container>
      )
    } else {
      return <LogAnalysisRow className={styles.logAnalysisRow} data={logAnalysisTableData} />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsLoading, logAnalysisTableData?.length])

  const renderChartCluster = useCallback(() => {
    if (clusterChartLoading) {
      return (
        <Container className={styles.loading}>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (!clusterChartData?.resource?.length) {
      return (
        <Container className={styles.noData}>
          <NoDataCard message={getString('pipeline.verification.logs.noAnalysis')} icon="warning-sign" />
        </Container>
      )
    } else {
      return <ClusterChart data={clusterChartData?.resource || []} />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterChartData?.resource?.length, clusterChartLoading])

  return (
    <Container className={styles.logsTab}>
      {showClusterChart ? (
        <Container className={styles.panel}>
          <Text font={{ weight: 'bold' }}>{getString('pipeline.verification.logs.logCluster')}</Text>
          {renderChartCluster()}
        </Container>
      ) : null}
      <Container className={styles.filters}>
        <Select
          value={selectedClusterType}
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
            verificationType={'LOG'}
          />
        ) : null}
      </Container>
      <Container className={styles.tableContent}>{renderLogsData()}</Container>
      {!!data?.resource?.totalPages && (
        <Pagination
          pageSize={data.resource.pageSize as number}
          pageCount={data.resource.totalPages + 1}
          itemCount={data.resource.totalItems as number}
          pageIndex={data.resource.pageIndex}
          gotoPage={goToPage}
        />
      )}
    </Container>
  )
}
