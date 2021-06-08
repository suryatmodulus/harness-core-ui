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
import { Button, Color, Container, Icon, Layout, Popover, Tabs, Text } from '@wings-software/uicore'
import { IconName, Menu, MenuItem, Position, Tab } from '@blueprintjs/core'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { Page, PageSpinner } from '@common/components'
import routes from '@common/RouteDefinitions'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import Contribution from '@common/components/Contribution/Contribution'
import { useGetActivityHistory, useGetActivityStats, UserInfo, useGetActivityStatsByProjects } from 'services/cd-ng'

import css from './UserInsights.module.scss'

enum ACTIVITY_TYPES_ENUM {
  VIEW_PROJECT = 'VIEW_PROJECT',
  VIEW_RESOURCE = 'VIEW_RESOURCE',
  CREATE_RESOURCE = 'CREATE_RESOURCE',
  UPDATE_RESOURCE = 'UPDATE_RESOURCE',
  RUN_PIPELINE = 'RUN_PIPELINE',
  CREATE_PIPELINE = 'CREATE_PIPELINE',
  UPDATE_PIPELINE = 'UPDATE_PIPELINE',
  VIEW_PIPELINE = 'VIEW_PIPELINE',
  ALL = 'ALL'
}

const ACTIVITY_TYPES = {
  [ACTIVITY_TYPES_ENUM.CREATE_RESOURCE]: 'Create Resource',
  [ACTIVITY_TYPES_ENUM.VIEW_RESOURCE]: 'View Resource',
  [ACTIVITY_TYPES_ENUM.UPDATE_RESOURCE]: 'Update Resource',
  [ACTIVITY_TYPES_ENUM.RUN_PIPELINE]: 'Run Pipeline',
  [ACTIVITY_TYPES_ENUM.CREATE_PIPELINE]: 'Create Pipeline',
  [ACTIVITY_TYPES_ENUM.VIEW_PROJECT]: 'View Project',
  [ACTIVITY_TYPES_ENUM.VIEW_PIPELINE]: 'View Pipeline',
  [ACTIVITY_TYPES_ENUM.UPDATE_PIPELINE]: 'Update Pipeline',
  [ACTIVITY_TYPES_ENUM.ALL]: 'All'
}

const IconMap = {
  [ACTIVITY_TYPES_ENUM.CREATE_RESOURCE]: 'plus',
  [ACTIVITY_TYPES_ENUM.VIEW_RESOURCE]: 'eye-open',
  [ACTIVITY_TYPES_ENUM.UPDATE_RESOURCE]: 'edit',
  [ACTIVITY_TYPES_ENUM.RUN_PIPELINE]: 'run-pipeline',
  [ACTIVITY_TYPES_ENUM.CREATE_PIPELINE]: 'plus',
  [ACTIVITY_TYPES_ENUM.UPDATE_PIPELINE]: 'edit',
  [ACTIVITY_TYPES_ENUM.VIEW_PROJECT]: 'eye-open',
  [ACTIVITY_TYPES_ENUM.VIEW_PIPELINE]: 'eye-open',
  default: 'plus'
}

const ColorMap = {
  [ACTIVITY_TYPES_ENUM.CREATE_RESOURCE]: css.blue200,
  [ACTIVITY_TYPES_ENUM.VIEW_RESOURCE]: css.green200,
  [ACTIVITY_TYPES_ENUM.UPDATE_RESOURCE]: css.red200,
  [ACTIVITY_TYPES_ENUM.RUN_PIPELINE]: css.orange200,
  [ACTIVITY_TYPES_ENUM.CREATE_PIPELINE]: css.yellow200,
  [ACTIVITY_TYPES_ENUM.UPDATE_PIPELINE]: css.grey200,
  [ACTIVITY_TYPES_ENUM.VIEW_PROJECT]: css.blue200,
  [ACTIVITY_TYPES_ENUM.VIEW_PIPELINE]: css.blue200
}

