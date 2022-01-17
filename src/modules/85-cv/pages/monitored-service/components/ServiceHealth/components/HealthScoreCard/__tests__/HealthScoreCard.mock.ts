/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RiskValues } from '@cv/utils/CommonUtils'
import type { ResponseHealthScoreDTO } from 'services/cv'

export const noHealthSourceData: ResponseHealthScoreDTO = {
  data: {
    currentHealthScore: {
      riskStatus: RiskValues.NO_DATA
    },
    dependentHealthScore: {
      riskStatus: RiskValues.NO_DATA
    }
  }
}

export const noServiceHealthScoreData: ResponseHealthScoreDTO = {
  data: {
    currentHealthScore: {
      riskStatus: RiskValues.NO_DATA
    },
    dependentHealthScore: {
      riskStatus: RiskValues.HEALTHY,
      healthScore: 100
    }
  }
}

export const noDependencyHealthScoreData: ResponseHealthScoreDTO = {
  data: {
    currentHealthScore: {
      riskStatus: RiskValues.NEED_ATTENTION,
      healthScore: 40
    },
    dependentHealthScore: {
      riskStatus: RiskValues.NO_DATA
    }
  }
}

export const healthSourceDataWithoutDependency: ResponseHealthScoreDTO = {
  data: {
    currentHealthScore: {
      riskStatus: RiskValues.NO_DATA
    }
  }
}
