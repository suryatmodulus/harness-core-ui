/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  render,
  waitFor,
  getByText,
  fireEvent,
  getAllByPlaceholderText,
  RenderResult,
  screen
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import * as usePlanEnforcementMock from '@cf/hooks/usePlanEnforcement'

import CreateTargetModal from '../CreateTargetModal'

describe('CreateTargetModal', () => {
  test('CreateTargetModal should render initial state correctly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <CreateTargetModal loading={true} onSubmitTargets={jest.fn()} onSubmitUpload={jest.fn()} />
      </TestWrapper>
    )

    expect(getByText(container, 'cf.targets.create')).toBeDefined()

    const button = container.querySelector('button[type="button"]') as HTMLElement
    expect(button).toBeDefined()
    fireEvent.click(getByText(container, 'cf.targets.create'))

    await waitFor(() => expect(document.querySelector('.bp3-portal')).toBeDefined())

    expect(document.querySelector('.bp3-portal')).toMatchSnapshot()
  })

  test('CreateTargetModal should call callbacks properly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }
    const onSubmitTargets = jest.fn()
    const onSubmitUpload = jest.fn()

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <CreateTargetModal loading={false} onSubmitTargets={onSubmitTargets} onSubmitUpload={onSubmitUpload} />
      </TestWrapper>
    )

    fireEvent.click(getByText(container, 'cf.targets.create'))

    await waitFor(() => expect(document.querySelector('.bp3-portal')).toBeDefined())
    fireEvent.change(document.querySelector('input[placeholder="cf.targets.enterName"]') as HTMLInputElement, {
      target: { value: 'Target1' }
    })
    fireEvent.change(document.querySelector('input[placeholder="cf.targets.enterValue"]') as HTMLInputElement, {
      target: { value: 'Target1' }
    })

    await waitFor(() =>
      expect(
        document.querySelector(
          '.bp3-portal [style*="height"] > button[type="button"][class*="intent-primary"][class*=disabled]'
        )
      ).toBeNull()
    )

    await act(async () => {
      fireEvent.click(
        document.querySelector(
          '.bp3-portal [style*="height"] > button[type="button"][class*="intent-primary"]'
        ) as HTMLButtonElement
      )
    })
    expect(onSubmitTargets).toBeCalledTimes(1)
  })

  test('CreateTargetModal can add and remove rows', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <CreateTargetModal loading={true} onSubmitTargets={jest.fn()} onSubmitUpload={jest.fn()} />
      </TestWrapper>
    )

    expect(getByText(container, 'cf.targets.create')).toBeDefined()

    await act(async () => {
      fireEvent.click(getByText(container, 'cf.targets.create'))
    })

    const modal = document.querySelector('.bp3-portal') as HTMLElement
    await waitFor(() => expect(modal).toBeDefined())

    // add row
    expect(getAllByPlaceholderText(modal, 'cf.targets.enterName').length).toBe(1)
    await act(async () => {
      fireEvent.click(document.querySelector('.bp3-icon-plus') as HTMLElement)
    })
    expect(getAllByPlaceholderText(modal, 'cf.targets.enterName').length).toBe(2)

    // remove row
    await act(async () => {
      fireEvent.click(document.querySelector('.bp3-icon-minus') as HTMLElement)
    })

    expect(getAllByPlaceholderText(modal, 'cf.targets.enterName').length).toBe(1)
  })

  test('CreateTargetModal can toggle upload options', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <CreateTargetModal loading={true} onSubmitTargets={jest.fn()} onSubmitUpload={jest.fn()} />
      </TestWrapper>
    )

    expect(getByText(container, 'cf.targets.create')).toBeDefined()

    await act(async () => {
      fireEvent.click(getByText(container, 'cf.targets.create'))
    })

    const modal = document.querySelector('.bp3-portal') as HTMLElement
    await waitFor(() => expect(modal).toBeDefined())

    // click upload targets button
    await act(async () => {
      fireEvent.click(getByText(modal, 'cf.targets.upload'))
    })

    expect(getByText(modal, 'cf.targets.uploadYourFile')).toBeDefined()

    // click add a target
    await act(async () => {
      fireEvent.click(getByText(modal, 'cf.targets.list'))
    })

    expect(getAllByPlaceholderText(modal, 'cf.targets.enterName').length).toBeDefined
  })

  test('+ Target(s) button should show CreateTargetModal when user is within MAU limit', async () => {
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true, isFreePlan: true })
    jest.spyOn(useFeaturesMock, 'useFeature').mockReturnValue({ enabled: false })

    const renderComponent = (): RenderResult => {
      return render(
        <TestWrapper
          path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
          pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
        >
          <CreateTargetModal loading={false} onSubmitTargets={jest.fn()} onSubmitUpload={jest.fn()} />
        </TestWrapper>
      )
    }

    renderComponent()
    const createTargetButton = screen.getByRole('button', { name: 'cf.targets.create' })
    userEvent.click(createTargetButton)

    const createTargetModal = screen.findByTitle('cf.targets.addTargetsLabel')

    expect(createTargetModal).toBeDefined()
    await waitFor(() =>
      expect(screen.queryByText('common.feature.upgradeRequired.pleaseUpgrade')).not.toBeInTheDocument()
    )
  })

  test('+ Target(s) button should show plan enforcement tooltip when user exceeds MAU limit', async () => {
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true, isFreePlan: true })
    jest.spyOn(useFeaturesMock, 'useFeature').mockReturnValue({ enabled: false })

    const renderComponent = (): RenderResult => {
      return render(
        <TestWrapper
          path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
          pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
        >
          <CreateTargetModal loading={false} onSubmitTargets={jest.fn()} onSubmitUpload={jest.fn()} />
        </TestWrapper>
      )
    }

    renderComponent()

    const createTargetButton = screen.getByRole('button', { name: 'cf.targets.create' })
    fireEvent.mouseOver(createTargetButton)

    await waitFor(() => expect(screen.queryByText('common.feature.upgradeRequired.pleaseUpgrade')).toBeInTheDocument())
    expect(createTargetButton.closest('a')).toHaveClass('bp3-disabled')
  })
})
