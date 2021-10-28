import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useMutateAsGet } from '@common/hooks'
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
    const { queryByText } = render(
      <TemplateActivityLog
        selectedTemplate={{ stableTemplate: true }}
        accountIdentifier="acId"
        projectIdentifier="pId"
        orgIdentifier="orgId"
      />
    )

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
        <TemplateActivityLog
          selectedTemplate={{ stableTemplate: true }}
          accountIdentifier="acId"
          projectIdentifier="pId"
          orgIdentifier="orgId"
        />
      </TestWrapper>
    )

    expect(queryByText('templatesLibrary.fetchingActivityLogs')).toBeTruthy()
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
        <TemplateActivityLog
          selectedTemplate={{ stableTemplate: true }}
          accountIdentifier="acId"
          projectIdentifier="pId"
          orgIdentifier="orgId"
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('response data')
  })
})
