import React from 'react'
import { render, waitFor, getByText, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import { NewSegmentButton } from '../NewSegmentButton'

describe('NewSegmentButton', () => {
  test('NewSegmentButton should render initial state correctly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <NewSegmentButton accountId="dummy" orgIdentifier="dummy" projectIdentifier="dummy" onCreated={jest.fn()} />
      </TestWrapper>
    )

    expect(getByText(container, 'cf.segments.create')).toBeDefined()
    fireEvent.click(getByText(container, 'cf.segments.create'))

    await waitFor(() => expect(document.querySelector('.bp3-portal')).toBeDefined())

    expect(document.querySelector('.bp3-portal')).toMatchSnapshot()
  })

  test('NewSegmentButton should call callbacks properly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }
    const onCreated = jest.fn()
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
        <NewSegmentButton accountId="dummy" orgIdentifier="dummy" projectIdentifier="dummy" onCreated={onCreated} />
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

    await waitFor(() => expect(onCreated).toBeCalledTimes(1))
  })
})
