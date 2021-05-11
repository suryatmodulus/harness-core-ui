import React, { useState, useRef, useEffect } from 'react'
import { Container, Layout, Text, Button } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'

import { convertNumberToFixedDecimalPlaces } from '@ce/utils/convertNumberToFixedDecimalPlaces'
import { getCPUValueInReadableForm, getMemValueInReadableForm } from '@ce/utils/formatResourceValue'
import type { RecommendationItem } from '@ce/types'
import type { ResourceObject } from '@ce/types'

import RecommendationDiffViewer from '../RecommendationDiffViewer/RecommendationDiffViewer'
import RecommendationHistogram, { CustomHighcharts } from '../RecommendationHistogram/RecommendationHistogram'
import limitLegend from './images/limit-legend.svg'
import requestLegend from './images/request-legend.svg'
import css from './RecommendationDetails.module.scss'

interface RecommendationTabsProps {
  selectedRecommendation: RecommedationType
  setSelectedRecommendation: React.Dispatch<React.SetStateAction<RecommedationType>>
  setCPUReqVal: React.Dispatch<React.SetStateAction<number>>
  setMemReqVal: React.Dispatch<React.SetStateAction<number>>
  setMemLimitVal: React.Dispatch<React.SetStateAction<number>>
}

const RecommendationTabs: React.FC<RecommendationTabsProps> = ({
  selectedRecommendation,
  setSelectedRecommendation,
  setCPUReqVal,
  setMemReqVal,
  setMemLimitVal
}) => {
  const { getString } = useStrings()

  return (
    <Container padding="small" className={css.recommendationTypeContainer}>
      <Layout.Horizontal className={css.recommendations}>
        <Text
          className={cx(css.recommendationTypeText, {
            [css.selectedTab]: selectedRecommendation === RecommedationType.CostOptimized
          })}
          onClick={() => {
            setCPUReqVal(50)
            setMemReqVal(50)
            setMemLimitVal(95)
            setSelectedRecommendation(RecommedationType.CostOptimized)
          }}
          font="small"
          padding="small"
        >
          {getString('ce.recommendation.detailsPage.costOptimized')}
        </Text>
        <Text
          onClick={() => {
            setCPUReqVal(95)
            setMemReqVal(95)
            setMemLimitVal(95)
            setSelectedRecommendation(RecommedationType.PerformanceOptimized)
          }}
          className={cx(css.recommendationTypeText, {
            [css.selectedTab]: selectedRecommendation === RecommedationType.PerformanceOptimized
          })}
          font="small"
          padding="small"
        >
          {getString('ce.recommendation.detailsPage.performanceOptimized')}
        </Text>
      </Layout.Horizontal>
    </Container>
  )
}

export enum RecommedationType {
  CostOptimized = 'Cost Optimized',
  PerformanceOptimized = 'Performance Optimized',
  Custom = 'Custom'
}

export enum ChartColors {
  'BLUE' = '#25a6f7',
  'GREEN' = '#38d168',
  'GREY' = '#c4c4c4',
  'GREEN_300' = '#d7f4e0'
}

interface RecommendationDetailsProps {
  histogramData: RecommendationItem
  currentResources: ResourceObject
}

