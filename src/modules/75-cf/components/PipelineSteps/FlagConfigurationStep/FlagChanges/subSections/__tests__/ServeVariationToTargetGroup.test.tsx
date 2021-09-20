import React from 'react'
import { render, screen } from '@testing-library/react'
import ServeVariationToTargetGroup from '../ServeVariationToTargetGroup'

describe('ServeVariationToTargetGroup', () => {
  test('it should render', async () => {
    render(<ServeVariationToTargetGroup subSectionSelector={<span />} />)

    expect(screen.getByText('Serve Variation To Target Group')).toBeInTheDocument()
  })
})
