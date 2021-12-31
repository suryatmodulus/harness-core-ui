import type { ValueType } from '@secrets/components/TextReference/TextReference'
import type { ConnectionConfigProps } from '../../../CommonCVConnector/constants'

export interface CustomHealthHeadersAndParamsProps extends ConnectionConfigProps {
  addRowButtonLabel: string
  nameOfObjectToUpdate: 'headers' | 'params'
}

export interface KeyValueEntity {
  key: string
}

export interface PlainEntity extends KeyValueEntity {
  value: {
    textField: string
    fieldType: ValueType.TEXT
  }
}

export interface EncryptedEntity extends KeyValueEntity {
  value: {
    fieldType: ValueType.ENCRYPTED
    secretField: {
      referenceString: string
    }
  }
}

export type BaseCompFields = {
  baseURL: string
  headers?: Array<PlainEntity | EncryptedEntity>
  params?: Array<PlainEntity | EncryptedEntity>
}
