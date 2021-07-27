import React from 'react'
import { render } from '@testing-library/react'

import MiniExecutionGraph from '../MiniExecutionGraph'

import pipeline from './pipeline.json'

jest.mock('@pipeline/components/PipelineSteps/PipelineStepFactory', () => ({}))

describe('<MiniExecutionGraph /> tests', () => {
  test('snapshot test', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { container } = render(
      <MiniExecutionGraph
        pipelineExecution={pipeline as any}
        projectIdentifier="TEST_PROJECT"
        orgIdentifier="TEST_ORG"
        accountId="TEST_ACCOUNT"
        module="cd"
      />
    )

    expect(container).toMatchSnapshot()
  })
})
