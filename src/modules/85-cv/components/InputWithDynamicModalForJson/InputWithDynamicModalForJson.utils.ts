import { isNumeric } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import type { NoRecordForm } from './InputWithDynamicModalForJson.types'

export function validate(value: NoRecordForm, getString: UseStringsReturn['getString']): { [key: string]: string } {
  const errors: { [key: string]: string } = {}

  if (!value?.name?.trim().length) {
    errors.name = getString('cv.onboarding.selectProductScreen.validationText.name')
  }
  return errors
}

export const formatJSONPath = (selectedValue: string): string => {
  let formattedJSONPath = ''
  const selectedValuePathElements = selectedValue.split('.')

  // replacing the array index in the path with [*]
  if (isNumeric(selectedValuePathElements[selectedValuePathElements.length - 1])) {
    formattedJSONPath = getJSONPathIfLastElementIsNum(selectedValuePathElements)
  } else {
    formattedJSONPath = replaceAllNum(selectedValue)
  }

  return `$.${formattedJSONPath}`
}

export const getJSONPathIfLastElementIsNum = (selectedValuePathElements: string[]): string => {
  const pathElementsExceptLastNumElement = selectedValuePathElements.slice(0, selectedValuePathElements.length - 1)
  const lastNumElement = selectedValuePathElements[selectedValuePathElements.length - 1]

  let path = pathElementsExceptLastNumElement.join('.')
  path = replaceAllNum(path)

  return `${path}.[${lastNumElement}]`
}

export const replaceAllNum = (path: string): string => {
  return path.replace(/\d/g, '[*]')
}
