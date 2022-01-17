/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import MetricPathDropdown from './MetricPathDropdown'

const refetchMock = jest.fn()
describe('Metric Path', () => {
  test('should render with Data', () => {
    jest.spyOn(cvServices, 'useGetAppdynamicsMetricStructure').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: { data: [{ name: 'Number of Very Slow Calls' }, { name: 'calls per minute' }] },
          refetch: refetchMock
        } as any)
    )
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <MetricPathDropdown
          baseFolder={'basefolder'}
          connectorIdentifier={'TestAppD'}
          appName={'AppDApplication'}
          tier={'cvng'}
          onChange={onChange}
          selectedValue={'Number of Very Slow Calls'}
          metricPath={'Number of Very Slow Calls'}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.metricPathDropdown').length).toEqual(1)
    expect(container.querySelector('input[value="Number of Very Slow Calls"]')).toBeTruthy()

    expect(container).toMatchSnapshot()
  })

  test('should render in loading state', () => {
    jest
      .spyOn(cvServices, 'useGetAppdynamicsMetricStructure')
      .mockImplementation(() => ({ loading: true, error: null, data: {}, refetch: refetchMock } as any))
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <MetricPathDropdown
          baseFolder={'basefolder'}
          connectorIdentifier={'TestAppD'}
          appName={'AppDApplication'}
          tier={'cvng'}
          onChange={onChange}
          selectedValue={'Number of Very Slow Calls'}
          metricPath={'Number of Very Slow Calls'}
        />
      </TestWrapper>
    )
    expect(container.querySelector('span[data-icon="spinner"]')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('should render in error state', () => {
    jest.spyOn(cvServices, 'useGetAppdynamicsMetricStructure').mockImplementation(
      () =>
        ({
          loading: false,
          error: { data: { message: 'mockError' } } as any,
          data: null,
          refetch: refetchMock
        } as any)
    )
    const onChange = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <MetricPathDropdown
          baseFolder={'basefolder'}
          connectorIdentifier={'TestAppD'}
          appName={'AppDApplication'}
          tier={'cvng'}
          onChange={onChange}
          selectedValue={'Number of Very Slow Calls'}
          metricPath={'Number of Very Slow Calls'}
        />
      </TestWrapper>
    )
    expect(getByText('mockError')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
