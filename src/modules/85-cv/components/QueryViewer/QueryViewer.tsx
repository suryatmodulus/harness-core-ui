import React, { useState, useEffect, useCallback } from 'react'
import cx from 'classnames'
import { Button, Container, FormInput, Layout, Text } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { MapGCPLogsToServiceFieldNames } from '@cv/pages/health-source/connectors/GCOLogsMonitoringSource/components/MapQueriesToHarnessService/constants'
import type { QueryViewerProps, QueryContentProps } from './types'
import { Records } from '../Records/Records'
import { QueryViewDialog } from './components/QueryViewDialog'
import css from './QueryViewer.module.scss'

export function QueryContent(props: QueryContentProps): JSX.Element {
  const { handleFetchRecords, query, loading, onClickExpand, onEditQuery, isDialogOpen, textAreaProps, textAreaName } =
    props
  const { getString } = useStrings()
  return (
    <Container className={css.queryContainer}>
      <Layout.Horizontal className={css.queryIcons} spacing="small">
        {onEditQuery && (
          <Button icon="main-edit" iconProps={{ size: 12 }} className={css.action} onClick={() => onEditQuery()} />
        )}
        {!isDialogOpen && (
          <Button
            icon="fullscreen"
            iconProps={{ size: 12 }}
            className={css.action}
            onClick={() => onClickExpand(true)}
          />
        )}
      </Layout.Horizontal>
      <FormInput.TextArea
        name={textAreaName || MapGCPLogsToServiceFieldNames.QUERY}
        textArea={textAreaProps}
        className={cx(css.formQueryBox)}
      />
      <Button
        intent="primary"
        text={getString('cv.monitoringSources.gcoLogs.fetchRecords')}
        onClick={handleFetchRecords}
        disabled={isEmpty(query) || loading}
      />
    </Container>
  )
}

export function QueryViewer(props: QueryViewerProps): JSX.Element {
  const {
    className,
    records,
    fetchRecords,
    loading,
    error,
    query,
    isQueryExecuted,
    postFetchingRecords,
    queryNotExecutedMessage
  } = props
  const { getString } = useStrings()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // if query exists then always fetch records on did mount
    if (query) {
      fetchRecords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFetchRecords = useCallback(() => {
    fetchRecords()
    if (postFetchingRecords) {
      postFetchingRecords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <Container className={cx(css.main, className)}>
      <Text className={css.labelText}>{getString('cv.query')}</Text>
      <QueryContent
        onClickExpand={setIsDialogOpen}
        query={query}
        isDialogOpen={isDialogOpen}
        loading={loading}
        handleFetchRecords={handleFetchRecords}
      />
      <Records
        fetchRecords={handleFetchRecords}
        loading={loading}
        data={records}
        error={error}
        query={query}
        isQueryExecuted={isQueryExecuted}
        queryNotExecutedMessage={queryNotExecutedMessage}
      />
      <QueryViewDialog
        isOpen={isDialogOpen}
        onHide={() => setIsDialogOpen(false)}
        query={query}
        fetchRecords={handleFetchRecords}
        loading={loading}
        data={records}
        error={error}
        isQueryExecuted={isQueryExecuted}
      />
    </Container>
  )
}
