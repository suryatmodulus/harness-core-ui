import React from 'react'
import { act } from 'react-dom/test-utils'
import { findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CreateAccessPointWizard from '../CreateAccessPointWizard'

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
    response: [{ id: 'lightwingtest.com', name: 'lightwingtest.com' }]
  },
  loading: false,
  refetch: jest.fn(() =>
    Promise.resolve({ data: { response: [{ id: 'lightwingtest.com', name: 'lightwingtest.com' }] } })
  )
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

const params = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

describe('Create Access Point Wizard Tests', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <CreateAccessPointWizard
          accessPoint={{
            ...params,
            metadata: {
              security_groups: [] // eslint-disable-line
            },
            type: 'aws'
          }}
          closeModal={jest.fn()}
          setAccessPoint={jest.fn()}
          refreshAccessPoints={jest.fn()}
          isEditMod={false}
          isRuleCreationMode={false}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders for rule creation mode without crashing', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <CreateAccessPointWizard
          accessPoint={{
            ...params,
            metadata: {
              security_groups: [] // eslint-disable-line
            },
            type: 'aws'
          }}
          closeModal={jest.fn()}
          setAccessPoint={jest.fn()}
          refreshAccessPoints={jest.fn()}
          isEditMod={false}
          isRuleCreationMode={true}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('fill form and submit without error', async () => {
    const { container, getByTestId } = render(
      <TestWrapper pathParams={params}>
        <CreateAccessPointWizard
          accessPoint={{
            ...params,
            metadata: {
              security_groups: [] // eslint-disable-line
            },
            type: 'aws'
          }}
          closeModal={jest.fn()}
          setAccessPoint={jest.fn()}
          refreshAccessPoints={jest.fn()}
          isEditMod={false}
          isRuleCreationMode={false}
        />
      </TestWrapper>
    )

    const nameInput = container.querySelector('input[name="accessPointName"]') as HTMLInputElement
    const inputVal = 'newloadbalancer.lightwingtest.com'
    act(() => {
      fireEvent.change(nameInput!, {
        target: { value: inputVal }
      })
    })
    expect(nameInput.value).toBe(inputVal)

    // regions dropdown
    const regionsDropdown = container.querySelector('input[name="accessPointRegion"]') as HTMLInputElement
    await waitFor(() => {
      fireEvent.focus(regionsDropdown)
    })
    const regionToSelect = await findByText(container, 'ap-southeast-1')
    act(() => {
      fireEvent.click(regionToSelect)
    })
    expect(regionsDropdown.value).toBe('ap-southeast-1')

    // new alb radio btn
    const newAlbBtn = container.querySelector('input[name="albSelector"]')
    act(() => {
      fireEvent.click(newAlbBtn as Element)
    })
    expect(newAlbBtn).toBeDefined()

    // certificates dropdown
    const certificatesDropdown = container.querySelector('input[name="certificate"]') as HTMLInputElement
    await waitFor(() => {
      fireEvent.focus(certificatesDropdown)
    })
    const certificateToSelect = await findByText(container, '*.lightwingtest.com')
    act(() => {
      fireEvent.click(certificateToSelect)
    })
    expect(certificatesDropdown.value).toBe('*.lightwingtest.com')

    // vpc dropdown
    const vpcDropdown = container.querySelector('input[name="vpc"]') as HTMLInputElement
    await waitFor(() => {
      fireEvent.focus(vpcDropdown)
    })
    const vpcToSelect = await findByText(container, 'testvpn')
    act(() => {
      fireEvent.click(vpcToSelect)
    })
    expect(vpcDropdown.value).toBe('testvpn')

    const submitBtn = await findByText(container, 'ce.co.accessPoint.proceed')
    expect(submitBtn).toBeDefined()
    act(() => {
      fireEvent.click(submitBtn)
    })

    expect(container).toMatchSnapshot()

    const mapDnsLabel = await findByText(container, 'ce.co.accessPoint.select.dnsProvider')
    expect(mapDnsLabel).toBeDefined()
    expect(container).toMatchSnapshot()

    const route53RadioBtn = container.querySelector('input[name="dnsProvider"]')
    fireEvent.click(route53RadioBtn!)
    expect(findByText(container, 'ce.co.accessPoint.select.route53zone')).toBeDefined()
    expect(container).toMatchSnapshot()

    const route53Dropdown = container.querySelector('input[name="route53Account"]') as HTMLInputElement
    await waitFor(() => {
      fireEvent.focus(route53Dropdown)
    })
    const routeToSelect = await findByText(container, 'lightwingtest.com')
    act(() => {
      fireEvent.click(routeToSelect)
    })
    expect(route53Dropdown.value).toBe('lightwingtest.com')

    const finalSubmitBtn = getByTestId('albFormSubmitBtn')
    expect(finalSubmitBtn).toBeDefined()
    act(() => {
      fireEvent.click(finalSubmitBtn)
    })
  })
})
