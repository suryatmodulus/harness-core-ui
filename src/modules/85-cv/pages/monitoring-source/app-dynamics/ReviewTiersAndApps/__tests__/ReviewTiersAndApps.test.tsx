import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as cvService from 'services/cv'
import ReviewTiersAndApps from '../ReviewTiersAndApps'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockImplementation(() => {
    return { isInitializingDB: false, dbInstance: { get: jest.fn() } }
  }),
  CVObjectStoreNames: {}
}))

const applications = {
  app1: {
    name: 'app1',
    environment: 'qa',
    totalTiers: 2,
    tiers: {
      tier1: {
        name: 'tier1',
        service: 'test-service-a'
      },
      tier2: {
        name: 'tier2',
        service: 'test-service-b'
      }
    }
  },
  app2: {
    name: 'app2',
    environment: 'qb',
    tiers: {
      tierA: {
        name: 'tierA',
        service: 'service-1-1'
      },
      tierB: {
        name: 'tierB',
        service: 'service-1-2'
      }
    }
  },
  shouldNotBeRenderedApp: {
    name: 'shouldNotBeRenderedApp',
    environment: 'dev'
  } // this app should not be rendered since it has no tiers and should not be sent in submit payload
}

describe('ReviewTiersAndApps', () => {
  const mutateCallback = jest.fn()
  beforeEach(() => {
    mutateCallback.mockClear()
  })
  test('matches snapshot', () => {
    jest.spyOn(cvService, 'getAppDynamicsTiersPromise').mockResolvedValue({
      data: {
        totalItems: 3
      }
    } as UseGetReturn<any, any, any, any>)
    const { container } = render(
      <TestWrapper>
        <ReviewTiersAndApps stepData={{ applications }} onCompleteStep={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('onNext handles saving correctly', () => {
    jest.spyOn(cvService, 'useSaveDSConfig').mockReturnValue({
      loading: false,
      mutate: mutateCallback as unknown
    } as UseMutateReturn<any, any, any, any, any>)

    jest.spyOn(cvService, 'getAppDynamicsTiersPromise').mockResolvedValue({
      data: {
        totalItems: 3
      }
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupMonitoringSource({
          accountId: 'accountIdMock',
          projectIdentifier: 'projectIdMock',
          orgIdentifier: 'orgIdMock',
          monitoringSource: 'appdynamics'
        })}
        pathParams={{ accountId: 'accountIdMock', projectIdentifier: 'projectIdMock', orgIdentifier: 'orgIdMock' }}
      >
        <ReviewTiersAndApps
          stepData={{
            applications,
            identifier: 'testID',
            connectorRef: { value: 'test' },
            product: 'Application Monitoring',
            metricPacks: [{ identifier: 'mp1' }, { identifier: 'mp2' }]
          }}
          onCompleteStep={jest.fn()}
        />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('button[type=submit]')!)
    const payload = mutateCallback.mock.calls[0][0]
    expect(payload.connectorIdentifier).toEqual('test')
    expect(payload.type).toEqual('APP_DYNAMICS')
    expect(payload.productName).toEqual('Application Monitoring')
    expect(payload.appConfigs[0].applicationName).toEqual('app1')
    expect(payload.appConfigs[0].envIdentifier).toEqual('qa')
    expect(payload.appConfigs[0].serviceMappings.length).toEqual(2)
  })
})
