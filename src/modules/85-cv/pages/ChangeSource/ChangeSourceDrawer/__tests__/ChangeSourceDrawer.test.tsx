import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import { ChangeSourceDrawer } from '../ChangeSourceDrawer'
import {
  changeSourceTableData,
  changeSourceDrawerData,
  onSuccessHarnessCD,
  onSuccessPagerDuty,
  pagerDutyChangeSourceDrawerData,
  pagerDutyChangeSourceDrawerDataWithoutService
} from './ChangeSourceDrawer.mock'

const onSuccess = jest.fn()
const hideDrawer = jest.fn()

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
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

describe('Test Change Source Drawer', () => {
  test('ChangeSource Drawer renders in create mode', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ChangeSourceDrawer
          isEdit={false}
          rowdata={{ spec: {} }}
          tableData={[]}
          onSuccess={onSuccess}
          hideDrawer={hideDrawer}
        />
      </TestWrapper>
    )

    // change source name input and source type dropdown are rendered
    await waitFor(() => expect(getByText('cv.changeSource.sourceName')).toBeTruthy())
    await waitFor(() => expect(container.querySelector('input[name="category"]')).toBeTruthy())

    act(() => {
      fireEvent.click(getByText('submit'))
    })

    await waitFor(() => expect(getByText('cv.changeSource.selectChangeSourceName')).toBeTruthy())

    expect(container).toMatchSnapshot()
  })

  test('ChangeSource Drawer renders in edit mode for HarnessCD', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ChangeSourceDrawer
          isEdit
          rowdata={changeSourceDrawerData}
          tableData={changeSourceTableData}
          onSuccess={onSuccess}
          hideDrawer={hideDrawer}
        />
      </TestWrapper>
    )

    // change source name input and source type dropdown are rendered
    await waitFor(() => expect(container.querySelector('input[value="deploymentText"]')).toBeTruthy())
    await waitFor(() => expect(container.querySelector('input[value="HarnessCD"]')).toBeTruthy())
    await waitFor(() => expect(getByText('cv.onboarding.changeSourceTypes.HarnessCDNextGen.name')).toBeTruthy())

    // category dropdown and thumbnailSelect are disabled in editmode
    await waitFor(() => expect(container.querySelector('input[value="deploymentText"]')).toBeDisabled())
    await waitFor(() => expect(container.querySelector('input[value="HarnessCD"]')).toBeDisabled())

    setFieldValue({
      container,
      fieldId: 'name',
      value: 'Updated Change Source',
      type: InputTypes.TEXTFIELD
    })

    // check chnageSource name is updated
    await waitFor(() => expect(container.querySelector('input[value="Updated Change Source"]')).toBeTruthy())

    act(() => {
      fireEvent.click(getByText('submit'))
    })
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(onSuccessHarnessCD))
    expect(container).toMatchSnapshot()
  })
  test('ChangeSource Drawer renders in create mode for PagerDuty', async () => {
    jest.spyOn(cvServices, 'useGetServicesFromPagerDuty').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: {},
          refetch: jest.fn()
        } as any)
    )

    const { container, getByText, findByText } = render(
      <TestWrapper>
        <ChangeSourceDrawer
          isEdit={false}
          rowdata={pagerDutyChangeSourceDrawerDataWithoutService}
          tableData={[pagerDutyChangeSourceDrawerDataWithoutService]}
          onSuccess={onSuccess}
          hideDrawer={hideDrawer}
        />
      </TestWrapper>
    )

    // change source name input and source type dropdown are rendered
    await waitFor(() => expect(container.querySelector('input[value="cv.changeSource.alertText"]')).toBeTruthy())
    await waitFor(() => expect(container.querySelector('input[value="PagerDuty"]')).toBeTruthy())
    await waitFor(() => expect(getByText('common.pagerDuty')).toBeTruthy())

    // connector is visible
    await waitFor(() => expect(getByText('cv.changeSource.connectChangeSource')).toBeTruthy())
    // pagerDuty service visible
    await waitFor(() => expect(findByText('cv.changeSource.PageDuty.pagerDutyService')).toBeTruthy())
    await waitFor(() => expect(container.querySelector('input[name="spec.pagerDutyServiceId"]')).toBeDefined())
    // Service empty warning visible
    await waitFor(() => expect(getByText('cv.changeSource.PageDuty.pagerDutyEmptyService')).toBeTruthy())

    act(() => {
      fireEvent.click(getByText('submit'))
    })
    // Service not select error
    await waitFor(() => expect(getByText('cv.changeSource.PageDuty.selectPagerDutyService')).toBeTruthy())

    expect(container).toMatchSnapshot()
  })
  test('ChangeSource Drawer renders in edit mode for PagerDuty', async () => {
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
        <ChangeSourceDrawer
          isEdit
          rowdata={pagerDutyChangeSourceDrawerData}
          tableData={[pagerDutyChangeSourceDrawerData]}
          onSuccess={onSuccess}
          hideDrawer={hideDrawer}
        />
      </TestWrapper>
    )

    // change source name input and source type dropdown are rendered
    await waitFor(() => expect(container.querySelector('input[value="cv.changeSource.alertText"]')).toBeTruthy())
    await waitFor(() => expect(container.querySelector('input[value="PagerDuty"]')).toBeTruthy())
    await waitFor(() => expect(getByText('common.pagerDuty')).toBeTruthy())

    // category dropdown and thumbnailSelect are disabled in editmode
    await waitFor(() => expect(container.querySelector('input[value="cv.changeSource.alertText"]')).toBeDisabled())
    await waitFor(() => expect(container.querySelector('input[value="PagerDuty"]')).toBeDisabled())

    // connector and pagerduty service are visible
    await waitFor(() => expect(getByText('cv.changeSource.connectChangeSource')).toBeTruthy())
    await waitFor(() => expect(getByText('cv.changeSource.PageDuty.pagerDutyService')).toBeTruthy())

    expect(container.querySelector('input[name="spec.pagerDutyServiceId"]')).toBeDefined()
    act(() => {
      fireEvent.click(getByText('submit'))
    })
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(onSuccessPagerDuty))
    expect(container).toMatchSnapshot()
  })

  test('Ensure defaults are preselected when changing a type', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ChangeSourceDrawer
          onSuccess={onSuccess}
          hideDrawer={hideDrawer}
          isEdit={false}
          rowdata={{ spec: {} }}
          tableData={[]}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector(`input[value="deploymentText"]`)).not.toBeNull())
    expect(container.querySelector('[class*="ReferenceSelect"]')).toBeNull()

    fireEvent.click(container.querySelector(`.bp3-input-action [data-icon="chevron-down"]`)!)
    await waitFor(() => container.querySelector('.menuItem'))

    // select infra
    fireEvent.click(getByText('infrastructureText'))
    await waitFor(() => expect(getByText('cv.healthSource.connectors.selectConnector')).not.toBeNull())

    fireEvent.click(container.querySelector(`.bp3-input-action [data-icon="chevron-down"]`)!)
    await waitFor(() => container.querySelector('.menuItem'))

    // select alert
    fireEvent.click(getByText('cv.changeSource.alertText'))
    await waitFor(() => expect(container.querySelector('input[value="cv.changeSource.alertText"]')).toBeTruthy())
  })
})
