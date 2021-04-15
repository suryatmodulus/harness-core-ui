import { Color, Layout, Text } from '@wings-software/uicore'
import React from 'react'
import css from './SpotvsODChart.module.scss'

interface SpotvsODChartProps {
  spotPercent: number
}
const SpotvsODChart: React.FC<SpotvsODChartProps> = props => {
  const ListSquares = (): JSX.Element => {
    return (
      <ul className={css.squares}>
        {Array.from(Array(100), (_, i) => {
          if (i < props.spotPercent) return <li key={i} data-level="1"></li>
          else return <li key={i} data-level="0"></li>
        })}
      </ul>
    )
  }
  return (
    <Layout.Horizontal spacing="xsmall">
      <div className={css.graph}>
        <ListSquares />
      </div>
      <Layout.Vertical spacing="medium" style={{ paddingTop: 'var(--spacing-medium)' }}>
        <Layout.Horizontal spacing="xsmall">
          <Text font="large" color={Color.BLUE_500}>
            {Math.round(props.spotPercent)}%
          </Text>
          <Text font="medium" color={Color.BLUE_500}>
            Spot
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal spacing="xsmall">
          <Text font="large" color={Color.AQUA_500}>
            {100 - Math.round(props.spotPercent)}%
          </Text>
          <Text font="medium" color={Color.AQUA_500}>
            On-demand
          </Text>
        </Layout.Horizontal>
        <Text font="medium" color={Color.GREY_300}>
          Spot vs On-demand <br />
          usage
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default SpotvsODChart
