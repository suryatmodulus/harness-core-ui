/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useMutateAsGet } from '@common/hooks'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { mockApiErrorResponse, mockApiFetchingResponse, mockApiSuccessResponse } from './TemplateActivityLogTestHelper'
import { TemplateActivityLog } from '../TemplateActivityLog'

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

describe('API ERROR', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(() => {
      return mockApiErrorResponse
    })
  })
  test('if error message is displayed', () => {
    const { queryByText } = render(<TemplateActivityLog template={mockTemplates?.data?.content?.[0] || {}} />)

    expect(queryByText('someerror')).toBeTruthy()
  })
})

describe('API FETCHING', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(() => {
      return mockApiFetchingResponse
    })
  })
  test('if loading message is displayed', () => {
    const { queryByText } = render(
      <TestWrapper>
        <TemplateActivityLog template={mockTemplates?.data?.content?.[0] || {}} />
      </TestWrapper>
    )

    expect(queryByText('Loading, please wait...')).toBeTruthy()
  })
})

describe('API SUCCESS', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(() => {
      return mockApiSuccessResponse
    })
  })
  test('if content is displayed', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateActivityLog template={mockTemplates?.data?.content?.[0] || {}} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('response data')
  })
})
