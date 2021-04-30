import { Colors } from '@blueprintjs/core'
import { Color } from '@wings-software/uicore'
import type { ServiceInstanceWidgetProps } from './components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import type { MostActiveServicesWidgetProps } from './components/Services/MostActiveServicesWidget/MostActiveServicesWidget'
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

export const MostActiveServicesWidgetMock: MostActiveServicesWidgetProps = {
  title: 'Most active services',
  data: [
    {
      label: 'Login',
      value: 23,
      color: Color.RED_600,
      change: 5
    },
    {
      label: 'Backend',
      value: 20,
      color: Color.RED_500,
      change: 5
    },
    {
      label: 'Portal',
      value: 16,
      color: Color.RED_450,
      change: 5
    },
    {
      label: 'Test',
      value: 12,
      color: Color.ORANGE_500,
      change: 5
    },
    {
      label: 'Others',
      value: 8,
      color: Color.ORANGE_400,
      change: 5
    }
  ]
}

export const DeploymentsWidgetMock = {
  deployments: {
    value: '211',
    change: 5
  },
  failureRate: {
    value: '15%',
    change: 5
  },
  frequency: {
    value: '3',
    change: 5
  },
  data: [
    {
      name: 'Failed',
      data: [30, 10, 20, 10, 20, 30, 20, 15, 16, 28],
      color: Colors.RED5
    },
    {
      name: 'Successful',
      data: [20, 30, 60, 70, 20, 10, 60, 85, 58, 72],
      color: Colors.BLUE5
    }
  ],
  dateLabels: [
    '01/02/2020',
    '02/02/2020',
    '01/02/2020',
    '02/02/2020',
    '01/02/2020',
    '02/02/2020',
    '01/02/2020',
    '02/02/2020',
    '01/02/2020',
    '02/02/2020'
  ]
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
