import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import JiraConnector from '../JiraConnector'
import { mockResponse, mockSecret, backButtonMock } from '../jiraMock'
import { backButtonTest } from '../../commonTest'

const createConnector = jest.fn()
const updateConnector = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn())
}))
jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret)),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn())
}))

describe('Create Jira Connector  Wizard', () => {
  test('Should render form', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <JiraConnector
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

  backButtonTest({
    Element: (
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <JiraConnector
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
    backButtonSelector: '[data-name="jiraBackButton"]',
    mock: backButtonMock
  })
})
