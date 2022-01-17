/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { ServicesList } from '@cd/components/Services/ServicesList/ServicesList'
import { serviceDetails } from '@cd/mock'
import type { ServiceDetailsDTO } from 'services/cd-ng'

jest.mock('highcharts-react-official', () => () => <></>)

describe('ServicesList', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServicesList
          loading={false}
          error={false}
          data={serviceDetails.data.serviceDeploymentDetailsList as unknown as ServiceDetailsDTO[]}
          refetch={noop}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
