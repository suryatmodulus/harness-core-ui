import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'

import COProviderSelector from '../COProviderSelector'

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
        name: 'string',
        icon: 'string',
        value: 'string'
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
})
