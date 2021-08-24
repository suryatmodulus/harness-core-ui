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
          color: 'green500'
        }}
        icon="caret-down"
        color="green500"
      >
        {`${val * -1}%`}
      </Text>
    )
  }
  return (
    <Text
      iconProps={{
        color: 'red500'
      }}
      icon="caret-up"
      color="red500"
    >
      {`${val}%`}
    </Text>
  )
}

interface CostCardProps {
  fetching: boolean
  statsLabel: string | undefined
  statsValue: string | undefined
  statsTrend: any
  statsDescription: string | undefined
  isEmpty: boolean
}

const CostCard: (val: CostCardProps) => JSX.Element = ({
  fetching,
  statsLabel,
  statsValue,
  statsTrend,
  statsDescription,
  isEmpty
}) => {
  return (
    <Card elevation={1} interactive={false}>
      <Container className={cx(css.mainCard, { [css.loadingContainer]: fetching })}>
        {fetching ? (
          <Icon name="spinner" color="blue500" size={30} />
        ) : !isEmpty ? (
          <>
            <Text color="grey500" font="small">
              {statsLabel}
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
                {statsValue}
              </Text>
              <FlexExpander />
              <StatsTrendRenderer val={statsTrend} />
            </Layout.Horizontal>

            <Text color="grey400" font="xsmall">
              {statsDescription}
            </Text>
          </>
        ) : null}
      </Container>
    </Card>
  )
}

interface PerspectiveSummaryProps {
  fetching: boolean
  data: Maybe<PerspectiveTrendStats> | undefined
  forecastedCostData: Maybe<PerspectiveTrendStats> | undefined
  errors?: any[] | null
}

const PerspectiveSummary: React.FC<PerspectiveSummaryProps> = ({ fetching, data, forecastedCostData }) => {
  return (
    <Layout.Horizontal margin="xlarge" spacing="large">
      <CostCard
        fetching={fetching}
        statsLabel={data?.cost?.statsLabel}
        statsDescription={data?.cost?.statsDescription}
        statsTrend={data?.cost?.statsTrend}
        statsValue={data?.cost?.statsValue}
        isEmpty={!data?.cost}
      />
      <CostCard
        fetching={fetching}
        statsLabel={forecastedCostData?.cost?.statsLabel}
        statsDescription={forecastedCostData?.cost?.statsDescription}
        statsTrend={forecastedCostData?.cost?.statsTrend}
        statsValue={forecastedCostData?.cost?.statsValue}
        isEmpty={!forecastedCostData?.cost}
      />
    </Layout.Horizontal>
  )
}

export default PerspectiveSummary
