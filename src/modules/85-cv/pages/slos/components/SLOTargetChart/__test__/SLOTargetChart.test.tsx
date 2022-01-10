import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import {
  serviceLevelIndicator,
  testWrapperProps,
  errorMessage
} from '@cv/pages/slos/components/CVCreateSLO/__tests__/CVCreateSLO.mock'
import { SLIMetricEnum } from '@cv/pages/slos/components/CVCreateSLO/components/CreateSLOForm/components/SLI/SLI.constants'
import SLOTargetChartWrapper from '../SLOTargetChart'
import { getDataPointsWithMinMaxXLimit } from '../SLOTargetChart.utils'

describe('SLOTargetChart Utils', () => {
  test('Should return min and max values without rounding', () => {
    const dataPoints: cvServices.Point[] = [
      {
        timestamp: 101,
        value: 90
      },
      {
        timestamp: 105,
        value: 80
      },
      {
        timestamp: 110,
        value: 85
      }
    ]

    expect(getDataPointsWithMinMaxXLimit(dataPoints)).toStrictEqual({
      dataPoints: [
        [101, 90],
        [105, 80],
        [110, 85]
      ],
      minXLimit: 80,
      maxXLimit: 90
    })
  })

  test('Should return min and max values by rounding', () => {
    const dataPoints: cvServices.Point[] = [
      {
        timestamp: 101,
        value: 98
      },
      {
        timestamp: 105,
        value: 82
      }
    ]

    expect(getDataPointsWithMinMaxXLimit(dataPoints)).toStrictEqual({
      dataPoints: [
        [101, 98],
        [105, 82]
      ],
      minXLimit: 80,
      maxXLimit: 100
    })
  })

  test('Should handle NaN and string types', () => {
    const dataPoints: cvServices.Point[] = [
      {
        timestamp: NaN,
        value: NaN
      },
      {
        timestamp: 105,
        value: 82
      },
      {
        timestamp: 'NaN' as unknown as number,
        value: 'NaN' as unknown as number
      }
    ]

    expect(getDataPointsWithMinMaxXLimit(dataPoints)).toStrictEqual({
      dataPoints: [
        [0, 0],
        [105, 82],
        [0, 0]
      ],
      minXLimit: 0,
      maxXLimit: 90
    })
  })
})

const getSLIGraph = jest.fn().mockReturnValue({ resource: {} })

jest.mock('services/cv', () => ({
  useGetSliGraph: jest.fn().mockImplementation(() => ({ mutate: getSLIGraph, loading: false, error: null }))
}))

describe('SLOTargetChartWrapper', () => {
  test('it should render empty state for Ratio based with objective value > 100', () => {
    render(
      <TestWrapper {...testWrapperProps}>
        <SLOTargetChartWrapper
          monitoredServiceIdentifier="Service_1_Environment_1"
          serviceLevelIndicator={{
            ...serviceLevelIndicator,
            spec: {
              ...serviceLevelIndicator.spec,
              spec: {
                ...serviceLevelIndicator.spec.spec,
                thresholdValue: 101
              }
            }
          }}
        />
      </TestWrapper>
    )

    expect(screen.getByText('cv.pleaseFillTheRequiredFieldsToSeeTheSLIData')).toBeInTheDocument()
  })

  test('it should not render empty state for Threshold based with objective value > 100', async () => {
    const serviceLevelIndicatorThreshold = {
      ...serviceLevelIndicator,
      spec: {
        type: SLIMetricEnum.THRESHOLD,
        spec: {
          ...serviceLevelIndicator.spec.spec,
          thresholdValue: 101
        }
      }
    }

    render(
      <TestWrapper {...testWrapperProps}>
        <SLOTargetChartWrapper
          monitoredServiceIdentifier="Service_1_Environment_1"
          serviceLevelIndicator={serviceLevelIndicatorThreshold}
        />
      </TestWrapper>
    )

    expect(screen.queryByText('cv.pleaseFillTheRequiredFieldsToSeeTheSLIData')).not.toBeInTheDocument()
    await waitFor(() => {
      expect(getSLIGraph).toHaveBeenCalledTimes(1)
      expect(getSLIGraph).toBeCalledWith(serviceLevelIndicatorThreshold)
    })
  })

  test('it should render loader', () => {
    jest.spyOn(cvServices, 'useGetSliGraph').mockReturnValue({ mutate: jest.fn(), loading: true, error: null } as any)

    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <SLOTargetChartWrapper
          monitoredServiceIdentifier="Service_1_Environment_1"
          serviceLevelIndicator={serviceLevelIndicator}
        />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('it should render error message', () => {
    jest
      .spyOn(cvServices, 'useGetSliGraph')
      .mockReturnValue({ mutate: jest.fn(), loading: false, error: { message: errorMessage } } as any)

    render(
      <TestWrapper {...testWrapperProps}>
        <SLOTargetChartWrapper
          monitoredServiceIdentifier="Service_1_Environment_1"
          serviceLevelIndicator={serviceLevelIndicator}
        />
      </TestWrapper>
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})
