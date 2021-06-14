import { Drawer } from '@blueprintjs/core'
import { Button, Container, FormInput } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import React from 'react'
import { useStrings } from 'framework/strings'
import { MapGCPLogsToServiceFieldNames } from '@cv/pages/monitoring-source/google-cloud-operations/MapQueriesToHarnessService/constants'
import { Records } from '../../Records/Records'
import { QueryViewDialogProps, DrawerProps } from '../types'
import css from './QueryViewDialog.module.scss'

export function QueryViewDialog(props: QueryViewDialogProps): JSX.Element {
  const { onHide, query, loading, data, error, fetchRecords, isQueryExecuted, isOpen } = props
  const { getString } = useStrings()
  return (
    <Drawer {...DrawerProps} isOpen={isOpen} onClose={onHide} className={css.queryViewDialog}>
      <Container className={css.queryContainer}>
        <FormInput.TextArea name={MapGCPLogsToServiceFieldNames.QUERY} className={css.formQueryBox} />
        <Button
          intent="primary"
          text={getString('cv.monitoringSources.gcoLogs.fetchRecords')}
          onClick={fetchRecords}
          disabled={isEmpty(query) || loading}
        />
        <Records
          loading={loading}
          data={data}
          error={error}
          fetchRecords={fetchRecords}
          isQueryExecuted={isQueryExecuted}
          query={query}
        />
      </Container>
    </Drawer>
  )
}
