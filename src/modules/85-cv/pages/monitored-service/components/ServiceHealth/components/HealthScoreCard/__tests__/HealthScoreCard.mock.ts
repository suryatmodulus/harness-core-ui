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
