/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { RiskValues, getRiskLabelStringId } from '@cv/utils/CommonUtils'
import ServiceDependenciesLegend from '../ServiceDependenciesLegend'

describe('ServiceDependenciesLegend Tests', () => {
  test('should render ServiceDependenciesLegend component with correct labels', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ServiceDependenciesLegend />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText(getRiskLabelStringId(RiskValues.UNHEALTHY))).toBeTruthy())
    await waitFor(() => expect(getByText(getRiskLabelStringId(RiskValues.NEED_ATTENTION))).toBeTruthy())
    await waitFor(() => expect(getByText(getRiskLabelStringId(RiskValues.OBSERVE))).toBeTruthy())
    await waitFor(() => expect(getByText(getRiskLabelStringId(RiskValues.HEALTHY))).toBeTruthy())
    await waitFor(() => expect(getByText('na')).toBeTruthy())

    // should render servicetype legend
    await waitFor(() => expect(container.querySelector('.serviceTypesContainer')).toBeTruthy())

    expect(container).toMatchSnapshot()
  })

  test('should render ServiceDependenciesLegend without ServiceType legend', async () => {
    const { container } = render(
      <TestWrapper>
        <ServiceDependenciesLegend hideServiceTypeLegend />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('.serviceTypesContainer')).not.toBeTruthy())
    expect(container).toMatchSnapshot()
  })
})
