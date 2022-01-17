/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TimeSeriesSampleDTO } from 'services/cv'
import type { MapCustomHealthToService } from '../../CustomHealthSource.types'

export interface QueryMappingInterface {
  formikSetFieldValue: any
  formikValues: MapCustomHealthToService | undefined
  connectorIdentifier: string
  onFetchRecordsSuccess: (data: { [key: string]: { [key: string]: any } }) => void
  isQueryExecuted: boolean
  recordsData: TimeSeriesSampleDTO | undefined
  setLoading: (value: boolean) => void
}
