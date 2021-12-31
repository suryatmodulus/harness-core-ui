import type { HTTPRequestMethod } from './components/HTTPRequestMethod/HTTPRequestMethod.types'

export type CustomHealthValidationPathFormFields = {
  requestMethod: HTTPRequestMethod
  validationPath: string
  requestBody?: string
}
