import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import COInstanceSelector from '../COInstanceSelector'

const initialGatewayDetails = {
  name: '',
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
    alwaysUsePrivateIP: false
  },
  provider: {
    name: 'Azure',
    value: 'azure',
    icon: 'service-azure'
  },
  selectedInstances: [],
  accessPointID: '',
  metadata: {},
  deps: []
}

const mockedInstance = {
  id: 'i-008',
  name: 'instance',
  region: 'us-west-1',
  ipv4: '',
  type: '',
  tags: '',
  launch_time: '', // eslint-disable-line
  status: 'running',
  vpc: ''
}

describe('Instance Selector Modal', () => {
  test('should show loader while loading data', () => {
    const { container } = render(
      <TestWrapper>
        <COInstanceSelector
          selectedInstances={[]}
          setSelectedInstances={jest.fn()}
          setGatewayDetails={jest.fn()}
          instances={[]}
          gatewayDetails={initialGatewayDetails}
          search={jest.fn()}
          onInstancesAddSuccess={jest.fn()}
          loading={true}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(container.querySelector('span[data-icon="spinner"]')).toBeDefined()
  })

  test('should show data', () => {
    const { container, getAllByRole } = render(
      <TestWrapper>
        <COInstanceSelector
          selectedInstances={[]}
          setSelectedInstances={jest.fn()}
          setGatewayDetails={jest.fn()}
          instances={[mockedInstance]}
          gatewayDetails={initialGatewayDetails}
          search={jest.fn()}
          onInstancesAddSuccess={jest.fn()}
          loading={false}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(container.querySelector('span[data-icon="spinner"]')).toBeFalsy()
    const tableRows = getAllByRole('row')
    expect(tableRows.length).toBeGreaterThan(1)
  })

  test('search and select instances successfully', async () => {
    const { container } = render(
      <TestWrapper>
        <COInstanceSelector
          selectedInstances={[]}
          setSelectedInstances={jest.fn()}
          setGatewayDetails={jest.fn()}
          instances={[mockedInstance]}
          gatewayDetails={initialGatewayDetails}
          search={jest.fn()}
          onInstancesAddSuccess={jest.fn()}
          loading={false}
        />
      </TestWrapper>
    )
    const input = container.querySelector('input[type="search"]') as HTMLInputElement
    expect(input).toBeDefined()
    await waitFor(() => {
      fireEvent.change(input, { target: { value: 'instance' } })
    })
    expect(input.value).toBe('instance')
    expect(container).toMatchSnapshot()

    const checkInput = container.querySelector('input[type="checkbox"]')
    expect(checkInput).toBeDefined()
    act(() => {
      fireEvent.click(checkInput!)
    })
    expect(checkInput).toMatchSnapshot()
  })
})
