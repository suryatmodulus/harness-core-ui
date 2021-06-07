import React from 'react'
import { queryByAttribute, act, fireEvent, findByText, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import BuildStageSpecifications from '../BuildStageSpecifications'
import { getDummyPipelineContextValue } from './BuildStageSpecificationsTestHelpers'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as any),
  debounce: jest.fn(fn => {
    fn.flush = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))

describe('BuildStageSpecifications tests', () => {
  const pipelineContextMockValue = getDummyPipelineContextValue()
  test('renders correctly', async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <BuildStageSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('clicking on description shows corresponding inputs', async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <BuildStageSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const addDescriptionBtn = await findByText(container, 'pipelineSteps.build.stageSpecifications.addDescription')
    expect(addDescriptionBtn).toBeDefined()
    await act(async () => {
      fireEvent.click(addDescriptionBtn)
    })
    expect(queryByAttribute('name', container, 'description')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
