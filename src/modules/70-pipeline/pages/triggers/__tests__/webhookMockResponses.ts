import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseMapStringMapStringListString, ResponseNGTriggerResponse } from 'services/pipeline-ng'

export const GetGitTriggerEventDetailsResponse: UseGetReturnData<ResponseMapStringMapStringListString> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      Github: {
        IssueComment: ['Create', 'Edit', 'Delete'],
        PullRequest: ['Close', 'Edit', 'Open', 'Reopen', 'Label', 'Unlabel', 'Synchronize'],
        Push: []
      },
      Bitbucket: {
        PullRequest: ['Create', 'Update', 'Merge', 'Decline'],
        Push: []
      },
      Gitlab: {
        MergeRequest: ['Open', 'Close', 'Reopen', 'Merge', 'Update', 'Sync'],
        Push: []
      },
      AwsCodeCommit: {
        Push: []
      }
    },
    metaData: (null as unknown) as undefined,
    correlationId: '45939431-731c-4434-89b0-4414ac46d3f7'
  }
}

export const GetTriggerResponse: UseGetReturnData<ResponseNGTriggerResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'All Values',
      identifier: 'All_Values',
      description: 'desc',
      type: 'Webhook',
      accountIdentifier: 'accountId',
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      targetIdentifier: 'noinputspipeline1',
      yaml:
        'trigger:\n    name: All Values\n    identifier: All_Values\n    enabled: true\n    description: desc\n    tags:\n        tag1: value1\n    orgIdentifier: default\n    projectIdentifier: project1\n    pipelineIdentifier: noinputspipeline1\n    source:\n        type: Webhook\n        spec:\n            type: Github\n            spec:\n                type: IssueComment\n                spec:\n                    connectorRef: test\n                    autoAbortPreviousExecutions: true\n                    payloadConditions:\n                        - key: changedFiles\n                          operator: NotEquals\n                          value: x\n                        - key: sourceBranch\n                          operator: Equals\n                          value: sourceBranch\n                        - key: targetBranch\n                          operator: In\n                          value: val1, val2\n                        - key: <+trigger.payload.path>\n                          operator: StartsWith\n                          value: "1"\n                    headerConditions:\n                        - key: <+trigger.header["key-name"]>\n                          operator: EndsWith\n                          value: release\n                    jexlCondition: jexlCondition\n                    repoName: reponame\n                    actions:\n                        - Create\n                        - Edit\n                        - Delete\n    inputYaml: ""\n',
      version: 1,
      enabled: true
    },
    metaData: (null as unknown) as undefined,
    correlationId: '25df5700-e9a4-49c4-98eb-dea4c371fd6e'
  }
}
export const GetTriggerRepoOrgConnectorResponse: UseGetReturnData<ResponseNGTriggerResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'test-github-repo',
      identifier: 'testgithub',
      description: '',
      type: 'Webhook',
      accountIdentifier: 'accountId',
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      targetIdentifier: 'pipeline1',
      yaml:
        'trigger:\n    name: test-github-repo\n    identifier: testgithub\n    enabled: true\n    description: ""\n    tags: {}\n    orgIdentifier: default\n    projectIdentifier: project1\n    pipelineIdentifier: pipeline1\n    source:\n        type: Webhook\n        spec:\n            type: Github\n            spec:\n                type: PullRequest\n                spec:\n                    connectorRef: repoconnector\n                    autoAbortPreviousExecutions: true\n                    payloadConditions:\n                        - key: sourceBranch\n                          operator: Equals\n                          value: sourceBranchValue\n                        - key: targetBranch\n                          operator: Equals\n                          value: targetBranchValue\n                    headerConditions:\n                        - key: <+trigger.header["key-name"]>\n                          operator: Equals\n                          value: "123"\n                    jexlCondition: jexlCondition\n                    actions:\n                        - Close\n                        - Edit\n                        - Reopen\n    inputYaml: |\n        pipeline:\n            identifier: pipeline1\n            stages:\n                - stage:\n                      identifier: stage1\n                      type: Deployment\n                      spec:\n                          infrastructure:\n                              environmentRef: ""\n                              infrastructureDefinition:\n                                  type: KubernetesDirect\n                                  spec:\n                                      namespace: ""\n',
      version: 1,
      enabled: true
    },
    metaData: (null as unknown) as undefined,
    correlationId: '25df5700-e9a4-49c4-98eb-dea4c371fd6e'
  }
}

