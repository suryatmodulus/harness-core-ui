/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { Services } from '../Services'

jest.mock('highcharts-react-official', () => () => <></>)

jest.mock('services/cd-ng', () => {
  return {
    useGetServiceDeploymentsInfo: jest.fn,
    useGetWorkloads: jest.fn,
    useGetServicesGrowthTrend: jest.fn,
    useGetServiceDetails: jest.fn
  }
})

describe('Services', () => {
  test('should render Services', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <Services />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