const UserHeader: React.FC = () => {
  const { accountId } = useParams<ProjectPathProps>()
  return (
    <Page.Header
      title={
        <Layout.Vertical spacing="xsmall">
          <Breadcrumbs
            links={[
              {
                url: routes.toUserInsights({ accountId }),
                label: 'User'
              },
              { url: '#', label: 'User Insights' }
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

const UserHeatMap: React.FC<{
  today: number
  selectedDate: number
  setSelectedDate: (selectedDate: number) => void
  activityType: ACTIVITY_TYPES_ENUM
  setActivityType: (activityType: ACTIVITY_TYPES_ENUM) => void
  currentUserId?: string
  selectedProject?: string | null
}> = ({ today, selectedDate, setSelectedDate, activityType, setActivityType, currentUserId, selectedProject }) => {
  const end = today + 86400000
  const start = end - 15552000000 // 6 months back

  const { data, loading } = useGetActivityStats({
    queryParams: {
      userId: currentUserId,
      startTime: start,
      endTime: end,
      ...(selectedProject ? { projectId: selectedProject } : {})
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

const UserOverView: React.FC<{
  selectedDate: number
  activityType: ACTIVITY_TYPES_ENUM
  currentUserId?: string
  selectedProject: string | null
}> = ({ selectedDate, activityType, currentUserId, selectedProject }) => {
  const { loading, data } = useGetActivityHistory({
    queryParams: {
      userId: currentUserId,
      startTime: selectedDate,
      endTime: selectedDate + 86400000,
      ...(selectedProject ? { projectId: selectedProject } : {})
    }
  })
  if (loading) {
    return <PageSpinner />
  }

  const activityHistoryDetailsList = data?.data?.activityHistoryDetailsList || []

  const resultsPresent =
    activityHistoryDetailsList?.length !== 0 &&
    (activityType === ACTIVITY_TYPES_ENUM.ALL ||
      activityHistoryDetailsList.filter(activityHistoryDetails => activityHistoryDetails.activityType === activityType)
        .length)

  return (
    <Timeline>
      {resultsPresent ? (
        (activityHistoryDetailsList || []).map((activityHistoryDetails, index) => {
          if (activityType === ACTIVITY_TYPES_ENUM.ALL || activityHistoryDetails.activityType === activityType) {
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
              message = `${username} (<b>${userid}</b>) ${action} ${resourceType} <a>${resourceName}</a> (<b>${resourceId}</b>)`
            } else if (
              [
                ACTIVITY_TYPES_ENUM.RUN_PIPELINE,
                ACTIVITY_TYPES_ENUM.CREATE_PIPELINE,
                ACTIVITY_TYPES_ENUM.VIEW_PIPELINE,
                ACTIVITY_TYPES_ENUM.UPDATE_PIPELINE
              ].indexOf(actType as ACTIVITY_TYPES_ENUM) !== -1
            ) {
              const action =
                actType === ACTIVITY_TYPES_ENUM.RUN_PIPELINE
                  ? 'started'
                  : actType === ACTIVITY_TYPES_ENUM.VIEW_PIPELINE
                  ? 'viewed'
                  : actType === ACTIVITY_TYPES_ENUM.UPDATE_PIPELINE
                  ? 'updated'
                  : 'created'
              message = `${username} (<b>${userid}</b>) ${action} ${resourceType} <a>${resourceName}</a> (<b>${resourceId}</b>)`
            } else if (actType === ACTIVITY_TYPES_ENUM.VIEW_PROJECT) {
              const action = 'viewed'
              message = `${username} (<b>${userid}</b>) ${action} ${resourceType} <a>${resourceName}</a> (<b>${resourceId}</b>)`
            }
            return (
              <TimelineItem key={index}>
                <TimelineOppositeContent>
                  <Text>{time}</Text>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot classes={{ root: ColorMap[actType!] }}>
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
          } else {
            return <></>
          }
        })
      ) : (
        <>No Activity History</>
      )}
    </Timeline>
  )
}

const UserContributions: React.FC<{
  currentUserInfo: UserInfo
  activityType: ACTIVITY_TYPES_ENUM
  selectedProject: string | null
  setSelectedProject: (selectedProject: string | null) => void
  today: number
}> = ({ currentUserInfo, activityType, selectedProject, setSelectedProject, today }) => {
  const end = today + 86400000
  const start = end - 2592000000 // 1 months back
  const { loading, data } = useGetActivityStatsByProjects({
    queryParams: {
      userId: currentUserInfo?.uuid,
      startTime: start,
      endTime: end
    }
  })

  if (loading) {
    return <PageSpinner />
  }
  let formattedData = (data?.data?.activityHistoryByUserList || []).map((activityHistoryByUser, index) => {
    let total = 0
    const dataItems = (activityHistoryByUser.activityStatsPerTimestampList || []).map(activityStatsPerTimestamp => {
      if (activityType === ACTIVITY_TYPES_ENUM.ALL) {
        total += activityStatsPerTimestamp.totalCount || 0
        return {
          x: activityStatsPerTimestamp?.timestamp,
          y: activityStatsPerTimestamp.totalCount
        }
      }
      const matching = (activityStatsPerTimestamp?.countPerActivityTypeList || []).filter(
        item => item.activityType === activityType
      )
      if (matching.length) {
        total += matching[0].count || 0
        return {
          x: activityStatsPerTimestamp?.timestamp,
          y: matching[0].count
        }
      }
      return {
        x: activityStatsPerTimestamp?.timestamp,
        y: 0
      }
    })
    dataItems.sort((itemA, itemB) => (itemA.x && itemB.x && itemA.x < itemB.x ? -1 : 1))
    return {
      projectId: activityHistoryByUser.projectId,
      total,
      data: dataItems,
      index
    }
  })
  formattedData.sort((itemA, itemB) => (itemA.total < itemB.total ? 1 : -1))
  formattedData = formattedData.map((value, index) => ({ ...value, index }))
  return (
    <Layout.Masonry
      center
      gutter={30}
      width={900}
      items={formattedData}
      renderItem={item => (
        <Contribution
          rank={item.index}
          view="PROJECT"
          name={item.projectId || ''}
          count={item.total}
          data={item.data}
          selected={selectedProject === item.projectId}
          onClick={() => setSelectedProject(selectedProject === item.projectId ? null : item.projectId || null)}
        />
      )}
      keyOf={item => item.projectId}
    />
  )
}

export const UserInsights: React.FC = () => {
  const [today] = useState(new Date().setHours(0, 0, 0, 0))
  const [selectedDate, setSelectedDate] = useState(today)
  const [activityType, setActivityType] = useState<ACTIVITY_TYPES_ENUM>(ACTIVITY_TYPES_ENUM.ALL)
  const [selectedProject, setSelectedProject] = useState(null)
  const { currentUserInfo } = useAppStore()
  const userHeatMapProps = {
    today,
    selectedDate,
    setSelectedDate,
    activityType,
    setActivityType,
    currentUserId: currentUserInfo?.uuid,
    selectedProject
  }
  const userOveriewProps = {
    selectedDate,
    activityType,
    currentUserId: currentUserInfo?.uuid,
    selectedProject
  }

  const userContributionProps = {
    selectedDate,
    currentUserInfo,
    selectedProject,
    setSelectedProject,
    today,
    activityType
  }

  return (
    <Layout.Vertical className={css.userInsights}>
      <UserHeader />
      <UserHeatMap {...userHeatMapProps} />
      <Container padding={{ left: 'medium', right: 'medium' }}>
        <Tabs id="user-insights" defaultSelectedTabId="overview" className={css.tabs}>
          <Tab
            id="overview"
            title="Overview"
            panel={<UserOverView {...userOveriewProps} />}
            panelClassName={css.panel}
          />
          <Tab
            id="contributions"
            title="Contributions"
            panel={<UserContributions {...userContributionProps} />}
            panelClassName={css.panel}
          />
          <Layout.Horizontal className={css.project}>
            {selectedProject ? (
              <div dangerouslySetInnerHTML={{ __html: `Showing data for project: <b>${selectedProject}</b>` }} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: `Showing data for <b>all projects</b>` }} />
            )}
          </Layout.Horizontal>
        </Tabs>
      </Container>
    </Layout.Vertical>
  )
}
