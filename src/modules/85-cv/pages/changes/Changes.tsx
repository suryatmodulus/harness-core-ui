/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react'
import { Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import ChangeTimeline from '@cv/components/ChangeTimeline/ChangeTimeline'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { useStrings } from 'framework/strings'
import type { ChangesInfoCardData } from '@cv/components/ChangeTimeline/ChangeTimeline.types'
import { getTimeFormat } from '@cv/components/ChangeTimeline/components/TimestampChart/TimestampChart.utils'
import { HorizontalLayout } from '@cv/pages/health-source/common/StyledComponents'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useDeleteMonitoredService,
  useGetChangeService,
  useGetMonitoredServiceListEnvironments,
  useGetServiceDependencyGraph,
  useListMonitoredService
} from 'services/cv'
import { TimePeriodEnum } from '../monitored-service/components/ServiceHealth/ServiceHealth.constants'
import { ChangesHeader } from './changes.styled'
import { getFilterAndEnvironmentValue } from '../monitored-service/CVMonitoredServiceListingPage.utils'
// import {
//   limitMaxSliderWidth,
//   getDimensionsAsPerContainerWidth
// } from '../monitored-service/components/ServiceHealth/ServiceHealth.utils'

export const Changes: React.FC = () => {
  const { selectedProject } = useAppStore()
  const project = selectedProject
  const { orgIdentifier, projectIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const { getString } = useStrings()
  const [selectedTimePeriod, _s] = useState<SelectOption>({
    value: TimePeriodEnum.TWENTY_FOUR_HOURS,
    label: getString('cv.monitoredServices.serviceHealth.last24Hrs')
  })
  useEffect(() => {
    if (showTimelineSlider) {
      setTimeRange({ startTime: 0, endTime: 0 })
      setShowTimelineSlider(false)
    }
  }, [selectedTimePeriod?.value])

  useGetChangeService({
    lazy: true,
    identifier,
    pathParams: {
      identifier
    },
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountId
    }
  })

  const params = useParams<ProjectPathProps>()
  const [page] = useState(0)

  const [environment] = useState<SelectOption>()
  useGetMonitoredServiceListEnvironments({
    queryParams: {
      accountId: params.accountId,
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier
    }
  })

  const { data } = useListMonitoredService({
    queryParams: {
      offset: page,
      pageSize: 10,
      orgIdentifier: params.orgIdentifier,
      projectIdentifier: params.projectIdentifier,
      accountId: params.accountId,
      ...getFilterAndEnvironmentValue(environment?.value as string, '')
    },
    debounce: 400
  })

  useGetServiceDependencyGraph({
    queryParams: {
      accountId: params.accountId,
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier,
      ...getFilterAndEnvironmentValue(environment?.value as string, '')
    }
  })

  useDeleteMonitoredService({
    queryParams: {
      accountId: params.accountId,
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier
    }
  })

  const { content = [] } = data?.data ?? ({} as any)

  const [showTimelineSlider, setShowTimelineSlider] = useState(false)
  //   const [timestamps, setTimestamps] = useState<number[]>([])
  const [timeRange, setTimeRange] = useState<{ startTime: number; endTime: number }>()
  const [_s2, setChangeTimelineSummary] = useState<ChangesInfoCardData[] | null>(null)
  const timeFormat = useMemo(() => {
    return getTimeFormat(selectedTimePeriod?.value as string)
  }, [selectedTimePeriod?.value])

  return (
    <>
      <ChangesHeader height={'80px'}>
        <HorizontalLayout alignItem={'flex-end'}>
          <NGBreadcrumbs
            links={[
              {
                url: routes.toCVChanges({
                  orgIdentifier: orgIdentifier,
                  projectIdentifier: projectIdentifier,
                  accountId: accountId
                }),
                label: project?.name as string
              }
            ]}
          />
        </HorizontalLayout>
        <p>{'Changes'}</p>
      </ChangesHeader>

      <Container>
        <ChangeTimeline
          serviceIdentifier={content.map((c: any) => c.serviceRef)}
          environmentIdentifier={content.map((c: any) => c.environmentRef)}
          timeFormat={timeFormat}
          startTime={timeRange?.startTime as number}
          endTime={timeRange?.endTime as number}
          selectedTimePeriod={selectedTimePeriod}
          onSliderMoved={setChangeTimelineSummary}
        />
      </Container>
    </>
  )
}
