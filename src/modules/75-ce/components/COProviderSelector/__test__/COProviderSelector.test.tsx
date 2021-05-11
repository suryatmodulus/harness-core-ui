import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'

import COProviderSelector from '../COProviderSelector'

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({ loading: false, refetch: jest.fn(), data: undefined }))
}))

describe('COProviderSelector', () => {
  const props = {
    nextTab: jest.fn(),
    setGatewayDetails: jest.fn(),
    gatewayDetails: {
      name: '',
      cloudAccount: {
        id: 'id',
        name: 'name'
      },
      idleTimeMins: 12,
      fullfilment: '',
      filter: '',
      kind: 'string',
      orgID: 'string',
      projectID: 'string',
      routing: {
        instance: {
          filterText: 'string'
        },
        lb: 'string',
        ports: []
      },
      healthCheck: {},
      opts: {
        preservePrivateIP: true,
        deleteCloudResources: true,
        alwaysUsePrivateIP: true
      },
      provider: {
        name: 'AWS',
        icon: 'service-aws',
        value: 'aws'
      },
      selectedInstances: [],
      accessPointID: 'string',
      accountID: 'string',
      metadata: {},
      deps: []
    }
  }
  describe('Rendering', () => {
    test('should render COProviderSelector', () => {
      const { container } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <COProviderSelector {...props} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })

  test('selecting AWS provider shows option to select connector', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: 'testAcc', projectIdentifier: 'projectIdentifier', orgIdentifier: 'orgIdentifier' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <COProviderSelector {...props} />
      </TestWrapper>
    )

    const awsCard = container.querySelector('.bp3-card')
    expect(awsCard).toBeDefined()
    act(() => {
      fireEvent.click(awsCard!)
    })
    const connectorLabel = container.querySelector('label.bp3-label')
    expect(connectorLabel).toBeDefined()
    if (connectorLabel)
      expect(connectorLabel.textContent).toBe('ce.co.gatewayBasics.connect AWS ce.co.gatewayBasics.account ')
    expect(container).toMatchSnapshot()
  })
})
