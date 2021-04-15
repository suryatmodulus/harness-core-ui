import type { SelectOption } from '@wings-software/uicore'
import type { StringKeys } from 'framework/exports'

export enum VariableType {
  String = 'String',
  Secret = 'Secret',
  Number = 'Number'
}

export const labelStringMap: Record<VariableType, StringKeys> = {
  [VariableType.String]: 'string',
  [VariableType.Secret]: 'secretType',
  [VariableType.Number]: 'number'
}

export const getVaribaleTypeOptions = (getString: (key: StringKeys) => string): SelectOption[] =>
  [VariableType.String, VariableType.Secret, VariableType.Number].map(type => ({
    label: getString(labelStringMap[type]),
    value: type
  }))
