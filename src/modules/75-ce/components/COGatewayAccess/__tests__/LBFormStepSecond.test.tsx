import React from 'react'
import { act } from 'react-dom/test-utils'
import { findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import LBFormStepSecond from '../LBFormStepSecond'

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
  test('render and fill form', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <LBFormStepSecond
          cloudAccountId={'currCloudAccountId'}
          loadBalancer={initialLoadBalancer}
          setNewLoadBalancer={jest.fn()}
          handleSubmit={jest.fn()}
          handlePreviousClick={jest.fn()}
          isSaving={false}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    // regions dropdown
    const regionsDropdown = container.querySelector('input[name="accessPointRegion"]') as HTMLInputElement
    const regionsCaret = container
      .querySelector(`input[name="accessPointRegion"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(regionsCaret!)
    })
    const regionToSelect = await findByText(container, 'ap-southeast-1')
    act(() => {
      fireEvent.click(regionToSelect)
    })
    expect(regionsDropdown.value).toBe('ap-southeast-1')

    const certificatesDropdown = container.querySelector('input[name="certificate"]') as HTMLInputElement
    const certificatesCaret = container
      .querySelector(`input[name="certificate"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(certificatesCaret!)
    })
    const certificateToSelect = await findByText(container, '*.lightwingtest.com')
    act(() => {
      fireEvent.click(certificateToSelect)
    })
    expect(certificatesDropdown.value).toBe('*.lightwingtest.com')

    // vpc dropdown
    const vpcDropdown = container.querySelector('input[name="vpc"]') as HTMLInputElement
    const vpcCaret = container
      .querySelector(`input[name="vpc"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(vpcCaret!)
    })
    const vpcToSelect = await findByText(container, 'testvpn')
    act(() => {
      fireEvent.click(vpcToSelect)
    })
    expect(vpcDropdown.value).toBe('testvpn')
  })
})
