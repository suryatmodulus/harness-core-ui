import React from 'react'
import { render } from '@testing-library/react'
import ActiveBuildCard from '../ActiveBuildCard'

describe('ActiveBuildCard', () => {
  test('matches snapshot when status=PENDING', () => {
    const { container } = render(<ActiveBuildCard title="test-Pipeline1" message="build message" status="PENDING" />)
    expect(container).toMatchSnapshot()
  })

  test('matches snapshot when status=RUNNING', () => {
    const { container } = render(<ActiveBuildCard title="test-Pipeline1" message="build message" status="RUNNING" />)
    expect(container).toMatchSnapshot()
  })
})
