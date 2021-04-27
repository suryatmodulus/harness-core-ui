import React from 'react'
import { render, getByText, getAllByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import EnvironmentDetails from '../EnvironmentDetails'
import mockEnvironment from './mockEnvironment'
import mockApiKeys from './mockApiKeys'
import EnvironmentDetailsBody from '../EnvironmentDetailsBody'

describe('EnvironmentDetails', () => {
  test('EnvironmentDetails should render loading correctly', async () => {
    mockImport('@cf/hooks/useSyncedEnvironment', {
      useSyncedEnvironment: () => ({ loading: true, refetch: jest.fn() })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentDetails />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
  })

  test('EnvironmentDetails should render error correctly', async () => {
    const message = 'ERROR OCCURS'

    mockImport('@cf/hooks/useSyncedEnvironment', {
      useSyncedEnvironment: () => ({ data: undefined, loading: false, error: { message }, refetch: jest.fn() })
    })

    render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentDetails />
      </TestWrapper>
    )
    expect(getByText(document.body, message)).toBeDefined()
  })

  test('EnvironmentDetails should render data correctly', async () => {
    mockImport('services/cd-ng', {
      useGetEnvironment: () => ({ data: mockEnvironment, loading: false, error: undefined, refetch: jest.fn() })
    })

    mockImport('services/cf', {
      useGetAllAPIKeys: () => ({ data: mockApiKeys })
    })

    mockImport('@cf/hooks/useSyncedEnvironment', {
      useSyncedEnvironment: () => ({ data: mockEnvironment, loading: undefined, error: undefined, refetch: jest.fn() })
    })

    render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentDetails />
      </TestWrapper>
    )

    expect(getAllByText(document.body, mockEnvironment.data.name)).toBeDefined()
    expect(getAllByText(document.body, mockEnvironment.data.identifier)).toBeDefined()

    expect(getAllByText(document.body, mockApiKeys.apiKeys[0].name)).toBeDefined()
    expect(getAllByText(document.body, mockApiKeys.apiKeys[1].name)).toBeDefined()
  })

  test('CFEnvironmentDetailsBody should render loading', async () => {
    mockImport('services/cf', {
      useGetAllAPIKeys: () => ({ data: mockApiKeys })
    })

    render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentDetailsBody environment={mockEnvironment.data as EnvironmentResponseDTO} />
      </TestWrapper>
    )

    expect(document.body.querySelector('[class*=ContainerSpinner]')).toBeDefined()
  })

  test('CFEnvironmentDetailsBody should render error', async () => {
    mockImport('services/cf', {
      useGetAllAPIKeys: () => ({ error: { message: 'SOME ERROR' } })
    })

    render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentDetailsBody environment={mockEnvironment.data as EnvironmentResponseDTO} />
      </TestWrapper>
    )

    expect(document.body.querySelector('[class*=PageError]')).toBeDefined()
    expect(getByText(document.body, 'SOME ERROR')).toBeDefined()
  })

  test('CFEnvironmentDetailsBody should render empty state', async () => {
    mockImport('services/cf', {
      useGetAllAPIKeys: () => ({ data: { apiKeys: [] } })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentDetailsBody environment={mockEnvironment.data as EnvironmentResponseDTO} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
