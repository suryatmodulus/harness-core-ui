import React from 'react'
import { render, waitFor, getByText, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
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

    fireEvent.click(
      document.querySelector(
        '.bp3-portal [style*="height"] > button[type="button"][class*="intent-primary"]'
      ) as HTMLButtonElement
    )

    expect(onSubmitTargets).toBeCalledTimes(1)
  })
})
