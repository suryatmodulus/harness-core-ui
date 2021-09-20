import React from 'react'
import { render, screen } from '@testing-library/react'
import DefaultRules from '../DefaultRules'

describe('DefaultRules', () => {
  test('it should render', async () => {
    render(<DefaultRules subSectionSelector={<span />} />)

    expect(screen.getByText('Default Rules')).toBeInTheDocument()
  })
})
