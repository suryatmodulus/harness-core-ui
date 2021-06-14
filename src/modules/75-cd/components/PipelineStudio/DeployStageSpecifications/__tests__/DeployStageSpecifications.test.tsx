import React from 'react'
import { render, fireEvent, act, findByText } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { CustomVariables } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariables'
import DeployStageSpecifications from '../DeployStageSpecifications'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

factory.registerStep(new CustomVariables())

const getPipelineContext = (): PipelineContextInterface => ({
  state: {
    pipeline: { name: '', identifier: '' },
    originalPipeline: { name: '', identifier: '' },
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      drawerData: { type: DrawerTypes.AddStep },
      splitViewData: {}
    },
    schemaErrors: false,
    selectionState: {},
    pipelineIdentifier: '',
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isInitialized: true,
    isLoading: false,
    gitDetails: {},
    isUpdated: true
  },
  setSchemaErrorView: jest.fn(),
  stagesMap: {},
  updateGitDetails: jest.fn(),
  isReadonly: false,
  renderPipelineStage: jest.fn(),
  fetchPipeline: jest.fn(),
  setYamlHandler: jest.fn(),
  updatePipeline: jest.fn(),
  updatePipelineView: jest.fn(),
  updateStage: jest.fn(),
  getStageFromPipeline: jest.fn(() => ({ stage: undefined, parent: undefined })),
  deletePipelineCache: jest.fn(),
  runPipeline: jest.fn(),
  pipelineSaved: jest.fn(),
  view: 'ui',
  setView: jest.fn(),
  stepsFactory: factory,
  setSelectedStageId: jest.fn(),
  setSelectedStepId: jest.fn(),
  getStagePathFromPipeline: jest.fn()
})
describe('StepWidget tests', () => {
  test(`renders DeployStageSpecifications without crashing `, () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getPipelineContext()}>
          <DeployStageSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip(`Updates DeployStageSpecifications form `, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getPipelineContext()}>
          <DeployStageSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    act(() => {
      const stageNameInput = container.querySelector('input[name="name"]')
      expect(stageNameInput).toBeDefined()
      fireEvent.change(stageNameInput!, { target: { value: 'Deploy' } })
      expect(container).toMatchSnapshot('Updated Form')
    })

    await act(async () => {
      const addVariableButton = await findByText(document.body, 'Add Variable')
      expect(addVariableButton).toBeDefined()
      fireEvent.click(addVariableButton)
      const variableNameInput = document.querySelector('input[placeholder="Variable Name"]')
      expect(variableNameInput).toBeDefined()
      fireEvent.change(variableNameInput!, { target: { value: 'Variable' } })
      const submitdVariableButton = await findByText(document.body, 'Save')
      expect(submitdVariableButton).toBeDefined()
      expect(document.getElementsByClassName('bp3-portal')[0]).toMatchSnapshot('Add Variable Form')
    })
    const variableTitle = await findByText(container, 'Variable')
    expect(variableTitle).toBeDefined()
    expect(document.getElementsByClassName('bp3-portal')[0]).toMatchSnapshot('Variables List')
  })
})
