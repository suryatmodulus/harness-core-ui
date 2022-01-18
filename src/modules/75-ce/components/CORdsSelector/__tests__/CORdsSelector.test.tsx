/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import CORdsSelector from '../CORdsSelector'

const pathParams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

const gatewayDetails = {
  name: 'Rule1',
  cloudAccount: {
    id: '',
    name: ''
  },
  idleTimeMins: 15,
  fullfilment: '',
  filter: '',
  kind: 'instance',
  orgID: 'orgIdentifier',
  projectID: 'projectIdentifier',
  accountID: 'accountId',
  hostName: '',
  customDomains: [],
  matchAllSubdomains: false,
  disabled: false,
  routing: {
    instance: {
      filterText: ''
    },
    lb: '',
    ports: []
  },
  healthCheck: {
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30
  },
  opts: {
    preservePrivateIP: false,
    deleteCloudResources: false,
    alwaysUsePrivateIP: false,
    access_details: {},
    hide_progress_page: false
  },
  provider: {
    name: 'AWS',
    value: 'aws',
    icon: 'service-aws'
  },
  selectedInstances: [],
  accessPointID: '',
  metadata: {},
  deps: []
}

const mockedRegionsData = { data: { response: [{ name: 'us-east-1', label: 'us-east-1' }] }, loading: false }

const mockedDbData = {
  mutate: jest.fn(() => Promise.resolve({ data: { response: [{ name: 'dummy-db', id: 'dummy-id' }] } })),
  loading: false
}

jest.mock('services/lw', () => ({
  useAllRegions: jest.fn().mockImplementation(() => mockedRegionsData),
  useAllResourcesOfAccount: jest.fn().mockImplementation(() => mockedDbData)
}))

describe('RDS DB Selector Modal', () => {
  test('should display message for selecting region', () => {
    const { container, getByText } = render(
      <TestWrapper pathParams={pathParams}>
        <CORdsSelector gatewayDetails={gatewayDetails} onDbAddSuccess={jest.fn()} setGatewayDetails={jest.fn()} />
      </TestWrapper>
    )

    const emptyText = getByText('ce.co.autoStoppingRule.configuration.rdsModal.emptyDescription')
    expect(emptyText).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test('should fill in region display list of databases', () => {
    const { container, getByText } = render(
      <TestWrapper pathParams={pathParams}>
        <CORdsSelector gatewayDetails={gatewayDetails} onDbAddSuccess={jest.fn()} setGatewayDetails={jest.fn()} />
      </TestWrapper>
    )

    const regionDropdown = container.querySelector(`input[name="rdsRegion"]`) as HTMLInputElement
    const regionCaret = container
      .querySelector(`input[name="rdsRegion"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    act(() => {
      fireEvent.click(regionCaret!)
    })

    const regionToSelect = getByText('us-east-1')
    expect(regionToSelect).toBeDefined()
    act(() => {
      fireEvent.click(regionToSelect)
    })

    expect(regionDropdown.value).toBe('us-east-1')

    expect(container).toMatchSnapshot()
  })
})
