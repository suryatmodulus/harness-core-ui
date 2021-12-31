import React from 'react'
import { Connectors } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import { buildCustomHealthPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { CustomHealthHeadersAndParams } from './components/CustomHealthHeadersAndParams/CustomHealthHeadersAndParams'
import { FieldNames } from './CreateCustomHealthConnector.constants'
import { CustomHealthValidationPath } from './components/CustomHealthValidationPath/CustomHealthValidationPath'

export function CustomHealthConnector(props: ConnectionConfigProps): JSX.Element[] {
  const { getString } = useStrings()
  return [
    <CustomHealthHeadersAndParams
      {...props}
      name={getString('common.headers')}
      addRowButtonLabel={getString('connectors.addHeader')}
      nameOfObjectToUpdate="headers"
      key={FieldNames.HEADERS}
    />,
    <CustomHealthHeadersAndParams
      {...props}
      name={getString('connectors.parameters')}
      addRowButtonLabel={getString('connectors.addParameter')}
      key={FieldNames.PARAMETERS}
      nameOfObjectToUpdate="params"
    />,
    <CustomHealthValidationPath
      {...props}
      key={FieldNames.VALIDATION_PATH}
      name={getString('connectors.validationPath')}
    />
  ]
}

export default cvConnectorHOC({
  connectorType: Connectors.CUSTOM_HEALTH,
  buildSubmissionPayload: buildCustomHealthPayload,
  nestedStep: CustomHealthConnector
})
