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
import BasePath from '../BasePath'

const refetchMock = jest.fn()
describe('Base Path', () => {
  beforeAll(() => {
    jest
      .spyOn(cvServices, 'useGetAppdynamicsBaseFolders')
      .mockImplementation(
        () =>
          ({ loading: false, error: null, data: { data: ['overall performane', 'cvng'] }, refetch: refetchMock } as any)
      )
  })
  test('should render', () => {
    const onChange = jest.fn()
    const { container, rerender } = render(
      <TestWrapper>
        <BasePath
          connectorIdentifier={'TestAppD'}
          appName={'AppDApplication'}
          basePathValue={{
            basePathDropdown_0: { value: 'overall performane', path: '' }
          }}
          onChange={onChange}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.basePathDropdown').length).toEqual(1)
    expect(container.querySelector('input[value="overall performane"]')).toBeTruthy()

    rerender(
      <TestWrapper>
        <BasePath
          connectorIdentifier={'TestAppD'}
          appName={'AppDApplication'}
          basePathValue={{
            basePathDropdown_0: { value: 'overall performane', path: '' },
            basePathDropdown_1: { value: 'cvng', path: 'overall performane' }
          }}
          onChange={onChange}
        />
      </TestWrapper>
    )

    expect(container.querySelectorAll('.basePathDropdown').length).toEqual(2)
    expect(container.querySelector('input[value="cvng"]')).toBeTruthy()
    expect(container.querySelector('input[value="overall performane"]')).toBeTruthy()

    expect(container).toMatchSnapshot()
  })
})
