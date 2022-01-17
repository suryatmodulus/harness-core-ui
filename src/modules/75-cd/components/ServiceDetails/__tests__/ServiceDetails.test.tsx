/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ServiceDetails from '@cd/components/ServiceDetails/ServiceDetails'
import * as cdngServices from 'services/cd-ng'

jest.mock('highcharts-react-official', () => () => <></>)
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.spyOn(cdngServices, 'useGetActiveServiceInstanceSummary').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetEnvBuildInstanceCount').mockImplementation(() => {
  return {
    mutate: () => Promise.resolve({ loading: true, data: [] })
  } as any
})

jest.spyOn(cdngServices, 'useGetServiceDeploymentsInfo').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetInstanceGrowthTrend').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetInstanceCountHistory').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetDeploymentsByServiceId').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

jest.spyOn(cdngServices, 'useGetServiceHeaderInfo').mockImplementation(() => {
  return { loading: false, error: false, data: [], refetch: jest.fn() } as any
})

describe('ServiceDetails', () => {
  test('should render ServiceDetails', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServiceDetails />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
