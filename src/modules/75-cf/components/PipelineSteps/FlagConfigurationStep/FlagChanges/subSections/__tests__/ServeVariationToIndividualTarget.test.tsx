import React from 'react'
import { render, screen } from '@testing-library/react'
import ServeVariationToIndividualTarget from '../ServeVariationToIndividualTarget'

describe('ServeVariationToIndividualTarget', () => {
  test('it should render', async () => {
    render(<ServeVariationToIndividualTarget subSectionSelector={<span />} />)

    expect(screen.getByText('Serve Variation To Individual Target')).toBeInTheDocument()
  })
})
