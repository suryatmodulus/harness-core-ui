import React, { useMemo } from 'react'
import cx from 'classnames'
import { Color, Container, Icon, StackTraceList, Text } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { PageError } from '@common/components/Page/PageError'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { transformGCOLogsSampleData } from './utils'
import type { RecordsProps } from './types'
import css from './Records.module.scss'

export function Records(props: RecordsProps): JSX.Element {
  const { data, loading, error, fetchRecords, isQueryExecuted, query } = props
  const { getString } = useStrings()
  let content: JSX.Element = <></>

  const { records } = useMemo(() => {
    return transformGCOLogsSampleData(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (error) {
    content = (
      <PageError
        message={getErrorMessage(error)}
        disabled={isEmpty(query)}
        onClick={() => {
          fetchRecords()
        }}
      />
    )
  } else if (loading) {
    content = <Icon name="steps-spinner" size={32} color={Color.GREY_600} className={css.centerElement} />
  } else if (!isQueryExecuted) {
    content = (
      <Text
        icon="timeline-line-chart"
        className={cx(css.noQueryChart, css.centerElement)}
        iconProps={{ size: 50, intent: 'success' }}
      >
        {getString('cv.monitoringSources.gcoLogs.submitQueryToSeeRecords')}
      </Text>
    )
  } else if (!records?.length) {
    content = (
      <Container className={css.noRecords}>
        <NoDataCard
          icon="warning-sign"
          message={getString('cv.monitoringSources.gcoLogs.noRecordsForQuery')}
          onClick={() => {
            fetchRecords()
          }}
          buttonText={getString('retry')}
          buttonDisabled={isEmpty(query)}
        />
      </Container>
    )
  } else {
    content = <StackTraceList stackTraceList={records} className={css.recordContainer} />
  }

  return (
    <Container className={css.queryAndRecords}>
      <Text className={css.labelText}>{getString('cv.monitoringSources.gcoLogs.records')}</Text>
      <Container className={css.chartContainer}>{content}</Container>
    </Container>
  )
}
