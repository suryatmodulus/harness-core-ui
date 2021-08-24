import React, { useState, useEffect, useMemo } from 'react'
import {
  Color,
  Container,
  ExpandingSearchInput,
  Select,
  SelectOption,
  Text,
  Icon,
  Pagination
} from '@wings-software/uicore'
import { isEqual } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import type { ExecutionNode } from 'services/pipeline-ng'
import { GetDeploymentMetricsQueryParams, useGetDataSourcetypes, useGetDeploymentMetrics } from 'services/cv'
import { NoDataCard } from '@common/components/Page/NoDataCard'
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
import { transformMetricData, dataSourceTypeToLabel, getErrorMessage } from './DeploymentMetrics.utils'
import css from './DeploymentMetrics.module.scss'

interface DeploymentMetricsProps {
  step: ExecutionNode
  activityId: string
  selectedNode?: DeploymentNodeAnalysisResult
}

interface HealthSourceDropDownProps {
  onChange: (selectedHealthSource: string) => void
  serviceIdentifier: string
  environmentIdentifier: string
}

type UpdateViewState = {
  hasNewData: boolean
  shouldUpdateView: boolean
  currentViewData: DeploymentMetricsAnalysisRowProps[]
  showSpinner: boolean
}

export function HealthSourceDropDown(props: HealthSourceDropDownProps): JSX.Element {
  const { onChange, serviceIdentifier, environmentIdentifier } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { data, error, loading } = useGetDataSourcetypes({
    queryParams: { accountId, projectIdentifier, orgIdentifier, serviceIdentifier, environmentIdentifier }
  })

  const healthSources: SelectOption[] = useMemo(() => {
    if (loading) {
      return [{ value: '', label: getString('loading') }]
    }
    if (error) {
      return []
    }

    const options = []
    for (const source of data?.resource || []) {
      if (source.dataSourceType && source.verificationType === 'TIME_SERIES') {
        options.push({
          label: dataSourceTypeToLabel(source.dataSourceType),
          value: source.dataSourceType as string
        })
      }
    }

    if (options.length > 1) {
      options.unshift({ label: getString('all'), value: 'all' })
    }

    return options
  }, [data, loading])

  return (
    <Select
      items={healthSources}
      className={css.maxDropDownWidth}
      defaultSelectedItem={healthSources?.[0]}
      key={healthSources?.[0]?.value as string}
      inputProps={{ placeholder: getString('pipeline.verification.healthSourcePlaceholder') }}
      onChange={item => {
        onChange(item?.value === 'all' ? '' : (item.value as string))
      }}
    />
  )
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

  useEffect(() => {
    setPollingIntervalId(-1)
    setUpdateViewInfo({ currentViewData: [], hasNewData: false, shouldUpdateView: true, showSpinner: true })
    setQueryParams(oldParams => ({
      ...oldParams,
      hostName: undefined,
      pageNumber: 0
    }))
  }, [activityId])

  useEffect(() => {
    let intervalId = pollingIntervalId
    clearInterval(intervalId)
    if (step?.status === 'Running' || step?.status === 'AsyncWaiting') {
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

  const renderContent = () => {
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
          onChange={selectedHealthSource => {
            setQueryParams(oldQueryParams => ({
              ...oldQueryParams,
              pageNumber: 0,
              healthSource: selectedHealthSource
            }))
            setUpdateViewInfo(oldInfo => ({ ...oldInfo, shouldUpdateView: true, showSpinner: true }))
          }}
          serviceIdentifier={(step?.stepParameters?.serviceIdentifier as unknown as string) || ''}
          environmentIdentifier={(step?.stepParameters?.environmentIdentifier as unknown as string) || ''}
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
