import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Container, FormInput } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { useValidateConnector } from 'services/cv'
import * as cvService from 'services/cv'
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

describe('Unit tests for SelectActivitySource', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test('Ensure validation works', async () => {
    jest.spyOn(cvService, 'useValidateConnector').mockImplementation((): any => {
      return {
        refetch: jest.fn(),
        error: null,
        loading: false,
        absolutePath: '',
        cancel: jest.fn(),
        response: null
      }
    })
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
    jest.spyOn(cvService, 'useValidateConnector').mockImplementation((): any => {
      return {
        refetch: jest.fn(),
        error: { message: 'error' },
        loading: false
      }
    })
    const onSubmitMockFunc = jest.fn()
    const { container, getByTestId } = render(
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

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) {
      throw Error('Submit button was not rendered.')
    }

    fireEvent.click(submitButton)

    await waitFor(() => expect(getByTestId('connectorError')).not.toBeNull())

    await waitFor(() => expect(useValidateConnector).toHaveBeenLastCalledWith({ lazy: true }))

    await waitFor(() => expect(onSubmitMockFunc).not.toHaveBeenCalled())
  })
})
