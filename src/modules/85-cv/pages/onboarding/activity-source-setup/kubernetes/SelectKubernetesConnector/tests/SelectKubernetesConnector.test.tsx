import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Container, FormInput } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as CVService from 'services/cv'
import * as toaster from '@common/components/Toaster/useToaster'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { SelectKubernetesConnector } from '../SelectKubernetesConnector'

const MockConnectorObj = {
  connector: {
    identifier: '1234_ident',
    name: 'connector'
  }
}

const STATUS = {
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS'
}

const errorConnectorValidation = 'No Delegates found'

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
  test('Ensure validation works', async () => {
    jest.spyOn(CVService, 'validateConnectorPromise').mockResolvedValue({
      status: STATUS.SUCCESS
    } as any)
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

  test('Ensure user is not able to move to Choose Namespace Section if connector validation fails', async () => {
    jest.spyOn(CVService, 'validateConnectorPromise').mockResolvedValue({
      status: STATUS.ERROR,
      message: errorConnectorValidation
    } as any)
    const showError = jest.fn()
    const useToasterSpy = jest.spyOn(toaster, 'useToaster')
    useToasterSpy.mockImplementation(
      () =>
        ({
          showError
        } as any)
    )
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
    await waitFor(() => expect(showError).toHaveBeenCalledWith(errorConnectorValidation))
    await waitFor(() => expect(onSubmitMockFunc).not.toHaveBeenCalled())
  })
})
