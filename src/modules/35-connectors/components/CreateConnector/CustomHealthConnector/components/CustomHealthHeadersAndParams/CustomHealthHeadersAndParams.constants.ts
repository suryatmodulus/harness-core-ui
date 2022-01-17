import { ValueType } from '@secrets/components/TextReference/TextReference'
import type { BaseCompFields } from './CustomHealthHeadersAndParams.types'

export const FieldNames = {
  BASE_URL: 'baseURL'
}

export const DefaultHeadersAndParamsInitialValues: BaseCompFields = {
  headers: [
    {
      key: '',
      value: {
        textField: '',
        fieldType: ValueType.TEXT
      }
    }
  ],
  params: [
    {
      key: '',
      value: {
        textField: '',
        fieldType: ValueType.TEXT
      }
    }
  ],
  baseURL: ''
}
