/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

// Common helpers and types for approval forms
import { flatMap } from 'lodash-es'

const getEntries = function <T>(object: T, prefix = ''): Array<any> {
  return flatMap(Object.entries(object), ([k, v]: { k: string; v: any }[]) =>
    Object(v) === v ? getEntries(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
  )
}

export function flatObject(object: Record<string, any>): Record<string, unknown> {
  return getEntries(object).reduce((o, k) => ((o[k[0]] = k[1]), o), {})
}

// returns if an approval form field is disabled.
// More params might be added in the future
// readonly denotes RBAC
export const isApprovalStepFieldDisabled = (readonly = false, fetching = false): boolean => {
  if (readonly) {
    return true
  }
  if (fetching) {
    return true
  }
  return false
}
