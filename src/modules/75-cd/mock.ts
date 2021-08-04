export const mostActiveServiceInfo = {
  data: {
    workloadDeploymentInfoList: [
      {
        serviceName: 'Service1',
        serviceId: 'Service1Id',
        totalDeployments: 100,
        totalSuccess: 37,
        totalFailure: 63,
        rateSuccess: 45.4,
        failureRateChangeRate: 600.2
      },
      {
        serviceName: 'Service2',
        serviceId: 'Service2Id',
        totalDeployments: 200,
        totalSuccess: 137,
        totalFailure: 163,
        rateSuccess: 435.4,
        failureRateChangeRate: 620.2
      }
    ]
  }
}

export const deploymentsInfo = {
  status: 'SUCCESS',
  data: {
    startTime: 1623149323912,
    endTime: 1625741323912,
    totalDeployments: 57,
    failureRate: 24.2,
    frequency: 324.2,
    failureRateChangeRate: 45.7,
    totalDeploymentsChangeRate: 34.4,
    frequencyChangeRate: 23.2,
    serviceDeploymentList: [{ time: 1625443200000, deployments: { total: 0, success: 0, failure: 0 } }]
  },
  metaData: null,
  correlationId: 'deaf3a4d-161b-4d64-a77d-5be92b7cf41b'
}

export const envBuildInstanceCount = {
  status: 'SUCCESS',
  data: {
    envBuildIdAndInstanceCountInfoList: [
      {
        envId: 'env1',
        envName: 'envName',
        buildIdAndInstanceCountList: [{ buildId: 'build1', count: 1 }]
      }
    ]
  }
}

export const serviceDetails = {
  status: 'SUCCESS',
  data: {
    serviceDeploymentDetailsList: [
      {
        serviceName: 'asdfasdf',
        serviceIdentifier: 'asdfasdf',
        deploymentTypeList: null,
        totalDeployments: 0,
        totalDeploymentChangeRate: 0.0,
        successRate: 0.0,
        successRateChangeRate: 0.0,
        failureRate: 0.0,
        failureRateChangeRate: 0.0,
        frequency: 0.0,
        frequencyChangeRate: 0.0,
        instanceCountDetails: null,
        lastPipelineExecuted: null
      }
    ]
  }
}

export const serviceInstances = {
  serviceCount: 10,
  serviceInstancesCount: 20,
  prodCount: 10,
  nonProdCount: 10
}
