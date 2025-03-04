/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import type { RestResponseSetHealthSourceDTO } from 'services/cv'

export interface HealthSourceDropDownProps {
  onChange: (selectedHealthSource: string) => void
  serviceIdentifier: string
  environmentIdentifier: string
  className?: string
  verificationType?: string
}

export interface DropdownData {
  verificationType?: string
  data: RestResponseSetHealthSourceDTO | null
  error: GetDataError<unknown> | null
  loading: boolean
}
