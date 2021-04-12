import React from 'react'
import { noop } from 'lodash-es'
import { render, fireEvent, queryByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { mockResponse, mockSecret, encryptedKeyMock, backButtonMock } from './mocks'
import CreateGcpConnector from '../CreateGcpConnector'
import { backButtonTest } from '../../commonTest'

const commonProps = {
  accountId: 'dummy',
  orgIdentifier: '',
  projectIdentifier: '',
  setIsEditMode: noop,
  onClose: noop,
  onSuccess: noop
}

const createConnector = jest.fn()
const updateConnector = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegateSelectors: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret))
}))

describe('Create GCP connector Wizard', () => {
  test('Should render form', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGcpConnector {...commonProps} isEditMode={false} connectorInfo={undefined} />
      </TestWrapper>
    )

    // fill step 1
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })
    // match step 1
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // match step 2
    expect(container).toMatchSnapshot()
  })

  test('Should render form for edit authtype encryptedKey', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGcpConnector {...commonProps} isEditMode={true} connectorInfo={encryptedKeyMock} mock={mockResponse} />
      </TestWrapper>
    )
    // editing connector name
    await act(async () => {
      fireEvent.change(container.querySelector('input[name="name"]')!, {
        target: { value: 'dummy name' }
      })
    })
    expect(container).toMatchSnapshot()
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(queryByText(container, 'connectors.GCP.delegateOutClusterInfo')).toBeTruthy()
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    // updating connector
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    const delegateSelector = container.querySelector('[data-name="DelegateSelectors"]')
    expect(delegateSelector).toBeTruthy()

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(updateConnector).toBeCalledWith({
      connector: {
        ...encryptedKeyMock,
        name: 'dummy name'
      }
    })
  })

  backButtonTest({
    Element: (
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <CreateGcpConnector {...commonProps} isEditMode={true} connectorInfo={backButtonMock} mock={mockResponse} />
      </TestWrapper>
    ),
    backButtonSelector: '[data-name="gcpBackButton"]',
    mock: backButtonMock
  })
})
