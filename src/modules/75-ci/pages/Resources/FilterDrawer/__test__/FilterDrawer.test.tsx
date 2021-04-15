import React from 'react'

import { render, queryByText } from '@testing-library/react'
import i18n from '../FilterDrawer.i18n'
import FilterDrawer from '../FilterDrawer'

describe('FilterDrawer Snapshot', () => {
  test('should render FilterDrawer', () => {
    const { container } = render(<FilterDrawer isFilterPanelOpen={true} />)
    expect(queryByText(container, i18n.filterTitle)).toBeDefined()
    expect(queryByText(container, i18n.applyFilter)).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
