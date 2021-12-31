import type { ConnectionConfigProps } from '@connectors/components/CreateConnector/CommonCVConnector/constants'
import type { CustomHealthValidationPathFormFields } from './CustomHealthValidationPath.types'
import { HTTPRequestMethod } from './components/HTTPRequestMethod/HTTPRequestMethod.types'

export function transformDataToStepData(
  apiData: ConnectionConfigProps['prevStepData']
): CustomHealthValidationPathFormFields {
  if (!apiData?.spec && !apiData?.validationPath) {
    return {
      validationPath: '',
      requestMethod: HTTPRequestMethod.GET
    }
  }

  if (apiData.validationPath) {
    return {
      validationPath: apiData.validationPath,
      requestMethod: apiData.requestMethod,
      requestBody: apiData.requestBody
    }
  }

  return {
    validationPath: apiData.spec.validationPath,
    requestMethod: apiData.spec.method,
    requestBody: apiData.spec.validationBody
  }
}
