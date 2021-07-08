import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CECODashboardPage from '../COCreateGateway'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ loading: false, refetch: jest.fn(), data: undefined }))
}))

describe('Create Auto Stopping rule', () => {
  test('Render cloud provider & connector selection screen', async () => {
    const { container } = render(
      <TestWrapper>
        <CECODashboardPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
