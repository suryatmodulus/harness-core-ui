/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
        alwaysUsePrivateIP: true,
        access_details: {},
        hide_progress_page: false
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
    if (connectorLabel) expect(connectorLabel.textContent).toBe('ce.co.gatewayBasics.connect AWS rbac.account ')
    expect(container).toMatchSnapshot()
  })

  test('passing a provider property shows the gateway basics', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: 'testAcc', projectIdentifier: 'projectIdentifier', orgIdentifier: 'orgIdentifier' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <COProviderSelector {...props} provider="CEAws" />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('selecting Azure provider shows option to select connector', () => {
    const azureProps = {
      ...props,
      gatewayDetails: {
        ...props.gatewayDetails,
        provider: {
          name: 'Azure',
          icon: 'service-azure',
          value: 'azure'
        }
      }
    }
    const { container } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: 'testAcc', projectIdentifier: 'projectIdentifier', orgIdentifier: 'orgIdentifier' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <COProviderSelector {...azureProps} />
      </TestWrapper>
    )

    const awsCard = container.querySelector('.bp3-card')
    expect(awsCard).toBeDefined()
    act(() => {
      fireEvent.click(awsCard!)
    })
    const connectorLabel = container.querySelector('label.bp3-label')
    expect(connectorLabel).toBeDefined()
    if (connectorLabel) expect(connectorLabel.textContent).toBe('ce.co.gatewayBasics.connect Azure rbac.account ')
    expect(container).toMatchSnapshot()
  })

  test('selecting GCP provider shows option to select connector', () => {
    const gcpProps = {
      ...props,
      gatewayDetails: {
        ...props.gatewayDetails,
        provider: {
          name: 'GCP',
          icon: 'gcp',
          value: 'gcp'
        }
      }
    }
    const { container } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: 'testAcc', projectIdentifier: 'projectIdentifier', orgIdentifier: 'orgIdentifier' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <COProviderSelector {...gcpProps} />
      </TestWrapper>
    )

    const awsCard = container.querySelector('.bp3-card')
    expect(awsCard).toBeDefined()
    act(() => {
      fireEvent.click(awsCard!)
    })
    const connectorLabel = container.querySelector('label.bp3-label')
    expect(connectorLabel).toBeDefined()
    if (connectorLabel) expect(connectorLabel.textContent).toBe('ce.co.gatewayBasics.connect GCP rbac.account ')
    expect(container).toMatchSnapshot()
  })
})
