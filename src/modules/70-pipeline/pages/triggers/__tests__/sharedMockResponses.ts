import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { UseGetReturnData } from '@common/utils/testUtils'
import type {
  ResponseInputSetTemplateResponse,
  ResponseMergeInputSetResponse,
  ResponsePageInputSetSummaryResponse,
  ResponsePageNGTriggerDetailsResponse
} from 'services/pipeline-ng'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import type { PMSPipelineResponseDTO, ResponsePMSPipelineResponseDTO } from 'services/pipeline-ng'

export const GetPipelineResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: ({
      ngPipeline: {
        pipeline: {
          name: 'p1',
          identifier: 'p1',
          description: '',
          tags: null,
          variables: null,
          ciCodebase: null,
          stages: [
            {
              stage: {
                identifier: 'stage1',
                name: 'stage-1',
                description: '',
                failureStrategies: null,
                type: 'Deployment',
                metadata: null,
                spec: {
                  variables: null,
                  service: {
                    useFromStage: null,
                    identifier: 'service1',
                    name: 'service-1',
                    description: '',
                    serviceDefinition: {
                      type: 'Kubernetes',
                      metadata: null,
                      spec: {
                        variables: null,
                        artifacts: {
                          primary: null,
                          sidecars: [],
                          metadata: null
                        },
                        manifests: [],
                        variableOverrideSets: null,
                        artifactOverrideSets: [],
                        manifestOverrideSets: [],
                        metadata: null
                      }
                    },
                    stageOverrides: null,
                    tags: null,
                    metadata: null
                  },
                  infrastructure: {
                    infrastructureDefinition: {
                      type: 'KubernetesDirect',
                      metadata: null,
                      spec: {
                        connectorRef: 'connector',
                        namespace: RUNTIME_INPUT_VALUE,
                        releaseName: RUNTIME_INPUT_VALUE,
                        metadata: null
                      }
                    },
                    useFromStage: null,
                    environment: {
                      name: 'env-1',
                      identifier: 'env1',
                      description: '',
                      type: 'PreProduction',
                      tags: null,
                      metadata: null
                    },
                    metadata: null
                  },
                  execution: {
                    steps: [
                      {
                        step: {
                          identifier: 'rolloutDeployment',
                          name: 'Rollout Deployment',
                          failureStrategies: null,
                          type: 'K8sRollingDeploy',
                          metadata: null,
                          spec: {
                            timeout: '10m',
                            skipDryRun: false,
                            metadata: null
                          }
                        }
                      }
                    ],
                    rollbackSteps: [
                      {
                        step: {
                          identifier: 'rollbackRolloutDeployment',
                          name: 'Rollback Rollout Deployment',
                          failureStrategies: null,
                          type: 'K8sRollingRollback',
                          metadata: null,
                          spec: {
                            timeout: '10m',
                            metadata: null
                          }
                        }
                      }
                    ],
                    metadata: null
                  },
                  skipCondition: null,
                  metadata: null
                }
              }
            }
          ],
          metadata: null
        }
      },
      executionsPlaceHolder: [],
      yamlPipeline:
        'pipeline:\n  name: p1\n  identifier: p1\n  description: ""\n  stages:\n    - stage:\n        name: stage-1\n        identifier: stage1\n        description: ""\n        type: Deployment\n        spec:\n          service:\n            identifier: service1\n            name: service-1\n            description: ""\n            serviceDefinition:\n              type: Kubernetes\n              spec:\n                artifacts:\n                  sidecars: []\n                manifests: []\n                artifactOverrideSets: []\n                manifestOverrideSets: []\n          infrastructure:\n            environment:\n              name: env-1\n              identifier: env1\n              description: ""\n              type: PreProduction\n            infrastructureDefinition:\n              type: KubernetesDirect\n              spec:\n                connectorRef: connector\n                namespace: <+input>\n                releaseName: <+input>\n          execution:\n            steps:\n              - step:\n                  name: Rollout Deployment\n                  identifier: rolloutDeployment\n                  type: K8sRollingDeploy\n                  spec:\n                    timeout: 10m\n                    skipDryRun: false\n            rollbackSteps:\n              - step:\n                  name: Rollback Rollout Deployment\n                  identifier: rollbackRolloutDeployment\n                  type: K8sRollingRollback\n                  spec:\n                    timeout: 10m\n',
      version: 8
    } as unknown) as PMSPipelineResponseDTO,
    metaData: (null as unknown) as undefined,
    correlationId: '26a25fc1-882a-4499-9059-d1ed08ae12fb'
  }
}

export const GetTemplateFromPipelineResponse: UseGetReturnData<ResponseInputSetTemplateResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      inputSetTemplateYaml:
        'pipeline:\n  identifier: "p1"\n  stages:\n  - stage:\n      identifier: "stage1"\n      type: "Deployment"\n      spec:\n        infrastructure:\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              namespace: "<+input>"\n              releaseName: "<+input>"\n'
    },
    metaData: (null as unknown) as undefined,
    correlationId: '4e057505-dbd4-4de7-9a9d-43a0364e5825'
  }
}

export const GetTemplateFromPipelineResponseEmpty: UseGetReturnData<ResponseInputSetTemplateResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      inputSetTemplateYaml: ''
    },
    metaData: (null as unknown) as undefined,
    correlationId: '4e057505-dbd4-4de7-9a9d-43a0364e5825'
  }
}

