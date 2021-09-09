import React, { useEffect, useMemo } from 'react'
import { Color, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { getRiskColorValue } from '@common/components/HeatMap/ColorUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetMonitoredServiceScoresFromServiceAndEnvironment } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { HealthScoreCardProps } from './HealthScoreCard.types'
import css from './HealthScoreCard.module.scss'

export default function HealthScoreCard(props: HealthScoreCardProps): JSX.Element {
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()
  const { serviceIdentifier, environmentIdentifier } = props
  const { getString } = useStrings()

  const healthScoreQueryParams = useMemo(() => {
    return {
      orgIdentifier,
      projectIdentifier,
      accountId,
      serviceIdentifier,
      environmentIdentifier
    }
  }, [accountId, environmentIdentifier, orgIdentifier, projectIdentifier, serviceIdentifier])

  const { data: healthScoreData, refetch: fetchHealthScore } = useGetMonitoredServiceScoresFromServiceAndEnvironment({
    lazy: true,
    queryParams: healthScoreQueryParams
  })

  useEffect(() => {
    if (serviceIdentifier && environmentIdentifier) {
      fetchHealthScore({ queryParams: healthScoreQueryParams })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceIdentifier, environmentIdentifier, healthScoreQueryParams])

  const { healthScore, color } = useMemo(() => {
    const { riskStatus: riskStatusData, healthScore: healthScoreValue = -2 } =
      healthScoreData?.data?.currentHealthScore || {}
    const colorData = getRiskColorValue(riskStatusData)
    return { healthScore: healthScoreValue, color: colorData }
  }, [healthScoreData?.data?.currentHealthScore])

  return (
    <>
      {healthScore !== null && healthScore > -1 ? (
        <Layout.Horizontal className={css.healthScoreCardContainer}>
          <div className={css.healthScoreCard} style={{ background: color }}>
            {healthScore}
          </div>
          <Text color={Color.BLACK} font={{ size: 'small' }}>
            {getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth')}
          </Text>
        </Layout.Horizontal>
      ) : null}
    </>
  )
}