// missing sourceRepo
export const GetTriggerInvalidYamlResponse: UseGetReturnData<ResponseNGTriggerResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'AllValues123',
      identifier: 'AllValues',
      description: 'desc',
      type: 'Webhook',
      accountIdentifier: 'accountIdentifier',
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      targetIdentifier: 'p1',
      enabled: false,
      yaml:
        'trigger:\n  name: AllValues123\n  identifier: AllValues\n  enabled: false\n  description: desc\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: p1\n          stages:\n            - stage:\n                identifier: stage1\n                type: Deployment\n                spec:\n                  infrastructure:\n                    infrastructureDefinition:\n                      type: KubernetesDirect\n                      spec:\n                        namespace: newNameSpaces\n                        releaseName: "22"\n  source:\n    type: Webhook\n    spec:\n      spec:\n        gitRepoSpec:\n          identifier: tesa1\n          repoName: triggerNgDemo\n        event: PullRequest\n        actions:\n          - closed\n          - edited\n          - opened\n        payloadConditions:\n          - key: sourceBranch\n            operator: Equals\n            value: "123"\n          - key: targetBranch\n            operator: Regex\n            value: Regex\n          - key: abcd\n            operator: In\n            value: abc\n          - key: defg\n            operator: NotIn\n            value: def\n',
      version: 12
    },
    metaData: (null as unknown) as undefined,
    correlationId: '25df5700-e9a4-49c4-98eb-dea4c371fd6e'
  }
}

export const GetTriggerEmptyActionsResponse: UseGetReturnData<ResponseNGTriggerResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'All Values',
      identifier: 'All_Values',
      description: 'desc',
      type: 'Webhook',
      accountIdentifier: 'accountId',
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      targetIdentifier: 'noinputspipeline1',
      yaml:
        'trigger:\n    name: All Values\n    identifier: All_Values\n    enabled: false\n    description: desc\n    tags:\n        tag1: value1\n    orgIdentifier: default\n    projectIdentifier: project1\n    pipelineIdentifier: noinputspipeline1\n    source:\n        type: Webhook\n        spec:\n            type: Github\n            spec:\n                type: IssueComment\n                spec:\n                    connectorRef: test\n                    autoAbortPreviousExecutions: true\n                    payloadConditions:\n                        - key: changedFiles\n                          operator: NotEquals\n                          value: x\n                        - key: sourceBranch\n                          operator: Equals\n                          value: sourceBranch\n                        - key: targetBranch\n                          operator: In\n                          value: val1, val2\n                        - key: <+trigger.payload.path>\n                          operator: StartsWith\n                          value: "1"\n                    headerConditions:\n                        - key: <+trigger.header["key-name"]>\n                          operator: EndsWith\n                          value: release\n                    jexlCondition: jexlCondition\n                    repoName: reponame\n                    actions: []\n    inputYaml: |\n        pipeline: {}\n',
      version: 6,
      enabled: false
    },
    metaData: (null as unknown) as undefined,
    correlationId: '25df5700-e9a4-49c4-98eb-dea4c371fd6e'
  }
}

export const GetTriggerWithPushEventResponse: UseGetReturnData<ResponseNGTriggerResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'github-connector',
      identifier: 'githubconnector',
      type: 'Webhook',
      accountIdentifier: 'accountId',
      orgIdentifier: 'default',
      projectIdentifier: 'mtproject',
      targetIdentifier: 'pipeline1',
      yaml:
        'trigger:\n  name: github-connector\n  identifier: githubconnector\n  enabled: true\n  tags: {}\n  target:\n    targetIdentifier: pipeline1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: pipeline1\n          stages:\n            - stage:\n                identifier: stage1\n                spec:\n                  serviceConfig:\n                    serviceRef: ""\n                  infrastructure:\n                    environmentRef: ""\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        gitRepoSpec:\n          identifier: mtaccountgithubconnector\n          repoName: repoName\n        event: Push\n        actions: []\n',
      version: 0,
      enabled: true
    },
    metaData: (null as unknown) as undefined,
    correlationId: '25df5700-e9a4-49c4-98eb-dea4c371fd6e'
  }
}

