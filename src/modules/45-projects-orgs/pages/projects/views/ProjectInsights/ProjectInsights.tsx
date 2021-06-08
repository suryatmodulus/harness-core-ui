import * as React from 'react'
import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import CalendarHeatmap from 'react-calendar-heatmap'
import Timeline from '@material-ui/lab/Timeline'
import TimelineItem from '@material-ui/lab/TimelineItem'
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent'
import TimelineSeparator from '@material-ui/lab/TimelineSeparator'
import TimelineDot from '@material-ui/lab/TimelineDot'
import TimelineConnector from '@material-ui/lab/TimelineConnector'
import TimelineContent from '@material-ui/lab/TimelineContent'
import { Button, Color, Icon, Layout, Popover, Tabs, Text } from '@wings-software/uicore'
import { IconName, Menu, MenuItem, Position, Tab } from '@blueprintjs/core'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner } from '@common/components'
import { useGetActivityHistory, useGetActivityStats } from 'services/cd-ng'
import css from './ProjectInsights.module.scss'

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

const IconMap = {
  [ACTIVITY_TYPES_ENUM.CREATE_RESOURCE]: 'plus',
  [ACTIVITY_TYPES_ENUM.VIEW_RESOURCE]: 'eye-open',
  [ACTIVITY_TYPES_ENUM.UPDATE_RESOURCE]: 'edit',
  [ACTIVITY_TYPES_ENUM.RUN_PIPELINE]: 'run-pipeline',
  [ACTIVITY_TYPES_ENUM.BUILD_PIPELINE]: 'build',
  [ACTIVITY_TYPES_ENUM.NEW_USER_ADDED]: 'user',
  default: 'plus'
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
  const end = today + 86400000
  const start = end - 15552000000 // 6 months back

  const { data, loading } = useGetActivityStats({
    queryParams: {
      projectId: projectIdentifier,
      startTime: start,
      endTime: end
    }
  })

  const dateToCountMap = useMemo(() => {
    const currDateToCountMap: Record<number, number> = {}
    let currDate = start
    while (currDate < end) {
      currDateToCountMap[currDate] = 0
      currDate += 86400000 // increment by a day
    }
    return currDateToCountMap
  }, [])

  if (loading) {
    return (
      <Layout.Horizontal width={'100%'} height={300} margin={{ top: 'medium' }} className={css.heatmap}>
        <PageSpinner />
      </Layout.Horizontal>
    )
  }

  ;(data?.data?.activityStatsPerTimestampList || []).map(activityStatsPerTimestamp => {
    const date = new Date(activityStatsPerTimestamp?.timestamp as number).setHours(0, 0, 0, 0)
    const count =
      activityType === ACTIVITY_TYPES_ENUM.ALL
        ? (activityStatsPerTimestamp.totalCount as number)
        : activityStatsPerTimestamp.countPerActivityTypeList?.filter(
            countPerActivityType => countPerActivityType.activityType === activityType
          )[0]?.count || 0
    dateToCountMap[date] = count
  })

  const values = Object.keys(dateToCountMap).map(date => ({
    date: parseInt(date),
    count: dateToCountMap[parseInt(date)]
  }))

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
        endDate={today}
        values={values}
        classForValue={classForValue}
        showWeekdayLabels
        onClick={(value: any) => setSelectedDate(value?.date as number)}
        titleForValue={(value: any) =>
          `Date: ${new Date(value.date).toLocaleString('default', { month: 'long', day: 'numeric' })}, Count: ${
            value.count
          }`
        }
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

const ProjectOverview: React.FC<{
  selectedDate: number
  activityType: ACTIVITY_TYPES_ENUM
  projectIdentifier: string
}> = ({ selectedDate, activityType, projectIdentifier }) => {
  const { loading, data } = useGetActivityHistory({
    queryParams: {
      projectId: projectIdentifier,
      startTime: selectedDate,
      endTime: selectedDate + 86400000
    }
  })
  if (loading) {
    return <PageSpinner />
  }
  return (
    <Timeline>
      {(data?.data?.activityHistoryDetailsList || []).map((activityHistoryDetails, index) => {
        const icon = IconMap[activityHistoryDetails?.activityType ?? 'default']
        const time = activityHistoryDetails?.timestamp
          ? new Date(activityHistoryDetails.timestamp).toLocaleTimeString('en-us', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : ''
        const actType = activityHistoryDetails?.activityType
        const username = activityHistoryDetails.userName || ''
        const userid = activityHistoryDetails.userId || ''
        const resourceType = activityHistoryDetails.resourceType?.toLowerCase() || ''
        const resourceName = activityHistoryDetails.resourceName || ''
        const resourceId = activityHistoryDetails.resourceId || ''
        let message = ''
        if (!actType) {
          /**/
        } else if (
          [
            ACTIVITY_TYPES_ENUM.CREATE_RESOURCE,
            ACTIVITY_TYPES_ENUM.UPDATE_RESOURCE,
            ACTIVITY_TYPES_ENUM.VIEW_RESOURCE
          ].indexOf(actType as ACTIVITY_TYPES_ENUM) !== -1
        ) {
          const action =
            actType === ACTIVITY_TYPES_ENUM.CREATE_RESOURCE
              ? 'created'
              : actType === ACTIVITY_TYPES_ENUM.UPDATE_RESOURCE
              ? 'updated'
              : 'viewed'
          message = `${username} (<b>${userid}</b>) ${action} ${resourceType} ${resourceName} (<b>${resourceId}</b>)`
        } else if (
          [ACTIVITY_TYPES_ENUM.RUN_PIPELINE, ACTIVITY_TYPES_ENUM.BUILD_PIPELINE].indexOf(
            actType as ACTIVITY_TYPES_ENUM
          ) !== -1
        ) {
          const action = actType === ACTIVITY_TYPES_ENUM.BUILD_PIPELINE ? 'started build for' : 'started'
          message = `${username} (<b>${userid}</b>) ${action} ${resourceType} ${resourceName} (<b>${resourceId}</b>)`
        } else if (actType === ACTIVITY_TYPES_ENUM.NEW_USER_ADDED) {
          const action = 'was added to'
          message = `${username} (<b>${userid}</b>) ${action} ${resourceType} ${resourceName} (<b>${resourceId}</b>)`
        }
        return (
          <TimelineItem key={index}>
            <TimelineOppositeContent>
              <Text>{time}</Text>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot>
                <Icon name={icon as IconName} />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Layout.Horizontal>
                <div dangerouslySetInnerHTML={{ __html: message }} />
              </Layout.Horizontal>
            </TimelineContent>
          </TimelineItem>
        )
      })}
    </Timeline>
  )
}

const ProjectContributions: React.FC = () => {
  return <Text>Contributions</Text>
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
  const projectOverviewProps = {
    selectedDate,
    activityType,
    projectIdentifier
  }

  const projectContributionsProps = {}

  return (
    <Layout.Vertical className={css.projectInsights}>
      <ProjectHeader />
      <ProjectHeatMap {...projectHeatmapProps} />
      <Tabs id="project-insights" defaultSelectedTabId="overview">
        <Tab
          id="overview"
          title="Overview"
          panel={<ProjectOverview {...projectOverviewProps} />}
          panelClassName={css.panel}
        />
        <Tab
          id="contributions"
          title="Contributions"
          panel={<ProjectContributions {...projectContributionsProps} />}
          panelClassName={css.panel}
        />
      </Tabs>
    </Layout.Vertical>
  )
}
