import { MultiTypeInputProps, MultiTypeInputType } from '@wings-software/uicore'

export function getMultiTypeInputProps(
  expressions: string[] | undefined,
  allowableTypes: MultiTypeInputType[]
): Omit<MultiTypeInputProps, 'name'> {
  return expressions
    ? { expressions, allowableTypes }
    : {
        allowableTypes: allowableTypes.filter(item => item !== MultiTypeInputType.EXPRESSION)
      }
}
