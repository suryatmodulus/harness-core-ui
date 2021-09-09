import React from 'react'
import { Card, FontVariation, Layout, Text } from '@wings-software/uicore'
import { useLandingDashboardContext } from '@common/factories/LandingDashboardContext'
import GlanceCard from '@common/components/GlanceCard/GlanceCard'
import TimeRangeSelect from '../TimeRangeSelect/TimeRangeSelect'

import css from './LandingDashboardSummaryWidget.module.scss'

const LandingDashboardSummaryWidget: React.FC = () => {
  const { selectedTimeRange } = useLandingDashboardContext()

  return (
    <div style={{ position: 'relative' }}>
      <TimeRangeSelect className={css.timeRangeSelect} />
      <Layout.Horizontal spacing="large">
        <Layout.Horizontal spacing="large">
          <Layout.Vertical spacing="large">
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
            <GlanceCard title="Environments" iconName="infrastructure" number={63} delta="-6%" intent="danger" />
          </Layout.Vertical>
          <Layout.Vertical spacing="large">
            <GlanceCard title="Services" iconName="services" number={6} delta="6" intent="success" href={'/'} />
            <GlanceCard title="Pipelines" iconName="pipeline" iconSize={38} number={460} delta="-6" intent="danger" />
          </Layout.Vertical>
        </Layout.Horizontal>
        <Card style={{ width: '100%' }}>
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.CARD_TITLE }}>Top Projects</Text>
            {selectedTimeRange}
          </Layout.Vertical>
        </Card>
      </Layout.Horizontal>
    </div>
  )
}

export default LandingDashboardSummaryWidget
