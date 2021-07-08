import React, { useEffect } from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import MapApplications, { validateTier } from '../MapApplications'
import { ValidationStatus } from '../../AppDOnboardingUtils'

jest.mock('services/cd-ng', () => ({
  useGetServiceListForProject: ({ resolve }: any) => {
    useEffect(() => {
      resolve({
        data: {
          content: [
            {
              identifier: 'service1',
              name: 'Service 1'
            },
            {
              identifier: 'service2',
              name: 'Service 2'
            }
          ]
        }
      })
    }, [])
    return {}
  }
}))

jest.mock('@cv/components/ServiceSelectOrCreate/ServiceSelectOrCreate', () => ({
  ServiceSelectOrCreate: () => (props: any) =>
    (
      <div
        className="service-select-mock"
        onClick={() =>
          props?.onSelect({
            label: 'Service 1',
            value: 'service1'
          })
        }
      />
    )
}))

const MockValiidateMetriscQueryParam = {
  accountId: '1234_accountId',
  orgIdentifier: '1234_orgIdentifier',
  projectIdentifier: '1234_projectIdentifier',
  connectorIdentifier: '1234_connectorIdentifier',
  appName: '1234_appName',
  tierName: '1234_tierName',
  requestGuid: '1234_requestGUID'
}

describe('MapApplications', () => {
  beforeEach(() => {
    jest.spyOn(cvService, 'useGetAppDynamicsTiers').mockReturnValue({
      loading: false,
      data: {
        data: {
          content: [
            {
              id: 1,
              name: 'tier1'
            },
            {
              id: 2,
              name: 'tier2'
            }
          ]
        }
      },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetMetricPacks').mockReturnValue({
      data: {
        resource: [{ identifier: 'mp1' }, { identifier: 'mp2' }]
      }
    } as UseGetReturn<any, any, any, any>)
  })

  test('matches snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <MapApplications
          stepData={{
            applications: {
              1: {
                id: 1,
                name: 'app1',
                environment: 'qa'
              }
            },
            metricPacks: [{ identifier: 'mp1' }]
          }}
          onCompleteStep={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('validateTier works as expected', async () => {
    const mockMetricPacks = {}
    const postMock = jest
      .spyOn(cvService, 'getAppDynamicsMetricDataPromise')
      .mockResolvedValue({ data: [{ overallStatus: 'FAILED' }, { overallStatus: 'NO_DATA' }] })

    let result: any = await validateTier(mockMetricPacks as any, MockValiidateMetriscQueryParam)
    expect(postMock).toHaveBeenCalled()
    expect(postMock.mock.calls[0][0]).toEqual({
      body: {},
      queryParams: {
        accountId: '1234_accountId',
        appName: '1234_appName',
        connectorIdentifier: '1234_connectorIdentifier',
        orgIdentifier: '1234_orgIdentifier',
        projectIdentifier: '1234_projectIdentifier',
        requestGuid: '1234_requestGUID',
        tierName: '1234_tierName'
      }
    })
    expect(result.validationStatus).toEqual(ValidationStatus.ERROR)

    jest
      .spyOn(cvService, 'getAppDynamicsMetricDataPromise')
      .mockResolvedValue({ data: [{ overallStatus: 'SUCCESS' }, { overallStatus: 'NO_DATA' }] })

    result = await validateTier(mockMetricPacks as any, MockValiidateMetriscQueryParam)
    expect(result.validationStatus).toEqual(ValidationStatus.NO_DATA)

    jest
      .spyOn(cvService, 'getAppDynamicsMetricDataPromise')
      .mockResolvedValue({ data: [{ overallStatus: 'SUCCESS' }, { overallStatus: 'SUCCESS' }] })
    result = await validateTier(mockMetricPacks as any, MockValiidateMetriscQueryParam)
    expect(result.validationStatus).toEqual(ValidationStatus.SUCCESS)
  })

  test('Can select tier, metricPack and hit next', async () => {
    jest
      .spyOn(cvService, 'getAppDynamicsMetricDataPromise')
      .mockResolvedValue({ data: [{ overallStatus: 'SUCCESS' }, { overallStatus: 'SUCCESS' }] })

    const onCompleteStep = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <MapApplications
          stepData={{
            applications: {
              app1: {
                name: 'app1',
                environment: 'qa',
                tiers: {
                  tier1: {
                    name: 'tier1',
                    service: 'test-service'
                  },
                  tier2: {
                    name: 'tier2',
                    service: 'test-service2'
                  }
                }
              }
            },
            metricPacks: [{ identifier: 'mp1' }]
          }}
          onCompleteStep={onCompleteStep}
        />
      </TestWrapper>
    )
    await waitFor(() => Promise.resolve())
    fireEvent.click(container.querySelector('.select-tier')!)
    fireEvent.click(container.querySelectorAll('.metricPacks input[type=checkbox]').item(1))
    fireEvent.click(getByText('next'))
    expect(onCompleteStep).toHaveBeenCalled()
    const applications: any = onCompleteStep.mock.calls[0][0].applications
    expect(applications['app1']).toBeDefined()
    expect(applications['app1'].tiers['tier2'].service).toEqual('test-service2')
  })
})
