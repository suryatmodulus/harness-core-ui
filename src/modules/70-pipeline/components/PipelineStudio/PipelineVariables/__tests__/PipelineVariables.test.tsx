import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import * as cdng from 'services/cd-ng'
import { PipelineVariablesContext } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { CustomVariables } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariables'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import PipelineVariables from '../PipelineVariables'
import { PipelineContext, PipelineContextInterface } from '../../PipelineContext/PipelineContext'
import variablesPipeline from './variables.json'
import pipeline from './pipeline.json'
import metadataMap from './metadataMap.json'

const pipelineContext: PipelineContextInterface = {
  updatePipeline: jest.fn(),
  state: { pipeline, pipelineView: { splitViewData: {} }, selectionState: {} } as any,
  stepsFactory: factory,
  stagesMap: {},
  isReadonly: false,
  setSchemaErrorView: jest.fn(),
  view: SelectedView.VISUAL,
  renderPipelineStage: jest.fn(),
  setView: jest.fn(),
  updateGitDetails: jest.fn(),
  updatePipelineView: jest.fn(),
  updateTemplateView: jest.fn(),
  fetchPipeline: jest.fn(),
  deletePipelineCache: jest.fn(),
  getStageFromPipeline: jest.fn(),
  setYamlHandler: jest.fn(),
  runPipeline: jest.fn(),
  updateStage: jest.fn(),
  pipelineSaved: jest.fn(),
  setSelectedStageId: jest.fn(),
  setSelectedStepId: jest.fn(),
  setSelectedSectionId: jest.fn(),
  setSelection: jest.fn(),
  getStagePathFromPipeline: jest.fn()
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(branchStatusMock))
const getListGitSync = jest.fn(() => Promise.resolve(gitConfigs))

jest.spyOn(cdng, 'useGetListOfBranchesWithStatus').mockImplementation((): any => {
  return { data: branchStatusMock, refetch: getListOfBranchesWithStatus, loading: false }
})
jest.spyOn(cdng, 'useListGitSync').mockImplementation((): any => {
  return { data: gitConfigs, refetch: getListGitSync, loading: false }
})
jest.spyOn(cdng, 'useGetSourceCodeManagers').mockImplementation((): any => {
  return { data: sourceCodeManagers, refetch: jest.fn(), loading: false }
})

describe('<PipelineVariables /> tests', () => {
  beforeAll(() => {
    factory.registerStep(new CustomVariables())
  })

  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <PipelineVariablesContext.Provider
            value={{ variablesPipeline, loading: false, initLoading: false, error: null, metadataMap } as any}
          >
            <PipelineVariables />
          </PipelineVariablesContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders loader', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <PipelineVariablesContext.Provider
            value={{ variablesPipeline, loading: false, initLoading: true, error: null, metadataMap } as any}
          >
            <PipelineVariables />
          </PipelineVariablesContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders error', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <PipelineVariablesContext.Provider
            value={
              {
                variablesPipeline,
                loading: false,
                initLoading: false,
                error: { message: 'This is an error message' },
                metadataMap
              } as any
            }
          >
            <PipelineVariables />
          </PipelineVariablesContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
