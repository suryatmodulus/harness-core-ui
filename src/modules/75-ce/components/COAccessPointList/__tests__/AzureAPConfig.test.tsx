import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AzureAPConfig from '../AzureAPConfig'

const mockObj = { response: { id: 'mock' } }

const params = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

const initialLoadBalancer = {
  account_id: params.accountId, // eslint-disable-line
  project_id: params.projectIdentifier, // eslint-disable-line
  org_id: params.orgIdentifier, // eslint-disable-line
  metadata: {
    security_groups: [] // eslint-disable-line
  },
  type: 'azure'
}

const mockedRegionsData = { data: { response: [{ name: 'ap-southeast-1', label: 'ap-southeast-1' }] }, loading: false }
const mockedCertificatesData = {
  data: { response: [{ name: '*.lightwingtest.com', id: '*.lightwingtest.com' }] },
  loading: false,
  refetch: jest.fn(() => mockObj)
}
const mockedVpnData = {
  data: {
    response: [{ name: 'testvpn', id: 'testvpn' }]
  },
  loading: false,
  refetch: jest.fn(() => mockObj)
}

jest.mock('services/lw', () => ({
  useGetAccessPoint: jest
    .fn()
    .mockImplementation(() => ({ data: mockObj, loading: false, refetch: jest.fn(() => mockObj) })),
  useCreateAccessPoint: jest.fn().mockImplementation(() => ({ mutate: Promise.resolve(mockObj) })),
  useAllRegions: jest.fn().mockImplementation(() => mockedRegionsData),
  useAllResourceGroups: jest.fn().mockImplementation(() => mockedRegionsData),
  useAllVPCs: jest.fn().mockImplementation(() => mockedVpnData),
  useAllSubnets: jest.fn().mockImplementation(() => mockedVpnData),
  useAllPublicIps: jest.fn().mockImplementation(() => mockedVpnData),
  useAccessPointResources: jest.fn().mockImplementation(() => ({ data: mockObj, refetch: jest.fn() })),
  useAllCertificates: jest.fn().mockImplementation(() => mockedCertificatesData),
  useAllSecurityGroups: jest
    .fn()
    .mockImplementation(() => ({ data: { response: [] }, loading: false, refetch: jest.fn() }))
}))

describe('Azure Access Point Configuration', () => {
  test('render configuration dialog and fill details', async () => {
    const { container, getByTestId } = render(
      <TestWrapper pathParams={params}>
        <AzureAPConfig
          cloudAccountId={'connectorIdentifier'}
          onSave={jest.fn()}
          createMode={true}
          onClose={jest.fn()}
          loadBalancer={initialLoadBalancer}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement
    expect(nameInput).toBeDefined()
    waitFor(() => {
      fireEvent.change(nameInput, { target: { value: 'Azure AP' } })
    })
    expect(nameInput.value).toBe('Azure AP')

    const domainInput = container.querySelector('input[name="customDomain"]') as HTMLInputElement
    expect(domainInput).toBeDefined()
    waitFor(() => {
      fireEvent.change(domainInput, { target: { value: 'custom.domain.test' } })
    })
    expect(domainInput.value).toBe('custom.domain.test')

    const saveBtn = getByTestId('saveAzureDetails')
    expect(saveBtn).toBeDefined()
    waitFor(() => {
      fireEvent.click(saveBtn)
    })
    expect(container).toMatchSnapshot()
  })

  test('Name field should be disabled and should contain load balancer name in case of import', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <AzureAPConfig
          cloudAccountId={'connectorIdentifier'}
          onSave={jest.fn()}
          createMode={false}
          onClose={jest.fn()}
          loadBalancer={{ ...initialLoadBalancer, name: 'Mock App Gateway' }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement
    expect(nameInput.value).toEqual('Mock App Gateway')
    expect(nameInput.attributes.getNamedItem('disabled')).toBeTruthy()
  })
})
