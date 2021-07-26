import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TestWrapper } from '@common/utils/testUtils'
import { RightDrawer } from '../RightDrawer'
import stateMock from './stateMock'
import type { PipelineSelectionState } from '../../PipelineQueryParamState/usePipelineQueryParam'

jest.mock('../../StepCommands/StepCommands', () => ({
  // eslint-disable-next-line react/display-name
  StepCommandsWithRef: React.forwardRef((props: any, ref) => {
    React.useImperativeHandle(ref, () => ({
      submitForm: () =>
        props.onChange({
          identifier: 'step1',
          name: 'step1',
          description: 'test desc',
          spec: {
            connectorRef: 'harnessImage',
            image: 'alpine',
            command: "echo 'run'",
            privileged: false
          }
        }),
      getValues: () => ({
        identifier: 'step1',
        name: 'step1',
        description: 'test desc',
        spec: {
          connectorRef: 'harnessImage',
          image: 'alpine',
          command: "echo 'run'",
          privileged: false
        }
      }),
      getErrors: () => ({})
    }))
    return <div className="step-commands-mock" />
  })
}))

jest.mock('@blueprintjs/core', () => ({
  ...(jest.requireActual('@blueprintjs/core') as any),
  // eslint-disable-next-line react/display-name
  Drawer: ({ children, title }: any) => (
    <div className="drawer-mock">
      {title}
      {children}
    </div>
  )
}))

jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as any),
  useStrings: jest.fn().mockReturnValue({
    getString: jest.fn().mockImplementation(val => val)
  }),
  loggerFor: jest.fn().mockReturnValue({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })
}))

jest.mock('../../PiplineHooks/useVariablesExpression', () => ({
  ...(jest.requireActual('../../PiplineHooks/useVariablesExpression') as any),
  useVariablesExpression: jest.fn().mockReturnValue({
    expressions: ['']
  })
}))

describe('Right Drawer tests', () => {
  test('Edit step works as expected', async () => {
    const udpateStageMock = jest.fn()
    const { findByText } = render(
      <PipelineContext.Provider
        value={{
          state: stateMock as any,
          stepsFactory: {
            getStepData: () => ({
              icon: 'run-step',
              name: 'Configure Run Step',
              type: 'Run'
            }),
            getStepIcon: () => 'run-step'
          } as any,
          stagesMap: {},
          setSchemaErrorView: () => undefined,
          isReadonly: false,
          view: 'VISUAL',
          updateGitDetails: () => new Promise<void>(() => undefined),
          setView: () => void 0,
          runPipeline: () => undefined,
          // eslint-disable-next-line react/display-name
          renderPipelineStage: () => <div />,
          fetchPipeline: () => new Promise<void>(() => undefined),
          updatePipelineView: () => undefined,
          updateStage: udpateStageMock,
          getStageFromPipeline: () => ({ stage: stateMock.pipeline.stages[0] as any, parent: undefined }),
          setYamlHandler: () => undefined,
          updatePipeline: () => new Promise<void>(() => undefined),
          pipelineSaved: () => undefined,
          deletePipelineCache: () => new Promise<void>(() => undefined),
          setSelectedStageId: (_selectedStageId: string | undefined) => undefined,
          setSelectedStepId: (_selectedStepId: string | undefined) => undefined,
          setSelectedSectionId: (_selectedSectionId: string | undefined) => undefined,
          setSelection: (_selectedState: PipelineSelectionState) => undefined,
          getStagePathFromPipeline: () => ''
        }}
      >
        <TestWrapper>
          <RightDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    const applyBtn = await findByText('applyChanges')
    fireEvent.click(applyBtn)
    expect(udpateStageMock).toHaveBeenCalled()
    expect(udpateStageMock.mock.calls[0][0]).toMatchSnapshot()
  })
})
