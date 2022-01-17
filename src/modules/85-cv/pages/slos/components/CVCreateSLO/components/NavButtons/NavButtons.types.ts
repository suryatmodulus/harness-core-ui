/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { UseStringsReturn } from 'framework/strings'
import type { CreateSLOEnum } from '../CreateSLOForm/CreateSLO.constants'
import type { SLOForm } from '../CreateSLOForm/CreateSLO.types'

export interface NavButtonsProps {
  selectedTabId: CreateSLOEnum
  setSelectedTabId: (tabId: CreateSLOEnum) => void
  getString: UseStringsReturn['getString']
  formikProps: FormikProps<SLOForm>
}
