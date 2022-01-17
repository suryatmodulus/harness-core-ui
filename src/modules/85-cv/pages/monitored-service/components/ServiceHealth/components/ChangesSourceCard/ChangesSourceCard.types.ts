/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CategoryCountDetails } from 'services/cv'
import type { TimePeriodEnum } from '../../ServiceHealth.constants'

export interface ChangeSourceCardInterfae {
  startTime: number
  endTime: number
  duration?: TimePeriodEnum
  serviceIdentifier: string
  environmentIdentifier: string
}

export interface ChangeSourceCardData {
  id: string
  label: string
  count: number
  percentage: number
}

export interface CategoryCountMapInterface {
  [key: string]: CategoryCountDetails
}
