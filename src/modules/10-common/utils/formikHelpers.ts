/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikContext } from 'formik'
import { get, isPlainObject } from 'lodash-es'

export const errorCheck = (name: string, formik?: FormikContext<any>): boolean | '' | 0 | undefined =>
  ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
    get(formik?.errors, name) &&
    !isPlainObject(get(formik?.errors, name))) as boolean
