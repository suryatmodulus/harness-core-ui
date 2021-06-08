import * as React from 'react'
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

const ProjectHeatMap = () => {
  const end = Date.now()
  const start = end - 15552000000 // 6 months back
  const values = []

  let currDate = start
  while (currDate < end) {
    values.push({
      date: currDate,
      count: parseInt(`${Math.random() * 1000}`, 10)
    })
    currDate += 86400000 // increment by a day
  }

  const small = values.reduce((prev, curr) => (curr && prev.count > curr.count ? curr : prev)).count
  const large = values.reduce((prev, curr) => (curr && prev.count < curr.count ? curr : prev)).count

  const classForValue = (value: any) => {
    if (!value) {
      return 'color-empty'
    }
    const colorKey = 1 + parseInt(`${(value.count * 10) / large}`)
    return `color-scale-${colorKey}`
  }
  return (
    <Layout.Horizontal width={'100%'} height={300}>
      <CalendarHeatmap
        startDate={start}
        endDate={end}
        values={values}
        classForValue={classForValue}
        showWeekdayLabels
      />
    </Layout.Horizontal>
  )
}

export const ProjectInsights: React.FC = () => {
  return (
    <Layout.Vertical>
      <ProjectHeader />
      <ProjectHeatMap />
    </Layout.Vertical>
  )
}
