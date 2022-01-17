/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { GCOProduct } from '@cv/pages/health-source/connectors/GCOLogsMonitoringSource/GoogleCloudOperationsMonitoringSourceUtils'
import type { TestWrapperProps } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'

export const MockParams = {
  accountId: '1234_account',
  projectIdentifier: '1234_project',
  orgIdentifier: '1234_ORG'
}

export const currentProduct = GCOProduct.CLOUD_METRICS

export const testWrapperProps: TestWrapperProps = {
  path: routes.toCVMonitoringServices({ ...accountPathProps, ...projectPathProps }),
  pathParams: MockParams
}

export const MockData = {
  data: {
    data: {
      content: [
        { name: 'CapabilityMismatchErrors', path: 'projects/674494598921/dashboards/10677345508806562647' },
        { name: ' Redis stress', path: 'projects/674494598921/dashboards/11281603920045896314' },
        { name: 'GCLB - Test', path: 'projects/674494598921/dashboards/1201721157960239302' },
        { name: 'QA-AccessLogs', path: 'projects/674494598921/dashboards/12415248476309631688' },
        {
          name: 'Database Issues - stress',
          path: 'projects/674494598921/dashboards/1438bc0d-41f1-476f-9430-5f4e3636fca0'
        },
        { name: 'Queues - QA', path: 'projects/674494598921/dashboards/14415235459248495942' },
        { name: 'CD', path: 'projects/674494598921/dashboards/14821685747839016814' },
        { name: 'Custom Dash - TimeScaleDB ', path: 'projects/674494598921/dashboards/15772748068262410069' },
        {
          name: ' Mongo Custom Metrics 3 - qa',
          path: 'projects/674494598921/dashboards/1c9d210e-7528-4487-87cc-d57d98b61307'
        },
        {
          name: 'Delegate Agent - qa',
          path: 'projects/674494598921/dashboards/1d8b73e6-bf1e-4230-8ea7-383664719591'
        }
      ],
      empty: false,
      pageIndex: 0,
      pageItemCount: 10,
      pageSize: 10,
      totalItems: 34,
      totalPages: 4
    }
  }
}

export const DefaultObject = {
  ...MockParams,
  identifier: 'MyGoogleCloudOperationsSource',
  product: currentProduct,
  name: 'MyGoogleCloudOperationsSource',
  selectedDashboards: [],
  selectedMetrics: new Map(),
  type: 'STACKDRIVER',
  mappedServicesAndEnvs: new Map(),
  isEdit: false
}
