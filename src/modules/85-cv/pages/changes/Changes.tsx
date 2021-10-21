/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Container, Select, SelectOption, MultiSelectDropDown, MultiSelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { Column } from 'react-table'
// eslint-disable-next-line no-restricted-imports
import _ from 'lodash'
import Card from '@cv/components/Card/Card'
import { useStrings } from 'framework/strings'
import ChangeTimeline from '@cv/components/ChangeTimeline/ChangeTimeline'
import TimelineSlider from '@cv/components/ChangeTimeline/components/TimelineSlider/TimelineSlider'
import { MonitoredServiceListItemDTO, RiskData, useChangeEventList, useListMonitoredService } from 'services/cv'
import type { ChangesInfoCardData } from '@cv/components/ChangeTimeline/ChangeTimeline.types'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { HorizontalLayout } from '@cv/pages/health-source/common/StyledComponents'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { PageBody } from '@common/components/Page/PageBody'
import { getStartAndEndTime } from '@cv/components/ChangeTimeline/ChangeTimeline.utils'

import {
  useGetHarnessEnvironments,
  useGetHarnessServices
} from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import {
  DEFAULT_MAX_SLIDER_WIDTH,
  DEFAULT_MIN_SLIDER_WIDTH,
  TimePeriodEnum
} from '../monitored-service/components/ServiceHealth/ServiceHealth.constants'
import {
  calculateLowestHealthScoreBar,
  calculateStartAndEndTimes,
  getDimensionsAsPerContainerWidth,
  getTimeFormat,
  getTimePeriods,
  getTimestampsForPeriod,
  limitMaxSliderWidth
} from '../monitored-service/components/ServiceHealth/ServiceHealth.utils'
import ChangesTable from '../monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/ChangesTable'
import HealthScoreChart from '../monitored-service/components/ServiceHealth/components/HealthScoreChart/HealthScoreChart'
// import AnomaliesCard from '../monitored-service/components/ServiceHealth/components/AnomaliesCard/AnomaliesCard'
import { getFilterAndEnvironmentValue, showPageSpinner } from '../monitored-service/CVMonitoredServiceListingPage.utils'
import { ChangesHeader } from './changes.styled'
import { getChangeSourceOptions } from '../ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.utils'
import AnomaliesCard from '../monitored-service/components/ServiceHealth/components/AnomaliesCard/AnomaliesCard'
import {
  renderChangeType,
  renderImpact,
  renderName,
  renderTime,
  renderType
} from '../monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/ChangesTable.utils'
import css from '../monitored-service/components/ServiceHealth/ServiceHealth.module.scss'

const prepareMutltiSelectOption = (data: string): { label: string; value: string } => {
  return {
    label: data,
    value: data
  }
}

const prepareFilterInfo = (data?: MultiSelectOption[]): Array<string | number> => {
  return data ? data.map((d: MultiSelectOption) => d.value as string) : []
}

