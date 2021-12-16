import React, { useState, useEffect } from 'react'
import Draggable from 'react-draggable'
import { Container, Layout, Text, Icon, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { SERVICES_CARDS } from '@common/constants/SubscriptionTypes'
import css from './TogglerBar.module.scss'

interface TogglerBarProps {
  height?: number
  width: number
  selectedValue?: number
  onSelected: (value: number) => void
  scale: number
  usages: UsageProps
  setSelectedCard: (card: SERVICES_CARDS) => void
}

export interface UsageProps {
  currentUsage: number
  actualUsage: number
  overUsage: number
  recommendUsage: number
}

interface LegendReturn {
  position: number
  legend: React.ReactElement
}

interface GetLegendsProps extends UsageProps {
  divi: number
  setSelectedCard: (card: SERVICES_CARDS) => void
  setToggleValue: (value: number) => void
}

function getLegends({
  currentUsage,
  actualUsage,
  overUsage,
  recommendUsage,
  divi,
  setToggleValue,
  setSelectedCard
}: GetLegendsProps): LegendReturn[] {
  const legendsReturn: LegendReturn[] = []
  const map = new Map<SERVICES_CARDS, number>()
  map.set(SERVICES_CARDS.ACTUAL_USAGE_CARD, actualUsage)
  map.set(SERVICES_CARDS.CURRENT_USAGE_CARD, currentUsage)
  map.set(SERVICES_CARDS.OVERUSE_USAGE_CARD, overUsage)
  map.set(SERVICES_CARDS.RECOMMENDATION_USAGE_CARD, recommendUsage)
  const sortedMap = new Map([...map.entries()].sort((a, b) => a[1] - b[1]))
  sortedMap.forEach((value, key) => {
    switch (key) {
      case SERVICES_CARDS.ACTUAL_USAGE_CARD: {
        legendsReturn.push({
          position: value * divi,
          legend: (
            <Icon
              className={css.legendIcon}
              name="symbol-circle"
              color={Color.GREEN_600}
              size={20}
              onClick={() => {
                setSelectedCard(SERVICES_CARDS.ACTUAL_USAGE_CARD)
                setToggleValue(actualUsage)
              }}
            />
          )
        })
        break
      }
      case SERVICES_CARDS.CURRENT_USAGE_CARD: {
        legendsReturn.push({
          position: value * divi,
          legend: (
            <Icon
              className={css.legendIcon}
              name="symbol-circle"
              color={Color.BLACK}
              size={20}
              onClick={() => {
                setSelectedCard(SERVICES_CARDS.CURRENT_USAGE_CARD)
                setToggleValue(currentUsage)
              }}
            />
          )
        })
        break
      }
      case SERVICES_CARDS.OVERUSE_USAGE_CARD: {
        legendsReturn.push({
          position: value * divi,
          legend: (
            <Icon
              className={css.legendIcon}
              name="symbol-triangle-up"
              color={Color.ORANGE_500}
              size={20}
              onClick={() => {
                setSelectedCard(SERVICES_CARDS.OVERUSE_USAGE_CARD)
                setToggleValue(overUsage)
              }}
            />
          )
        })
        break
      }
      case SERVICES_CARDS.RECOMMENDATION_USAGE_CARD: {
        legendsReturn.push({
          position: value * divi,
          legend: (
            <Icon
              className={css.legendIcon}
              name="flash"
              color={Color.PRIMARY_6}
              size={20}
              onClick={() => {
                setSelectedCard(SERVICES_CARDS.RECOMMENDATION_USAGE_CARD)
                setToggleValue(recommendUsage)
              }}
            />
          )
        })
        break
      }
    }
  })

  for (let i = legendsReturn.length - 1; i >= 0; i--) {
    let position = legendsReturn[i].position
    if (i !== 0) {
      position = legendsReturn[i].position - legendsReturn[i - 1].position
      legendsReturn[i].position = position
    }
  }

  return legendsReturn
}

const TogglerBar: React.FC<TogglerBarProps> = props => {
  const { width, scale, selectedValue, usages, setSelectedCard, onSelected } = props
  const sliderWidth = width
  const divi = (sliderWidth * 0.9) / scale
  const [workload, setWorkload] = useState<number>(0)

  useEffect(() => {
    if (selectedValue) {
      setWorkload(selectedValue)
    }
  }, [selectedValue])

  const legends = getLegends({ ...usages, divi, setSelectedCard, setToggleValue: onSelected })

  return (
    <Layout.Vertical width={sliderWidth}>
      <Layout.Horizontal className={css.legends} flex={{ alignItems: 'baseline', justifyContent: 'start' }}>
        {legends.map(legend => (
          <div key={legend.position} style={{ paddingLeft: legend.position }}>
            {legend.legend}
          </div>
        ))}
      </Layout.Horizontal>
      <Draggable
        axis="x"
        bounds={{ right: sliderWidth * 0.9, left: 1 }}
        defaultClassNameDragging={css.draggingHandle}
        position={{ x: (selectedValue || 0) * divi, y: 7 }}
        onDrag={(e, data) => {
          e.stopPropagation()
          setWorkload((data.x / divi) | 0)
        }}
        onStop={() => {
          onSelected(workload)
        }}
      >
        <Container className={css.handleWrapper}>
          <Text font={{ size: 'small' }} width={30} className={css.score}>
            {workload}
          </Text>
          <Container className={css.handle} flex={{ align: 'center-center' }}>
            <Container className={css.innerCircle} />
          </Container>
        </Container>
      </Draggable>
      <Layout.Horizontal>
        <div style={{ width: workload * divi }} className={cx(css.bar, css.bar1)} />
        <div style={{ width: sliderWidth * 0.9 - workload * divi }} className={cx(css.bar)} />
        <div style={{ width: sliderWidth * 0.1 }} className={cx(css.bar, css.bar3)} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default TogglerBar
