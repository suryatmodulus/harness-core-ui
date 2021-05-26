import React from 'react'
import { render } from '@testing-library/react'
import executionMock from './executionMock.json'

import ExecutionArtifactsView, {
  getStageSetupIds,
  getStageNodesWithArtifacts,
  getArtifactGroups
} from '../ExecutionArtifactsView'

jest.mock('@pipeline/pages/execution/ExecutionContext/ExecutionContext', () => ({
  useExecutionContext: () => ({
    pipelineExecutionDetail: {
      pipelineExecutionSummary: executionMock.data.pipelineExecutionSummary as any,
      executionGraph: executionMock.data.executionGraph as any
    },
    allNodeMap: {},
    pipelineStagesMap: new Map(),
    selectedStageId: '',
    selectedStepId: '',
    loading: false,
    isDataLoadedForSelectedStage: true,
    queryParams: {},
    logsToken: '',
    setLogsToken: () => void 0,
    refetch: undefined,
    addNewNodeToMap: () => void 0,
    setStepsGraphCanvasState: () => undefined,
    stepsGraphCanvasState: { offsetX: 0, offsetY: 0, zoom: 100 }
  })
}))

describe('<ExecutionArtifactsView /> tests', () => {
  test('getStageSetupIds() test', () => {
    const ids = getStageSetupIds(executionMock.data.pipelineExecutionSummary as any)
    expect(ids).toEqual(['8PKMDSMyRdih_aJp8p3f6w', 'UkROwkBmS-2QpiHgvc6CLA'])
  })
  test('getStageNodesWithArtifacts() test', () => {
    const stageNodes = getStageNodesWithArtifacts(executionMock.data.executionGraph as any, [
      '8PKMDSMyRdih_aJp8p3f6w',
      'UkROwkBmS-2QpiHgvc6CLA'
    ])
    expect(stageNodes).toEqual([
      {
        baseFqn: 'pipeline.stages.docker-buildPush-success',
        delegateInfoList: [],
        endTs: 1619650654250,
        executableResponses: [
          {
            child: {
              childNodeId: 'E3Kq8iITQ8-ruvrOQK2K2g'
            }
          }
        ],
        failureInfo: {
          failureTypeList: [],
          message: '',
          responseMessages: []
        },
        identifier: 'docker-buildPush-success',
        interruptHistories: [],
        name: 'docker build push',
        nodeRunInfo: {
          evaluatedCondition: true,
          whenCondition: '<+OnPipelineSuccess>'
        },
        outcomes: [
          {
            fileArtifacts: [],
            imageArtifacts: [
              {
                imageName: 'harness/ci-automation',
                tag: '1.2',
                url:
                  'https://hub.docker.com/layers/harness/ci-automation/1.2/images/sha256-e4069d8aa9b2825630ba28674526544967dfc9fd6d832b002df00c534e8de6e0/'
              },
              {
                imageName: 'harness/ci-automation',
                tag: '1',
                url:
                  'https://hub.docker.com/layers/harness/ci-automation/1/images/sha256-e4069d8aa9b2825630ba28674526544967dfc9fd6d832b002df00c534e8de6e0/'
              }
            ]
          }
        ],
        setupId: '8PKMDSMyRdih_aJp8p3f6w',
        skipInfo: null,
        startTs: 1619650562121,
        status: 'Success',
        stepParameters: {
          childNodeID: 'E3Kq8iITQ8-ruvrOQK2K2g',
          dependencies: null,
          description: null,
          enableCloneRepo: false,
          identifier: 'docker-buildPush-success',
          infrastructure: {
            spec: {
              annotations: null,
              connectorRef: 'account.testK8sConnectorWXRr',
              labels: null,
              namespace: 'harness-delegate'
            },
            type: 'KUBERNETES_DIRECT'
          },
          name: 'docker build push',
          originalVariables: null,
          sharedPaths: null,
          skipCondition: null,
          stepIdentifiers: ['createDockerFile', 'dockerBuildPush'],
          type: 'CI'
        },
        stepType: 'IntegrationStageStepPMS',
        taskIdToProgressDataMap: {},
        unitProgresses: [],
        uuid: 'pLisAB7sT0Woi6I3PomP-w'
      }
    ])
  })
  test('getArtifactGroups() test', () => {
    const stageNodes = getStageNodesWithArtifacts(executionMock.data.executionGraph as any, [
      '8PKMDSMyRdih_aJp8p3f6w',
      'UkROwkBmS-2QpiHgvc6CLA'
    ])
    const groups = getArtifactGroups(stageNodes)
    expect(groups).toEqual([
      {
        artifacts: [
          {
            image: 'harness/ci-automation',
            tag: '1.2',
            type: 'Image',
            url:
              'https://hub.docker.com/layers/harness/ci-automation/1.2/images/sha256-e4069d8aa9b2825630ba28674526544967dfc9fd6d832b002df00c534e8de6e0/'
          },
          {
            image: 'harness/ci-automation',
            tag: '1',
            type: 'Image',
            url:
              'https://hub.docker.com/layers/harness/ci-automation/1/images/sha256-e4069d8aa9b2825630ba28674526544967dfc9fd6d832b002df00c534e8de6e0/'
          }
        ],
        icon: 'pipeline-deploy',
        name: 'docker build push'
      }
    ])
  })
  test('renders ok', () => {
    const { container } = render(<ExecutionArtifactsView />)
    expect(container).toMatchSnapshot()
  })
})
