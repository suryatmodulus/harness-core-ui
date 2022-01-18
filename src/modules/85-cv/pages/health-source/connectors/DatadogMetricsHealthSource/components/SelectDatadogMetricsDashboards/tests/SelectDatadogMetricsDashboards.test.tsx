/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import type { MetricsDashboardListProps } from '@cv/components/MetricsDashboardList/MetricsDashboardList.type'
import { DatadogMetricsMockHealthSource } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/components/SelectDatadogMetricsDashboards/tests/mock'
import { SelectDatadogMetricsDashboards } from '../SelectDatadogMetricsDashboards'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

jest.mock('@cv/components/MetricsDashboardList/MetricsDashboardList', () => (props: MetricsDashboardListProps<any>) => {
  return (
    <>
      {props.selectedDashboardList.map(dashboard => {
        return <span key={dashboard.id}>{dashboard?.name}</span>
      })}
    </>
  )
})

function WrapperComponent({ data }: any): JSX.Element {
  return (
    <TestWrapper
      path={routes.toCVActivitySourceEditSetup({
        ...accountPathProps,
        ...projectPathProps
      })}
      pathParams={{
        accountId: projectPathProps.accountId,
        projectIdentifier: projectPathProps.projectIdentifier,
        orgIdentifier: projectPathProps.orgIdentifier,
        activitySource: '1234_activitySource',
        activitySourceId: '1234_sourceId'
      }}
    >
      <SetupSourceTabs data={data} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <SelectDatadogMetricsDashboards />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('MetricDashboardList unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should initialize selected dashboards based on metrics provided from source', async () => {
    const { container } = render(<WrapperComponent data={DatadogMetricsMockHealthSource} />)
    expect(container.querySelectorAll('span').length).toBe(1)
  })
})
