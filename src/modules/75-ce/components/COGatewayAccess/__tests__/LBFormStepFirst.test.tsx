import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import LBFormStepFirst from '../LBFormStepFirst'

const params = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

const initialLoadBalancer = {
  account_id: params.accountId, // eslint-disable-line
  project_id: params.projectIdentifier, // eslint-disable-line
  org_id: params.orgIdentifier, // eslint-disable-line
  metadata: {
    security_groups: [] // eslint-disable-line
  },
  type: 'aws'
}
const mockObj = { response: { id: 'mock' } }
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
const mockedHostedZonesData = {
  data: {
    response: [{ id: 'route53mock.com', name: 'route53mock.com' }]
  },
  loading: false,
  refetch: jest.fn(() => Promise.resolve({ data: { response: [{ id: 'route53mock.com', name: 'route53mock.com' }] } }))
}

jest.mock('services/lw', () => ({
  useAllRegions: jest.fn().mockImplementation(() => mockedRegionsData),
  useAllVPCs: jest.fn().mockImplementation(() => mockedVpnData),
  useAccessPointResources: jest.fn().mockImplementation(() => ({ data: mockObj, refetch: jest.fn() })),
  useAllCertificates: jest.fn().mockImplementation(() => mockedCertificatesData),
  useAllSecurityGroups: jest
    .fn()
    .mockImplementation(() => ({ data: { response: [] }, loading: false, refetch: jest.fn() })),
  useAllHostedZones: jest.fn().mockImplementation(() => mockedHostedZonesData),
  useGetAccessPoint: jest
    .fn()
    .mockImplementation(() => ({ data: mockObj, loading: false, refetch: jest.fn(() => mockObj) })),
  useCreateAccessPoint: jest.fn().mockImplementation(() => ({ mutate: Promise.resolve(mockObj) }))
}))

describe('AWS Access Point Configuration screen first', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test('render and fill form', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <LBFormStepFirst
          cloudAccountId={'currCloudAccountId'}
          handleCancel={jest.fn()}
          createMode={true}
          handleSubmit={jest.fn()}
          loadBalancer={initialLoadBalancer}
          handleCloudConnectorChange={jest.fn()}
          isSaving={false}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const nameInput = container.querySelector('input[name="lbName"]') as HTMLInputElement
    expect(nameInput).toBeDefined()
    waitFor(() => {
      fireEvent.change(nameInput, { target: { value: 'AWS AP' } })
    })
    expect(nameInput.value).toBe('AWS AP')

    const customDomainInput = container.querySelector('input[name="customDomainPrefix"]') as HTMLInputElement
    expect(customDomainInput).toBeDefined()
    waitFor(() => {
      fireEvent.change(customDomainInput, { target: { value: 'test.lwtest.com' } })
    })
    expect(customDomainInput.value).toBe('test.lwtest.com')
  })

  describe('Import access point flow', () => {
    test('name field should be disabled and value should be of given access point', () => {
      const { container } = render(
        <TestWrapper pathParams={params}>
          <LBFormStepFirst
            cloudAccountId={'currCloudAccountId'}
            handleCancel={jest.fn()}
            createMode={false}
            handleSubmit={jest.fn()}
            loadBalancer={{ ...initialLoadBalancer, name: 'Mock Access Point' }}
            handleCloudConnectorChange={jest.fn()}
            isSaving={false}
          />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()

      const nameInput = container.querySelector('input[name="lbName"]') as HTMLInputElement
      expect(nameInput.value).toEqual('Mock Access Point')
      expect(nameInput.attributes.getNamedItem('disabled')).toBeTruthy()
    })
  })
})
