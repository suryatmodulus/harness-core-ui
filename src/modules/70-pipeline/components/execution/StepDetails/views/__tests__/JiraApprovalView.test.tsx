import React from 'react'
import { render, waitFor, act, fireEvent } from '@testing-library/react'
import { useGetApprovalInstance } from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { JiraApprovalView } from '../JiraApprovalView/JiraApprovalView'
import { mockJiraApprovalDataLoading, mockJiraApprovalData, mockJiraApprovalDataError } from './mock'

jest.mock('services/pipeline-ng', () => ({
  useGetApprovalInstance: jest.fn()
}))

describe('LOADING', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetApprovalInstance.mockImplementation(() => mockJiraApprovalDataLoading)
  })

  test('show spinner in loading state', () => {
    const { container } = render(<JiraApprovalView step={{}} />)

    const spinner = container.querySelector('.bp3-spinner')
    expect(spinner).toBeTruthy()
  })
})

describe('SUCCESS', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetApprovalInstance.mockImplementation(() => mockJiraApprovalData)
  })
  test('show tabs when data is present and authorized', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <JiraApprovalView step={{ status: 'ResourceWaiting' }} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('jira approval execution view')

    act(() => {
      fireEvent.click(getByText('common.refresh'))
    })
    await waitFor(() => expect(mockJiraApprovalData.refetch).toBeCalled())
  })
})

describe('ERROR', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetApprovalInstance.mockImplementation(() => mockJiraApprovalDataError)
  })

  test('show tabs when data is present and authorized', async () => {
    const { container } = render(
      <TestWrapper>
        <JiraApprovalView step={{}} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('.bp3-icon-error')).toBeTruthy())
  })
})
