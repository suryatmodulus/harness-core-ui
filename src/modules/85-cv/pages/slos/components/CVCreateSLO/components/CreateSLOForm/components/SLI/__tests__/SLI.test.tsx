import React from 'react'
import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import { FormikForm } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { initialFormData } from '@cv/pages/slos/components/CVCreateSLO/__tests__/CVCreateSLO.mock'
import type { StringKeys } from 'framework/strings'
import {
  getHealthSourceOptions,
  getMonitoredServiceOptions
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.utils'
import { getSLIMetricOptions, getSLITypeOptions } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.constants'
import SLI from '../SLI'
import { expectedHealthSourcesOptions, expectedMonitoredServiceOptions, mockedMonitoredServiceData } from './SLI.mock'

jest.mock('@cv/pages/slos/components/SLOTargetChart/SLOTargetChart', () => ({
  __esModule: true,
  default: function SLOTargetChart() {
    return <span data-testid="SLO-target-chart" />
  }
}))

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
  }),
  useGetSloMetrics: jest.fn().mockImplementation(() => ({ refetch: jest.fn() }))
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
    expect(screen.getByTestId('SLO-target-chart')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('verify getMonitoredServicesOptions method', async () => {
    const actualMonitoredServiceOptions = getMonitoredServiceOptions(mockedMonitoredServiceData.data)
    expect(actualMonitoredServiceOptions).toEqual(expectedMonitoredServiceOptions)
  })

  test('verify healthSourcesOptions method', async () => {
    const actualHealthSources = getHealthSourceOptions(mockedMonitoredServiceData.data, 'Service_102_QA')
    expect(actualHealthSources).toEqual(expectedHealthSourcesOptions)
  })

  test('verify getSliTypeOptions method', async () => {
    expect(getSLITypeOptions(getString)).toEqual([
      { label: 'cv.slos.slis.type.availability', value: 'Availability' },
      { label: 'cv.slos.slis.type.latency', value: 'Latency' }
    ])
  })

  test('verify getSliMetricOptions method', async () => {
    expect(getSLIMetricOptions(getString)).toEqual([
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
