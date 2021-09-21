import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Color, Text, Icon } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Ticker, TickerVerticalAlignment } from '@common/components/Ticker/Ticker'
import { useToaster } from '@common/components'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useGetChangeSummary } from 'services/cv'
import type { ChangeSourceCardData, ChangeSourceCardInterfae } from './ChangesSourceCard.types'
import TickerValue from './components/TickerValue/TickerValue'
import { calculateChangePercentage, getTickerColor } from './ChangesSourceCard.utils'
import css from './ChangesSourceCard.module.scss'

export default function ChangeSourceCard(props: ChangeSourceCardInterfae): JSX.Element {
  const { startTime, endTime, duration } = props
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { orgIdentifier, projectIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const { data, refetch, loading, error } = useGetChangeSummary({ lazy: true, identifier })

  useEffect(() => {
    refetch({ queryParams: { orgIdentifier, projectIdentifier, accountId, startTime, endTime } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, startTime, endTime])
  const { Infrastructure, Deployment, Alert } = data?.resource?.categoryCountMap || {}

  const changeSummaryList = useMemo(
    () => calculateChangePercentage(data?.resource, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      Infrastructure?.count,
      Infrastructure?.countInPrecedingWindow,
      Deployment?.count,
      Deployment?.countInPrecedingWindow,
      Alert?.count,
      Alert?.countInPrecedingWindow
    ]
  )

  if (error) {
    clear()
    showError(getErrorMessage(error))
  }

  return (
    <Container className={css.tickersRow}>
      {loading || error ? (
        <>
          {error && <Icon name={'error'} color={Color.ERROR} size={16} />}
          {loading && <Icon name={'spinner'} size={16} />}
        </>
      ) : (
        changeSummaryList.map((ticker: ChangeSourceCardData) => {
          const tickerColor = getTickerColor(ticker.percentage)
          return (
            <Container key={ticker.id} className={css.ticker}>
              <Ticker
                value={<TickerValue value={ticker.percentage} label={ticker.label} color={tickerColor} />}
                decreaseMode={ticker.percentage < 0}
                color={tickerColor}
                verticalAlign={TickerVerticalAlignment.TOP}
              >
                <Text
                  className={css.tickerCount}
                  color={Color.BLACK}
                  font={{ weight: 'bold', size: 'large' }}
                  margin={{ right: 'small' }}
                >
                  {ticker.count}
                </Text>
              </Ticker>
            </Container>
          )
        })
      )}
    </Container>
  )
}