const RecommendationDetails: React.FC<RecommendationDetailsProps> = ({ histogramData, currentResources }) => {
  const [cpuReqVal, setCPUReqVal] = useState(50)
  const [memReqVal, setMemReqVal] = useState(50)
  const [memLimitVal, setMemLimitVal] = useState(95)

  const [reRenderChart, setRerenderChart] = useState(false)

  const { getString } = useStrings()

  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommedationType>(
    RecommedationType.CostOptimized
  )

  const cpuChartRef = useRef<CustomHighcharts>()
  const memoryChartRef = useRef<CustomHighcharts>()

  const setCPUChartRef: (chart: CustomHighcharts) => void = chart => {
    cpuChartRef.current = chart
  }

  const setMemoryChartRef: (chart: CustomHighcharts) => void = chart => {
    memoryChartRef.current = chart
  }

  const resetReqLimitMarkers: (reqCpu: number, reqMem: number, limitMem: number) => void = (
    reqCpu,
    reqMem,
    limitMem
  ) => {
    cpuChartRef.current && cpuChartRef.current.rePlaceMarker(reqCpu)
    memoryChartRef.current && memoryChartRef.current.rePlaceMarker(reqMem, limitMem)
  }

  const resetToDefaultRecommendation: (recommendation: RecommedationType) => void = (
    recommendation: RecommedationType
  ) => {
    if (recommendation === RecommedationType.CostOptimized) {
      setCPUReqVal(50)
      setMemReqVal(50)
      setMemLimitVal(95)
      resetReqLimitMarkers(50, 50, 90)
    } else if (recommendation === RecommedationType.PerformanceOptimized) {
      setCPUReqVal(95)
      setMemReqVal(95)
      setMemLimitVal(95)
      resetReqLimitMarkers(95, 95, 95)
    }
    setRerenderChart(state => !state)
  }

  useEffect(() => {
    resetReqLimitMarkers(cpuReqVal, memReqVal, memLimitVal)
  }, [selectedRecommendation])

  const updateCPUChart: (val: number) => void = val => {
    const {
      cpuHistogram: { precomputed }
    } = histogramData
    setCPUReqVal(val)
    const value = precomputed[val]

    cpuChartRef.current?.series[0].update({
      type: 'column',
      zones: [
        {
          value: convertNumberToFixedDecimalPlaces(value, 2) + 0.0001,
          color: ChartColors.BLUE
        },
        {
          color: ChartColors.GREY
        }
      ]
    })
  }

  const updateMemoryChart: (val: [number, number]) => void = val => {
    const {
      memoryHistogram: { precomputed }
    } = histogramData
    const [reqVal, limitVal] = val
    setMemReqVal(reqVal)
    setMemLimitVal(limitVal)

    const reqValHistogram = precomputed[reqVal]
    const limitValHistogram = precomputed[limitVal]

    memoryChartRef.current?.series[0].update({
      type: 'column',
      zones: [
        {
          value: convertNumberToFixedDecimalPlaces(reqValHistogram, 2) + 1,
          color: ChartColors.BLUE
        },
        {
          value: convertNumberToFixedDecimalPlaces(limitValHistogram, 2) + 1,
          color: ChartColors.GREEN
        },
        {
          color: ChartColors.GREY
        }
      ]
    })
  }

  return (
    <Container className={css.mainContainer} background="white" padding="large">
      <RecommendationTabs
        selectedRecommendation={selectedRecommendation}
        setSelectedRecommendation={setSelectedRecommendation}
        setCPUReqVal={setCPUReqVal}
        setMemReqVal={setMemReqVal}
        setMemLimitVal={setMemLimitVal}
      />
      <section className={css.diffContainer}>
        <Text padding="xsmall" font={{ size: 'normal', align: 'center' }} background="grey100">
          {getString('ce.recommendation.detailsPage.resourceChanges')}
        </Text>
        <section className={css.diffHeader}>
          <Text className={css.heading} color="grey800" font={{ size: 'small', align: 'center' }}>
            {getString('ce.recommendation.detailsPage.currentResources')}
          </Text>
          <Text
            font={{ size: 'small', align: 'center' }}
            className={css.heading}
            color="grey800"
            style={{
              justifyContent: 'center'
            }}
            border={{
              left: true
            }}
            rightIcon="duplicate"
          >
            {getString('ce.recommendation.detailsPage.recommendedResources', {
              recommendationType: selectedRecommendation
            })}
          </Text>
        </section>

        <RecommendationDiffViewer
          recommendedResources={{
            limits: {
              memory: getMemValueInReadableForm(histogramData?.memoryHistogram.precomputed[memLimitVal])
            },
            requests: {
              memory: getMemValueInReadableForm(histogramData?.memoryHistogram.precomputed[memReqVal]),
              cpu: getCPUValueInReadableForm(histogramData?.cpuHistogram.precomputed[cpuReqVal])
            }
          }}
          currentResources={currentResources}
        />
      </section>
      <Container className={css.timeframeContainer}>
        <Text padding="xsmall" font={{ size: 'normal', align: 'center' }} background="grey100">
          {getString('ce.recommendation.detailsPage.timeChangeText')}
        </Text>
      </Container>
      <Container className={css.histogramContainer}>
        <RecommendationHistogram
          reRenderChart={reRenderChart}
          updateMemoryChart={updateMemoryChart}
          updateCPUChart={updateCPUChart}
          histogramData={histogramData}
          selectedRecommendation={selectedRecommendation}
          cpuReqVal={cpuReqVal}
          memReqVal={memReqVal}
          memLimitVal={memLimitVal}
          onCPUChartLoad={setCPUChartRef}
          onMemoryChartLoad={setMemoryChartRef}
        />
      </Container>
      <Container className={css.legendContainer}>
        <Container>
          <Button
            onClick={() => {
              resetToDefaultRecommendation(selectedRecommendation)
            }}
            icon="reset-icon"
            withoutBoxShadow={true}
            intent="none"
          >
            {getString('ce.recommendation.detailsPage.resetRecommendationText', {
              recommendationType: selectedRecommendation
            })}
          </Button>
        </Container>
        <img src={requestLegend} />
        <Text>{getString('ce.recommendation.detailsPage.reqPercentileLegendText')}</Text>

        <img src={limitLegend} />
        <Text>{getString('ce.recommendation.detailsPage.limitPercentileLegendText')}</Text>
      </Container>
    </Container>
  )
}

export default RecommendationDetails
