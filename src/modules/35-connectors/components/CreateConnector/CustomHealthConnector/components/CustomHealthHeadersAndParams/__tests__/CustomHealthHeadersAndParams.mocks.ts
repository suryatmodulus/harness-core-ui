import { ValueType } from '@secrets/components/TextReference/TextReference'
import type { BaseCompFields } from '../CustomHealthHeadersAndParams.types'

export const StepParams: BaseCompFields['params'] = [
  {
    key: 'param1',
    value: {
      secretField: {
        referenceString: 'account.secret'
      },
      fieldType: ValueType.ENCRYPTED
    }
  },
  {
    key: 'param2',
    value: {
      secretField: {
        referenceString: 'account.secret2'
      },
      fieldType: ValueType.ENCRYPTED
    }
  }
]

export const StepHeaders: BaseCompFields['headers'] = [
  {
    key: 'header1',
    value: {
      textField: 'solo',
      fieldType: ValueType.TEXT
    }
  },
  {
    key: 'header2',
    value: {
      secretField: {
        referenceString: 'account.secret'
      },
      fieldType: ValueType.ENCRYPTED
    }
  }
]

export const SpecHeaders = [
  {
    key: 'header1',
    value: 'solo',
    valueEncrypted: false
  },
  {
    encryptedValueRef: 'account.secret',
    key: 'header2',
    valueEncrypted: true
  }
]

export const SpecParams = [
  {
    encryptedValueRef: 'account.secret',
    key: 'param1',
    valueEncrypted: true
  },
  {
    encryptedValueRef: 'account.secret2',
    key: 'param2',
    valueEncrypted: true
  }
]
