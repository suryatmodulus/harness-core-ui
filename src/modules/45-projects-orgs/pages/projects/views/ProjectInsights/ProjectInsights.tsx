import * as React from 'react'
import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import CalendarHeatmap from 'react-calendar-heatmap'
import { Color, Layout, Text } from '@wings-software/uicore'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './ProjectInsights.module.scss'

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
}> = ({ today, selectedDate, setSelectedDate }) => {
  const end = today
  const start = end - 15552000000 // 6 months back

  const values = useMemo(() => {
    const currValues = []
    let currDate = start
    while (currDate <= end) {
      currValues.push({
        date: currDate,
        count: currDate > end - 2592000000 ? parseInt(`${Math.random() * 1000}`, 10) : 0
      })
      currDate += 86400000 // increment by a day
    }
    return currValues
  }, [])

  const large = values.reduce((prev, curr) => (curr && prev.count < curr.count ? curr : prev)).count

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
    <Layout.Horizontal width={'100%'} height={300} margin={{ top: 'medium' }}>
      <CalendarHeatmap
        startDate={start}
        endDate={end}
        values={values}
        classForValue={classForValue}
        showWeekdayLabels
        onClick={(value: any) => setSelectedDate(value?.date as number)}
      />
    </Layout.Horizontal>
  )
}

const ProjectHistory: React.FC<{ selectedDate: number }> = ({ selectedDate }) => {
  return <Text>{selectedDate}</Text>
}

export const ProjectInsights: React.FC = () => {
  const [today] = useState(new Date().setHours(0, 0, 0, 0))
  const [selectedDate, setSelectedDate] = useState(today)
  return (
    <Layout.Vertical>
      <ProjectHeader />
      <ProjectHeatMap today={today} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <ProjectHistory selectedDate={selectedDate} />
    </Layout.Vertical>
  )
}
