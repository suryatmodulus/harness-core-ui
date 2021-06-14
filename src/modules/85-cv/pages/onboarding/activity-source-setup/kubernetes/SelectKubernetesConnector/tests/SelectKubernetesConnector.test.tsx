import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Container, FormInput } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { useValidateConnector } from 'services/cv'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { SelectKubernetesConnector } from '../SelectKubernetesConnector'

const MockConnectorObj = {
  connector: {
    identifier: '1234_ident',
    name: 'connector'
  }
}

jest.mock('@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector', () => ({
  ...(jest.requireActual('@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector') as any),
  ConnectorSelection: function MockComponent(props: any) {
    return (
      <Container className="mockInput">
        <FormInput.Text name="connectorRef" />
        <button onClick={() => props.onSuccess(MockConnectorObj)} />
      </Container>
    )
  }
}))

jest.mock('services/cv', () => ({
  useValidateConnector: jest
    .fn()
    .mockReturnValueOnce({
      data: {},
      loading: false,
      error: null
    })
    .mockReturnValue({
      data: {},
      loading: true,
      error: { status: 'error' }
    })
}))

describe('Unit tests for SelectActivitySource', () => {
  test('Ensure validation works', async () => {
    const onSubmitMockFunc = jest.fn()
    const { container } = render(
      <TestWrapper
        path={routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_accountId',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <SelectKubernetesConnector onSubmit={onSubmitMockFunc} onPrevious={() => undefined} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    const mockInputButton = container.querySelector('[class*="mockInput"] button')
    if (!mockInputButton) {
      throw Error('Mock input button was not rendered')
    }

    fireEvent.click(mockInputButton)
    await waitFor(() => undefined)

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('Submit button was not rendered.')
    }

    fireEvent.click(submitButton)

    await waitFor(() =>
      expect(useValidateConnector).toHaveBeenCalledWith({
        queryParams: {
          accountId: '1234_accountId',
          connectorIdentifier: 'account.1234_ident',
          dataSourceType: 'KUBERNETES',
          orgIdentifier: '1234_ORG',
          projectIdentifier: '1234_project',
          tracingId: 'account.1234_ident:testConnection'
        }
      })
    )

    await waitFor(() =>
      expect(onSubmitMockFunc).toHaveBeenCalledWith({
        connectorRef: {
          label: 'connector',
          scope: 'account',
          value: 'account.1234_ident'
        },
        connectorType: 'Kubernetes',
        identifier: '',
        name: '',
        selectedNamespaces: [],
        selectedWorkloads: new Map()
      })
    )
  })

  test('Ensure connector validation fails', async () => {
    const onSubmitMockFunc = jest.fn()
    const { container } = render(
      <TestWrapper
        path={routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_accountId',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <SelectKubernetesConnector onSubmit={onSubmitMockFunc} onPrevious={() => undefined} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    const mockInputButton = container.querySelector('[class*="mockInput"] button')
    if (!mockInputButton) {
      throw Error('Mock input button was not rendered')
    }

    fireEvent.click(mockInputButton)
    await waitFor(() => undefined)

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('Submit button was not rendered.')
    }

    fireEvent.click(submitButton)

    expect(container.querySelector('p[test-id="connectorError"]')).toBeNull()

    await waitFor(() =>
      expect(useValidateConnector).toHaveBeenCalledWith({
        queryParams: {
          accountId: '1234_accountId',
          connectorIdentifier: 'account.1234_ident',
          dataSourceType: 'KUBERNETES',
          orgIdentifier: '1234_ORG',
          projectIdentifier: '1234_project',
          tracingId: 'account.1234_ident:testConnection'
        }
      })
    )

    await waitFor(() => expect(onSubmitMockFunc).not.toHaveBeenCalled())
  })
})
