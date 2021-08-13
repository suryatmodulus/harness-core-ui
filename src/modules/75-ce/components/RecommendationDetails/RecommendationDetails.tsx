import React, { useState, useRef, useEffect } from 'react'
import { Container, Layout, Text, Button, Icon, Popover } from '@wings-software/uicore'
import copy from 'copy-to-clipboard'
import { PopoverInteractionKind, Position, Menu, MenuItem } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'

import { convertNumberToFixedDecimalPlaces } from '@ce/utils/convertNumberToFixedDecimalPlaces'
import {
  getCPUValueInReadableForm,
  getMemValueInReadableForm,
  getRecommendationYaml,
  getMemoryValueInGBFromExpression,
  getCPUValueInCPUFromExpression
} from '@ce/utils/formatResourceValue'
import type { RecommendationItem, TimeRangeValue } from '@ce/types'
import type { ResourceObject } from '@ce/types'

import { RecommendationType, ChartColors, ViewTimeRange } from './constants'
import RecommendationTabs from './RecommendationTabs'
import RecommendationDiffViewer from '../RecommendationDiffViewer/RecommendationDiffViewer'
import RecommendationHistogram, { CustomHighcharts } from '../RecommendationHistogram/RecommendationHistogram'
import limitLegend from './images/limit-legend.svg'
import requestLegend from './images/request-legend.svg'
import histogramImg from './images/histogram.gif'
import css from './RecommendationDetails.module.scss'

interface RecommendationDetailsProps {
  histogramData: RecommendationItem
  currentResources: ResourceObject
  timeRange: TimeRangeValue
  setTimeRange: React.Dispatch<React.SetStateAction<TimeRangeValue>>
}

