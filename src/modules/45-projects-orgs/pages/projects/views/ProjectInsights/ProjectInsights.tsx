import * as React from 'react'
import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import CalendarHeatmap from 'react-calendar-heatmap'
import { Button, Color, Layout, Popover, Text } from '@wings-software/uicore'
import { Menu, MenuItem, Position } from '@blueprintjs/core'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetActivityStats } from 'services/cd-ng'
import css from './ProjectInsights.module.scss'
import { PageSpinner } from '@common/components'

enum ACTIVITY_TYPES_ENUM {
  CREATE_RESOURCE = 'CREATE_RESOURCE',
  VIEW_RESOURCE = 'VIEW_RESOURCE',
  UPDATE_RESOURCE = 'UPDATE_RESOURCE',
  RUN_PIPELINE = 'RUN_PIPELINE',
  BUILD_PIPELINE = 'BUILD_PIPELINE',
  NEW_USER_ADDED = 'NEW_USER_ADDED',
  ALL = 'ALL'
}

const ACTIVITY_TYPES = {
  [ACTIVITY_TYPES_ENUM.CREATE_RESOURCE]: 'Create Resource',
  [ACTIVITY_TYPES_ENUM.VIEW_RESOURCE]: 'View Resource',
  [ACTIVITY_TYPES_ENUM.UPDATE_RESOURCE]: 'Update Resource',
  [ACTIVITY_TYPES_ENUM.RUN_PIPELINE]: 'Run Pipeline',
  [ACTIVITY_TYPES_ENUM.BUILD_PIPELINE]: 'Build Pipeline',
  [ACTIVITY_TYPES_ENUM.NEW_USER_ADDED]: 'User Added',
  [ACTIVITY_TYPES_ENUM.ALL]: 'All'
}

const ProjectHeader: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  return (
    <Page.Header
      title={
        <Layout.Vertical spacing="xsmall">
          <Breadcrumbs
            links={[
              {
                url: routes.toProjectInsights({ orgIdentifier, projectIdentifier, accountId }),
                label: projectIdentifier
              },
              { url: '#', label: 'Project Insights' }
            ]}
          />
          <Text font={{ size: 'medium' }} color={Color.GREY_700}>
            Insights
          </Text>
        </Layout.Vertical>
      }
    />
  )
}

const ProjectHeatMap: React.FC<{
  today: number
  selectedDate: number
  setSelectedDate: (selectedDate: number) => void
  projectIdentifier: string
  activityType: ACTIVITY_TYPES_ENUM
  setActivityType: (activityType: ACTIVITY_TYPES_ENUM) => void
}> = ({ today, selectedDate, setSelectedDate, projectIdentifier, activityType, setActivityType }) => {
  const end = today
  const start = end - 15552000000 // 6 months back

  const { data, loading } = useGetActivityStats({
    queryParams: {
      projectId: projectIdentifier,
      startTime: start,
      endTime: end
    }
  })

  if (loading) {
    return (
      <Layout.Horizontal width={'100%'} height={300} margin={{ top: 'medium' }} className={css.heatmap}>
        <PageSpinner />
      </Layout.Horizontal>
    )
  }

  const values = (data?.data?.activityStatsPerTimestampList || []).map(activityStatsPerTimestamp => ({
    data: activityStatsPerTimestamp.timestamp,
    count:
      activityStatsPerTimestamp.countPerActivityTypeList?.filter(
        countPerActivityType => countPerActivityType.activityType === activityType
      )[0]?.count || activityStatsPerTimestamp.totalCount
  }))

  //   const values = useMemo(() => {
  //     const currValues = []
  //     let currDate = start
  //     while (currDate <= end) {
  //       currValues.push({
  //         date: currDate,
  //         count: currDate > end - 2592000000 ? parseInt(`${Math.random() * 1000}`, 10) : 0
  //       })
  //       currDate += 86400000 // increment by a day
  //     }
  //     return currValues
  //   }, [])

  const large = values.length
    ? (values as { count: number }[]).reduce((prev, curr) => (curr && prev.count < curr.count ? curr : prev)).count
    : 1

  const classForValue: any = (value: any) => {
    let className = ''
    if (value?.date === selectedDate) {
      className = 'color-selected'
    }
    if (!value || !value.count) {
      className += ' color-empty'
    } else {
      const colorKey = 1 + parseInt(`${(value.count * 7) / large}`)
      className += ` color-scale-${colorKey}`
    }
    return className
  }
  return (
    <Layout.Horizontal width={'100%'} height={300} margin={{ top: 'medium' }} className={css.heatmap}>
      <CalendarHeatmap
        startDate={start}
        endDate={end}
        values={values}
        classForValue={classForValue}
        showWeekdayLabels
        onClick={(value: any) => setSelectedDate(value?.date as number)}
      />
      <Popover
        minimal
        captureDismiss
        content={
          <Menu>
            {((Object.keys(ACTIVITY_TYPES) as unknown) as []).map(activityTypeKey => {
              return (
                <MenuItem
                  text={ACTIVITY_TYPES[activityTypeKey]}
                  onClick={() => setActivityType(activityTypeKey)}
                  key={activityTypeKey}
                />
              )
            })}
          </Menu>
        }
        position={Position.BOTTOM}
      >
        <Button
          rightIcon="caret-down"
          height={20}
          text={ACTIVITY_TYPES[activityType]}
          minimal
          font={{ size: 'xsmall' }}
        />
      </Popover>
    </Layout.Horizontal>
  )
}

const ProjectHistory: React.FC<{ selectedDate: number }> = ({ selectedDate }) => {
  return <Text>{selectedDate}</Text>
}

export const ProjectInsights: React.FC = () => {
  const [today] = useState(new Date().setHours(0, 0, 0, 0))
  const [selectedDate, setSelectedDate] = useState(today)
  const [activityType, setActivityType] = useState<ACTIVITY_TYPES_ENUM>(ACTIVITY_TYPES_ENUM.ALL)
  const { projectIdentifier } = useParams<ProjectPathProps>()
  const projectHeatmapProps = {
    today,
    selectedDate,
    setSelectedDate,
    projectIdentifier,
    activityType,
    setActivityType
  }
  const projectHistoryProps = {
    selectedDate,
    activityType
  }
  return (
    <Layout.Vertical className={css.projectInsights}>
      <ProjectHeader />
      <ProjectHeatMap {...projectHeatmapProps} />
      <ProjectHistory {...projectHistoryProps} />
    </Layout.Vertical>
  )
}
