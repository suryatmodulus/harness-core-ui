import React from 'react'
import { render, waitFor, getByText, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import { SelectSegmentsModalButton } from '../SelectSegmentsModalButton'
import mockAvailableTargetGroup from './mockAvailableTargetGroup'

describe('SelectSegmentsModalButton', () => {
  test('SelectSegmentsModalButton should render loading correctly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }

    mockImport('services/cf', {
      useGetTargetAvailableSegments: () => ({ loading: true, refetch: jest.fn() })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <SelectSegmentsModalButton
          {...params}
          environmentIdentifier="dummy"
          modalTitle="Test Title"
          onSubmit={jest.fn()}
          text="Open Modal"
        />
      </TestWrapper>
    )
    expect(getByText(container, 'Open Modal')).toBeDefined()

    const button = container.querySelector('button[type="button"]') as HTMLElement
    expect(button).toBeDefined()
    fireEvent.click(getByText(container, 'Open Modal'))

    await waitFor(() => expect(getByText(document.body, 'Test Title')).toBeDefined())

    expect(document.body.querySelector('[data-icon="spinner"]')).toBeDefined()
  })

  test('SelectSegmentsModalButton should render error correctly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }
    const message = 'ERROR OCCURS'

    mockImport('services/cf', {
      useGetTargetAvailableSegments: () => ({
        data: undefined,
        loading: false,
        error: { message },
        refetch: jest.fn()
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <SelectSegmentsModalButton
          {...params}
          environmentIdentifier="dummy"
          modalTitle="Test Title"
          onSubmit={jest.fn()}
          text="Open Modal"
        />
      </TestWrapper>
    )
    expect(getByText(container, 'Open Modal')).toBeDefined()

    fireEvent.click(getByText(container, 'Open Modal'))
    await waitFor(() => expect(getByText(document.body, 'Test Title')).toBeDefined())
    expect(getByText(document.body, message)).toBeDefined()
  })

  test('SelectSegmentsModalButton should render data correctly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }
    const onSubmit = jest.fn()

    mockImport('services/cf', {
      useGetTargetAvailableSegments: () => ({
        data: mockAvailableTargetGroup,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <SelectSegmentsModalButton
          {...params}
          environmentIdentifier="dummy"
          modalTitle="Test Title"
          onSubmit={onSubmit}
          text="Open Modal"
        />
      </TestWrapper>
    )
    expect(getByText(container, 'Open Modal')).toBeDefined()

    fireEvent.click(getByText(container, 'Open Modal'))
    await waitFor(() => expect(getByText(document.body, 'Test Title')).toBeDefined())
    expect(getByText(document.body, mockAvailableTargetGroup.segments[0].name)).toBeDefined()
    expect(getByText(document.body, mockAvailableTargetGroup.segments[1].name)).toBeDefined()

    // Add button must be disabled
    expect(document.body.querySelector('button[class*=bp3-disabled]')).toBeDefined()

    // Select two
    fireEvent.click(getByText(document.body, mockAvailableTargetGroup.segments[0].name))
    fireEvent.click(getByText(document.body, mockAvailableTargetGroup.segments[1].name))

    // Add button must be enable
    expect(document.body.querySelector('button[class*=bp3-disabled]')).toBeNull()
    const addButton = document.body.querySelector('button[class*=intent-primary]') as HTMLButtonElement
    expect(addButton).not.toBeNull()

    fireEvent.click(addButton)
    expect(onSubmit).toBeCalledTimes(1)
  })
})
