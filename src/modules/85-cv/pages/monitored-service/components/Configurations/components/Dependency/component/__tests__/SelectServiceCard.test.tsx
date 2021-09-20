import React from 'react'
import { render, waitFor, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SelectServiceCard from '../SelectServiceCard'

const data = {
  serviceRef: 'service101',
  serviceName: 'Service 101'
}
const onChange = jest.fn()

describe('SelectServiceCard', () => {
  test('should render', async () => {
    const { container, getByRole } = render(
      <TestWrapper>
        <SelectServiceCard data={data} onChange={onChange} isChecked />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByRole('checkbox'))
    })
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(container).toMatchSnapshot()
  })
  test('should retain checked status', async () => {
    const { container } = render(
      <TestWrapper>
        <SelectServiceCard data={data} onChange={onChange} isChecked />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('input[type="checkbox"]')).toBeChecked())
    expect(container).toMatchSnapshot()
  })
})
