import React, { useEffect } from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import xhr, { XhrPromise } from '@wings-software/xhr-async'
import MapApplications, { validateTier } from '../MapApplications'
import { ValidationStatus } from '../../AppDOnboardingUtils'

jest.mock('react-router-dom', () => ({
  useParams: () => ({
    accountId: 'accountIdMock',
    projectIdentifier: 'projectIdMock',
    orgIdentifier: 'orgIdMock'
  })
}))

jest.mock('framework/exports', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...(jest.requireActual('framework/exports') as object),
  useStrings: () => ({
    getString: () => 'xx'
  })
}))

jest.mock('services/cv', () => ({
  useGetAppDynamicsTiers: () => ({
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
    refetch: jest.fn()
  }),
  useGetMetricPacks: () => ({
    data: {
      resource: [{ identifier: 'mp1' }, { identifier: 'mp2' }]
    }
  })
}))

jest.mock('@wings-software/xhr-async')

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
  ServiceSelectOrCreate: () => (props: any) => (
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

describe('MapApplications', () => {
  test('matches snapshot', () => {
    const { container } = render(
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
    )
    expect(container).toMatchSnapshot()
  })

  test('validateTier works as expected', async () => {
    const mockMetricPacks = {}
    const postMock = jest.spyOn(xhr, 'post').mockImplementationOnce(
      () =>
        Promise.resolve({
          response: { resource: [{ overallStatus: 'FAILED' }, { overallStatus: 'NO_DATA' }] }
        }) as XhrPromise<any>
    )
    let result: any = await validateTier(mockMetricPacks as any, { q1: 'q1', q2: 'a2' })
    expect(postMock).toHaveBeenCalled()
    expect(postMock.mock.calls[0][0]).toEqual('/cv/api/appdynamics/metric-data?q1=q1&q2=a2')
    expect(postMock.mock.calls[0][1]).toHaveProperty('data')
    expect(result.validationStatus).toEqual(ValidationStatus.ERROR)

    jest.spyOn(xhr, 'post').mockImplementationOnce(
      () =>
        Promise.resolve({
          response: { resource: [{ overallStatus: 'SUCCESS' }, { overallStatus: 'NO_DATA' }] }
        }) as XhrPromise<any>
    )
    result = await validateTier(mockMetricPacks as any, {})
    expect(result.validationStatus).toEqual(ValidationStatus.NO_DATA)

    jest.spyOn(xhr, 'post').mockImplementationOnce(
      () =>
        Promise.resolve({
          response: { resource: [{ overallStatus: 'SUCCESS' }, { overallStatus: 'SUCCESS' }] }
        }) as XhrPromise<any>
    )
    result = await validateTier(mockMetricPacks as any, {})
    expect(result.validationStatus).toEqual(ValidationStatus.SUCCESS)
  })

  test('Can select tier, metricPack and hit next', async () => {
    jest.spyOn(xhr, 'post').mockImplementation(
      () =>
        Promise.resolve({
          response: { resource: [{ overallStatus: 'SUCCESS' }, { overallStatus: 'SUCCESS' }] }
        }) as XhrPromise<any>
    )
    const onCompleteStep = jest.fn()
    const { container, getByText } = render(
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
    )
    await waitFor(() => Promise.resolve())
    fireEvent.click(container.querySelector('.select-tier')!)
    fireEvent.click(container.querySelectorAll('.metricPacks input[type=checkbox]').item(1))
    fireEvent.click(getByText('Next'))
    expect(onCompleteStep).toHaveBeenCalled()
    const applications: any = onCompleteStep.mock.calls[0][0].applications
    expect(applications['app1']).toBeDefined()
    expect(applications['app1'].tiers['tier2'].service).toEqual('test-service2')
  })
})
