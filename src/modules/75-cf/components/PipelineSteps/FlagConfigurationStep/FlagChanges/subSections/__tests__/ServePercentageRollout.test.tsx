import React from 'react'
import { render, screen } from '@testing-library/react'
import ServePercentageRollout from '../ServePercentageRollout'

describe('ServePercentageRollout', () => {
  test('it should render', async () => {
    render(<ServePercentageRollout subSectionSelector={<span />} />)

    expect(screen.getByText('Serve Percentage Rollout')).toBeInTheDocument()
  })
})
