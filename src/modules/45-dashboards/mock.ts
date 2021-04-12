import { Colors } from '@blueprintjs/core'
import { Color } from '@wings-software/uicore'

export const ServiceInstancesWidgetMock = {
  serviceCount: 57,
  serviceInstancesCount: 130,
  trendTitle: '6 month trend',
  trendData: [20, 50, 30, 50, 60, 70, 80, 35, 56, 78, 45],
  trendPopoverData: [
    {
      name: 'Failed',
      data: [30, 10, 20, 10, 20, 30, 20, 15, 16, 28, 35],
      color: Colors.RED5
    },
    {
      name: 'Successful',
      data: [20, 30, 60, 70, 20, 10, 60, 85, 58, 72, 65],
      color: Colors.GREEN5
    }
  ],
  nonProdCount: 120,
  prodCount: 20
}

export const MostActiveServicesWidgetMock = {
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
