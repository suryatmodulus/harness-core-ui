import React, { useEffect, useState } from 'react'
import { Container, Text, Select, Color, SelectOption, SelectProps } from '@wings-software/uicore'
import moment from 'moment'
import { useHistory, useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import ActivitesTimelineViewSection from '@cv/components/ActivitiesTimelineView/ActivitiesTimelineViewSection'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { RestResponseCategoryRisksDTO, useGetCategoryRiskMap } from 'services/cv'
import ServiceSelector from './ServiceSelector/ServiceSelector'
import { CategoryRiskCards } from '../dashboard/CategoryRiskCards/CategoryRiskCards'
import { AnalysisDrillDownView, AnalysisDrillDownViewProps } from './analysis-drilldown-view/AnalysisDrillDownView'
import ServiceHeatMap from './ServiceHeatMap/ServiceHeatMap'
import styles from './CVServicesPage.module.scss'

const FIVE_MINUTES_IN_MILLISECONDS = 1000 * 60 * 5
const TimelineViewProps = {
  labelsWidth: 210,
  timelineBarProps: {
    columnWidth: 65,
    className: styles.timelineBarStyle
  }
}

function getRangeOptions(getString: UseStringsReturn['getString']): SelectOption[] {
  return [
    { label: getString('cv.serviceDashboardPage.twelveHours'), value: 12 * 60 },
    { label: getString('cv.serviceDashboardPage.oneDay'), value: 24 * 60 },
    { label: getString('cv.serviceDashboardPage.sevenDays'), value: 7 * 24 * 60 },
    { label: getString('cv.serviceDashboardPage.thirtyDays'), value: 30 * 24 * 60 }
  ]
}

const getRangeDates = (val: number, endTime?: number) => {
  const currTime =
    endTime ||
    Math.round(new Date().getTime() / FIVE_MINUTES_IN_MILLISECONDS) * FIVE_MINUTES_IN_MILLISECONDS -
      FIVE_MINUTES_IN_MILLISECONDS
  const now = moment(currTime)
  return {
    startTime: now.clone().subtract(val, 'minutes').valueOf(),
    endTime: currTime
  }
}

export default function CVServicesPage(): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [serviceIsEmpty, setIsServiceEmpty] = useState<boolean>(false)
  const rangeOptions = getRangeOptions(getString)
  const [{ selectedValue, startTime, endTime }, setRange] = useState<{
    selectedValue: number
    endTime?: number
    startTime?: number
  }>({
    selectedValue: rangeOptions[0].value as number,
    endTime: undefined,
    startTime: undefined
  })
  const [selectedService, setSelectedService] = useState<{
    serviceIdentifier?: string
    environmentIdentifier?: string
  }>({})
  const [heatMapAndActivityTimelineInput, setInput] = useState<
    Pick<AnalysisDrillDownViewProps, 'startTime' | 'endTime' | 'environmentIdentifier' | 'serviceIdentifier'>
  >({
    startTime: startTime || 0,
    endTime: endTime || 0,
    ...selectedService
  })
  const [timeSeriesAndActivityTimelineInput, setScopedInput] = useState<
    (Pick<AnalysisDrillDownViewProps, 'startTime' | 'endTime'> & { categoryName?: string }) | undefined
  >()
  const history = useHistory()

  const {
    data: categoryRiskData,
    error,
    loading,
    refetch: refetchCategoryRisk
  } = useGetCategoryRiskMap({
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId,
      envIdentifier: selectedService?.environmentIdentifier,
      serviceIdentifier: selectedService?.serviceIdentifier
    },
    resolve: (response: RestResponseCategoryRisksDTO) => {
      if (response?.resource?.endTimeEpoch) {
        const { startTime: updatedStartTime, endTime: updatedEndTime } = getRangeDates(
          selectedValue,
          response.resource.endTimeEpoch
        )
        setRange({ selectedValue, startTime: updatedStartTime, endTime: updatedEndTime })
        setInput({ startTime: updatedStartTime, endTime: updatedEndTime, ...selectedService })
      }
      return response
    }
  })

  // We need to reset a value to default one every time account ID / project ID / organization ID changes
  useEffect(() => {
    setIsServiceEmpty(false)
  }, [accountId, projectIdentifier, orgIdentifier])

  return (
    <>
      <Page.Header title={getString('services').toLocaleUpperCase()} toolbar={<Container></Container>} />
      <Page.Body
        loading={loading}
        noData={{
          when: () => !loading && serviceIsEmpty === true,
          message: getString('cv.serviceDashboardPage.noServicesConfigured'),
          buttonText: getString('cv.serviceDashboardPage.goToMonitoringSources'),
          onClick: () => {
            history.push({
              pathname: routes.toCVAdminSetup({
                projectIdentifier,
                orgIdentifier,
                accountId
              }),
              search: `?step=2`
            })
          },
          icon: 'error'
        }}
        error={error?.message}
        retryOnError={() => refetchCategoryRisk()}
      >
        <Container className={styles.servicesPage} background={Color.GREY_100}>
          <ServiceSelector
            isEmptyList={isEmpty => setIsServiceEmpty(isEmpty)}
            onSelect={(environmentIdentifier?: string, serviceIdentifier?: string) => {
              setSelectedService({ environmentIdentifier, serviceIdentifier })
            }}
          />
          <Container className={styles.content}>
            <CategoryRiskCards className={styles.categoryRiskCard} data={categoryRiskData} />
            <Container className={styles.serviceBody}>
              <Container>
                <Select
                  defaultSelectedItem={rangeOptions[0]}
                  items={rangeOptions}
                  className={styles.rangeSelector}
                  size={'small' as SelectProps['size']}
                  onChange={({ value }: SelectOption) => {
                    if (selectedValue === value) return
                    const { startTime: updatedStartTime, endTime: updatedEndTime } = getRangeDates(
                      value as number,
                      endTime
                    )
                    setRange({ selectedValue: value as number, startTime: updatedStartTime, endTime: updatedEndTime })
                    setInput({
                      ...selectedService,
                      startTime: updatedStartTime,
                      endTime: updatedEndTime
                    })
                    setScopedInput(undefined)
                  }}
                />
                <ServiceHeatMap
                  {...heatMapAndActivityTimelineInput}
                  className={styles.servicePageHeatMap}
                  onClickHeatMapCell={(cellStartTime, cellEndTime, seriesData) =>
                    setScopedInput(
                      cellStartTime && cellEndTime
                        ? {
                            startTime: cellStartTime - 2 * 60 * 60 * 1000,
                            endTime: cellEndTime,
                            categoryName: seriesData?.name
                          }
                        : undefined
                    )
                  }
                />
              </Container>
              <Text margin={{ bottom: 'xsmall' }} font={{ size: 'small' }} color={Color.BLACK}>
                {getString('cv.changeTimeline')}
              </Text>
              <ActivitesTimelineViewSection
                startTime={timeSeriesAndActivityTimelineInput?.startTime || heatMapAndActivityTimelineInput.startTime}
                endTime={timeSeriesAndActivityTimelineInput?.endTime || heatMapAndActivityTimelineInput.endTime}
                environmentIdentifier={selectedService?.environmentIdentifier}
                serviceIdentifier={selectedService?.serviceIdentifier}
                className={styles.serviceActivityTimeline}
                timelineViewProps={{
                  ...TimelineViewProps,
                  shadedRegionProps: timeSeriesAndActivityTimelineInput
                    ? {
                        shadedRegionEndTime: timeSeriesAndActivityTimelineInput.endTime,
                        shadedRegionStartTime: timeSeriesAndActivityTimelineInput.startTime + 2 * 60 * 60 * 1000,
                        startTime: timeSeriesAndActivityTimelineInput.startTime,
                        endTime: timeSeriesAndActivityTimelineInput.endTime,
                        height: '90%',
                        top: 8,
                        leftOffset: 215
                      }
                    : undefined
                }}
              />
              {timeSeriesAndActivityTimelineInput && (
                <AnalysisDrillDownView
                  {...heatMapAndActivityTimelineInput}
                  {...timeSeriesAndActivityTimelineInput}
                  shadedRegionForMetricProps={
                    timeSeriesAndActivityTimelineInput
                      ? {
                          shadedRegionEndTime: timeSeriesAndActivityTimelineInput.endTime,
                          shadedRegionStartTime: timeSeriesAndActivityTimelineInput.startTime + 2 * 60 * 60 * 1000,
                          startTime: timeSeriesAndActivityTimelineInput.startTime,
                          endTime: timeSeriesAndActivityTimelineInput.endTime,
                          top: 8,
                          leftOffset: 210
                        }
                      : undefined
                  }
                />
              )}
            </Container>
          </Container>
        </Container>
      </Page.Body>
    </>
  )
}
