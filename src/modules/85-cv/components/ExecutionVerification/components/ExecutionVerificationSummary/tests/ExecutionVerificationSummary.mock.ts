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
      risk: 'MEDIUM',
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
            risk: 'NO_DATA',
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-sj6lt',
            risk: 'NO_ANALYSIS',
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-s4gck',
            risk: 'HIGH',
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-qqwpw',
            risk: 'LOW',
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-jrl2x',
            risk: 'MEDIUM',
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-kzq2h',
            risk: 'NO_ANALYSIS',
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          },
          {
            hostName: 'manager-6f8b584cbf-sskjh',
            risk: 'NO_ANALYSIS',
            anomalousMetricsCount: 0,
            anomalousLogClustersCount: 0
          }
        ],
        canary: [
          {
            hostName: 'manager-6f8b584cbf-2vg8h',
            risk: 'LOW',
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
