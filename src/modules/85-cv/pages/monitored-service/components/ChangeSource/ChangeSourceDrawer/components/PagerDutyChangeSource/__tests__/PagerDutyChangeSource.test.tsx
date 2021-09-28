import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import PagerDutyChangeSource from '../PagerDutyChangeSource'

describe('Test PagerDuty Change Source', () => {
  test('PagerDuty ChangeSource renders in create mode', async () => {
    jest.spyOn(cvServices, 'useGetServicesFromPagerDuty').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: {},
          refetch: jest.fn()
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <PagerDutyChangeSource
          formik={
            {
              values: {
                spec: {
                  pagerDutyServiceId: 'cvng',
                  connectorRef: 'PagerDutyConnector'
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('cv.changeSource.PageDuty.pagerDutyService')).toBeTruthy())
    await waitFor(() => expect(getByText('cv.changeSource.PageDuty.pagerDutyEmptyService')).toBeTruthy())
    expect(container.querySelector('input[name="spec.pagerDutyServiceId"]')).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test('PagerDuty ChangeSource renders in edit mode', async () => {
    jest.spyOn(cvServices, 'useGetServicesFromPagerDuty').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: {},
          refetch: jest.fn()
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <PagerDutyChangeSource
          formik={
            {
              values: {
                spec: {
                  pagerDutyServiceId: 'cvng',
                  connectorRef: 'PagerDutyConnector'
                }
              }
            } as any
          }
          isEdit={true}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.connectorField .bp3-disabled')).toBeDisabled())
  })
})
