import React from 'react'
import { Container, FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { InputWithDynamicModalForJson } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson'

import { MapGCPLogsToServiceFieldNames } from '../../constants'
import type { MapGCPLogsQueriesToServiceProps } from './types'
import css from './MapGCPLogsQueriesToService.module.scss'

export function MapGCPLogsQueriesToService(props: MapGCPLogsQueriesToServiceProps): JSX.Element {
  const { onChange, sampleRecord, isQueryExecuted, loading } = props
  const { getString } = useStrings()
  const isAddingIdentifiersDisabled = !isQueryExecuted || loading

  return (
    <Container className={css.main}>
      <FormInput.Text
        label={getString('cv.monitoringSources.queryNameLabel')}
        name={MapGCPLogsToServiceFieldNames.METRIC_NAME}
      />
      <InputWithDynamicModalForJson
        onChange={onChange}
        isQueryExecuted={isQueryExecuted}
        isDisabled={isAddingIdentifiersDisabled}
        sampleRecord={sampleRecord}
        inputName={MapGCPLogsToServiceFieldNames.SERVICE_INSTANCE}
        inputLabel={getString('cv.monitoringSources.gcoLogs.serviceInstance')}
        inputPlaceholder={getString('cv.monitoringSources.gcoLogs.selectRecords')}
        noRecordModalHeader={getString('cv.monitoringSources.gcoLogs.newGCOLogsServiceInstance')}
        noRecordInputLabel={getString('cv.monitoringSources.gcoLogs.gcoLogsServiceInstance')}
        recordsModalHeader={getString('cv.monitoringSources.gcoLogs.selectPathForServiceInstance')}
      />
      <InputWithDynamicModalForJson
        onChange={onChange}
        isDisabled={isAddingIdentifiersDisabled}
        isQueryExecuted={isQueryExecuted}
        sampleRecord={sampleRecord}
        inputName={MapGCPLogsToServiceFieldNames.MESSAGE_IDENTIFIER}
        inputLabel={getString('cv.monitoringSources.gcoLogs.messageIdentifier')}
        inputPlaceholder={getString('cv.monitoringSources.gcoLogs.selectRecords')}
        noRecordModalHeader={getString('cv.monitoringSources.gcoLogs.newGCOLogsMessageIdentifier')}
        noRecordInputLabel={getString('cv.monitoringSources.gcoLogs.gcoLogsMessageIdentifer')}
        recordsModalHeader={getString('cv.monitoringSources.gcoLogs.selectPathForMessageIdentifier')}
      />
    </Container>
  )
}
