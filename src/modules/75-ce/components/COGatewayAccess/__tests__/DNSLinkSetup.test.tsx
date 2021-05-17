import React from 'react'
import { act } from 'react-dom/test-utils'
import { findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { AccessPoint, AccessPointCore } from 'services/lw'
import DNSLinkSetup from '../DNSLinkSetup'

let mockAccessPointList = {
  response: [
    {
      name: 'mock.com',
      id: 'mock.com',
      host_name: 'mock.com',
      metadata: {
        albArn: 'mockalbARN'
      }
    } as AccessPoint
  ]
}
let mockedHostedZonesData = {
  data: {
    response: [{ id: 'route53mock.com', name: 'route53mock.com' }]
  },
  loading: false,
  refetch: jest.fn(() => Promise.resolve({ data: { response: [{ id: 'route53mock.com', name: 'route53mock.com' }] } }))
}
const mockURL = 'mock.com'
const testpath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/create'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

const accessDetails = {
  dnsLink: { selected: true },
  ssh: { selected: false },
  rdp: { selected: false },
  backgroundTasks: { selected: false },
  ipaddress: { selected: false }
}

const mockAccessPointResourceData = {
  response: [
    {
      details: {
        albARN: 'mockalbARN',
        name: 'mockALBname',
        id: 'mock.com'
      }
    }
  ] as AccessPointCore[]
}

jest.mock('services/lw', () => ({
  useListAccessPoints: jest.fn().mockImplementation(() => ({
    data: mockAccessPointList,
    loading: false,
    refetch: jest.fn(() => mockAccessPointList)
  })),
  useAllHostedZones: jest.fn().mockImplementation(() => mockedHostedZonesData),
  useAccessPointResources: jest.fn().mockImplementation(() => ({
    data: mockAccessPointResourceData,
    loading: false,
    refetch: jest.fn(() => mockAccessPointResourceData)
  })),
  useCreateAccessPoint: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  }))
}))

const initialGatewayDetails = {
  name: 'mockname',
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
    name: 'AWS',
    value: 'aws',
    icon: 'service-aws'
  },
  selectedInstances: [
    {
      id: '1',
      ipv4: '',
      launch_time: '', // eslint-disable-line
      name: '',
      region: 'us-east-2',
      status: 'stopped',
      tags: '',
      type: 't2.micro',
      vpc: 'vpc-4e233426'
    }
  ],
  accessPointID: '',
  metadata: {
    security_groups: [], // eslint-disable-line
    access_details: accessDetails // eslint-disable-line
  },
  deps: []
}

describe('Use DNS for Setup', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <DNSLinkSetup
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          setHelpTextSections={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('form fills without error', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <DNSLinkSetup
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          setHelpTextSections={jest.fn()}
        />
      </TestWrapper>
    )

    const notUsingCustomDomain = container.querySelector('input[name="notUsingCustomDomain"]') as HTMLInputElement
    expect(notUsingCustomDomain).toBeDefined()

    const accessPointDropDown = container.querySelector('input[name="accessPoint"]') as HTMLInputElement
    const generatedHostName = await findByText(container, 'ce.co.dnsSetup.autoURL')
    expect(generatedHostName).toBeDefined()
    expect(accessPointDropDown).toBeDefined()

    // selecting resource
    const accessPointCaret = container
      .querySelector(`input[name="accessPoint"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(accessPointCaret!)
    })
    const apToSelect = await findByText(container, 'mockALBname')
    expect(apToSelect).toBeDefined()
    act(() => {
      fireEvent.click(apToSelect)
    })
    expect(accessPointDropDown.value).toBe('mockALBname')
    expect(generatedHostName.textContent).toBe('orgidentifier-mockname.mock.com')

    // adding custom url
    const customURL = container.querySelector('input[name="customURL"]') as HTMLInputElement
    expect(customURL).toBeDefined()
    expect(customURL.value).toBe('')

    const usingCustomDomain = container.querySelector('input[name="usingCustomDomain"]') as HTMLInputElement
    act(() => {
      fireEvent.click(usingCustomDomain)
    })
    expect(usingCustomDomain.checked).toBe(true)
    await waitFor(() => {
      fireEvent.change(customURL, { target: { value: mockURL } })
    })
    expect(customURL.value).toBe(mockURL)

    // mapping other/route53 domain
    const route53 = container.querySelector('input[name="route53RadioBtn"]') as HTMLInputElement
    expect(route53).toBeDefined()
    act(() => {
      fireEvent.click(route53)
    })
    expect(route53.checked).toBe(true)

    const route53Account = container.querySelector('input[name="route53Account"]') as HTMLInputElement
    expect(route53Account).toBeDefined()
    const route53Caret = container
      .querySelector(`input[name="route53Account"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(route53Caret!)
    })
    const route53ToSelect = await findByText(container, 'route53mock.com')
    act(() => {
      fireEvent.click(route53ToSelect)
    })
    expect(route53Account.value).toBe('route53mock.com')
  })

  test('No Access Point is available', () => {
    mockAccessPointList = { response: [] }
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <DNSLinkSetup
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          setHelpTextSections={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('No hosted zone is available', () => {
    mockedHostedZonesData = {
      data: {
        response: []
      },
      loading: false,
      refetch: jest.fn(() => Promise.resolve({ data: { response: [] } }))
    }
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <DNSLinkSetup
          gatewayDetails={initialGatewayDetails}
          setGatewayDetails={jest.fn()}
          setHelpTextSections={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('Azure DNS setup', () => {
  test('render azure dns setup page', async () => {
    const azureProvider = {
      name: 'Azure',
      value: 'azure',
      icon: 'service-azure'
    }

    mockAccessPointList = {
      response: [
        {
          name: 'mock.com',
          id: 'mock.com',
          host_name: 'mock.com',
          metadata: {
            albArn: 'mockalbARN',
            app_gateway_id: 'mock.com'
          }
        }
      ]
    }
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <DNSLinkSetup
          gatewayDetails={{ ...initialGatewayDetails, provider: azureProvider }}
          setGatewayDetails={jest.fn()}
          setHelpTextSections={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const accessPointDropDown = container.querySelector('input[name="accessPoint"]') as HTMLInputElement
    const generatedHostName = await findByText(container, 'ce.co.dnsSetup.autoURL')
    expect(generatedHostName).toBeDefined()
    expect(accessPointDropDown).toBeDefined()

    // selecting resource
    const accessPointCaret = container
      .querySelector(`input[name="accessPoint"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(accessPointCaret!)
    })
    const apToSelect = await findByText(container, 'mockALBname')
    expect(apToSelect).toBeDefined()
    act(() => {
      fireEvent.click(apToSelect)
    })
    expect(accessPointDropDown.value).toBe('mockALBname')
    expect(generatedHostName.textContent).toBe('orgidentifier-mockname.mock.com')
  })
})
