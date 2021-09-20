import { Container, Layout, Text } from '@wings-software/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { StatsInfo } from 'services/ce/services'
import CostTrend from '@ce/common/CostTrend'
import { Card, Loader } from './OverviewPageLayout'
import css from './OverviewPage.module.scss'

interface SummaryProps {
  cost: StatsInfo
  fetching: boolean
  name: string
}

const OverviewSummary = (props: SummaryProps) => {
  const { cost, name, fetching } = props
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      <Card>
        {fetching ? (
          <Loader className={css.cardLoader} />
        ) : (
          <Layout.Vertical spacing="medium">
            <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
              <Container>
                <Text inline color="grey500" font="small" tooltipProps={{ dataTooltipId: `overviewSummary${name}` }}>
                  {cost.statsLabel}
                </Text>
              </Container>
              <CostTrend value={cost.statsTrend} />
            </Layout.Horizontal>
            <Text color="black" font="medium">
              {cost.statsValue || getString('na')}
            </Text>
          </Layout.Vertical>
        )}
      </Card>
    </Layout.Horizontal>
  )
}

export default OverviewSummary
