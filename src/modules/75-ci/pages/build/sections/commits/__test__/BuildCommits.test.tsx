import React from 'react'
import { render } from '@testing-library/react'
jest.mock('copy-to-clipboard')
import { StringsContext } from 'framework/strings'
import BuildCommits from '../BuildCommits'
import BuildMock from './mock/build.json'

jest.mock('@ci/services/CIUtils', () => ({
  getTimeAgo: () => '1 day ago',
  getShortCommitId: () => 'abc'
}))

jest.mock('@pipeline/context/ExecutionContext', () => ({
  useExecutionContext: () => ({
    pipelineExecutionDetail: {
      pipelineExecutionSummary: BuildMock
    }
  })
}))

describe('BuildCommits snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <StringsContext.Provider value={{ data: {} as any, getString: (key: string) => key as string }}>
        <BuildCommits />
      </StringsContext.Provider>
    )
    expect(container).toMatchSnapshot()
  })
})