export const Changes: React.FC = () => {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()
  const [page] = useState(0)
  const [sourceContentPage, setSourceContentPage] = useState<number>(0)
  const [environment] = useState<SelectOption>()
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<SelectOption>({
    value: TimePeriodEnum.TWENTY_FOUR_HOURS,
    label: getString('cv.monitoredServices.serviceHealth.last24Hrs')
  })
  const [selectedServices, setSelectedServices] = useState<MultiSelectOption[]>()
  const [selectedDescns, setSelectedDescns] = useState<MultiSelectOption[]>()
  const [selectedEnvs, setSelectedEnvs] = useState<MultiSelectOption[]>()
  const [selectedChangeTypes, setSelectedCchangeTypes] = useState<MultiSelectOption[]>()
  const [selectedSources, setSelectedSSources] = useState<MultiSelectOption[]>()
  const [timestamps, setTimestamps] = useState<number[]>([])
  const [timeRange, setTimeRange] = useState<{ startTime: number; endTime: number }>()
  const [showTimelineSlider, setShowTimelineSlider] = useState(false)
  const containerRef = useRef<HTMLElement>(null)
  const [healthScoreData, setHealthScoreData] = useState<RiskData[]>()

  const [filteredContent, setFilteredContents] = useState<any[]>([])

  const { data: monitoredService, loading } = useListMonitoredService({
    queryParams: {
      offset: page,
      pageSize: 10,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      accountId: accountId,
      ...getFilterAndEnvironmentValue(environment?.value as string, '')
    },
    debounce: 400
  })
  const {
    data,
    refetch: fetchSources,
    cancel,
    loading: changeEnvLoading
  } = useChangeEventList({
    lazy: true,
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  })

  const { content = [] } = monitoredService?.data ?? ({} as any)

  useEffect(() => {
    if (content && content.length > 0) {
      cancel()
      fetchSources({
        queryParams: {
          serviceIdentifiers: content.map((c: MonitoredServiceListItemDTO) => c.serviceRef),
          envIdentifiers: content.map((c: MonitoredServiceListItemDTO) => c.environmentRef),
          startTime: showTimelineSlider
            ? (timeRange?.startTime as number)
            : getStartAndEndTime((selectedTimePeriod?.value as string) || '').startTimeRoundedOffToNearest30min,
          endTime: showTimelineSlider
            ? (timeRange?.endTime as number)
            : getStartAndEndTime((selectedTimePeriod?.value as string) || '').endTimeRoundedOffToNearest30min,
          pageIndex: sourceContentPage,
          pageSize: 1000
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, sourceContentPage, timeRange, selectedTimePeriod])

  const {
    content: sourceContent = [],
    totalItems: sourceContentItemCount = 0,
    pageSize: sourceContentPageCount = 0,
    pageIndex: sourceContentPageIndex = 0,
    totalPages: sourceContentTotalPages = 0
  } = data?.resource ?? ({} as any)

  useEffect(() => {
    if (sourceContent?.length) {
      setFilteredContents(sourceContent)
    }
  }, [sourceContent])

  useEffect(() => {
    const sources = prepareFilterInfo(selectedSources)
    const descs = prepareFilterInfo(selectedDescns)
    const envs = prepareFilterInfo(selectedEnvs)
    const services = prepareFilterInfo(selectedServices)
    const types = prepareFilterInfo(selectedChangeTypes)
    setFilteredContents(
      sourceContent.filter(
        (v: any) =>
          (sources.length > 0 ? sources.includes(v.type) : true) &&
          (descs.length > 0 ? descs.includes(v.name) : true) &&
          (envs.length > 0 ? envs.includes(v.envIdentifier) : true) &&
          (services.length > 0 ? services.includes(v.serviceIdentifier) : true) &&
          (types.length > 0 ? types.includes(v.category) : true)
      )
    )
  }, [selectedSources, selectedDescns, selectedEnvs, selectedServices, selectedChangeTypes])

  const lowestHealthScoreBarForTimeRange = useMemo(() => {
    setTimestamps(getTimestampsForPeriod(healthScoreData))
    return calculateLowestHealthScoreBar(timeRange?.startTime, timeRange?.endTime, healthScoreData)
  }, [timeRange?.startTime, timeRange?.endTime, healthScoreData])

  useEffect(() => {
    //changing timeperiod in dropdown should reset the timerange and remove the slider.
    if (showTimelineSlider) {
      setTimeRange({ startTime: 0, endTime: 0 })
      setShowTimelineSlider(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimePeriod?.value])
  // calculating the min and max width for the the timeline slider
  const sliderDimensions = useMemo(() => {
    // This is temporary change , will be removed once BE fix is done.
    const defaultMaxSliderWidth = limitMaxSliderWidth(selectedTimePeriod?.value as string)
      ? DEFAULT_MIN_SLIDER_WIDTH
      : DEFAULT_MAX_SLIDER_WIDTH

    return getDimensionsAsPerContainerWidth(
      defaultMaxSliderWidth,
      selectedTimePeriod,
      containerRef?.current?.offsetWidth
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef?.current, selectedTimePeriod?.value])

  const timeFormat = useMemo(() => {
    return getTimeFormat(selectedTimePeriod?.value as string)
  }, [selectedTimePeriod?.value])

  const onFocusTimeRange = useCallback((startTime: number, endTime: number) => {
    setTimeRange({ startTime, endTime })
  }, [])

  const [changeTimelineSummary, setChangeTimelineSummary] = useState<ChangesInfoCardData[] | null>(null)
  const renderInfoCard = useCallback(() => {
    return (
      <AnomaliesCard
        timeRange={timeRange}
        changeTimelineSummary={changeTimelineSummary || []}
        lowestHealthScoreBarForTimeRange={lowestHealthScoreBarForTimeRange}
        timeFormat={timeFormat}
        serviceIdentifier={content.map((c: MonitoredServiceListItemDTO) => c.serviceRef)?.[0]}
        environmentIdentifier={content.map((c: MonitoredServiceListItemDTO) => c.environmentRef?.[0])}
        monitoredServiceIdentifier={content.map((c: MonitoredServiceListItemDTO) => c.serviceRef)?.[0]}
      />
    )
  }, [content, lowestHealthScoreBarForTimeRange, timeFormat, timeRange, changeTimelineSummary])

  const columns: Column<any>[] = useMemo(
    () => [
      {
        Header: getString('timeLabel'),
        Cell: renderTime,
        accessor: 'eventTime',
        width: '15%'
      },
      {
        Header: 'Description',
        Cell: renderName,
        accessor: 'name',
        width: '30%'
      },
      {
        Header: 'Monitored SVC',
        Cell: renderImpact,
        accessor: 'serviceIdentifier',
        width: '25%'
      },
      {
        Header: getString('source'),
        Cell: renderType,
        accessor: 'type',
        width: '15%'
      },
      {
        Header: getString('typeLabel'),
        width: '15%',
        accessor: 'category',
        Cell: renderChangeType
      }
    ],
    [content]
  )

  return (
    <>
      <ChangesHeader height={'80px'}>
        <HorizontalLayout alignItem={'flex-end'}>
          <NGBreadcrumbs />
        </HorizontalLayout>
        <p>{'Changes'}</p>
      </ChangesHeader>
      <PageBody>
        {showPageSpinner(changeEnvLoading || loading, false)}
        <Container className={css.serviceHealthHeader}>
          <Select
            value={selectedTimePeriod}
            items={getTimePeriods(getString)}
            className={css.timePeriods}
            onChange={setSelectedTimePeriod}
          />

          <MultiSelectDropDown
            placeholder="Description: All"
            value={selectedDescns}
            items={_.uniqBy(sourceContent, 'name').map((c: any) => prepareMutltiSelectOption(c.name || ''))}
            className={css.timePeriods}
            onChange={setSelectedDescns}
          />
          <MultiSelectDropDown
            placeholder="Service: All"
            value={selectedServices}
            items={useGetHarnessServices().serviceOptions}
            className={css.timePeriods}
            onChange={setSelectedServices}
          />

          <MultiSelectDropDown
            placeholder="Environment: All"
            value={selectedEnvs}
            items={useGetHarnessEnvironments().environmentOptions}
            className={css.timePeriods}
            onChange={setSelectedEnvs}
          />
          <MultiSelectDropDown
            placeholder="Change Type: All"
            value={selectedChangeTypes}
            items={getChangeSourceOptions(getString)}
            className={css.timePeriods}
            onChange={setSelectedCchangeTypes}
          />

          <MultiSelectDropDown
            placeholder="Source: Alll"
            value={selectedSources}
            items={_.uniqBy(sourceContent, 'type').map((c: any) => prepareMutltiSelectOption(c.type || ''))}
            className={css.timePeriods}
            onChange={setSelectedSSources}
          />
        </Container>
        <Container className={css.serviceHealthCard}>
          <Card>
            <>
              <Container
                onClick={() => {
                  if (!showTimelineSlider) {
                    setShowTimelineSlider(true)
                  }
                }}
                className={css.main}
                ref={containerRef}
              >
                <HealthScoreChart
                  duration={selectedTimePeriod}
                  monitoredServiceIdentifier={content.map((c: any) => c.name)?.[0] as string}
                  setHealthScoreData={d => setHealthScoreData(d)}
                  timeFormat={timeFormat}
                />
                <TimelineSlider
                  resetFocus={() => setShowTimelineSlider(false)}
                  initialSliderWidth={sliderDimensions.minWidth}
                  leftContainerOffset={90}
                  hideSlider={!showTimelineSlider}
                  className={css.slider}
                  minSliderWidth={sliderDimensions.minWidth}
                  maxSliderWidth={sliderDimensions.maxWidth}
                  infoCard={renderInfoCard()}
                  onSliderDragEnd={({ startXPercentage, endXPercentage }) => {
                    const startAndEndtime = calculateStartAndEndTimes(startXPercentage, endXPercentage, timestamps)
                    if (startAndEndtime) onFocusTimeRange?.(startAndEndtime[0], startAndEndtime[1])
                  }}
                />
                <ChangeTimeline
                  serviceIdentifier={content.map((c: MonitoredServiceListItemDTO) => c.serviceRef)}
                  environmentIdentifier={content.map((c: MonitoredServiceListItemDTO) => c.environmentRef)}
                  timeFormat={timeFormat}
                  startTime={timeRange?.startTime as number}
                  endTime={timeRange?.endTime as number}
                  selectedTimePeriod={selectedTimePeriod}
                  onSliderMoved={setChangeTimelineSummary}
                />
              </Container>
            </>
          </Card>
          <Container>
            <ChangesTable
              startTime={
                showTimelineSlider
                  ? (timeRange?.startTime as number)
                  : getStartAndEndTime((selectedTimePeriod?.value as string) || '').startTimeRoundedOffToNearest30min
              }
              endTime={
                showTimelineSlider
                  ? (timeRange?.endTime as number)
                  : getStartAndEndTime((selectedTimePeriod?.value as string) || '').endTimeRoundedOffToNearest30min
              }
              pagination={{
                itemCount: sourceContentItemCount,
                gotoPage: setSourceContentPage,
                pageIndex: sourceContentPageIndex,
                pageSize: sourceContentPageCount,
                pageCount: sourceContentTotalPages
              }}
              dynColumns={columns}
              dynData={filteredContent}
              hasChangeSource={true}
              serviceIdentifier={content.map((c: MonitoredServiceListItemDTO) => c.serviceRef)}
              environmentIdentifier={content.map((c: MonitoredServiceListItemDTO) => c.environmentRef)}
            />
          </Container>
        </Container>
      </PageBody>
    </>
  )
}
