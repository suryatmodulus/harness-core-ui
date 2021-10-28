import React from 'react'
import { Color, Container, Icon, Intent, Layout, Text } from '@wings-software/uicore'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import css from './StackedSummaryBar.module.scss'

const logger = loggerFor(ModuleName.COMMON)
export interface StackedBarSectionData {
  count: number
  color: string
}

export interface BarSection {
  width: number
  color: string
}

export interface StackedSummaryBarData {
  barSectionsData: Array<StackedBarSectionData>
  trend?: string
  intent?: Intent
  showTrend?: boolean
}

export interface StackedSummaryBarProps extends StackedSummaryBarData {
  maxCount: number
  barLength?: number
}

export const getStackedSummaryBarCount = (barData: Array<StackedBarSectionData>): number =>
  barData.reduce((sum: number, section: StackedBarSectionData) => sum + section.count, 0)

export const StackedSummaryBar: React.FC<StackedSummaryBarProps> = props => {
  const { maxCount, barSectionsData, trend, intent = Intent.SUCCESS, barLength = 100, showTrend = true } = props
  const summaryCount = getStackedSummaryBarCount(barSectionsData)
  const trendChange = trend ? parseInt(trend) : 0
  const barSections: Array<BarSection> = []
  const effectiveBarLength = barLength - barSectionsData.length // for 1px gaps

  // Can not have stackBar without these data
  if (!(maxCount > 0) || !barSectionsData.length) {
    logger.error(`Ivalid data for StackedSummaryBar maxCount:${{ maxCount }}, barSectionsData:${{ barSectionsData }}`)
    return null
  }

  barSectionsData.forEach((stackedBarSection: StackedBarSectionData) => {
    stackedBarSection.count && // section for 0 count is not required
      barSections.push({
        width: (stackedBarSection.count / maxCount) * effectiveBarLength,
        color: stackedBarSection.color
      })
  })
  // leftover section relative to maxCount should be as blank
  barSections.push({ width: (1 - summaryCount / maxCount) * effectiveBarLength, color: Color.GREY_100 })

  const handleZeroOrInfinityTrend = (intentColor: Color): JSX.Element => {
    return isNaN(trendChange) ? ( // handling Infinity and other unexpected trends
      <Container flex={{ alignItems: 'center' }}>
        <Icon name={'caret-up'} color={intentColor}></Icon>
        <Icon name={'infinityTrend'} size={20} color={intentColor}></Icon>
      </Container>
    ) : (
      // handing 0 trend change
      <Container flex>{renderTrend(Color.GREY_300)}</Container>
    )
  }

  const renderTrend = (intentColor: Color): JSX.Element => {
    return (
      <>
        <Icon
          name={trendChange === 0 ? 'caret-right' : trendChange < 0 ? 'caret-down' : 'caret-up'}
          color={intentColor}
        ></Icon>
        <Text font="xsmall" color={intentColor}>
          {trend}
        </Text>
      </>
    )
  }

  return (
    <Layout.Horizontal spacing="small">
      <Text font="small" className={css.summaryCount}>
        {summaryCount}
      </Text>
      <Container flex>
        {barSections.map((barSection: BarSection, index: number) => {
          return barSection.width ? (
            <Container
              background={barSection.color}
              key={index}
              className={css.barSection}
              width={barSection.width}
            ></Container>
          ) : null
        })}
      </Container>
      {showTrend ? (
        trendChange ? (
          <Container flex>
            {(intent === Intent.SUCCESS) === trendChange < 0
              ? renderTrend(Color.RED_500)
              : renderTrend(Color.GREEN_500)}
          </Container>
        ) : (
          handleZeroOrInfinityTrend(intent === Intent.SUCCESS ? Color.GREEN_500 : Color.RED_500)
        )
      ) : (
        <></>
      )}
    </Layout.Horizontal>
  )
}
