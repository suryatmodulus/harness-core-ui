import React from 'react'
import { render, waitFor, getByText, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import CreateTargetSegmentModal from '../CreateTargetSegmentModal'

describe('CreateTargetSegmentModal', () => {
  test('CreateTargetSegmentModal should render initial state correctly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <CreateTargetSegmentModal project="dummy" environment="dummy" onCreate={jest.fn()} />
      </TestWrapper>
    )

    expect(getByText(container, 'cf.segments.create')).toBeDefined()
    fireEvent.click(getByText(container, 'cf.segments.create'))

    await waitFor(() => expect(document.querySelector('.bp3-portal')).toBeDefined())

    expect(document.querySelector('.bp3-portal')).toMatchSnapshot()
  })

  test('CreateTargetSegmentModal should call callbacks properly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }
    const onCreate = jest.fn()
    const mutate = jest.fn(() => {
      return Promise.resolve({ data: {} })
    })

    mockImport('services/cf', {
      useCreateSegment: () => ({ mutate })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <CreateTargetSegmentModal project="dummy" environment="dummy" onCreate={onCreate} />
      </TestWrapper>
    )

    expect(getByText(container, 'cf.segments.create')).toBeDefined()
    fireEvent.click(getByText(container, 'cf.segments.create'))

    await waitFor(() => expect(document.querySelector('.bp3-portal')).toBeDefined())

    fireEvent.change(document.querySelector('.bp3-portal input[name="name"]') as HTMLInputElement, {
      target: { value: 'Segment1' }
    })

    fireEvent.click(
      document.querySelector('.bp3-portal button[type="button"][class*="intent-primary"]') as HTMLButtonElement
    )

    await waitFor(() => expect(onCreate).toBeCalledTimes(1))
  })
})
