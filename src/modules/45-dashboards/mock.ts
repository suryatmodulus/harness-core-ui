import type { ServiceInstanceWidgetProps } from './components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import { DeploymentStatus } from './components/Services/ServicesList/ServicesList'
import type { ServicesListProps } from './components/Services/ServicesList/ServicesList'

export const ServiceInstancesWidgetMock: ServiceInstanceWidgetProps = {
  serviceCount: 57,
  serviceInstancesCount: 130,
  trendTitle: '6 month trend',
  trendData: [38, 10, 70, 63, 61, 107, 40, 61, 82, 22, 100, 63, 94, 16, 73, 59, 31, 90, 87, 102, 45, 39, 10, 64, 76],
  nonProdCount: 120,
  prodCount: 20
}

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

export const ServiceListMock: ServicesListProps = {
  total: 54,
  totalItems: 10,
  totalPages: 1,
  data: Array(10).fill({
    name: 'My Login Service',
    id: 'Service 001',
    serviceInstances: {
      count: 13,
      prodCount: 12,
      nonProdCount: 1
    },
    deployments: {
      value: '13',
      change: 5
    },
    failureRate: {
      value: '20%',
      change: 5
    },
    frequency: {
      value: '23',
      change: 5
    },
    lastDeployment: {
      name: 'My Pipeline X',
      id: 'Pipeline X 1899',
      timestamp: '1619120733360',
      status: DeploymentStatus.SUCCESS
    }
  })
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
