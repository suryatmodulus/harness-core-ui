/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render } from '@testing-library/react'
import React from 'react'
import routes from '@common/RouteDefinitions'
import * as dashboardServices from 'services/dashboard-service'
import { TestWrapper } from '@common/utils/testUtils'
import overviewCountMock from '@projects-orgs/components/OverviewGlanceCards/__tests__/overviewMock.json'
import LandingDashboardPage from './LandingDashboardPage'

const getData = jest.fn(() => {
  return Promise.resolve(overviewCountMock)
})

jest
  .spyOn(dashboardServices, 'useGetCounts')
  .mockImplementation(() => ({ mutate: getData, refetch: getData, data: overviewCountMock } as any))

describe('Landing Dashboard Page', () => {
  test('render', async () => {
    const { findByText } = render(
      <TestWrapper path={routes.toLandingDashboard({ accountId: ':accountId' })} pathParams={{ accountId: 'dummy' }}>
        <LandingDashboardPage />
      </TestWrapper>
    )

    expect(findByText('projectsOrgs.landingDashboard.welcomeMessageWithoutName')).toBeDefined()
    expect(findByText('projectsOrgs.welcomeSecondLine')).toBeDefined()
    expect(findByText('projectLabel')).toBeDefined()
  })
})
