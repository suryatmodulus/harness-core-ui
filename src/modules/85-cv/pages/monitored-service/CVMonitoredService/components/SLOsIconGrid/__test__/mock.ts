/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SloHealthIndicatorDTO } from 'services/cv'

export const items: SloHealthIndicatorDTO[] = [
  {
    serviceLevelObjectiveIdentifier: 'manager_http_errors',
    errorBudgetRemainingPercentage: 51.30434782608695,
    errorBudgetRisk: 'NEED_ATTENTION'
  },
  {
    serviceLevelObjectiveIdentifier: 'cvng_Slow_calls',
    errorBudgetRemainingPercentage: -71.99074074074075,
    errorBudgetRisk: 'UNHEALTHY'
  },
  {
    serviceLevelObjectiveIdentifier: 'slo',
    errorBudgetRemainingPercentage: -3111.8811881188117,
    errorBudgetRisk: 'HEALTHY'
  },
  {
    serviceLevelObjectiveIdentifier: 'slo-4',
    errorBudgetRemainingPercentage: -3111.8811881188117,
    errorBudgetRisk: 'OBSERVE'
  },
  {
    serviceLevelObjectiveIdentifier: 'slo-5',
    errorBudgetRemainingPercentage: 34.23,
    errorBudgetRisk: 'HEALTHY'
  }
]
