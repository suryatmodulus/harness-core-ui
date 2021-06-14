import type { UseStringsReturn } from 'framework/strings'
import type { NoRecordForm } from './types'

export function validate(value: NoRecordForm, getString: UseStringsReturn['getString']): { [key: string]: string } {
  const errors: { [key: string]: string } = {}

  if (!value?.name?.trim().length) {
    errors.name = getString('cv.onboarding.selectProductScreen.validationText.name')
  }
  return errors
}
