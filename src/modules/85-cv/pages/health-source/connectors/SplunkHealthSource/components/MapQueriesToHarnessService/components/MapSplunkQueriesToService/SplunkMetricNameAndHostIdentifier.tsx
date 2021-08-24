import React from 'react'
import { Container, FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { InputWithDynamicModalForJson } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson'

import { MapSplunkToServiceFieldNames } from '../../constants'
import type { MapSplunkQueriesToServiceProps } from './types'
import css from './SplunkMetricNameAndHostIdentifier.module.scss'

export function SplunkMetricNameAndHostIdentifier(props: MapSplunkQueriesToServiceProps): JSX.Element {
  const { onChange, sampleRecord, isQueryExecuted, loading } = props
  const { getString } = useStrings()
  const isAddingIdentifiersDisabled = !isQueryExecuted || loading

  return (
    <Container className={css.main}>
      <FormInput.Text
        label={getString('cv.monitoringSources.queryNameLabel')}
        name={MapSplunkToServiceFieldNames.METRIC_NAME}
      />
      <InputWithDynamicModalForJson
        onChange={onChange}
        isQueryExecuted={isQueryExecuted}
        isDisabled={isAddingIdentifiersDisabled}
        sampleRecord={sampleRecord}
        inputName={MapSplunkToServiceFieldNames.SERVICE_INSTANCE}
        inputLabel={getString('cv.monitoringSources.gcoLogs.serviceInstance')}
        inputPlaceholder={getString('cv.monitoringSources.gcoLogs.selectRecords')}
        noRecordModalHeader={getString('cv.monitoringSources.gcoLogs.newGCOLogsServiceInstance')}
        noRecordInputLabel={getString('cv.monitoringSources.gcoLogs.gcoLogsServiceInstance')}
        recordsModalHeader={getString('cv.monitoringSources.gcoLogs.selectPathForServiceInstance')}
      />
    </Container>
  )
}
