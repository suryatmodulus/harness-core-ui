import type { UseGetReturnData } from '@common/utils/testUtils'
import type {
  ResponseInputSetTemplateResponse,
  ResponseMergeInputSetResponse,
  ResponsePageInputSetSummaryResponse,
  ResponsePageNGTriggerDetailsResponse
} from 'services/pipeline-ng'
import type { ResponseConnectorResponse, ResponsePageEnvironmentResponseDTO } from 'services/cd-ng'
import type { ResponsePMSPipelineResponseDTO, PMSPipelineResponseDTO } from 'services/pipeline-ng'

export const GetPipelineResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: ({
      yamlPipeline:
        'pipeline:\n    name: no-inputs-pipeline-1\n    identifier: noinputspipeline1\n    projectIdentifier: project1\n    orgIdentifier: default\n    tags: {}\n    stages: []\n    variables:\n        - name: newVar\n          type: String\n          value: <+input>\n        - name: otherVariable\n          type: String\n          value: ""\n',
      version: 15,
      gitDetails: {
        objectId: null,
        branch: null,
        repoIdentifier: null,
        rootFolder: null,
        filePath: null
      }
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
        'pipeline:\n  identifier: "noinputspipeline1"\n  variables:\n  - name: "newVar"\n    type: "String"\n    value: "<+input>"\n'
    },
    metaData: (null as unknown) as undefined,
    correlationId: '4e057505-dbd4-4de7-9a9d-43a0364e5825'
  }
}

export const GetTemplateStageVariablesFromPipelineResponse: UseGetReturnData<ResponseInputSetTemplateResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      inputSetTemplateYaml:
        'pipeline:\n  identifier: "pipeline1"\n  stages:\n  - stage:\n      identifier: "stage1"\n      type: "Deployment"\n      spec:\n        infrastructure:\n          environmentRef: "env"\n          infrastructureDefinition:\n            type: "KubernetesDirect"\n            spec:\n              namespace: "<+input>"\n'
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
        name: 'test',
        identifier: 'test',
        description: '',
        orgIdentifier: 'default',
        projectIdentifier: 'project1',
        tags: {},
        type: 'Github',
        spec: {
          url: 'github.com/account',
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
          delegateSelectors: [],
          type: 'Account'
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
        name: 'repo-connector',
        identifier: 'repoconnector',
        description: '',
        orgIdentifier: 'default',
        projectIdentifier: 'project1',
        tags: {},
        type: 'Github',
        spec: {
          url: 'https://github.com/account',
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
          delegateSelectors: [],
          type: 'Repo'
        }
      },
      createdAt: 1621454553668,
      lastModifiedAt: 1621454553245,
      status: {
        status: 'FAILURE',
        errorSummary: ' No Delegate Found ( No Delegate Eligible to perform the request)',
        errors: [
          {
            reason: ' No Delegate Found',
            message: ' No Delegate Eligible to perform the request',
            code: 463
          }
        ],
        testedAt: 1621454555821,
        lastTestedAt: 0,
        lastConnectedAt: 0
      },
      activityDetails: {
        lastActivityTime: 1621454554101
      },
      harnessManaged: false,
      gitDetails: {
        objectId: (null as unknown) as undefined,
        branch: (null as unknown) as undefined,
        repoIdentifier: (null as unknown) as undefined,
        rootFolder: (null as unknown) as undefined,
        filePath: (null as unknown) as undefined
      }
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
      totalItems: 1,
      pageItemCount: 1,
      pageSize: 100,
      content: [
        {
          identifier: 'test',
          name: 'test',
          pipelineIdentifier: 'pipeline1',
          inputSetType: 'INPUT_SET',
          tags: {},
          version: 0,
          gitDetails: {
            objectId: (null as unknown) as undefined,
            branch: (null as unknown) as undefined,
            repoIdentifier: (null as unknown) as undefined,
            rootFolder: (null as unknown) as undefined,
            filePath: (null as unknown) as undefined
          }
        }
      ],
      pageIndex: 0,
      empty: false
    },
    correlationId: 'dbc7238c-380f-4fe0-b160-a29510cfe0c8'
  }
}

export const GetEnvironmentListForProject: UseGetReturnData<ResponsePageEnvironmentResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      totalPages: 1,
      totalItems: 1,
      pageItemCount: 1,
      pageSize: 100,
      content: [
        {
          accountId: 'accountId',
          orgIdentifier: 'default',
          projectIdentifier: 'p1',
          identifier: 'prod',
          name: 'prod',
          description: (null as unknown) as undefined,
          color: '#0063F7',
          type: 'Production',
          deleted: false,
          tags: {},
          version: 2
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
            'trigger:\n  name: AllValues123\n  identifier: AllValues\n  description: desc\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: p1\n          stages:\n            - stage:\n                identifier: stage1\n                type: Deployment\n                spec:\n                  infrastructure:\n                    infrastructureDefinition:\n                      type: KubernetesDirect\n                      spec:\n                        namespace: newNameSpaces\n                        releaseName: "22"\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        repoUrl: repoUrlss1\n        event: Pull Request\n        actions:\n          - closed\n          - edited\n          - opened\n        payloadConditions:\n          - key: sourceBranch\n            operator: Equals\n            value: "123"\n          - key: targetBranch\n            operator: Regex\n            value: Regex\n          - key: abcd\n            operator: In\n            value: abc\n          - key: defg\n            operator: NotIn\n            value: def\n'
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
            'trigger:\n  name: trigger-2\n  identifier: trigger2\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline: {}\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        repoUrl: "12"\n        event: Pull Request\n        actions:\n          - closed\n          - edited\n          - labeled\n        payloadConditions:\n          - key: sourceBranch\n            operator: Regex\n            value: abc\n          - key: targetBranch\n            operator: Contains\n            value: abc\n'
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
