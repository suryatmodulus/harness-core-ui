import React from 'react'
import { noop } from 'lodash-es'
import { Container, FormInput } from '@wings-software/uicore'
import {
  HarnessEnvironmentAsFormField,
  HarnessServiceAsFormField
} from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import { useStrings } from 'framework/strings'
import { InputWithDynamicModalForJson } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson'

import { MapGCPLogsToServiceFieldNames } from '../../constants'
import type { MapGCPLogsQueriesToServiceProps } from './types'
import css from './MapGCPLogsQueriesToService.module.scss'

export function MapGCPLogsQueriesToService(props: MapGCPLogsQueriesToServiceProps): JSX.Element {
  const {
    onChange,
    serviceValue,
    environmentValue,
    serviceOptions,
    environmentOptions,
    setEnvironmentOptions,
    setServiceOptions,
    sampleRecord,
    isQueryExecuted,
    loading
  } = props
  const { getString } = useStrings()
  const isAddingIdentifiersDisabled = !isQueryExecuted || loading

  return (
    <Container className={css.main}>
      <FormInput.Text
        label={getString('cv.monitoringSources.queryNameLabel')}
        name={MapGCPLogsToServiceFieldNames.METRIC_NAME}
      />
      <HarnessServiceAsFormField
        customRenderProps={{
          name: MapGCPLogsToServiceFieldNames.SERVICE,
          label: getString('service')
        }}
        serviceProps={{
          item: serviceValue,
          options: serviceOptions,
          onSelect: noop,
          onNewCreated: newService => {
            if (newService?.name && newService.identifier) {
              const newServiceOption = { label: newService.name, value: newService.identifier }
              onChange(MapGCPLogsToServiceFieldNames.SERVICE, newServiceOption)
              setServiceOptions(oldServices => [newServiceOption, ...oldServices])
            }
          }
        }}
      />
      <HarnessEnvironmentAsFormField
        customRenderProps={{
          name: MapGCPLogsToServiceFieldNames.ENVIRONMENT,
          label: getString('environment')
        }}
        environmentProps={{
          item: environmentValue,
          options: environmentOptions,
          onSelect: noop,
          onNewCreated: newEnv => {
            if (newEnv?.name && newEnv.identifier) {
              const newEnvOption = { label: newEnv.name, value: newEnv.identifier }
              onChange(MapGCPLogsToServiceFieldNames.ENVIRONMENT, newEnvOption)
              setEnvironmentOptions(oldEnvs => [newEnvOption, ...oldEnvs])
            }
          }
        }}
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
