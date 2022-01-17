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
import BasePathDropdown from '../BasePathDropdown'

const refetchMock = jest.fn()
describe('Base Path Dropdown', () => {
  test('should render with data', () => {
    jest
      .spyOn(cvServices, 'useGetAppdynamicsBaseFolders')
      .mockImplementation(
        () =>
          ({ loading: false, error: null, data: { data: ['overall performane', 'cvng'] }, refetch: refetchMock } as any)
      )
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <BasePathDropdown
          name={'asdas'}
          connectorIdentifier={'TestAppD'}
          appName={'AppDApplication'}
          selectedValue={'overall performane'}
          path={''}
          onChange={onChange}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.basePathDropdown').length).toEqual(1)
    expect(container.querySelector('input[value="overall performane"]')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('should render in loading state', () => {
    jest
      .spyOn(cvServices, 'useGetAppdynamicsBaseFolders')
      .mockImplementation(() => ({ loading: true, error: null, data: {}, refetch: refetchMock } as any))
    const onChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <BasePathDropdown
          name={'asdas'}
          connectorIdentifier={'TestAppD'}
          appName={'AppDApplication'}
          selectedValue={'overall performane'}
          path={''}
          onChange={onChange}
        />
      </TestWrapper>
    )
    expect(container.querySelector('span[data-icon="spinner"]')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('should render in error state', () => {
    jest.spyOn(cvServices, 'useGetAppdynamicsBaseFolders').mockImplementation(
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
        <BasePathDropdown
          name={'asdas'}
          connectorIdentifier={'TestAppD'}
          appName={'AppDApplication'}
          selectedValue={'overall performane'}
          path={''}
          onChange={onChange}
        />
      </TestWrapper>
    )
    expect(getByText('mockError')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
