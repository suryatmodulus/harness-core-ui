import React, { useState, useEffect, useCallback } from 'react'
import {
  Color,
  Container,
  ExpandingSearchInput,
  Select,
  Text,
  Icon,
  Pagination,
  PageError,
  NoDataCard
} from '@wings-software/uicore'
import { isEqual } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ExecutionNode } from 'services/pipeline-ng'
import { GetDeploymentMetricsQueryParams, useGetDeploymentMetrics, useGetHealthSources } from 'services/cv'
import { VerificationType } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown.constants'
import {
  MetricType,
  MetricTypeOptions,
  POLLING_INTERVAL,
  PAGE_SIZE,
  DEFAULT_PAGINATION_VALUEE
} from './DeploymentMetrics.constants'
import { RefreshViewForNewData } from '../RefreshViewForNewDataButton/RefreshForNewData'
import type { DeploymentNodeAnalysisResult } from '../DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'
import {
  DeploymentMetricsAnalysisRow,
  DeploymentMetricsAnalysisRowProps
} from './components/DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow'
import { transformMetricData, getErrorMessage } from './DeploymentMetrics.utils'
import { HealthSourceDropDown } from '../HealthSourcesDropdown/HealthSourcesDropdown'
import css from './DeploymentMetrics.module.scss'

interface DeploymentMetricsProps {
  step: ExecutionNode
  activityId: string
  selectedNode?: DeploymentNodeAnalysisResult
}

type UpdateViewState = {
  hasNewData: boolean
  shouldUpdateView: boolean
  currentViewData: DeploymentMetricsAnalysisRowProps[]
  showSpinner: boolean
}

