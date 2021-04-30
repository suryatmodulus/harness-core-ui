import React, { useMemo } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { Color, Layout, Text } from '@wings-software/uicore'
import { merge } from 'lodash-es'

interface PieChartItem {
  label: string
  value: number
  formattedValue?: string
  color?: Color
}

export interface PieChartProps {
  items: PieChartItem[]
  size: number
  options?: Highcharts.Options
  labelContainerStyles?: string
  labelStyles?: string
}

const getParsedOptions = (defaultOptions: Highcharts.Options, options: Highcharts.Options): Highcharts.Options =>
  merge(defaultOptions, options)

export const PieChart: React.FC<PieChartProps> = props => {
  const { size, items, options = {}, labelContainerStyles = '', labelStyles = '' } = props
  const defaultOptions: Highcharts.Options = useMemo(
    () => ({
      chart: {
        type: 'pie',
        width: size,
        height: size,
        margin: [0, 0, 0, 0],
        spacing: [0, 0, 0, 0]
      },
      title: {
        text: ''
      },
      credits: { enabled: false },
      tooltip: {
        useHTML: true,
        padding: 4,
        formatter: function () {
          const { point } = this as { point: { name: string; y: number } }
          return `${point.name}: ${point.y}`
        }
      },
      plotOptions: {
        pie: {
          size,
          dataLabels: {
            enabled: false
          },
          states: {
            hover: {
              halo: null
            }
          }
        }
      },
      series: [
        {
          type: 'pie',
          colorByPoint: true,
          data: items.map(item => ({
            name: item.label,
            y: item.value,
            color: item.color
          }))
        }
      ]
    }),
    [size, items]
  )
  const parsedOptions = useMemo(() => getParsedOptions(defaultOptions, options), [defaultOptions, options])
  return (
    <Layout.Horizontal flex={{ align: 'center-center' }} height={'100%'}>
      <Layout.Vertical
        flex={{ alignItems: 'flex-end' }}
        height="100%"
        padding={{ top: 'xsmall', bottom: 'xsmall', right: 'large' }}
        className={labelContainerStyles}
      >
        {items.map(({ label, formattedValue, value }) => (
          <Text font={{ size: 'small' }} color={Color.GREY_500} className={labelStyles} key={label}>{`${label} (${
            formattedValue ? formattedValue : value
          })`}</Text>
        ))}
      </Layout.Vertical>
      <HighchartsReact highcharts={Highcharts} options={parsedOptions}></HighchartsReact>
    </Layout.Horizontal>
  )
}
