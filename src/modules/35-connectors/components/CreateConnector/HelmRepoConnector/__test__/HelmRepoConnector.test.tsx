import React from 'react'
import { render, fireEvent, queryByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import HelmRepoConnector from '../HemRepoConnector'
import { mockResponse, dockerMock, mockSecret, backButtonMock } from '../helmMock'
import { backButtonTest } from '../../commonTest'

const createConnector = jest.fn()
const updateConnector = jest.fn()
const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateSelectors: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  }),
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn())
}))
jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret)),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn())
}))

describe('Create Helm Connector  Wizard', () => {
  test('Should render form', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <HelmRepoConnector
          mock={mockResponse}
          isEditMode={false}
          onClose={jest.fn()}
          orgIdentifier="testOrg"
          projectIdentifier="test"
          accountId="testAcc"
        />
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

  test('Should render form for editing provider type', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <HelmRepoConnector
          isEditMode={true}
          onClose={jest.fn()}
          connectorInfo={dockerMock}
          mock={mockResponse}
          orgIdentifier="testOrg"
          projectIdentifier="test"
          accountId="testAcc"
        />
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
    // step 2
    expect(queryByText(container, 'Helm Registry URL')).toBeDefined()
    expect(container).toMatchSnapshot()

    //updating connector
    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(updateConnector).toBeCalledWith({
      connector: {
        description: 'devConnector description',
        identifier: 'devConnector',
        name: 'dummy name',
        spec: {
          delegateSelectors: [],
          auth: { type: 'Anonymous' },
          helmRepoUrl: 'https://index.docker.io/v2/'
        },
        tags: {},
        type: 'HttpHelmRepo'
      }
    })
  })

  backButtonTest({
    Element: (
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <HelmRepoConnector
          isEditMode={true}
          connectorInfo={backButtonMock}
          mock={mockResponse}
          onClose={jest.fn()}
          orgIdentifier="testOrg"
          projectIdentifier="test"
          accountId="testAcc"
        />
      </TestWrapper>
    ),
    backButtonSelector: '[data-name="helmBackButton"]',
    mock: backButtonMock
  })
})
