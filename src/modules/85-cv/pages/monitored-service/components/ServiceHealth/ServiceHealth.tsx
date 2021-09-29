import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Container, Select, SelectOption } from '@wings-software/uicore'
import Card from '@cv/components/Card/Card'
import { useStrings } from 'framework/strings'
import ChangeTimeline from '@cv/components/ChangeTimeline/ChangeTimeline'
import TimelineSlider from '@cv/components/ChangeTimeline/components/TimelineSlider/TimelineSlider'
import type { RiskData } from 'services/cv'
import type { ChangesInfoCardData } from '@cv/components/ChangeTimeline/ChangeTimeline.types'
import {
  calculateLowestHealthScoreBar,
  calculateStartAndEndTimes,
  getDimensionsAsPerContainerWidth,
  getTimeFormat,
  getTimePeriods,
  getTimestampsForPeriod,
  limitMaxSliderWidth
} from './ServiceHealth.utils'
import { DEFAULT_MAX_SLIDER_WIDTH, DEFAULT_MIN_SLIDER_WIDTH, TimePeriodEnum } from './ServiceHealth.constants'
import type { ServiceHealthProps } from './ServiceHealth.types'
import HealthScoreChart from './components/HealthScoreChart/HealthScoreChart'
import MetricsAndLogs from './components/MetricsAndLogs/MetricsAndLogs'
import HealthScoreCard from './components/HealthScoreCard/HealthScoreCard'
import AnomaliesCard from './components/AnomaliesCard/AnomaliesCard'
import ChangesSourceCard from './components/ChangesSourceCard/ChangesSourceCard'
import ChangesAndServiceDependency from './components/ChangesAndServiceDependency/ChangesAndServiceDependency'
import css from './ServiceHealth.module.scss'

export default function ServiceHealth({
  monitoredServiceIdentifier,
  serviceIdentifier,
  environmentIdentifier,
  hasChangeSource
}: ServiceHealthProps): JSX.Element {
  const { getString } = useStrings()
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<SelectOption>({
    value: TimePeriodEnum.TWENTY_FOUR_HOURS,
    label: getString('cv.monitoredServices.serviceHealth.last24Hrs')
  })

  const [timestamps, setTimestamps] = useState<number[]>([])
  const [timeRange, setTimeRange] = useState<{ startTime: number; endTime: number }>()
  const [showTimelineSlider, setShowTimelineSlider] = useState(false)
  const [healthScoreData, setHealthScoreData] = useState<RiskData[]>()
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const timestampsForPeriod = getTimestampsForPeriod(selectedTimePeriod.value as string)
    setTimestamps(timestampsForPeriod)

    //changing timeperiod in dropdown should reset the timerange and remove the slider.
    if (showTimelineSlider) {
      setTimeRange({ startTime: 0, endTime: 0 })
      setShowTimelineSlider(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimePeriod?.value])

  useEffect(() => {
    //changing timeperiod in dropdown should reset the timerange and remove the slider.
    if (showTimelineSlider) {
      setTimeRange({ startTime: 0, endTime: 0 })
    }
  }, [showTimelineSlider])

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

  const lowestHealthScoreBarForTimeRange = useMemo(() => {
    return calculateLowestHealthScoreBar(timeRange?.startTime, timeRange?.endTime, healthScoreData)
  }, [timeRange?.startTime, timeRange?.endTime, healthScoreData])

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
        serviceIdentifier={serviceIdentifier}
        environmentIdentifier={environmentIdentifier}
        monitoredServiceIdentifier={monitoredServiceIdentifier}
      />
    )
  }, [
    environmentIdentifier,
    lowestHealthScoreBarForTimeRange,
    monitoredServiceIdentifier,
    serviceIdentifier,
    timeFormat,
    timeRange,
    changeTimelineSummary
  ])

  const changesTableAndSourceCardStartAndEndtime = useMemo(
    () => calculateStartAndEndTimes(0, 1, timestamps) || [],
    [timestamps]
  )

  return (
    <>
      <Container className={css.serviceHealthHeader}>
        <Select
          value={selectedTimePeriod}
          items={getTimePeriods(getString)}
          className={css.timePeriods}
          onChange={setSelectedTimePeriod}
        />
        <HealthScoreCard serviceIdentifier={serviceIdentifier} environmentIdentifier={environmentIdentifier} />
      </Container>
      <Container className={css.serviceHealthCard}>
        <Card>
          <>
            {serviceIdentifier &&
              environmentIdentifier &&
              changesTableAndSourceCardStartAndEndtime[0] &&
              changesTableAndSourceCardStartAndEndtime[1] && (
                <ChangesSourceCard
                  startTime={changesTableAndSourceCardStartAndEndtime[0]}
                  endTime={changesTableAndSourceCardStartAndEndtime[1]}
                />
              )}
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
                monitoredServiceIdentifier={monitoredServiceIdentifier as string}
                setHealthScoreData={setHealthScoreData}
                timeFormat={timeFormat}
              />
              {showTimelineSlider ? (
                <TimelineSlider
                  resetFocus={() => setShowTimelineSlider(false)}
                  initialSliderWidth={sliderDimensions.minWidth}
                  leftContainerOffset={100}
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
              ) : null}
              <ChangeTimeline
                serviceIdentifier={serviceIdentifier}
                environmentIdentifier={environmentIdentifier}
                timeFormat={timeFormat}
                startTime={timeRange?.startTime as number}
                endTime={timeRange?.endTime as number}
                selectedTimePeriod={selectedTimePeriod?.value as string}
                onSliderMoved={setChangeTimelineSummary}
              />
            </Container>
          </>
        </Card>
        <ChangesAndServiceDependency
          hasChangeSource={hasChangeSource}
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
          startTime={
            showTimelineSlider ? (timeRange?.startTime as number) : changesTableAndSourceCardStartAndEndtime[0]
          }
          endTime={showTimelineSlider ? (timeRange?.endTime as number) : changesTableAndSourceCardStartAndEndtime[1]}
        />
        <MetricsAndLogs
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
          startTime={timeRange?.startTime as number}
          endTime={timeRange?.endTime as number}
        />
      </Container>
    </>
  )
}
