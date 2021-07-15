import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@wings-software/uicore'
import { isEmpty, isNull, isUndefined, omit, omitBy, set } from 'lodash-es'
import { yupToFormErrors } from 'formik'
import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { ContinousVerificationData, spec } from './types'
import {
  VerificationSensitivityOptions,
  durationOptions,
  baseLineOptions,
  trafficSplitPercentageOptions,
  SensitivityTypes
} from './constants'

/**
 * checks if a field is a runtime input.
 * @param field
 * @returns boolean
 */
export function checkIfRunTimeInput(field: string | SelectOption | number | undefined): boolean {
  return getMultiTypeFromValue(field as string) === MultiTypeInputType.RUNTIME
}

/**
 * validates a particular field for errors.
 * @param fieldValue
 * @param fieldKey
 * @param data
 * @param errors
 * @param getString
 * @param isRequired
 */
export function validateField(
  fieldValue: string,
  fieldKey: string,
  data: ContinousVerificationData,
  errors: any,
  getString: UseStringsReturn['getString'],
  isRequired = true
): void {
  if (checkIfRunTimeInput(fieldValue) && isRequired && isEmpty(data?.spec?.spec && data?.spec?.spec[fieldKey])) {
    set(errors, `spec.spec.${fieldKey}`, getString('fieldRequired', { field: fieldKey }))
  }
}

/**
 * validates timeout field.
 * @param template
 * @param getString
 * @param data
 * @param errors
 */
export function validateTimeout(
  getString: UseStringsReturn['getString'],
  data: ContinousVerificationData,
  errors: any,
  template?: ContinousVerificationData,
  isRequired = true
): void {
  if (checkIfRunTimeInput(template?.timeout)) {
    let timeout: Yup.ObjectSchema
    if (isRequired) {
      timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
      })
    } else {
      timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' })
      })
    }

    try {
      timeout.validateSync(data)
    } catch (e) {
      if (e instanceof Yup.ValidationError) {
        const err = yupToFormErrors(e)
        Object.assign(errors, err)
      }
    }
  }
}

/**
 * returns yaml data for spec field.
 * @param specInfo
 * @returns spec
 */
export function getSpecYamlData(specInfo?: spec, type?: string): spec {
  let validspec = omitBy(specInfo, v => isUndefined(v) || isNull(v) || v === '')

  switch (type) {
    case 'LoadTest':
      validspec = omit(validspec, ['trafficsplit'])
      break
    case 'Bluegreen':
    case 'Canary':
      validspec = omit(validspec, ['baseline'])
      break
    default:
      break
  }

  Object.keys(validspec).map((key: string) => {
    //TODO logic in if block will be removed once backend api is fixed : https://harness.atlassian.net/browse/CVNG-2481
    if (key === 'sensitivity') {
      validspec[key] = validspec[key].value
        ? SensitivityTypes[validspec[key].value as keyof typeof SensitivityTypes]
        : validspec[key]
    } else {
      validspec[key] = validspec[key].value ? validspec[key].value : validspec[key]
    }
  })

  return validspec
}

/**
 * returns forms data for spec field.
 * @param specInfo
 * @returns spec
 */
export function getSpecFormData(specInfo: spec | undefined): spec {
  const validspec: spec | undefined = { ...specInfo }
  if (specInfo) {
    Object.keys(specInfo).map((key: string) => {
      switch (key) {
        case 'sensitivity':
          setFieldData(validspec, 'sensitivity', VerificationSensitivityOptions)
          break
        case 'duration':
          setFieldData(validspec, 'duration', durationOptions)
          break
        case 'baseline':
          setFieldData(validspec, 'baseline', baseLineOptions)
          break
        case 'trafficsplit':
          setFieldData(validspec, 'trafficsplit', trafficSplitPercentageOptions)
          break
        default:
      }
    })
  }
  return validspec
}

/**
 * sets particular field data
 * @param validspec
 * @param field
 * @param options
 */
export function setFieldData(validspec: spec | undefined, field: string, fieldOptions: SelectOption[]): void {
  //finding the complete option if the field is fixed input
  if (validspec && validspec[field] && validspec[field] !== RUNTIME_INPUT_VALUE) {
    //TODO logic in if block will be removed once backend api is fixed : https://harness.atlassian.net/browse/CVNG-2481
    if (field === 'sensitivity') {
      validspec[field] = fieldOptions.find(
        (el: SelectOption) =>
          SensitivityTypes[el.value as keyof typeof SensitivityTypes] === (validspec && validspec[field])
      )
    } else {
      validspec[field] = fieldOptions.find((el: SelectOption) => el.value === (validspec && validspec[field]))
    }
  }
}
