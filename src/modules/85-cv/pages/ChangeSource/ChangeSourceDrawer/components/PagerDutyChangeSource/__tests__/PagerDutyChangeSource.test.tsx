import React from 'react'
import { Formik } from 'formik'
import { noop } from 'lodash-es'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import PagerDutyChangeSource from '../PagerDutyChangeSource'

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetConnectorList: () => {
    return {
      data: {},
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: {},
      refetch: jest.fn()
    }
  }
}))

interface InitValue {
  spec: {
    connectorRef?: string
    pagerDutyServiceId?: string
  }
}

const TestComponent = ({ initialValues }: { initialValues: InitValue }): React.ReactElement => (
  <TestWrapper>
    <Formik initialValues={initialValues} onSubmit={noop}>
      {formik => {
        return <PagerDutyChangeSource formik={formik} isEdit={true} />
      }}
    </Formik>
  </TestWrapper>
)

describe('Test PagerDuty Change Source', () => {
  test('PagerDuty ChangeSource shows empty service message', async () => {
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
      <TestComponent
        initialValues={{
          spec: {
            pagerDutyServiceId: '',
            connectorRef: 'PagerDutyConnector'
          }
        }}
      />
    )

    fireEvent.click(container.querySelector(`.bp3-input-action [data-icon="chevron-down"]`)!)
    const menuItemLabels = container.querySelectorAll('[class*="menuItemLabel"]')
    expect(menuItemLabels.length).toEqual(0)

    await waitFor(() => expect(getByText('cv.changeSource.PageDuty.pagerDutyService')).toBeTruthy())
    await waitFor(() => expect(getByText('cv.changeSource.PageDuty.pagerDutyEmptyService')).toBeTruthy())
    expect(container.querySelector('input[name="spec.pagerDutyServiceId"]')).toBeDefined()

    expect(container).toMatchSnapshot()
  })

  test('PagerDuty ChangeSource renders in edit mode', async () => {
    const refetch = jest.fn()

    jest.spyOn(cvServices, 'useGetServicesFromPagerDuty').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: {
            metaData: {},
            resource: [
              { id: 'P9DDPEV', name: 'cvng' },
              { id: 'PU7R5AE', name: 'Sowmya' }
            ],
            responseMessages: []
          },
          refetch
        } as any)
    )
    const { container } = render(
      <TestComponent
        initialValues={{
          spec: {
            pagerDutyServiceId: 'P9DDPEV',
            connectorRef: 'PagerDutyConnector'
          }
        }}
      />
    )

    await waitFor(() => expect(refetch).toHaveBeenCalled())
    await waitFor(() => expect(container.querySelector('input[value="cvng"]')).toBeTruthy())
    await waitFor(() => expect(container.querySelector('.connectorField .bp3-disabled')).toBeDisabled())

    // renders both service value in dropdown
    act(() => {
      fireEvent.click(container.querySelector(`.bp3-input-action [data-icon="chevron-down"]`)!)
    })
    const menuItemLabels = container.querySelectorAll('[class*="menuItemLabel"]')
    await waitFor(() => expect(menuItemLabels.length).toEqual(2))
    await waitFor(() => expect(menuItemLabels[0].innerHTML).toEqual('cvng'))
    await waitFor(() => expect(menuItemLabels[1].innerHTML).toEqual('Sowmya'))
  })
})
