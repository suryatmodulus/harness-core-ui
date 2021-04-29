import { Container, Text } from '@wings-software/uicore'
import React from 'react'
import type { RecommendationItem } from '@ce/pages/recommendationDetails/RecommendationDetailsPage'

import { getCPUValueInReadableForm, getMemValueInReadableForm } from '@ce/utils/formatResourceValue'
import { convertNumberToFixedDecimalPlaces } from '@ce/utils/convertNumberToFixedDecimalPlaces'
import { useStrings } from 'framework/strings'

import CEChart from '../CEChart/CEChart'
import css from './RecommendationHistogram.module.scss'

export enum ChartColors {
  'BLUE' = '#25a6f7',
  'GREEN' = '#38d168',
  'GREY' = '#c4c4c4',
  'GREEN_300' = '#d7f4e0'
}

interface RecommendationChartProps {
  histogramData: RecommendationItem
  onCPUChartLoad: (chart: Highcharts.Chart) => void
  onMemoryChartLoad: (chart: Highcharts.Chart) => void
  memReqVal: number
  cpuReqVal: number
  memLimitVal: number
  selectedRecommendation: string
}

const RecommendationHistogram: React.FC<RecommendationChartProps> = props => {
  const { cpuReqVal, memReqVal, memLimitVal, onMemoryChartLoad, onCPUChartLoad, histogramData } = props

  const { getString } = useStrings()

  const cpuData = histogramData.cpuHistogram.bucketWeights.map((bucketWeight, index) => {
    const { firstBucketSize, growthRatio, minBucket } = histogramData.cpuHistogram
    const currentIdx = index + minBucket
    return [
      convertNumberToFixedDecimalPlaces(
        (firstBucketSize * (Math.pow(1 + Number(growthRatio), currentIdx + 1) - 1)) / Number(growthRatio),
        2
      ),
      Number(bucketWeight.toFixed(2))
    ]
  })

  const formattedCPUData = [[0, 0], ...cpuData]

  const memData = histogramData.memoryHistogram.bucketWeights.map((bucketWeight, index) => {
    const { firstBucketSize, growthRatio, minBucket } = histogramData.memoryHistogram
    const currentIdx = index + minBucket

    return [
      convertNumberToFixedDecimalPlaces(
        (firstBucketSize * (Math.pow(1 + Number(growthRatio), currentIdx + 1) - 1)) / Number(growthRatio),
        2
      ),
      Number(bucketWeight.toFixed(2))
    ]
  })

  const formattedmemData = [[0, 0], ...memData]

  const plotOptions = {
    series: {
      connectNulls: true,
      animation: {
        duration: 500
      }
    },
    column: {
      borderColor: undefined,
      pointPadding: 0,
      borderWidth: 0,
      groupPadding: 0,
      shadow: false
    },
    legend: {
      enabled: false
    }
  }

  return (
    <Container className={css.chartContainer}>
      {/* <label className={css.sampleText}>Number of Samples</label> */}
      <Container>
        <Text padding="xsmall" font={{ size: 'normal', align: 'center' }} background="blue200" color="blue500">
          {getString('delegate.delegateCPU')}
        </Text>
        <CEChart
          options={{
            tooltip: {
              formatter: function () {
                return `CPU: ${getCPUValueInReadableForm(this.x)}`
              }
            },
            series: [
              {
                showInLegend: false,
                pointPlacement: -0.5,
                type: 'column',
                data: formattedCPUData,
                zoneAxis: 'x',
                name: getString('delegate.delegateCPU'),
                zones: [
                  {
                    value:
                      convertNumberToFixedDecimalPlaces(histogramData?.cpuHistogram.precomputed[cpuReqVal], 2) + 0.001,
                    color: ChartColors.BLUE
                  },
                  {
                    color: ChartColors.GREY
                  }
                ]
              }
            ],
            chart: {
              height: 280,
              type: 'column',
              events: {
                load() {
                  onCPUChartLoad(this)
                }
              }
            },
            plotOptions,
            xAxis: {
              crosshair: true,
              title: {
                text: getString('ce.recommendation.recommendationChart.cpuPlaceholder')
              },
              plotLines: [
                {
                  zIndex: 5,
                  color: ChartColors.BLUE,
                  width: 3,
                  value:
                    convertNumberToFixedDecimalPlaces(histogramData?.cpuHistogram.precomputed[cpuReqVal], 2) + 0.001
                }
              ]
            },
            yAxis: {
              endOnTick: true,
              title: {
                text: getString('ce.recommendation.recommendationChart.noOfSamples')
              },
              labels: {
                formatter: function () {
                  return `${this['value']}`
                }
              }
            }
          }}
        />
      </Container>
      <Container>
        <Text padding="xsmall" font={{ size: 'normal', align: 'center' }} background="blue200" color="blue500">
          {getString('ce.recommendation.recommendationChart.memoryLabel')}
        </Text>
        <CEChart
          options={{
            tooltip: {
              formatter: function () {
                return `Memory: ${getMemValueInReadableForm(this.x)}`
              }
            },
            series: [
              {
                showInLegend: false,
                pointPlacement: -0.5,
                type: 'column',
                name: getString('ce.recommendation.recommendationChart.memoryLabelRegular'),
                data: formattedmemData,
                zoneAxis: 'x',
                zones: [
                  {
                    value:
                      convertNumberToFixedDecimalPlaces(histogramData?.memoryHistogram.precomputed[memReqVal], 2) + 1,
                    color: ChartColors.BLUE
                  },
                  {
                    value:
                      convertNumberToFixedDecimalPlaces(histogramData?.memoryHistogram.precomputed[memLimitVal], 2) + 1,
                    color: ChartColors.GREEN
                  },
                  {
                    color: ChartColors.GREY
                  }
                ]
              }
            ],
            chart: {
              height: 280,
              type: 'column',
              events: {
                load() {
                  onMemoryChartLoad(this)
                }
              }
            },
            plotOptions,
            xAxis: {
              title: {
                text: getString('ce.recommendation.recommendationChart.memoryUsagePlaceholder')
              },
              crosshair: true,
              plotLines: [
                {
                  zIndex: 5,
                  color: ChartColors.BLUE,
                  width: 3,
                  value: convertNumberToFixedDecimalPlaces(histogramData?.memoryHistogram.precomputed[memReqVal], 2) + 1
                },
                {
                  zIndex: 5,
                  color: ChartColors.GREEN,
                  width: 3,
                  value:
                    convertNumberToFixedDecimalPlaces(histogramData?.memoryHistogram.precomputed[memLimitVal], 2) + 1
                }
              ],
              plotBands: [
                {
                  color: ChartColors.GREEN_300,
                  from: 0,
                  to: histogramData?.memoryHistogram.precomputed[memLimitVal]
                }
              ]
            },
            yAxis: {
              endOnTick: true,
              title: {
                text: getString('ce.recommendation.recommendationChart.noOfSamples')
              },
              labels: {
                formatter: function () {
                  return `${this['value']}`
                }
              }
            }
          }}
        />
      </Container>
    </Container>
  )
}

export default React.memo(RecommendationHistogram, (prevProps, nextProps) => {
  return prevProps.selectedRecommendation === nextProps.selectedRecommendation
})
