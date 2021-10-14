import React from 'react'
import { Card, Color, Icon, IconName, Layout } from '@wings-software/uicore'
import GlanceCard, { GlanceCardProps } from '@common/components/GlanceCard/GlanceCard'

interface OverviewGlanceCardsProps {
  range: Array<number>
}

const mockProjectCardData = {
  title: 'Projects',
  iconName: 'nav-project' as IconName,
  iconSize: 16,
  number: 48,
  delta: '+1%',
  intent: 'success' as GlanceCardProps['intent'],
  href: '/'
}

const mockEnvCardData = {
  title: 'Environments',
  iconName: 'infrastructure' as IconName,
  number: 63,
  delta: '-6%',
  intent: 'danger' as GlanceCardProps['intent']
}

const mockServicesCardData = {
  title: 'Services',
  iconName: 'services' as IconName,
  number: 6,
  delta: '6',
  intent: 'success' as GlanceCardProps['intent'],
  href: '/'
}

const mockPipelinesCardData = {
  title: 'Pipelines',
  iconName: 'pipeline' as IconName,
  iconSize: 38,
  number: 460,
  delta: '-6%',
  intent: 'danger' as GlanceCardProps['intent']
}

const renderGlanceCard = (loading: boolean, data: GlanceCardProps): JSX.Element => {
  return loading ? (
    <Card style={{ height: '248px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
    </Card>
  ) : (
    <GlanceCard {...data} />
  )
}

const OverviewGlanceCards: React.FC<OverviewGlanceCardsProps> = () => {
  return (
    <Layout.Horizontal spacing="large">
      <Layout.Vertical spacing="large">
        {renderGlanceCard(false, mockProjectCardData)}
        {renderGlanceCard(false, mockEnvCardData)}
      </Layout.Vertical>
      <Layout.Vertical spacing="large">
        {renderGlanceCard(false, mockServicesCardData)}
        {renderGlanceCard(false, mockPipelinesCardData)}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default OverviewGlanceCards
