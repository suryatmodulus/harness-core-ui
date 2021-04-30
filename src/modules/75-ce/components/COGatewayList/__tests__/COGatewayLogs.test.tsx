import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import COGatewayLogs from '../COGatewayLogs'

const mockedServiceData = {
  id: 1,
  name: 'string',
  org_id: 'string',
  fulfilment: 'string',
  kind: 'string',
  cloud_account_id: 'string'
}

const mockedData = [
  {
    id: 3991,
    service_id: 22,
    state: 'coolingdown',
    message: null,
    error: null,
    created_at: '2021-04-05T13:14:58.857084Z'
  },
  {
    id: 3991,
    service_id: 22,
    state: 'coolingdown',
    message: null,
    error: 'Error: null',
    created_at: '2021-04-05T13:14:58.857084Z'
  },
  {
    id: 3991,
    service_id: 22,
    state: 'active',
    message: null,
    error: null,
    created_at: '2021-04-05T13:14:58.857084Z'
  }
]

jest.mock('services/lw', () => ({
  useLogsOfService: jest.fn().mockImplementation(() => ({ data: { response: mockedData }, loading: false }))
}))

describe('Auto stopping rule logs', () => {
  test('should show logs', () => {
    const { container } = render(
      <TestWrapper>
        <COGatewayLogs service={mockedServiceData} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