export const GetMergeInputSetFromPipelineTemplateWithListInputResponse: UseGetReturnData<ResponseMergeInputSetResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: ({
    status: 'SUCCESS',
    data: {
      inputSetTemplateYaml:
        'pipeline:\n  identifier: "p1"\n  stages:\n  - stage:\n      identifier: "stage1"\n      type: "Deployment"\n      spec:\n        infrastructure:\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              namespace: "<+input>"\n              releaseName: "<+input>"\n'
    },
    metaData: null,
    correlationId: '2197e87f-64d4-44a4-91c7-607337cf4394'
  } as unknown) as ResponseMergeInputSetResponse
}

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'tesa1',
        identifier: 'tesa1',
        description: '',
        orgIdentifier: 'Harness11',
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}
export const RepoConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'repo-github',
        identifier: 'repogithub',
        description: '',
        orgIdentifier: 'default',
        tags: {},
        type: 'Github',
        spec: {
          url: 'https://github.com',
          authentication: {
            type: 'Http',
            spec: {
              type: 'UsernamePassword',
              spec: {
                username: 'username',
                usernameRef: null,
                passwordRef: 'HARNESS_IMAGE_PASSWORD'
              }
            }
          },
          apiAccess: null,
          type: 'Repo'
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

export const GetInputSetsResponse: UseGetReturnData<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      totalPages: 1,
      totalItems: 2,
      pageItemCount: 2,
      pageSize: 100,
      content: [
        {
          identifier: 'asd',
          name: 'asd',
          pipelineIdentifier: 'testqqq',
          description: 'asd',
          inputSetType: 'INPUT_SET'
        },
        {
          identifier: 'test',
          name: 'test',
          pipelineIdentifier: 'testqqq',
          description: 'sdf',
          inputSetType: 'INPUT_SET'
        }
      ],
      pageIndex: 0,
      empty: false
    },
    correlationId: 'dbc7238c-380f-4fe0-b160-a29510cfe0c8'
  }
}
export const GetTriggerListForTargetResponse: UseGetReturnData<ResponsePageNGTriggerDetailsResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      totalPages: 1,
      totalItems: 3,
      pageItemCount: 3,
      pageSize: 25,
      content: [
        {
          name: 'AllValues123',
          identifier: 'AllValues',
          description: 'desc',
          type: 'Webhook',
          executions: [2, 3, 4, 5, 4, 3, 2],
          enabled: true,
          yaml:
            'trigger:\n  name: AllValues123\n  identifier: AllValues\n  description: desc\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: p1\n          stages:\n            - stage:\n                identifier: stage1\n                type: Deployment\n                spec:\n                  infrastructure:\n                    infrastructureDefinition:\n                      type: KubernetesDirect\n                      spec:\n                        namespace: newNameSpaces\n                        releaseName: "22"\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        repoUrl: repoUrlss1\n        event: Pull Request\n        actions:\n          - closed\n          - edited\n          - opened\n        payloadConditions:\n          - key: sourceBranch\n            operator: equals\n            value: "123"\n          - key: targetBranch\n            operator: regex\n            value: regex\n          - key: abcd\n            operator: in\n            value: abc\n          - key: defg\n            operator: not in\n            value: def\n'
        },
        {
          name: 'test1',
          identifier: 'test1',
          type: 'Webhook',
          lastTriggerExecutionDetails: {
            lastExecutionTime: 1607637774407,
            lastExecutionSuccessful: true
          },
          enabled: true,
          webhookUrl: 'http://localhost:12001/api/webhook/trigger?accountIdentifier=accountIdentifier',
          tags: {
            tag1: '',
            tag2: 'val2'
          },
          yaml:
            'trigger:\n  name: test1\n  identifier: test1\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: p1\n          stages:\n            - stage:\n                identifier: stage1\n                type: Deployment\n                spec:\n                  infrastructure:\n                    infrastructureDefinition:\n                      type: KubernetesDirect\n                      spec:\n                        namespace: namespace\n                        releaseName: releaseName\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        repoUrl: test\n        event: Pull Request\n        actions: []\n'
        },
        {
          name: 'trigger-2',
          identifier: 'trigger2',
          type: 'Webhook',
          enabled: false,
          webhookUrl: 'http://localhost:12001/api/webhook/trigger?accountIdentifier=accountIdentifier',
          yaml:
            'trigger:\n  name: trigger-2\n  identifier: trigger2\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline: {}\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        repoUrl: "12"\n        event: Pull Request\n        actions:\n          - closed\n          - edited\n          - labeled\n        payloadConditions:\n          - key: sourceBranch\n            operator: regex\n            value: abc\n          - key: targetBranch\n            operator: contains\n            value: abc\n'
        },
        {
          name: 'testcustomtrigger1',
          identifier: 'testcustomtrigger1',
          type: 'Webhook',
          webhookDetails: {
            webhookSecret: 'token',
            webhookSourceRepo: 'CUSTOM'
          },
          webhookUrl: 'http://localhost:12001/api/webhook/trigger?accountIdentifier=accountIdentifier',
          tags: {},
          executions: [0, 0, 0, 0, 0, 0, 0],
          yaml: '',
          enabled: false
        }
      ],
      pageIndex: 0,
      empty: false
    },
    metaData: (null as unknown) as undefined,
    correlationId: 'bd8be6bf-2fdb-4df1-8a09-ba3b56b6b3e0'
  }
}

export const GetDeleteTriggerResponse = {
  status: 'SUCCESS',
  data: true,
  metaData: null,
  correlationId: '60982855-534b-4997-9bd5-a30b1f5964df'
}
