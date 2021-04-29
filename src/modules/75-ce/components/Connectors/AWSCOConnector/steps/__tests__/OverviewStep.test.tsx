import React from 'react'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import OverviewStep from '../OverviewStep'

const testpath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/create'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }
const mockname = 'mockname'

jest.mock('services/cd-ng', () => ({
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() => ({
    status: 'SUCCESS',
    data: {}
  }))
}))

describe('Test Step 1', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <OverviewStep name={'AWS Cloud Provider Overview'} type="CEAws" permission={'CO'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Form Fills without error', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <OverviewStep name={'AWS Cloud Provider Overview'} type="CEAws" permission={'CO'} />
      </TestWrapper>
    )

    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement
    expect(nameInput).toBeDefined()
    fireEvent.change(nameInput, { target: { value: mockname } })
    await waitFor(() => {
      expect(nameInput.value).toBe(mockname)
    })

    const adddescbutton = screen.getByText('+ Description')
    const addtagbutton = screen.getByText('+ Tags')
    fireEvent.click(adddescbutton)
    await waitFor(() => {
      expect(screen.getByText('Description')).toBeDefined()
    })
    fireEvent.click(addtagbutton)
    await waitFor(() => {
      expect(screen.getByText('Tags')).toBeDefined()
    })

    const submitbutton = screen.getByText('ce.connector.AWS.overview.submitText')
    expect(submitbutton).toBeDefined()

    fireEvent.click(submitbutton)
  })
})
