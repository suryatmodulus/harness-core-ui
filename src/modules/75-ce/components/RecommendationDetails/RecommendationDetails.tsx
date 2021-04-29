import React, { useState, useRef } from 'react'
import { Slider, MultiSlider, Intent } from '@blueprintjs/core'
import { Container, Layout, Text } from '@wings-software/uicore'
import { MonacoDiffEditor } from 'react-monaco-editor'
import cx from 'classnames'
import { useStrings } from 'framework/strings'

import { convertNumberToFixedDecimalPlaces } from '@ce/utils/convertNumberToFixedDecimalPlaces'
import { getCPUValueInReadableForm, getMemValueInReadableForm } from '@ce/utils/formatResourceValue'
import type { RecommendationItem } from '@ce/pages/recommendationDetails/RecommendationDetailsPage'

import RecommendationHistogram from '../RecommendationHistogram/RecommendationHistogram'
// import histogramData from '../RecommendationHistogram/MockData.json'
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
          padding="xsmall"
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
          padding="xsmall"
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
}

const RecommendationDetails: React.FC<RecommendationDetailsProps> = ({ histogramData }) => {
  const [cpuReqVal, setCPUReqVal] = useState(50)
  const [memReqVal, setMemReqVal] = useState(50)
  const [memLimitVal, setMemLimitVal] = useState(95)

  const { getString } = useStrings()

  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommedationType>(
    RecommedationType.CostOptimized
  )

  const cpuChartRef = useRef<Highcharts.Chart>()
  const memoryChartRef = useRef<Highcharts.Chart>()

  const setCPUChartRef: (chart: Highcharts.Chart) => void = chart => {
    cpuChartRef.current = chart
  }

  const setMemoryChartRef: (chart: Highcharts.Chart) => void = chart => {
    memoryChartRef.current = chart
  }

  const updateCPUChart: (val: number) => void = val => {
    const {
      cpuHistogram: { precomputed }
    } = histogramData
    setCPUReqVal(val)
    const value = precomputed[val]
    selectedRecommendation !== RecommedationType.Custom && setSelectedRecommendation(RecommedationType.Custom)

    cpuChartRef.current?.update({
      xAxis: {
        plotLines: [
          {
            zIndex: 5,
            color: ChartColors.BLUE,
            width: 3,
            value: convertNumberToFixedDecimalPlaces(value, 2) + 0.0001
          }
        ]
      }
    })
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

    selectedRecommendation !== RecommedationType.Custom && setSelectedRecommendation(RecommedationType.Custom)

    const reqValHistogram = precomputed[reqVal]
    const limitValHistogram = precomputed[limitVal]

    memoryChartRef.current?.update({
      xAxis: {
        plotLines: [
          {
            zIndex: 5,
            color: ChartColors.BLUE,
            width: 3,
            value: convertNumberToFixedDecimalPlaces(reqValHistogram, 2) + 1
          },
          {
            zIndex: 5,
            color: ChartColors.GREEN,
            width: 3,
            value: convertNumberToFixedDecimalPlaces(limitValHistogram, 2) + 1
          }
        ],
        plotBands: [
          {
            color: ChartColors.GREEN_300,
            from: 0,
            to: convertNumberToFixedDecimalPlaces(limitValHistogram, 2) + 1
          }
        ]
      }
    })
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
          <div className={css.heading}>{getString('ce.recommendation.detailsPage.currentResources')}</div>
          <div className={css.heading}>{getString('ce.recommendation.detailsPage.recommendedResources')}</div>
        </section>

        <div className={css.diff}>
          <MonacoDiffEditor
            width="100%"
            height="100%"
            language="yaml"
            original={`sample`}
            value={`limits:\n  memory: ${getMemValueInReadableForm(
              histogramData?.memoryHistogram.precomputed[memLimitVal]
            )}\nrequests:\n  memory: ${getMemValueInReadableForm(
              histogramData?.memoryHistogram.precomputed[memReqVal]
            )}\n  cpu: ${getCPUValueInReadableForm(histogramData?.cpuHistogram.precomputed[cpuReqVal])}\n`}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              lineNumbers: 'off',
              renderIndentGuides: false,
              scrollbar: {
                useShadows: false,
                horizontal: 'auto',
                verticalScrollbarSize: 5,
                horizontalScrollbarSize: 5
              },
              scrollBeyondLastLine: false
            }}
          />
        </div>
      </section>
      <Container className={css.timeframeContainer}>
        <Text padding="xsmall" font={{ size: 'normal', align: 'center' }} background="grey100">
          {getString('ce.recommendation.detailsPage.timeChangeText')}
        </Text>
      </Container>
      <Container className={css.histogramContainer}>
        <RecommendationHistogram
          histogramData={histogramData}
          selectedRecommendation={selectedRecommendation}
          cpuReqVal={cpuReqVal}
          memReqVal={memReqVal}
          memLimitVal={memLimitVal}
          onCPUChartLoad={setCPUChartRef}
          onMemoryChartLoad={setMemoryChartRef}
        />
      </Container>

      <Container className={css.sliderContainer}>
        <Slider min={0} max={100} stepSize={1} labelStepSize={25} onChange={updateCPUChart} value={cpuReqVal} />

        <MultiSlider min={0} max={100} stepSize={1} labelStepSize={25} onChange={updateMemoryChart}>
          <MultiSlider.Handle className="request-slider" value={memReqVal} type="full" intentBefore={Intent.PRIMARY} />
          <MultiSlider.Handle
            className={css.limitHandle}
            value={memLimitVal}
            type="full"
            intentBefore={Intent.SUCCESS}
          />
        </MultiSlider>
        <Text font={{ align: 'center' }}>{getString('ce.recommendation.detailsPage.percentileOfReqAndLimit')}</Text>
      </Container>
    </Container>
  )
}

export default RecommendationDetails
