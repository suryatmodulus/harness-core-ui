/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RiskValues } from '@cv/utils/CommonUtils'

export const mockedServiceDependencies = {
  metaData: {},
  resource: {
    nodes: [
      {
        identifierRef: 'service106_Test_env_102',
        serviceRef: 'service106',
        environmentRef: 'Test_env_102',
        riskScore: -1,
        riskLevel: RiskValues.NO_ANALYSIS,
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0
      },
      {
        identifierRef: 'Test_Service_103_Test_env_102',
        serviceRef: 'Test_Service_103',
        environmentRef: 'Test_env_102',
        riskScore: -1,
        riskLevel: RiskValues.NO_ANALYSIS,
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0
      },
      {
        identifierRef: 'service105_Test_env_102',
        serviceRef: 'service105',
        environmentRef: 'Test_env_102',
        riskScore: -1,
        riskLevel: RiskValues.NO_ANALYSIS,
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0
      },
      {
        identifierRef: 'service107_Test_env_102',
        serviceRef: 'service107',
        environmentRef: 'Test_env_102',
        riskScore: -1,
        riskLevel: RiskValues.NO_ANALYSIS,
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0
      },
      {
        identifierRef: 'Test_Service_104_Test_env_102',
        serviceRef: 'Test_Service_104',
        environmentRef: 'Test_env_102',
        riskScore: 0,
        riskLevel: RiskValues.HEALTHY,
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0
      }
    ],
    edges: [
      {
        from: 'service106_Test_env_102',
        to: 'Test_Service_104_Test_env_102'
      },
      {
        from: 'service105_Test_env_102',
        to: 'Test_Service_104_Test_env_102'
      },
      {
        from: 'service107_Test_env_102',
        to: 'Test_Service_104_Test_env_102'
      },
      {
        from: 'Test_Service_103_Test_env_102',
        to: 'Test_Service_104_Test_env_102'
      }
    ]
  },
  responseMessages: []
}
