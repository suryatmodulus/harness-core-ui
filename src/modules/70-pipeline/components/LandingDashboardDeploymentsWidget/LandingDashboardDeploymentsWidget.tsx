import React, { useMemo, useState } from 'react'
import { Card, FontVariation, Text } from '@wings-software/uicore' // Layout
import { useParams } from 'react-router'
import { useStrings } from 'framework/strings'
// import { useLandingDashboardContext } from '@dashboards/pages/LandingDashboardPage/LandingDashboardContext'
import { ExecutionsChart } from '@pipeline/components/Dashboards/BuildExecutionsChart/BuildExecutionsChart'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetDeploymentExecution } from 'services/cd-ng'
import { useErrorHandler } from '@pipeline/components/Dashboards/shared'
// import GlanceCard from '@common/components/GlanceCard/GlanceCard'
// import TimeRangeSelect from '../TimeRangeSelect/TimeRangeSelect'

// import css from './LandingDashboardDeploymentsWidget.module.scss'

const LandingDashboardDeploymentsWidget: React.FC = () => {
  const { getString } = useStrings()
  // const { selectedTimeRange } = useLandingDashboardContext()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [range, setRange] = useState([Date.now() - 30 * 24 * 60 * 60000, Date.now()])

  const { data, loading, error } = useGetDeploymentExecution({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier: projectIdentifier || 'venkat',
      orgIdentifier: orgIdentifier || 'default',
      startTime: range[0],
      endTime: range[1]

      // routingId: zEaak-FLS425IEO7OLzMUg
      // accountIdentifier: zEaak-FLS425IEO7OLzMUg
      // projectIdentifier: venkat
      // orgIdentifier: default
      // startTime: 1627812224809
      // endTime: 1630404224809
    }
  })

  useErrorHandler(error)

  const chartData = useMemo(() => {
    if (data?.data?.executionDeploymentList?.length) {
      return data.data.executionDeploymentList.map(val => ({
        time: val.time,
        success: val.deployments!.success,
        failed: val.deployments!.failure
      }))
    }
  }, [data])

  return (
    <div style={{ position: 'relative' }}>
      <Card style={{ width: '100%' }}>
        <Text font={{ variation: FontVariation.CARD_TITLE }}>
          Deployments, Failure Rate and Deployment Frequency will come here.
        </Text>
        <ExecutionsChart
          titleText={getString('pipeline.dashboards.buildExecutions')}
          data={chartData}
          loading={loading}
          range={range}
          onRangeChange={setRange}
          yAxisTitle="# of Deployments"
          successColor="#00ade4" // "var(--ci-color-blue-400)"
        />
      </Card>
    </div>
  )
}

export default LandingDashboardDeploymentsWidget
