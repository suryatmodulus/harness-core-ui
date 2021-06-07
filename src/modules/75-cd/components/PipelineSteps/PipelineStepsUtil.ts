import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'

const namespaceRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
const releaseNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/

export function getNameSpaceSchema(getString: UseStringsReturn['getString']): Yup.StringSchema<string | undefined> {
  return Yup.string()
    .required(getString('fieldRequired', { field: getString('common.namespace') }))
    .test('namespace', getString('cd.namespaceValidation'), function (value) {
      if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED) {
        return true
      }
      return namespaceRegex.test(value)
    })
}
export function getReleaseNameSchema(getString: UseStringsReturn['getString']): Yup.StringSchema<string | undefined> {
  return Yup.string()
    .required(getString('fieldRequired', { field: getString('common.releaseName') }))
    .test('releaseName', getString('cd.releaseNameValidation'), function (value) {
      if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED) {
        return true
      }
      return releaseNameRegex.test(value)
    })
}
