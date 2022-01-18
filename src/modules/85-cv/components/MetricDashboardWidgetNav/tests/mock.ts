/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  MetricDashboardItem,
  MetricWidget
} from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.type'

export const MockDashboards: MetricDashboardItem[] = [
  {
    itemId: 'dashboard_id_1',
    title: 'dashboard_id_title'
  },
  {
    itemId: 'dashboard_id_2',
    title: 'dashboard_id_title_2'
  }
]

export const MockWidgetsResponse: MetricWidget[] = [
  {
    widgetName: 'widget_1',
    dataSets: [
      {
        id: 'id_1',
        name: 'metric_1',
        query: 'test query 1'
      },
      {
        id: 'id_2',
        name: 'metric_2',
        query: 'test query 2'
      },
      {
        id: 'id_3',
        name: 'metric_3',
        query: '7578768678'
      }
    ]
  },
  {
    widgetName: 'bad_widget',
    dataSets: []
  },
  {
    widgetName: 'widget_2',
    dataSets: [
      {
        id: 'id_7',
        name: 'metric_4',
        query: '5654grt46'
      }
    ]
  }
]

export const MockConnectorIdentifier = '1234_connectorIdentifier'
