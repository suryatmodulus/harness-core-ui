import React, { useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { Container } from '@wings-software/uicore'
import { chartOptions, mapRisk } from './ClusterChart.utils'
import type { ClusterChartProps } from './ClusterChart.types'

export default function ClusterChart({ data }: ClusterChartProps): JSX.Element {
  const chartConfig = useMemo(() => {
    return chartOptions([
      {
        type: 'scatter',
        marker: {
          radius: 8,
          symbol: 'circle'
        },
        data: data.map(val =>
          Object.assign(
            {},
            {
              x: val.x,
              y: val.y
            },
            mapRisk(val.risk)
          )
        )
      }
    ])
  }, [data])
  return (
    <Container padding="medium">
      <HighchartsReact highcharts={Highcharts} options={chartConfig} />
    </Container>
  )
}
