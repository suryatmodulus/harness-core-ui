import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { RightBar } from '../RightBar'
import { PipelineContext, PipelineContextInterface } from '../../PipelineContext/PipelineContext'

jest.mock('services/cd-ng', () => ({
  getConnectorPromise: () => Promise.resolve(connectorMock),
  useGetConnector: () => ({
    loading: false,
    data: connectorMock,
    refetch: jest.fn()
  })
}))

jest.mock('../../RightDrawer/RightDrawer', () => ({
  RightDrawer: () => <div />
}))

const connectorMock = {
  data: {
    connector: {
      name: 'Git5',
      identifier: 'Git5',
      description: '',
      orgIdentifier: 'CV',
      projectIdentifier: 'Milos2',
      tags: {},
      type: 'Git',
      spec: {
        url: 'https://github.com/wings-software/template-yaml-bugbash.git',
        branchName: null,
        delegateSelectors: [],
        type: 'Http',
        connectionType: 'Repo',
        spec: {
          username: 'AutoUserHarness1',
          usernameRef: null,
          passwordRef: 'GitPass2'
        },
        gitSync: {
          enabled: false,
          customCommitAttributes: null,
          syncEnabled: false
        }
      }
    }
  }
}

const stateMock = {
  pipeline: {
    name: 'P1',
    identifier: 'P1',
    projectIdentifier: 'Milos2',
    orgIdentifier: 'CV',
    tags: {},
    properties: {
      ci: {
        codebase: {
          connectorRef: 'Git5',
          build: '<+input>'
        }
      }
    },
    stages: [
      {
        stage: {
          name: 'S1',
          identifier: 'S1',
          description: '',
          type: 'CI',
          spec: {
            cloneCodebase: true,
            execution: {
              steps: []
            },
            serviceDependencies: []
          }
        }
      }
    ]
  },
  originalPipeline: {
    name: 'P1',
    identifier: 'P1',
    projectIdentifier: 'Milos2',
    orgIdentifier: 'CV',
    tags: {}
  },
  pipelineIdentifier: '-1',
  pipelineView: {
    isSplitViewOpen: true,
    isDrawerOpened: false,
    splitViewData: {
      type: 'StageView'
    },
    drawerData: {
      type: 'AddCommand'
    }
  },
  gitDetail: {},
  isLoading: false,
  isBEPipelineUpdated: false,
  isDBInitialized: true,
  isUpdated: true,
  isInitialized: true,
  selectionState: {
    selectedStageId: 'S1'
  },
  error: ''
}

const pipelineContext: PipelineContextInterface = {
  updatePipeline: jest.fn(),
  state: stateMock as any,
  stepsFactory: factory,
  stagesMap: {},
  isReadonly: false,
  setSchemaErrorView: jest.fn(),
  view: 'ui',
  renderPipelineStage: jest.fn(),
  setView: jest.fn(),
  updateGitDetails: jest.fn(),
  updatePipelineView: jest.fn(),
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

describe('RightBar', () => {
  test('renders correctly', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <RightBar />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
