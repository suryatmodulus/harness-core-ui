import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ColumnSelector from '../ColumnSelector'
import { DEFAULT_COLS } from '../Columns'

const mock = {
  columns: DEFAULT_COLS,
  selectedColumns: DEFAULT_COLS,
  onChange: jest.fn().mockImplementationOnce(() => ({}))
}

describe('test cases for ColumnSelector component', () => {
  test('should be able to render the column selector and its dropdown', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <ColumnSelector {...mock} />
      </TestWrapper>
    )

    expect(getByText('ce.gridColumnSelector')).toBeDefined()

    fireEvent.click(getByText('ce.gridColumnSelector'))
    await waitFor(() => {
      expect(getByText('Name')).not.toBeNull()
      expect(getByText('Total cost')).not.toBeNull()
      expect(getByText('Cost trend')).not.toBeNull()

      const nameCheckBox = getByTestId('checkbox-name') as HTMLInputElement
      expect(nameCheckBox).not.toBeNull()
      expect(nameCheckBox.disabled).toBe(true)
      expect(nameCheckBox.checked).toBe(true)
    })

    expect(container).toMatchSnapshot()
  })
})
