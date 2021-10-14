import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as portalServices from 'services/portal'
import HarnessCDCurrentGenChangeSource from '../HarnessCDCurrentGenChangeSource'
import { mockedEnvironments, mockedServices } from './HarnessCDCurrentGenChangeSource.mock'

describe('Test HarnessCDCurrentGenChangeSource Change Source', () => {
  test('HarnessCDCurrentGenChangeSource ChangeSource renders in create mode', async () => {
    jest.spyOn(portalServices, 'useGetListApplications').mockImplementation(
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
        <HarnessCDCurrentGenChangeSource
          formik={
            {
              values: {
                spec: {}
              }
            } as any
          }
        />
      </TestWrapper>
    )

    expect(container.querySelector('input[name="spec.harnessApplicationId"]')).toBeDefined()
    expect(container.querySelector('input[name="spec.harnessEnvironmentId"]')).toBeDefined()
    expect(container.querySelector('input[name="spec.harnessServiceId"]')).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test('HarnessCDCurrentGenChangeSource ChangeSource renders in edit mode', async () => {
    jest.spyOn(portalServices, 'useGetListApplications').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: {},
          refetch: jest.fn()
        } as any)
    )
    jest.spyOn(portalServices, 'useGetListEnvironments').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: mockedEnvironments,
          refetch: jest.fn()
        } as any)
    )
    jest.spyOn(portalServices, 'useGetListServices').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: mockedServices,
          refetch: jest.fn()
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <HarnessCDCurrentGenChangeSource
          formik={
            {
              values: {
                spec: {
                  harnessApplicationId: 't-cO5ChuS2afXKNrJk2_Eg',
                  harnessServiceId: 'nOSIX_OFSzeOEyLaZYlJmg',
                  harnessEnvironmentId: 'Ym-GIpJZQHu7RtF0OQ4I_A'
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    expect(container.querySelector('input[name="spec.harnessApplicationId"]')).toBeDefined()
    expect(container.querySelector('input[name="spec.harnessEnvironmentId"]')).toBeDefined()
    expect(container.querySelector('input[name="spec.harnessServiceId"]')).toBeDefined()
  })
})
