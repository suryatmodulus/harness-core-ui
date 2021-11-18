import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from 'formik'
import { FormikForm } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { initialFormData } from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import type { StringKeys } from 'framework/strings'
import type { ResponseListMonitoredServiceWithHealthSources } from 'services/cv'
import SLI from '../SLI'
import {
  getHealthSourcesOptions,
  getMonitoredServicesOptions,
  getSliMetricOptions,
  getSliTypeOptions
} from '../SLI.utils'
import { expectedHealthSourcesOptions, expectedMonitoredServiceOptions, mockedMonitoredServiceData } from './SLI.mock'

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper>
      <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={jest.fn()}>
        {formikProps => {
          return (
            <FormikForm>
              <SLI formikProps={formikProps}>
                <></>
              </SLI>
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

jest.mock('services/cv', () => ({
  useGetMonitoredService: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetAllMonitoredServicesWithTimeSeriesHealthSources: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Test SLI component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render SLI component', async () => {
    const { container } = render(<WrapperComponent initialValues={initialFormData} />)
    expect(container).toMatchSnapshot()
  })

  test('verify getMonitoredServicesOptions method', async () => {
    const actualMonitoredServiceOptions = getMonitoredServicesOptions(
      mockedMonitoredServiceData as ResponseListMonitoredServiceWithHealthSources
    )
    expect(actualMonitoredServiceOptions).toEqual(expectedMonitoredServiceOptions)
  })

  test('verify healthSourcesOptions method', async () => {
    const actualHealthSources = getHealthSourcesOptions(
      mockedMonitoredServiceData as ResponseListMonitoredServiceWithHealthSources,
      'Service_102_QA'
    )
    expect(actualHealthSources).toEqual(expectedHealthSourcesOptions)
  })

  test('verify getSliTypeOptions method', async () => {
    expect(getSliTypeOptions(getString)).toEqual([
      { label: 'cv.slos.slis.type.availability', value: 'Availability' },
      { label: 'cv.slos.slis.type.latency', value: 'Latency' }
    ])
  })

  test('verify getSliMetricOptions method', async () => {
    expect(getSliMetricOptions(getString)).toEqual([
      {
        label: 'cv.slos.slis.metricOptions.thresholdBased',
        value: 'Threshold'
      },
      {
        label: 'cv.slos.slis.metricOptions.ratioBased',
        value: 'Ratio'
      }
    ])
  })
})
