import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CreateAccessPointDialogScreens from '../CreateAccessPointDialogSteps'

const params = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
    data: undefined,
    loading: false
  }))
}))

describe('Creation of Access Point', () => {
  test('render access point creation dialog', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <CreateAccessPointDialogScreens onCancel={jest.fn()} onSave={jest.fn()} />)
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Selection of provider and connector', () => {
    const { container } = render(
      <TestWrapper>
        <CreateAccessPointDialogScreens onCancel={jest.fn()} onSave={jest.fn()} />)
      </TestWrapper>
    )
    const providerCard = container.querySelectorAll('.bp3-card')[0]
    act(() => {
      fireEvent.click(providerCard)
    })
    expect(container).toMatchSnapshot()
  })
})
