import React, { useEffect, useState } from 'react'
import { Card, Color, Icon, IconName, Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import GlanceCard, { GlanceCardProps } from '@common/components/GlanceCard/GlanceCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CountChangeDetails, useGetCounts } from 'services/dashboard-service'
import { TimeRangeToDays, useLandingDashboardContext } from '@common/factories/LandingDashboardContext'

enum OverviewGalanceCard {
  PROJECT = 'PROJECT',
  SERVICES = 'SERVICES',
  ENV = 'ENV',
  PIPELINES = 'PIPELINES'
}

const getDataForCard = (
  cardType: OverviewGalanceCard,
  countDetails: CountChangeDetails | undefined
): GlanceCardProps => {
  if (!countDetails) {
    return {} as GlanceCardProps
  }

  const countChange = countDetails.countChangeAndCountChangeRateInfo?.countChange?.toString()
  switch (cardType) {
    case OverviewGalanceCard.PROJECT:
      return {
        title: 'Projects',
        iconName: 'nav-project' as IconName,
        iconSize: 16,
        number: countDetails.count,
        delta: countChange,
        intent: 'success' as GlanceCardProps['intent'],
        href: '/'
      }
    case OverviewGalanceCard.SERVICES:
      return {
        title: 'Services',
        iconName: 'services' as IconName,
        number: countDetails.count,
        delta: countChange,
        intent: 'success' as GlanceCardProps['intent'],
        href: '/'
      }
    case OverviewGalanceCard.ENV:
      return {
        title: 'Environments',
        iconName: 'infrastructure' as IconName,

        number: countDetails.count,
        delta: countChange,
        intent: 'success' as GlanceCardProps['intent'],
        href: '/'
      }
    case OverviewGalanceCard.PIPELINES:
      return {
        title: 'Pipelines',
        iconName: 'pipeline' as IconName,
        iconSize: 38,
        number: countDetails.count,
        delta: countChange,
        intent: 'success' as GlanceCardProps['intent'],
        href: '/'
      }
  }
}

const renderGlanceCard = (loading: boolean, data: GlanceCardProps): JSX.Element => {
  return loading ? (
    <Card style={{ height: '248px', width: '116px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
    </Card>
  ) : (
    <GlanceCard {...data} />
  )
}

const OverviewGlanceCards: React.FC = () => {
  const { accountId } = useParams<ProjectPathProps>()
  const { selectedTimeRange } = useLandingDashboardContext()
  const [range] = useState([Date.now() - TimeRangeToDays[selectedTimeRange] * 24 * 60 * 60000, Date.now()])
  const {
    data: countResponse,
    loading,
    error: countError,
    refetch
  } = useGetCounts({
    queryParams: {
      accountIdentifier: accountId,
      startTime: range[0],
      endTime: range[1]
    },
    lazy: true
  })

  useEffect(() => {
    refetch()
  }, [selectedTimeRange, refetch])

  console.log(countError)

  return (
    <Layout.Horizontal spacing="large">
      <Layout.Vertical spacing="large">
        {renderGlanceCard(
          loading,
          getDataForCard(OverviewGalanceCard.PROJECT, countResponse?.data?.response?.projectsCountDetail)
        )}
        {renderGlanceCard(
          loading,
          getDataForCard(OverviewGalanceCard.ENV, countResponse?.data?.response?.envCountDetail)
        )}
      </Layout.Vertical>
      <Layout.Vertical spacing="large">
        {renderGlanceCard(
          loading,
          getDataForCard(OverviewGalanceCard.SERVICES, countResponse?.data?.response?.servicesCountDetail)
        )}
        {renderGlanceCard(
          loading,
          getDataForCard(OverviewGalanceCard.PIPELINES, countResponse?.data?.response?.pipelinesCountDetail)
        )}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default OverviewGlanceCards
