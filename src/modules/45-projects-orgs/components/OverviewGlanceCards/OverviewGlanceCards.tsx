import React from 'react'
import { Card, Color, Container, Icon, Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import GlanceCard from '@common/components/GlanceCard/GlanceCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetCounts } from 'services/dashboard-service'

interface OverviewGlanceCardsProps {
  range: Array<number>
}

const renderGlanceCard = (loading: boolean, data: Record<string, string | number | boolean>): JSX.Element => {
  console.log('data in renderGlanceCard', data)
  return loading ? (
    <Card style={{ height: '248px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
    </Card>
  ) : (
    <GlanceCard
      title="Projects"
      iconName="nav-project"
      iconSize={16}
      number={48}
      delta="+1%"
      styling
      intent="success"
      href={'/'}
    />
  )
}

const OverviewGlanceCards: React.FC<OverviewGlanceCardsProps> = props => {
  const { accountId } = useParams<ProjectPathProps>()
  const {
    data: countResponse,
    loading,
    error: countError,
    refetch: countRefetch
  } = useGetCounts({
    queryParams: {
      accountIdentifier: accountId,
      startTime: props.range[0],
      endTime: props.range[1]
    }
  })

  const mockCardData = {
    title: 'Projects',
    iconName: 'nav-project',
    iconSize: 16,
    number: 48,
    delta: '+1%',
    intent: 'success',
    href: '/'
  }

  return (
    <Layout.Horizontal spacing="large">
      <Layout.Vertical spacing="large">
        {renderGlanceCard(loading, mockCardData)}
        <GlanceCard title="Environments" iconName="infrastructure" number={63} delta="-6%" intent="danger" />
      </Layout.Vertical>
      <Layout.Vertical spacing="large">
        <GlanceCard title="Services" iconName="services" number={6} delta="6" intent="success" href={'/'} />
        <GlanceCard title="Pipelines" iconName="pipeline" iconSize={38} number={460} delta="-6" intent="danger" />
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default OverviewGlanceCards
