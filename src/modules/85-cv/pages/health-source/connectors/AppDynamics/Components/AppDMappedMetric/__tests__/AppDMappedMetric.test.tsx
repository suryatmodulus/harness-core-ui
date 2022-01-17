import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import AppDMappedMetric from '../AppDMappedMetric'
import { mappedMetricsMap, formikValues } from './AppDMappedMetric.mock'
import { validationData } from '../../../__tests__/AppDMonitoredSource.mock'

describe('AppDMappedMetric component', () => {
  const refetchMock = jest.fn()

  beforeAll(() => {
    jest
      .spyOn(cvServices, 'useGetAppdynamicsMetricStructure')
      .mockImplementation(
        () => ({ loading: false, error: null, data: [{ name: 'cvng', type: 'leaf' }], refetch: refetchMock } as any)
      )
    jest
      .spyOn(cvServices, 'useGetAppdynamicsBaseFolders')
      .mockImplementation(
        () => ({ loading: false, error: null, data: { data: ['overall performane'] }, refetch: refetchMock } as any)
      )
    jest
      .spyOn(cvServices, 'useGetAppdynamicsMetricDataByPath')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'getAppDynamicsMetricDataPromise')
      .mockImplementation(() => ({ error: null, data: validationData.data } as any))
    jest
      .spyOn(cvServices, 'useGetServiceInstanceMetricPath')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: refetchMock } as any))
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should render with data', () => {
    const { container } = render(
      <TestWrapper>
        <AppDMappedMetric
          setMappedMetrics={jest.fn()}
          selectedMetric={'appdMetric new'}
          formikValues={formikValues as any}
          formikSetField={jest.fn()}
          connectorIdentifier={''}
          mappedMetrics={mappedMetricsMap}
          createdMetrics={['appdMetric', 'appdMetric new']}
          isValidInput={true}
          setCreatedMetrics={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
