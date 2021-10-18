import React from 'react'
import { Container, Text, Color } from '@wings-software/uicore'
import { RiskValues, getRiskColorValue } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import type { ColumnChartPopoverContentProps } from './ColumnChartPopoverContent.types'
import css from './ColumnChartPopoverContent.module.scss'

export default function ColumnChartPopoverContent(props: ColumnChartPopoverContentProps): JSX.Element {
  const { cell } = props
  const { getString } = useStrings()

  let content = <Text color={Color.WHITE}>{getString('noData')}</Text>
  if (cell.riskStatus !== RiskValues.NO_DATA) {
    content = (
      <>
        <Text color={Color.WHITE} inline>
          {`${getString('cv.healthScore')}:`}
        </Text>
        <Text className={css.healthScore} color={getRiskColorValue(cell.riskStatus, false)}>
          {cell?.healthScore}
        </Text>
      </>
    )
  }

  return (
    <Container>
      <Text lineClamp={1} className={css.timeRange}>{`${new Date(
        cell.timeRange?.startTime
      ).toLocaleString()} - ${new Date(cell.timeRange?.endTime).toLocaleString()}`}</Text>
      {content}
    </Container>
  )
}
