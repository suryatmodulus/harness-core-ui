import React from 'react'
import { render } from '@testing-library/react'
import CIDashboardSummaryCards from '../CIDashboardSummaryCards'

describe('CIDashboardSummaryCards', () => {
  test('matches snapshot', () => {
    const { container } = render(<CIDashboardSummaryCards />)
    expect(container).toMatchSnapshot()
  })
})