export function DeploymentMetrics(props: DeploymentMetricsProps): JSX.Element {
  const { step, selectedNode, activityId } = props
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()
  const [queryParams, setQueryParams] = useState<GetDeploymentMetricsQueryParams>({
    accountId,
    anomalousMetricsOnly: false,
    hostName: selectedNode?.hostName,
    pageNumber: 0,
    pageSize: PAGE_SIZE
  })
  const [pollingIntervalId, setPollingIntervalId] = useState(-1)
  const [{ hasNewData, shouldUpdateView, currentViewData, showSpinner }, setUpdateViewInfo] = useState<UpdateViewState>(
    {
      hasNewData: false,
      showSpinner: true,
      shouldUpdateView: true,
      currentViewData: []
    }
  )
  const { loading, error, data, refetch } = useGetDeploymentMetrics({
    queryParams,
    activityId
  })

  const {
    data: healthSourcesData,
    error: healthSourcesError,
    loading: healthSourcesLoading,
    refetch: fetchHealthSources
  } = useGetHealthSources({
    queryParams: { accountId },
    activityId: activityId as string,
    lazy: true
  })

  useEffect(() => {
    if (activityId) {
      fetchHealthSources()
    }
    setPollingIntervalId(-1)
    setUpdateViewInfo({ currentViewData: [], hasNewData: false, shouldUpdateView: true, showSpinner: true })
    setQueryParams(oldParams => ({
      ...oldParams,
      hostName: undefined,
      pageNumber: 0
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId])

  useEffect(() => {
    let intervalId = pollingIntervalId
    clearInterval(intervalId)
    if (step?.status === 'Running' || step?.status === 'AsyncWaiting') {
      // eslint-disable-next-line
      // @ts-ignore
      intervalId = setInterval(refetch, POLLING_INTERVAL)
      setPollingIntervalId(intervalId)
    }

    return () => clearInterval(intervalId)
  }, [step?.status, queryParams])

  useEffect(() => {
    const updatedQueryParams = { ...queryParams, hostName: selectedNode?.hostName }
    if (!isEqual(updatedQueryParams, queryParams)) {
      setQueryParams(updatedQueryParams)
    }
    setUpdateViewInfo(oldState => ({ ...oldState, shouldUpdateView: true, showSpinner: true }))
  }, [selectedNode])

  useEffect(() => {
    if (error || loading) return
    const updatedProps = transformMetricData(data)

    if (shouldUpdateView) {
      setUpdateViewInfo({
        hasNewData: false,
        shouldUpdateView: false,
        currentViewData: updatedProps,
        showSpinner: false
      })
    } else {
      setUpdateViewInfo(prevState => ({
        ...prevState,
        hasNewData: !isEqual(prevState?.currentViewData, updatedProps),
        showSpinner: false
      }))
    }
  }, [data])

  const paginationInfo = data?.resource?.pageResponse || DEFAULT_PAGINATION_VALUEE

  const handleHealthSourceChange = useCallback(selectedHealthSource => {
    setQueryParams(prevQueryParams => ({
      ...prevQueryParams,
      pageNumber: 0,
      healthSources: selectedHealthSource ? [selectedHealthSource] : undefined
    }))

    setUpdateViewInfo(oldInfo => ({ ...oldInfo, shouldUpdateView: true, showSpinner: true }))
  }, [])

  const renderContent = (): JSX.Element => {
    if (loading && showSpinner) {
      return <Icon name="steps-spinner" className={css.loading} color={Color.GREY_400} size={30} />
    }

    if (error && shouldUpdateView) {
      return <PageError message={getErrorMessage(error)} onClick={() => refetch()} className={css.error} />
    }

    if (!currentViewData?.length) {
      return (
        <Container className={css.noData}>
          <NoDataCard
            onClick={() => refetch()}
            message={getString('pipeline.verification.noMetrics')}
            icon="warning-sign"
          />
        </Container>
      )
    }

    return (
      <>
        {currentViewData?.map(analysisRow => {
          const { transactionName, metricName, healthSourceType, controlData, testData } = analysisRow
          return (
            <DeploymentMetricsAnalysisRow
              key={`${analysisRow.transactionName}-${analysisRow.metricName}-${analysisRow.healthSourceType}`}
              transactionName={transactionName}
              metricName={metricName}
              controlData={controlData}
              testData={testData}
              healthSourceType={healthSourceType}
              className={css.analysisRow}
            />
          )
        })}
      </>
    )
  }

  return (
    <Container className={css.main}>
      {pollingIntervalId !== -1 && hasNewData && (
        <RefreshViewForNewData
          className={css.refreshButton}
          onClick={() => {
            setUpdateViewInfo(prevState => ({
              ...prevState,
              hasNewData: false,
              currentViewData: transformMetricData(data)
            }))
          }}
        />
      )}
      <Container className={css.filters}>
        <Text color={Color.BLACK} font={{ size: 'small', weight: 'bold' }}>
          {getString('rbac.permissionLabels.view').toLocaleUpperCase()}:
        </Text>
        <Select
          items={MetricTypeOptions}
          className={css.maxDropDownWidth}
          defaultSelectedItem={MetricTypeOptions[0]}
          onChange={item => {
            setQueryParams(oldQueryParams => ({
              ...oldQueryParams,
              pageNumber: 0,
              anomalousMetricsOnly: item.value === MetricType.ANOMALOUS
            }))
            setUpdateViewInfo(oldInfo => ({ ...oldInfo, shouldUpdateView: true, showSpinner: true }))
          }}
        />
        <HealthSourceDropDown
          data={healthSourcesData}
          loading={healthSourcesLoading}
          error={healthSourcesError}
          onChange={handleHealthSourceChange}
          verificationType={VerificationType.TIME_SERIES}
        />
        <ExpandingSearchInput
          throttle={500}
          className={css.filterBy}
          placeholder={getString('pipeline.verification.metricViewPlaceholder')}
          onChange={filterString => {
            setQueryParams(oldQueryParams => ({ ...oldQueryParams, filter: filterString, pageNumber: 0 }))
            setUpdateViewInfo(oldInfo => ({ ...oldInfo, shouldUpdateView: true, showSpinner: true }))
          }}
        />
      </Container>
      <Container className={css.content}>{renderContent()}</Container>
      <Pagination
        pageSize={paginationInfo.pageSize as number}
        pageCount={paginationInfo.totalPages as number}
        itemCount={paginationInfo.totalItems as number}
        pageIndex={paginationInfo.pageIndex}
        gotoPage={selectedPage => {
          setQueryParams(oldQueryParams => ({ ...oldQueryParams, pageNumber: selectedPage }))
          setUpdateViewInfo(oldInfo => ({ ...oldInfo, shouldUpdateView: true, showSpinner: true }))
        }}
      />
    </Container>
  )
}
