import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { TestWrapper } from '@common/utils/testUtils'
import testConnectionSuccess from '@connectors/common/VerifyOutOfClusterDelegate/__tests__/mockData/test-connection-success.json'
import delegateNameresponse from '@connectors/common/VerifyOutOfClusterDelegate/__tests__/mockData/delegate-name-response-error.json'

import { Connectors } from '@connectors/constants'
import TestConnection from '../TestConnection'

jest.mock('services/portal', () => ({
  useGetDelegateFromId: jest.fn().mockImplementation(() => {
    return { ...delegateNameresponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useGetTestConnectionResult: jest.fn().mockImplementation(() => {
    return { data: testConnectionSuccess, refetch: jest.fn(), error: null }
  })
}))

describe('Test Connection', () => {
  test('render test connection', () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <MemoryRouter>
          <TestConnection
            connectorType={Connectors.KUBERNETES_CLUSTER}
            connectorIdentifier="connectorId"
            url={'kubernetes_mock_url'}
            refetchConnector={jest.fn()}
          />
        </MemoryRouter>
      </TestWrapper>
    )
    expect(getByText('connectors.stepThreeName')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('render test connection verify out of cluster ', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <MemoryRouter>
          <TestConnection
            connectorType={Connectors.KUBERNETES_CLUSTER}
            connectorIdentifier="connectorId"
            url={'kubernetes_mock_url'}
            refetchConnector={jest.fn()}
          />
        </MemoryRouter>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const testBtn = container.querySelector('[class*="testButton"]')
    expect(testBtn).not.toBeNull()
    expect(getByText('connectors.stepThreeName')).toBeDefined()
    if (testBtn) {
      await act(async () => {
        fireEvent.click(testBtn)
      })
    }

    expect(container).toMatchSnapshot()
  })
})
