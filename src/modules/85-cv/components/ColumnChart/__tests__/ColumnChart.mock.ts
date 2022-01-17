/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getRiskColorValue, RiskValues } from '@cv/utils/CommonUtils'
import type { ColumnChartProps } from '../ColumnChart.types'

export const mockSeriesData: ColumnChartProps = {
  data: [
    {
      color: getRiskColorValue(RiskValues.HEALTHY),
      riskStatus: RiskValues.HEALTHY,
      height: 50,
      timeRange: { startTime: 2, endTime: 5 }
    },
    {
      color: getRiskColorValue(RiskValues.HEALTHY),
      riskStatus: RiskValues.HEALTHY,
      height: 99,
      timeRange: { startTime: 6, endTime: 8 }
    },
    {
      color: getRiskColorValue(RiskValues.HEALTHY),
      riskStatus: RiskValues.HEALTHY,
      height: 100,
      timeRange: { startTime: 9, endTime: 10 }
    },
    {
      color: getRiskColorValue(RiskValues.HEALTHY),
      riskStatus: RiskValues.HEALTHY,
      height: 45,
      timeRange: { startTime: 11, endTime: 12 }
    }
  ]
}
