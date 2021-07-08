import React from 'react'
import { Layout, Card, Text, Container, FlexExpander, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import type { PerspectiveTrendStats, Maybe } from 'services/ce/services'

import css from './PerspectiveSummary.module.scss'

const StatsTrendRenderer: React.FC<{ val: number }> = ({ val }) => {
  if (+val === 0) {
    return null
  }
  if (val < 0) {
    return (
      <Text
        iconProps={{
          color: 'red500'
        }}
        icon="caret-down"
        color="red500"
      >
        {val * -1}
      </Text>
    )
  }
  return (
    <Text
      iconProps={{
        color: 'green500'
      }}
      icon="caret-up"
      color="green500"
    >
      {val}
    </Text>
  )
}

interface PerspectiveSummaryProps {
  fetching: boolean
  data: Maybe<PerspectiveTrendStats> | undefined
  errors?: any[] | null
}

const PerspectiveSummary: React.FC<PerspectiveSummaryProps> = ({ fetching, data }) => {
  return (
    <Layout.Horizontal margin="medium">
      <Card elevation={1} interactive={false}>
        <Container className={cx(css.mainCard, { [css.loadingContainer]: fetching })}>
          {fetching ? (
            <Icon name="spinner" color="blue500" size={30} />
          ) : data?.cost ? (
            <>
              <Text color="grey500" font="small">
                {data.cost.statsLabel}
              </Text>
              <Layout.Horizontal
                style={{
                  alignItems: 'center'
                }}
                margin={{
                  top: 'small',
                  bottom: 'small'
                }}
              >
                <Text color="black" font="medium">
                  {data.cost.statsValue}
                </Text>
                <FlexExpander />
                <StatsTrendRenderer val={data.cost.statsTrend} />
              </Layout.Horizontal>

              <Text color="grey400" font="xsmall">
                {data.cost.statsDescription}
              </Text>
            </>
          ) : null}
        </Container>
      </Card>
    </Layout.Horizontal>
  )
}

export default PerspectiveSummary