export const updateTriggerMockResponse = {
  status: 'SUCCESS',
  data: {
    name: 'AllValues123',
    identifier: 'AllValues',
    description: 'desc',
    type: 'Webhook',
    accountIdentifier: 'accountIdentifier',
    orgIdentifier: 'default',
    projectIdentifier: 'project1',
    targetIdentifier: 'p1',
    yaml:
      'trigger:\n  name: AllValues123\n  identifier: AllValues\n  enabled: false\n  description: desc\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: p1\n          stages:\n            - stage:\n                identifier: stage1\n                type: Deployment\n                spec:\n                  infrastructure:\n                    infrastructureDefinition:\n                      type: KubernetesDirect\n                      spec:\n                        namespace: newNameSpaces\n                        releaseName: "22"\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        gitRepoSpec:\n          identifier: tesa1\n          repoName: triggerNgDemo\n        event: PullRequest\n        actions:\n          - closed\n          - edited\n          - opened\n        payloadConditions:\n          - key: sourceBranch\n            operator: Equals\n            value: "123"\n          - key: targetBranch\n            operator: Regex\n            value: Regex\n          - key: abcd\n            operator: In\n            value: abc\n          - key: defg\n            operator: NotIn\n            value: def\n',
    version: 13
  },
  metaData: null,
  correlationId: 'abd712b8-920a-43da-a382-228e93012e6e'
}

export const CreateTriggerResponse = {}

// double space instead of 4 and removed 3 org, project, pipeline identifiers
export const updateTriggerMockResponseYaml =
  'trigger:\n  name: All Values\n  identifier: All_Values\n  enabled: true\n  description: desc\n  tags:\n    tag1: value1\n  source:\n    type: Webhook\n    spec:\n      type: Github\n      spec:\n        type: IssueComment\n        spec:\n          connectorRef: test\n          autoAbortPreviousExecutions: true\n          payloadConditions:\n            - key: changedFiles\n              operator: NotEquals\n              value: x\n            - key: sourceBranch\n              operator: Equals\n              value: sourceBranch\n            - key: targetBranch\n              operator: In\n              value: val1, val2\n            - key: <+trigger.payload.path>\n              operator: StartsWith\n              value: "1"\n          headerConditions:\n            - key: <+trigger.header["key-name"]>\n              operator: EndsWith\n              value: release\n          jexlCondition: jexlCondition\n          repoName: reponame\n          actions:\n            - Create\n            - Edit\n            - Delete\n  inputYaml: |\n    pipeline:\n      identifier: noinputspipeline1\n      variables:\n        - name: newVar\n          type: String\n          value: ""\n        - name: otherVariable\n          type: String\n          value: ""\n'
export const enabledFalseUpdateTriggerMockResponseYaml =
  'trigger:\n  name: All Values\n  identifier: All_Values\n  enabled: false\n  description: desc\n  tags:\n    tag1: value1\n  source:\n    type: Webhook\n    spec:\n      type: Github\n      spec:\n        type: IssueComment\n        spec:\n          connectorRef: test\n          autoAbortPreviousExecutions: true\n          payloadConditions:\n            - key: changedFiles\n              operator: NotEquals\n              value: x\n            - key: sourceBranch\n              operator: Equals\n              value: sourceBranch\n            - key: targetBranch\n              operator: In\n              value: val1, val2\n            - key: <+trigger.payload.path>\n              operator: StartsWith\n              value: "1"\n          headerConditions:\n            - key: <+trigger.header["key-name"]>\n              operator: EndsWith\n              value: release\n          jexlCondition: jexlCondition\n          repoName: reponame\n          actions:\n            - Create\n            - Edit\n            - Delete\n  inputYaml: |\n    pipeline:\n      identifier: noinputspipeline1\n      variables:\n        - name: newVar\n          type: String\n          value: ""\n        - name: otherVariable\n          type: String\n          value: ""\n'

