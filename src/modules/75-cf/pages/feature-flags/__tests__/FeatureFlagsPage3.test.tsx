import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import mockEnvironments from '@cf/pages/environments/__tests__/mockEnvironments'
import FeatureFlagsPage from '../FeatureFlagsPage'
import mockFeatureFlags from './mockFeatureFlags'

jest.mock('@cf/hooks/useGitSync', () => ({
  useGitSync: jest.fn(() => ({
    getGitSyncFormMeta: jest.fn().mockReturnValue({
      gitSyncInitialValues: {},
      gitSyncValidationSchema: {}
    }),
    isAutoCommitEnabled: false,
    isGitSyncEnabled: false,
    handleAutoCommit: jest.fn()
  }))
}))

describe('FeatureFlagsPage', () => {
  test('FeatureFlagsPage should render data correctly', async () => {
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, refetch: jest.fn() })
    })

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { getAllByText } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FeatureFlagsPage />
      </TestWrapper>
    )

    expect(getAllByText(mockFeatureFlags.features[0].name)).toBeDefined()
    expect(getAllByText(mockFeatureFlags.features[1].name)).toBeDefined()
  })

  test('Should go to edit page by clicking a row', async () => {
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, refetch: jest.fn() })
    })

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FeatureFlagsPage />
      </TestWrapper>
    )

    fireEvent.click(container.getElementsByClassName('row card clickable')[0] as HTMLElement)

    expect(getByText('/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/hello_world')).toBeDefined()
  })

  test('Should go to edit page by clicking edit', async () => {
    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, refetch: jest.fn() })
    })

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FeatureFlagsPage />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="edit"]') as HTMLElement)

    expect(
      getByText('/account/dummy/cf/orgs/dummy/projects/dummy/feature-flags/hello_world?activeEnvironment=sfgsd')
    ).toBeDefined()
  })

  test('Should allow deleting', async () => {
    const mutate = jest.fn(() => {
      return Promise.resolve({ data: {} })
    })

    mockImport('services/cf', {
      useGetAllFeatures: () => ({ data: mockFeatureFlags, refetch: jest.fn() }),
      useDeleteFeatureFlag: () => ({ mutate })
    })

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <FeatureFlagsPage />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[role="row"]:not(:first-of-type) [data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)

    fireEvent.click(document.querySelector('button[class*=intent-danger]') as HTMLButtonElement)
    await waitFor(() => expect(mutate).toBeCalledTimes(1))
  })
})