const RecommendationDetails: React.FC<RecommendationDetailsProps> = ({
  histogramData,
  currentResources,
  timeRange,
  setTimeRange
}) => {
  const [cpuReqVal, setCPUReqVal] = useState(50)
  const [memReqVal, setMemReqVal] = useState(50)
  const [memLimitVal, setMemLimitVal] = useState(95)

  const { cpu: cpuCost, memory: memoryCost } = histogramData.containerRecommendation?.lastDayCost || {}

  const [reRenderChart, setRerenderChart] = useState(false)

  const { getString } = useStrings()

  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationType>(
    RecommendationType.CostOptimized
  )
  const currentCPUResource = getCPUValueInCPUFromExpression(currentResources.requests.cpu || 1)
  const currentMemResource = getMemoryValueInGBFromExpression(currentResources.requests.memory)

  const cpuReqValue = Number(histogramData?.cpuHistogram.precomputed[cpuReqVal])
  const memReqValue = Number(histogramData?.memoryHistogram.precomputed[memReqVal])
  const memLimitValue = Number(histogramData?.memoryHistogram.precomputed[memLimitVal])

  const perfCPUReqValue = Number(histogramData?.cpuHistogram.precomputed[95])
  const perfMemReqValue = Number(histogramData?.memoryHistogram.precomputed[95])

  const costOptimisedCPUReqValue = Number(histogramData?.cpuHistogram.precomputed[50])
  const costOptimisedMemReqValue = Number(histogramData?.memoryHistogram.precomputed[50])

  const isLastDayCostDefined = cpuCost && memoryCost

  const numCPUCost = Number(cpuCost)
  const numMemCost = Number(memoryCost)

  const currentSavings = isLastDayCostDefined
    ? (((currentCPUResource - getCPUValueInCPUFromExpression(cpuReqValue)) / currentCPUResource) * numCPUCost +
        ((currentMemResource - getMemoryValueInGBFromExpression(memReqValue)) / currentMemResource) * numMemCost) *
      30
    : -1

  const performanceOptimizedSavings = isLastDayCostDefined
    ? (((currentCPUResource - getCPUValueInCPUFromExpression(perfCPUReqValue)) / currentCPUResource) * numCPUCost +
        ((currentMemResource - getMemoryValueInGBFromExpression(perfMemReqValue)) / currentMemResource) * numMemCost) *
      30
    : -1

  const costOptimizedSavings = isLastDayCostDefined
    ? (((currentCPUResource - getCPUValueInCPUFromExpression(costOptimisedCPUReqValue)) / currentCPUResource) *
        numCPUCost +
        ((currentMemResource - getMemoryValueInGBFromExpression(costOptimisedMemReqValue)) / currentMemResource) *
          numMemCost) *
      30
    : -1

  const isCostOptimizedCustomized =
    selectedRecommendation === RecommendationType.CostOptimized && currentSavings !== costOptimizedSavings

  const isPerfOptimizedCustomized =
    selectedRecommendation === RecommendationType.PerformanceOptimized && currentSavings !== performanceOptimizedSavings

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

  const resetToDefaultRecommendation: (recommendation: RecommendationType) => void = (
    recommendation: RecommendationType
  ) => {
    if (recommendation === RecommendationType.CostOptimized) {
      setCPUReqVal(50)
      setMemReqVal(50)
      setMemLimitVal(95)
      resetReqLimitMarkers(50, 50, 90)
    } else if (recommendation === RecommendationType.PerformanceOptimized) {
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
        costOptimizedSavings={costOptimizedSavings}
        performanceOptimizedSavings={performanceOptimizedSavings}
        currentSavings={currentSavings}
        selectedRecommendation={selectedRecommendation}
        setSelectedRecommendation={setSelectedRecommendation}
        setCPUReqVal={setCPUReqVal}
        setMemReqVal={setMemReqVal}
        setMemLimitVal={setMemLimitVal}
        isPerfOptimizedCustomized={isPerfOptimizedCustomized}
        isCostOptimizedCustomized={isCostOptimizedCustomized}
      />
      <section className={css.diffContainer}>
        <Text padding="xsmall" font={{ size: 'normal', align: 'center' }} background="grey100">
          {getString('ce.recommendation.detailsPage.resourceChanges')}
        </Text>
        <section className={css.diffHeader}>
          <Text padding={{ left: 'small' }} className={css.heading} color="grey800" font={{ size: 'small' }}>
            {getString('ce.recommendation.detailsPage.currentResources')}
          </Text>

          <Layout.Horizontal
            border={{
              left: true
            }}
          >
            <Text
              padding={{ left: 'small' }}
              font={{ size: 'small' }}
              className={css.heading}
              color="grey800"
              style={{
                flex: 1
              }}
            >
              {getString('ce.recommendation.detailsPage.recommendedResources', {
                recommendationType: selectedRecommendation
              })}
            </Text>
            <Icon
              name="duplicate"
              color="primary5"
              onClick={() => {
                const yamlVal = getRecommendationYaml(cpuReqValue, memReqValue, memLimitValue)
                copy(yamlVal)
              }}
              className={css.copyIcon}
              size={13}
            />
          </Layout.Horizontal>
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
        <Layout.Horizontal
          background="grey100"
          style={{
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text
            margin={{
              right: 'xsmall'
            }}
          >
            {selectedRecommendation === RecommendationType.CostOptimized
              ? getString('ce.recommendation.detailsPage.costOptimizedCaps')
              : getString('ce.recommendation.detailsPage.performanceOptimizedCaps')}
          </Text>
          <Popover
            interactionKind={PopoverInteractionKind.HOVER}
            position={Position.BOTTOM_LEFT}
            usePortal={false}
            modifiers={{
              arrow: { enabled: false },
              flip: { enabled: true },
              keepTogether: { enabled: true },
              preventOverflow: { enabled: true }
            }}
            content={
              <Container padding="medium" className={css.histogram}>
                <Layout.Horizontal spacing="medium">
                  <img width="235" src={histogramImg} />
                  <Text>{getString('ce.recommendation.detailsPage.histogramTextDetails1')}</Text>
                </Layout.Horizontal>
                <Text
                  padding={{
                    top: 'small'
                  }}
                >
                  {getString('ce.recommendation.detailsPage.histogramTextDetails2')}
                </Text>
              </Container>
            }
          >
            <Text color="primary5" className={css.actionText}>
              {getString('ce.recommendation.detailsPage.histogramText')}
            </Text>
          </Popover>
          <Text padding="xsmall" font={{ size: 'normal', align: 'center' }}>
            {getString('ce.recommendation.detailsPage.timeChangeText')}
          </Text>
          <Popover
            position={Position.BOTTOM_LEFT}
            modifiers={{
              arrow: { enabled: false },
              flip: { enabled: true },
              keepTogether: { enabled: true },
              preventOverflow: { enabled: true }
            }}
            content={
              <Menu>
                {ViewTimeRange.map(viewTimeRange => (
                  <MenuItem
                    onClick={() => {
                      setTimeRange(viewTimeRange)
                    }}
                    text={viewTimeRange.label}
                    key={viewTimeRange.value}
                  />
                ))}
              </Menu>
            }
          >
            <Text
              color="primary5"
              rightIcon="caret-down"
              rightIconProps={{
                color: 'primary5'
              }}
              className={css.actionText}
            >
              {timeRange?.label}
            </Text>
          </Popover>
        </Layout.Horizontal>
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
          {isPerfOptimizedCustomized || isCostOptimizedCustomized ? (
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
          ) : null}
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