export const GetSchemaYaml = {
  status: 'SUCCESS',
  data: {
    type: 'object',
    properties: {
      trigger: {
        $ref: '#/definitions/NGTriggerConfigV2'
      }
    },
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
      AwsCodeCommitEventSpec: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      AwsCodeCommitPushSpec: {
        allOf: [
          {
            $ref: '#/definitions/AwsCodeCommitEventSpec'
          },
          {
            type: 'object',
            properties: {
              connectorRef: {
                type: 'string'
              },
              jexlCondition: {
                type: 'string'
              },
              payloadConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              repoName: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      AwsCodeCommitSpec: {
        allOf: [
          {
            $ref: '#/definitions/WebhookTriggerSpecV2'
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['Push']
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Push'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/AwsCodeCommitPushSpec'
                }
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      BitbucketEventSpec: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      BitbucketPRSpec: {
        allOf: [
          {
            $ref: '#/definitions/BitbucketEventSpec'
          },
          {
            type: 'object',
            properties: {
              actions: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['Create', 'Update', 'Merge', 'Decline']
                }
              },
              autoAbortPreviousExecutions: {
                type: 'boolean'
              },
              connectorRef: {
                type: 'string'
              },
              headerConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              jexlCondition: {
                type: 'string'
              },
              payloadConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              repoName: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      BitbucketPushSpec: {
        allOf: [
          {
            $ref: '#/definitions/BitbucketEventSpec'
          },
          {
            type: 'object',
            properties: {
              autoAbortPreviousExecutions: {
                type: 'boolean'
              },
              connectorRef: {
                type: 'string'
              },
              headerConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              jexlCondition: {
                type: 'string'
              },
              payloadConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              repoName: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      BitbucketSpec: {
        allOf: [
          {
            $ref: '#/definitions/WebhookTriggerSpecV2'
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['PullRequest', 'Push']
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'PullRequest'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/BitbucketPRSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Push'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/BitbucketPushSpec'
                }
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      CronTriggerSpec: {
        allOf: [
          {
            $ref: '#/definitions/ScheduledTriggerSpec'
          },
          {
            type: 'object',
            properties: {
              expression: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      CustomTriggerSpec: {
        allOf: [
          {
            $ref: '#/definitions/WebhookTriggerSpecV2'
          },
          {
            type: 'object',
            properties: {
              headerConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              jexlCondition: {
                type: 'string'
              },
              payloadConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GithubEventSpec: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GithubIssueCommentSpec: {
        allOf: [
          {
            $ref: '#/definitions/GithubEventSpec'
          },
          {
            type: 'object',
            properties: {
              actions: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['Create', 'Edit', 'Delete']
                }
              },
              autoAbortPreviousExecutions: {
                type: 'boolean'
              },
              connectorRef: {
                type: 'string'
              },
              headerConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              jexlCondition: {
                type: 'string'
              },
              payloadConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              repoName: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GithubPRSpec: {
        allOf: [
          {
            $ref: '#/definitions/GithubEventSpec'
          },
          {
            type: 'object',
            properties: {
              actions: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['Close', 'Edit', 'Open', 'Reopen', 'Label', 'Unlabel', 'Synchronize']
                }
              },
              autoAbortPreviousExecutions: {
                type: 'boolean'
              },
              connectorRef: {
                type: 'string'
              },
              headerConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              jexlCondition: {
                type: 'string'
              },
              payloadConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              repoName: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GithubPushSpec: {
        allOf: [
          {
            $ref: '#/definitions/GithubEventSpec'
          },
          {
            type: 'object',
            properties: {
              autoAbortPreviousExecutions: {
                type: 'boolean'
              },
              connectorRef: {
                type: 'string'
              },
              headerConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              jexlCondition: {
                type: 'string'
              },
              payloadConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              repoName: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GithubSpec: {
        allOf: [
          {
            $ref: '#/definitions/WebhookTriggerSpecV2'
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['PullRequest', 'Push', 'IssueComment']
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'IssueComment'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GithubIssueCommentSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'PullRequest'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GithubPRSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Push'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GithubPushSpec'
                }
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GitlabEventSpec: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GitlabPRSpec: {
        allOf: [
          {
            $ref: '#/definitions/GitlabEventSpec'
          },
          {
            type: 'object',
            properties: {
              actions: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['Open', 'Close', 'Reopen', 'Merge', 'Update', 'Sync']
                }
              },
              autoAbortPreviousExecutions: {
                type: 'boolean'
              },
              connectorRef: {
                type: 'string'
              },
              headerConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              jexlCondition: {
                type: 'string'
              },
              payloadConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              repoName: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GitlabPushSpec: {
        allOf: [
          {
            $ref: '#/definitions/GitlabEventSpec'
          },
          {
            type: 'object',
            properties: {
              autoAbortPreviousExecutions: {
                type: 'boolean'
              },
              connectorRef: {
                type: 'string'
              },
              headerConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              jexlCondition: {
                type: 'string'
              },
              payloadConditions: {
                type: 'array',
                items: {
                  $ref: '#/definitions/TriggerEventDataCondition'
                }
              },
              repoName: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GitlabSpec: {
        allOf: [
          {
            $ref: '#/definitions/WebhookTriggerSpecV2'
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['MergeRequest', 'Push']
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'MergeRequest'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GitlabPRSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Push'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GitlabPushSpec'
                }
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NGTriggerConfigV2: {
        type: 'object',
        required: ['identifier', 'orgIdentifier', 'projectIdentifier'],
        properties: {
          description: {
            type: 'string'
          },
          enabled: {
            type: 'boolean'
          },
          identifier: {
            type: 'string'
          },
          inputYaml: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          orgIdentifier: {
            type: 'string',
            const: 'default'
          },
          pipelineIdentifier: {
            type: 'string'
          },
          projectIdentifier: {
            type: 'string',
            const: 'project1'
          },
          source: {
            $ref: '#/definitions/NGTriggerSourceV2'
          },
          tags: {
            type: 'object',
            additionalProperties: {
              type: 'string'
            }
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NGTriggerSourceV2: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['Webhook', 'Scheduled']
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        allOf: [
          {
            if: {
              properties: {
                type: {
                  const: 'Scheduled'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/ScheduledTriggerConfig'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Webhook'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/WebhookTriggerConfigV2'
                }
              }
            }
          }
        ]
      },
      NGTriggerSpecV2: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NgTriggerConfigSchemaWrapper: {
        type: 'object',
        properties: {
          trigger: {
            $ref: '#/definitions/NGTriggerConfigV2'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ScheduledTriggerConfig: {
        allOf: [
          {
            $ref: '#/definitions/NGTriggerSpecV2'
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string'
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Cron'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/CronTriggerSpec'
                }
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ScheduledTriggerSpec: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      TriggerEventDataCondition: {
        type: 'object',
        properties: {
          key: {
            type: 'string'
          },
          operator: {
            type: 'string',
            enum: ['In', 'Equals', 'NotEquals', 'NotIn', 'Regex', 'EndsWith', 'StartsWith', 'Contains']
          },
          value: {
            type: 'string'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      WebhookTriggerConfigV2: {
        allOf: [
          {
            $ref: '#/definitions/NGTriggerSpecV2'
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['Github', 'Gitlab', 'Bitbucket', 'Custom', 'AwsCodeCommit']
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'AwsCodeCommit'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/AwsCodeCommitSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Bitbucket'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/BitbucketSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Custom'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/CustomTriggerSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Github'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GithubSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'Gitlab'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GitlabSpec'
                }
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      WebhookTriggerSpecV2: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      }
    }
  },
  metaData: null,
  correlationId: 'd317ef50-dda6-408b-94dc-c66da72e9bcf'
}
