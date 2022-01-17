/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { RiskData } from 'services/cv'
import { RiskValues } from '@cv/utils/CommonUtils'

export const items: RiskData[] = [
  {
    riskStatus: RiskValues.HEALTHY,
    healthScore: 99
  },
  {
    riskStatus: RiskValues.OBSERVE,
    healthScore: 74
  },
  {
    riskStatus: RiskValues.NEED_ATTENTION,
    healthScore: 49
  },
  {
    riskStatus: RiskValues.NO_DATA
  },
  {
    riskStatus: RiskValues.UNHEALTHY,
    healthScore: 24
  }
]
