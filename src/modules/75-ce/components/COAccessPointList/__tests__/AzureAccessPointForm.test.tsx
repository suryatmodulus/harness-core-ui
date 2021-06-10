import React from 'react'
import { act } from 'react-dom/test-utils'
import { findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AzureAccessPointForm from '../AzureAccessPointForm'

const mockObj = { response: { id: 'mock' } }

const params = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

const initialLoadBalancer = {
  account_id: params.accountId, // eslint-disable-line
  project_id: params.projectIdentifier, // eslint-disable-line
  org_id: params.orgIdentifier, // eslint-disable-line
  metadata: {
    security_groups: [] // eslint-disable-line
  },
  type: 'azure',
  host_name: 'host_name',
  name: 'name'
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

describe('Azure Access Point Form', () => {
  test('render and fill azure ap form', async () => {
    const { container } = render(
      <TestWrapper>
        <AzureAccessPointForm
          cloudAccountId={'cloudAccountId'}
          onSave={jest.fn()}
          handlePreviousClick={jest.fn()}
          lbCreationInProgress={false}
          handleFormSubmit={jest.fn()}
          loadBalancer={initialLoadBalancer}
          isCreateMode={true}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    // regions dropdown
    const regionsDropdown = container.querySelector('input[name="region"]') as HTMLInputElement
    const regionsCaret = container
      .querySelector(`input[name="region"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(regionsCaret!)
    })
    const regionToSelect = await findByText(container, 'ap-southeast-1')
    act(() => {
      fireEvent.click(regionToSelect)
    })
    expect(regionsDropdown.value).toBe('ap-southeast-1')

    // resource group dropdown
    const resourceGroupDropdown = container.querySelector('input[name="resourceGroup"]') as HTMLInputElement
    const resourceGroupCaret = container
      .querySelector(`input[name="resourceGroup"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="caret-down"]')
    await waitFor(() => {
      fireEvent.click(resourceGroupCaret!)
    })
    const resourceGroupToSelect = await findByText(container, 'ap-southeast-1')
    act(() => {
      fireEvent.click(resourceGroupToSelect)
    })
    expect(resourceGroupDropdown.value).toBe('ap-southeast-1')

    // certificates dropdown
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
    const vpcDropdown = container.querySelector('input[name="virtualNetwork"]') as HTMLInputElement
    const vpcCaret = container
      .querySelector(`input[name="virtualNetwork"] + [class*="bp3-input-action"]`)
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
