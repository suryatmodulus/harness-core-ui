/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { RestResponseAnomaliesSummaryDTO } from 'services/cv'
import type { IsAnomaliesDataAvailable } from './Anomalies.types'

export const areAnomaliesAvailable = (
  anomaliesData: RestResponseAnomaliesSummaryDTO | null,
  isLowestHealthScoreAvailable?: number
): IsAnomaliesDataAvailable => {
  return {
    isTimeSeriesAnomaliesAvailable: !!(
      anomaliesData?.resource?.timeSeriesAnomalies === 0 || anomaliesData?.resource?.timeSeriesAnomalies
    ),
    isLogsAnomaliesAvailable: !!(
      anomaliesData?.resource?.logsAnomalies === 0 || anomaliesData?.resource?.logsAnomalies
    ),
    isTotalAnomaliesAvailable: !!(
      anomaliesData?.resource?.totalAnomalies === 0 || anomaliesData?.resource?.totalAnomalies
    ),
    isLowestHealthScoreAvailable: !!(isLowestHealthScoreAvailable === 0 || isLowestHealthScoreAvailable)
  }
}
