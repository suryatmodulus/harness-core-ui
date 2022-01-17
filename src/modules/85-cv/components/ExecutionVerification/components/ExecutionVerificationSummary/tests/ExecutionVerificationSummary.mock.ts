/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RiskValues } from '@cv/utils/CommonUtils'

export const SampleResponse = {
  resource: {
    serviceName: 'manager',
    serviceIdentifier: 'manager',
    envName: 'prod',
    envIdentifier: 'prod',
    deploymentTag: 'build#test1',
    deploymentVerificationJobInstanceSummary: {
      progressPercentage: 30,
      remainingTimeMs: 303800,
      startTime: 1625262360000,
      durationMs: 600000,
      risk: RiskValues.NEED_ATTENTION,
      environmentName: 'prod',
      jobName: 'canaryCV',
      verificationJobInstanceId: 'UQBmFeCcQEWTNGWkpTbsOA',
      activityId: 'k2SuXAUJQ2Syk72DZzoVlg',
      activityStartTime: 1625262333000,
      status: 'FAILED',
      additionalInfo: {
        primary: [
          {
            hostName: 'manager-6f8b584cbf-kqq9h',
            risk: RiskValues.NO_DATA,
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-sj6lt',
            risk: RiskValues.NO_ANALYSIS,
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-s4gck',
            risk: RiskValues.UNHEALTHY,
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-qqwpw',
            risk: RiskValues.HEALTHY,
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-jrl2x',
            risk: RiskValues.NEED_ATTENTION,
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-kzq2h',
            risk: RiskValues.NO_ANALYSIS,
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-sskjh',
            risk: RiskValues.NO_ANALYSIS,
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-sskjh',
            risk: RiskValues.OBSERVE,
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          }
        ],
        canary: [
          {
            hostName: 'manager-6f8b584cbf-2vg8h',
            risk: RiskValues.HEALTHY,
            anomalousMetricsCount: 2,
            anomalousLogClustersCount: 0
          }
        ],
        primaryInstancesLabel: 'primary',
        canaryInstancesLabel: 'canary',
        trafficSplitPercentage: null,
        type: 'CANARY'
      },
      timeSeriesAnalysisSummary: {
        totalNumMetrics: 89,
        numAnomMetrics: 49
      },
      logsAnalysisSummary: {
        totalClusterCount: 0,
        anomalousClusterCount: 0
      }
    }
  }
}
