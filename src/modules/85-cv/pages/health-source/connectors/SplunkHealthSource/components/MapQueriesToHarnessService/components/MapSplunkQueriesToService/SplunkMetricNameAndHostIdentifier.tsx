/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { InputWithDynamicModalForJson } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson'

import { MapSplunkToServiceFieldNames } from '../../constants'
import type { MapSplunkQueriesToServiceProps } from './types'
import css from './SplunkMetricNameAndHostIdentifier.module.scss'

export function SplunkMetricNameAndHostIdentifier(props: MapSplunkQueriesToServiceProps): JSX.Element {
  const { onChange, sampleRecord, isQueryExecuted, loading, serviceInstance } = props
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
        fieldValue={serviceInstance}
        isQueryExecuted={isQueryExecuted}
        isDisabled={isAddingIdentifiersDisabled}
        sampleRecord={sampleRecord}
        inputName={MapSplunkToServiceFieldNames.SERVICE_INSTANCE}
        inputLabel={getString('cv.monitoringSources.gcoLogs.serviceInstance')}
        noRecordModalHeader={getString('cv.monitoringSources.gcoLogs.newGCOLogsServiceInstance')}
        noRecordInputLabel={getString('cv.monitoringSources.gcoLogs.gcoLogsServiceInstance')}
        recordsModalHeader={getString('cv.monitoringSources.gcoLogs.selectPathForServiceInstance')}
      />
    </Container>
  )
}
