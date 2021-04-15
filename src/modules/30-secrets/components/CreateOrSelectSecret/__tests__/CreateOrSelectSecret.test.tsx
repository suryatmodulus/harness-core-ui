import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import CreateOrSelectSecret from '../CreateOrSelectSecret'

import connectorsListMockData from './connectorsListMockdata.json'
import secretsListMockData from './secretsListMockData.json'
import connectorDetailsMockData from './getConnectorMock.json'

const successCallback = jest.fn()

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetConnectorList: () => {
    return {
      data: connectorsListMockData,
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: connectorDetailsMockData,
      refetch: jest.fn()
    }
  }
}))

describe('CreateOrSelectSecret', () => {
  test('render', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <CreateOrSelectSecret
          type="SecretText"
          onSuccess={successCallback}
          secretsListMockData={secretsListMockData as any}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getByText('Create a new secret')).toBeDefined()
    })

    expect(container).toMatchSnapshot()

    const $selectTab = getByText('Select an existing secret')
    await act(async () => {
      fireEvent.click($selectTab)
    })

    const $secret = getByText('demo-1')
    await act(async () => {
      fireEvent.click($secret)
    })

    const $applyBtn = getByText('entityReference.apply')
    await act(async () => {
      fireEvent.click($applyBtn)
    })

    expect(successCallback).toHaveBeenCalled()
  })
})
