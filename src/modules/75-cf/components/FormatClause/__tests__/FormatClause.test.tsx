import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Clause } from 'services/cf'
import FormatClause, { FormatClauseProps } from '../FormatClause'

const sampleClause: Clause = {
  id: 'test1',
  op: 'starts_with',
  attribute: 'something',
  values: ['some', 'value'],
  negate: false
}

const renderComponent = (props: Partial<FormatClauseProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <FormatClause clause={sampleClause} {...props} />
    </TestWrapper>
  )

describe('FormatClause', () => {
  test('it should render a clause with a single value', async () => {
    const clause = { ...sampleClause, values: ['single value'] }
    const { container } = renderComponent({ clause })

    expect(container).toHaveTextContent(`${clause.attribute} cf.clause.operators.startsWith ${clause.values[0]}`)
  })

  test('it should render a clause with multiple values', async () => {
    const clause = { ...sampleClause, values: ['one', 'two', 'three'] }
    const { container } = renderComponent({ clause })

    expect(container).toHaveTextContent(
      `${clause.attribute} cf.clause.operators.startsWith ${clause.values.join(', ')}`
    )
  })

  test('it should render NO_OP for an unknown operation', async () => {
    const clause = { ...sampleClause, op: 'SOMETHING_ELSE' }
    const { container } = renderComponent({ clause })

    expect(container).toHaveTextContent(`${clause.attribute} NO_OP ${clause.values.join(', ')}`)
  })
})
