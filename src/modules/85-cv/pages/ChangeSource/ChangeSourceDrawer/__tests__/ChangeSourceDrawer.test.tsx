/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
  pagerDutyChangeSourceDrawerDataWithoutService,
  k8sChangeSourceDrawerData
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
  // eslint-disable-next-line jest/no-disabled-tests
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
  })

  // eslint-disable-next-line jest/no-disabled-tests
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
    await waitFor(() => expect(container.querySelector('input[value="HarnessCDNextGen"]')).toBeTruthy())
    await waitFor(() => expect(getByText('cv.onboarding.changeSourceTypes.HarnessCDNextGen.name')).toBeTruthy())

    // category dropdown and thumbnailSelect are disabled in editmode
    await waitFor(() => expect(container.querySelector('input[value="deploymentText"]')).toBeDisabled())
    await waitFor(() => expect(container.querySelector('input[value="HarnessCDNextGen"]')).toBeDisabled())

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
  })
  // eslint-disable-next-line jest/no-disabled-tests
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
  })
  // eslint-disable-next-line jest/no-disabled-tests
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

  test('Ensure that correct category drop down values are rendered when type prop is provided', async () => {
    const { container, rerender } = render(
      <TestWrapper>
        <ChangeSourceDrawer
          onSuccess={onSuccess}
          hideDrawer={hideDrawer}
          isEdit={false}
          monitoredServiceType="Application"
          rowdata={{ spec: {} }}
          tableData={[]}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector(`input[value="deploymentText"]`)).not.toBeNull())
    expect(container.querySelector('input[name="category"][value="deploymentText"]')).not.toBeNull()
    fireEvent.click(container.querySelector(`.bp3-input-action [data-icon="chevron-down"]`)!)
    await waitFor(() => expect(container.querySelector('[class*="menuItemLabel"]')).not.toBeNull())

    let menuItemLabels = container.querySelectorAll('[class*="menuItemLabel"]')
    expect(menuItemLabels[0].innerHTML).toEqual('deploymentText')
    expect(menuItemLabels[1].innerHTML).toEqual('cv.changeSource.alertText')

    rerender(
      <TestWrapper>
        <ChangeSourceDrawer
          onSuccess={onSuccess}
          hideDrawer={hideDrawer}
          isEdit={false}
          monitoredServiceType="Infrastructure"
          rowdata={{ spec: {} }}
          tableData={[]}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector(`input[placeholder="infrastructureText"]`)).not.toBeNull())
    fireEvent.click(container.querySelector(`.bp3-input-action [data-icon="chevron-down"]`)!)
    await waitFor(() => expect(container.querySelector('[class*="menuItemLabel"]')).not.toBeNull())

    menuItemLabels = container.querySelectorAll('[class*="menuItemLabel"]')
    expect(menuItemLabels[0].innerHTML).toEqual('infrastructureText')
    expect(menuItemLabels[1].innerHTML).toEqual('cv.changeSource.alertText')
  })

  test('Ensure k8s connector is disabled on edit', async () => {
    render(
      <TestWrapper>
        <ChangeSourceDrawer
          onSuccess={onSuccess}
          hideDrawer={hideDrawer}
          isEdit={true}
          monitoredServiceType="Infrastructure"
          rowdata={k8sChangeSourceDrawerData}
          tableData={[k8sChangeSourceDrawerData]}
        />
      </TestWrapper>
    )

    await waitFor(() => expect('[class*="ReferenceSelect"] button[disabled]').not.toBeNull())
  })
})
