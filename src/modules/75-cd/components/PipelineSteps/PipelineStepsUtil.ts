/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import * as Yup from 'yup'
import isEmpty from 'lodash/isEmpty'
import type { UseStringsReturn } from 'framework/strings'

const namespaceRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
const releaseNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/

export function getNameSpaceSchema(
  getString: UseStringsReturn['getString'],
  isRequired = true
): Yup.StringSchema<string | undefined> {
  const namespaceSchema = Yup.string().test('namespace', getString('cd.namespaceValidation'), function (value) {
    if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED || isEmpty(value)) {
      return true
    }
    return namespaceRegex.test(value)
  })
  if (isRequired) {
    return namespaceSchema.required(getString('fieldRequired', { field: getString('common.namespace') }))
  }
  return namespaceSchema
}
export function getReleaseNameSchema(
  getString: UseStringsReturn['getString'],
  isRequired = true
): Yup.StringSchema<string | undefined> {
  const releaseNameSchema = Yup.string().test('releaseName', getString('cd.releaseNameValidation'), function (value) {
    if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED || isEmpty(value)) {
      return true
    }
    return releaseNameRegex.test(value)
  })
  if (isRequired) {
    return releaseNameSchema.required(getString('fieldRequired', { field: getString('common.releaseName') }))
  }
  return releaseNameSchema
}
