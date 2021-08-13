import React from 'react'
import { render } from '@testing-library/react'

import { CDExecutionCardSummary } from '../CDExecutionCardSummary'

import props from './props.json'

describe('<CDExecutionCardSummary /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(<CDExecutionCardSummary {...(props as any)} />)
    expect(container).toMatchSnapshot()
  })
})
