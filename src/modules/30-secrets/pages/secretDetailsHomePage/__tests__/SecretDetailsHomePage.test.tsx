import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import SecretDetailsHomePage from '../SecretDetailsHomePage'
import mockData from './secret-details-home-data.json'

jest.mock('services/cd-ng', () => ({
  useGetSecretV2: jest.fn().mockImplementation(() => {
    return { ...mockData, refetch: jest.fn(), error: null }
  })
}))

describe('Secret Details', () => {
  test('render for data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretDetailsHomePage mockSecretDetails={mockData as any} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('render for no  data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretDetailsHomePage mockSecretDetails={{} as any} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
