import React from 'react'
import { getByText, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockEnvironments from '@cf/pages/environments/__tests__/mockEnvironments'
import mockImport from 'framework/utils/mockImport'
import { TargetsPage } from '../TargetsPage'

describe('TargetsPage', () => {
  test('TargetsPage should render loading correctly 1', async () => {
    mockImport('services/cf', {
      useGetAllTargets: () => ({ loading: true, refetch: jest.fn() })
    })

    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        data: undefined,
        loading: true,
        error: undefined,
        refetch: jest.fn(),
        EnvironmentSelect: function EnvironmentSelect() {
          return <div />
        }
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <TargetsPage />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
  })

  test('TargetsPage should render loading correctly 2', async () => {
    mockImport('services/cf', {
      useGetAllTargets: () => ({ loading: false, data: { segments: [] }, refetch: jest.fn() })
    })

    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        data: undefined,
        loading: true,
        error: undefined,
        refetch: jest.fn(),
        EnvironmentSelect: function EnvironmentSelect() {
          return <div />
        }
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <TargetsPage />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
  })

  test('TargetsPage should render loading correctly 3', async () => {
    mockImport('services/cf', {
      useGetAllTargets: () => ({ loading: true, refetch: jest.fn() })
    })

    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        environments: [],
        loading: false,
        error: undefined,
        refetch: jest.fn(),
        EnvironmentSelect: function EnvironmentSelect() {
          return <div />
        }
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <TargetsPage />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
  })

  test('TargetsPage should render error correctly 1', async () => {
    const error = { message: 'SOME ERROR OCCURS' }
    mockImport('services/cf', {
      useGetAllTargets: () => ({ error, loading: false, refetch: jest.fn() })
    })

    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        environments: [{}],
        loading: false,
        error: undefined,
        refetch: jest.fn(),
        EnvironmentSelect: function EnvironmentSelect() {
          return <div />
        }
      })
    })

    render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <TargetsPage />
      </TestWrapper>
    )

    expect(getByText(document.body, error.message)).toBeDefined()
  })

  test('TargetsPage should render error correctly 2', async () => {
    const error = { message: 'SOME ERROR OCCURS' }
    mockImport('services/cf', {
      useGetAllTargets: () => ({ data: [], loading: false, refetch: jest.fn() })
    })

    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        environments: undefined,
        loading: false,
        error,
        refetch: jest.fn(),
        EnvironmentSelect: function EnvironmentSelect() {
          return <div />
        }
      })
    })

    render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <TargetsPage />
      </TestWrapper>
    )

    expect(getByText(document.body, error.message)).toBeDefined()
  })

  test('TargetsPage should render data correctly', async () => {
    mockImport('services/cf', {
      useGetAllTargets: () => ({
        data: [
          {
            itemCount: 1,
            pageCount: 1,
            pageIndex: 0,
            pageSize: 15,
            targets: [
              {
                account: '',
                anonymous: false,
                attributes: {},
                createdAt: 1615914009436,
                environment: 'QA',
                identifier: 'harness',
                name: 'harness test',
                org: '',
                project: 'FeatureFlagsQADemo',
                segments: []
              }
            ]
          }
        ],
        loading: false,
        refetch: jest.fn()
      })
    })

    mockImport('@cf/hooks/useEnvironmentSelectV2', {
      useEnvironmentSelectV2: () => ({
        environments: mockEnvironments,
        loading: false,
        refetch: jest.fn(),
        EnvironmentSelect: function EnvironmentSelect() {
          return <div />
        }
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <TargetsPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
