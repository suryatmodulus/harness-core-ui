/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { SLOForm } from '../../CreateSLO.types'

export interface SLIProps {
  formikProps: FormikProps<SLOForm>
  children: JSX.Element
}

// PickMetric

export interface PickMetricProps {
  formikProps: SLIProps['formikProps']
}

export enum Comparators {
  LESS = 'less',
  GREATER = 'greater',
  LESS_EQUAL = 'lessOrEqual',
  GREATER_EQUAL = 'greaterOrEqual'
}
