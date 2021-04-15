import type { UseGetReturnData } from '@common/utils/testUtils'
import type {
  ResponseMapWebhookSourceRepoListWebhookEvent,
  ResponseListWebhookAction,
  ResponseNGTriggerResponse
} from 'services/pipeline-ng'

export const GetSourceRepoToEventResponse: UseGetReturnData<ResponseMapWebhookSourceRepoListWebhookEvent> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      GITLAB: ['Push', 'Merge Request'],
      GITHUB: ['Pull Request', 'Push', 'Delete'],
      BITBUCKET: ['Pull Request', 'Repository']
    },
    metaData: (null as unknown) as undefined,
    correlationId: '45939431-731c-4434-89b0-4414ac46d3f7'
  }
}

export const GenerateWebhookTokenResponse = {
  metaData: {},
  resource: 'token',
  responseMessages: []
}

export const GetActionsListResponse: UseGetReturnData<ResponseListWebhookAction> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: ['closed', 'edited', 'opened', 'reopened', 'labeled', 'unlabeled', 'synchronized'],
    metaData: (null as unknown) as undefined,
    correlationId: '4b575abb-9519-485e-ab11-9a805dda5cc1'
  }
}

export const GetActionsListPushEventResponse: UseGetReturnData<ResponseListWebhookAction> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: [],
    metaData: (null as unknown) as undefined,
    correlationId: (null as unknown) as undefined
  }
}

export const GetTriggerResponse: UseGetReturnData<ResponseNGTriggerResponse> = {
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
        'trigger:\n  name: AllValues123\n  identifier: AllValues\n  enabled: false\n  description: desc\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: p1\n          stages:\n            - stage:\n                identifier: stage1\n                type: Deployment\n                spec:\n                  infrastructure:\n                    infrastructureDefinition:\n                      type: KubernetesDirect\n                      spec:\n                        namespace: newNameSpaces\n                        releaseName: "22"\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        gitRepoSpec:\n          identifier: tesa1\n          repoName: triggerNgDemo\n        event: Pull Request\n        actions:\n          - closed\n          - edited\n          - opened\n        payloadConditions:\n          - key: sourceBranch\n            operator: equals\n            value: "123"\n          - key: targetBranch\n            operator: regex\n            value: regex\n          - key: abcd\n            operator: in\n            value: abc\n          - key: defg\n            operator: not in\n            value: def\n',
      version: 12
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
        'trigger:\n  name: test-repo-connector\n  identifier: testrepoconnector\n  enabled: true\n  tags: {}\n  target:\n    targetIdentifier: pipeline1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline: {}\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        gitRepoSpec:\n          identifier: org.repogithub\n          repoName: null\n        event: Pull Request\n        actions: []\n',
      version: 12
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
        'trigger:\n  name: AllValues123\n  identifier: AllValues\n  enabled: false\n  description: desc\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: p1\n          stages:\n            - stage:\n                identifier: stage1\n                type: Deployment\n                spec:\n                  infrastructure:\n                    infrastructureDefinition:\n                      type: KubernetesDirect\n                      spec:\n                        namespace: newNameSpaces\n                        releaseName: "22"\n  source:\n    type: Webhook\n    spec:\n      spec:\n        gitRepoSpec:\n          identifier: tesa1\n          repoName: triggerNgDemo\n        event: Pull Request\n        actions:\n          - closed\n          - edited\n          - opened\n        payloadConditions:\n          - key: sourceBranch\n            operator: equals\n            value: "123"\n          - key: targetBranch\n            operator: regex\n            value: regex\n          - key: abcd\n            operator: in\n            value: abc\n          - key: defg\n            operator: not in\n            value: def\n',
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
      name: 'github-connector',
      identifier: 'githubconnector',
      description: 'desc',
      type: 'Webhook',
      accountIdentifier: 'accountIdentifier',
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      targetIdentifier: 'p1',
      enabled: false,
      yaml:
        'trigger:\n  name: github-connector\n  identifier: githubconnector\n  enabled: false\n  tags: {}\n  target:\n    targetIdentifier: pipeline1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: pipeline1\n          stages:\n            - stage:\n                identifier: stage1\n                spec:\n                  serviceConfig:\n                    serviceRef: ""\n                  infrastructure:\n                    environmentRef: ""\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        gitRepoSpec:\n          identifier: mtrepogithub\n          repoName: ""\n        event: Pull Request\n        actions: []\n',
      version: 12
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

export const GetTriggerWithMergeRequestEventResponse: UseGetReturnData<ResponseNGTriggerResponse> = {
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
        'trigger:\n  name: github-connector\n  identifier: githubconnector\n  enabled: true\n  tags: {}\n  target:\n    targetIdentifier: pipeline1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: pipeline1\n          stages:\n            - stage:\n                identifier: stage1\n                spec:\n                  serviceConfig:\n                    serviceRef: ""\n                  infrastructure:\n                    environmentRef: ""\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        gitRepoSpec:\n          identifier: mtaccountgithubconnector\n          repoName: repoName\n        event: Merge Request\n        actions: []\n',
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
      'trigger:\n  name: AllValues123\n  identifier: AllValues\n  enabled: false\n  description: desc\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: p1\n          stages:\n            - stage:\n                identifier: stage1\n                type: Deployment\n                spec:\n                  infrastructure:\n                    infrastructureDefinition:\n                      type: KubernetesDirect\n                      spec:\n                        namespace: newNameSpaces\n                        releaseName: "22"\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        gitRepoSpec:\n          identifier: tesa1\n          repoName: triggerNgDemo\n        event: Pull Request\n        actions:\n          - closed\n          - edited\n          - opened\n        payloadConditions:\n          - key: sourceBranch\n            operator: equals\n            value: "123"\n          - key: targetBranch\n            operator: regex\n            value: regex\n          - key: abcd\n            operator: in\n            value: abc\n          - key: defg\n            operator: not in\n            value: def\n',
    version: 13
  },
  metaData: null,
  correlationId: 'abd712b8-920a-43da-a382-228e93012e6e'
}

export const CreateTriggerResponse = {}

export const updateTriggerMockResponseYaml =
  'trigger:\n  name: AllValues123\n  identifier: AllValues\n  enabled: false\n  description: desc\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: p1\n          stages:\n            - stage:\n                identifier: stage1\n                type: Deployment\n                spec:\n                  infrastructure:\n                    infrastructureDefinition:\n                      type: KubernetesDirect\n                      spec:\n                        namespace: newNameSpaces\n                        releaseName: "22"\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        gitRepoSpec:\n          identifier: tesa1\n          repoName: triggerNgDemo\n        event: Pull Request\n        actions:\n          - closed\n          - edited\n          - opened\n        payloadConditions:\n          - key: sourceBranch\n            operator: equals\n            value: "123"\n          - key: targetBranch\n            operator: regex\n            value: regex\n          - key: abcd\n            operator: in\n            value: abc\n          - key: defg\n            operator: not in\n            value: def\n'

export const enabledFalseUpdateTriggerMockResponseYaml =
  'trigger:\n  name: AllValues123\n  identifier: AllValues\n  enabled: true\n  description: desc\n  target:\n    targetIdentifier: p1\n    type: Pipeline\n    spec:\n      runtimeInputYaml: |\n        pipeline:\n          identifier: p1\n          stages:\n            - stage:\n                identifier: stage1\n                type: Deployment\n                spec:\n                  infrastructure:\n                    infrastructureDefinition:\n                      type: KubernetesDirect\n                      spec:\n                        namespace: newNameSpaces\n                        releaseName: "22"\n  source:\n    type: Webhook\n    spec:\n      type: GITHUB\n      spec:\n        gitRepoSpec:\n          identifier: tesa1\n          repoName: triggerNgDemo\n        event: Pull Request\n        actions:\n          - closed\n          - edited\n          - opened\n        payloadConditions:\n          - key: sourceBranch\n            operator: equals\n            value: "123"\n          - key: targetBranch\n            operator: regex\n            value: regex\n          - key: abcd\n            operator: in\n            value: abc\n          - key: defg\n            operator: not in\n            value: def\n'

export const GetSchemaYaml = {
  status: 'SUCCESS',
  data: {
    type: 'object',
    properties: {
      trigger: {
        $ref: '#/definitions/NGTriggerConfig'
      }
    },
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
      AuthToken: {
        type: 'object',
        properties: {
          type: {
            type: 'string'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        allOf: [
          {
            if: {
              properties: {
                type: {
                  const: 'inline'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/CustomWebhookInlineAuthToken'
                }
              }
            }
          }
        ]
      },
      AuthTokenSpec: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      AwsCodeCommitTriggerSpec: {
        allOf: [
          {
            $ref: '#/definitions/WebhookTriggerSpec'
          },
          {
            type: 'object',
            properties: {
              gitRepoSpec: {
                $ref: '#/definitions/GitRepoSpec'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      BitbucketTriggerSpec: {
        allOf: [
          {
            $ref: '#/definitions/WebhookTriggerSpec'
          },
          {
            type: 'object',
            properties: {
              gitRepoSpec: {
                $ref: '#/definitions/GitRepoSpec'
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
      CustomWebhookInlineAuthToken: {
        allOf: [
          {
            $ref: '#/definitions/AuthTokenSpec'
          },
          {
            type: 'object',
            properties: {
              value: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      CustomWebhookTriggerSpec: {
        allOf: [
          {
            $ref: '#/definitions/WebhookTriggerSpec'
          },
          {
            type: 'object',
            properties: {
              authToken: {
                $ref: '#/definitions/AuthToken'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GitRepoSpec: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string'
          },
          repoName: {
            type: 'string'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GithubTriggerSpec: {
        allOf: [
          {
            $ref: '#/definitions/WebhookTriggerSpec'
          },
          {
            type: 'object',
            properties: {
              gitRepoSpec: {
                $ref: '#/definitions/GitRepoSpec'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      GitlabTriggerSpec: {
        allOf: [
          {
            $ref: '#/definitions/WebhookTriggerSpec'
          },
          {
            type: 'object',
            properties: {
              gitRepoSpec: {
                $ref: '#/definitions/GitRepoSpec'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NGTriggerConfig: {
        type: 'object',
        required: ['identifier'],
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
          name: {
            type: 'string'
          },
          source: {
            $ref: '#/definitions/NGTriggerSource'
          },
          tags: {
            type: 'object',
            additionalProperties: {
              type: 'string'
            }
          },
          target: {
            $ref: '#/definitions/NGTriggerTarget'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NGTriggerSource: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['Webhook', 'NewArtifact', 'Scheduled']
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
                  $ref: '#/definitions/WebhookTriggerConfig'
                }
              }
            }
          }
        ]
      },
      NGTriggerSpec: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      NGTriggerTarget: {
        type: 'object',
        properties: {
          targetIdentifier: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: ['Pipeline']
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        allOf: [
          {
            if: {
              properties: {
                type: {
                  const: 'Pipeline'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/PipelineTargetSpec'
                }
              }
            }
          }
        ]
      },
      NgTriggerConfigSchemaWrapper: {
        type: 'object',
        properties: {
          trigger: {
            $ref: '#/definitions/NGTriggerConfig'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      PipelineTargetSpec: {
        allOf: [
          {
            $ref: '#/definitions/TargetSpec'
          },
          {
            type: 'object',
            properties: {
              runtimeInputYaml: {
                type: 'string'
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      RepoSpec: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string'
          },
          repoName: {
            type: 'string'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      ScheduledTriggerConfig: {
        allOf: [
          {
            $ref: '#/definitions/NGTriggerSpec'
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
      TargetSpec: {
        type: 'object',
        discriminator: 'type',
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      WebhookCondition: {
        type: 'object',
        properties: {
          key: {
            type: 'string'
          },
          operator: {
            type: 'string'
          },
          value: {
            type: 'string'
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      WebhookTriggerConfig: {
        allOf: [
          {
            $ref: '#/definitions/NGTriggerSpec'
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
                  const: 'AWS_CODECOMMIT'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/AwsCodeCommitTriggerSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'BITBUCKET'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/BitbucketTriggerSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'CUSTOM'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/CustomWebhookTriggerSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'GITHUB'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GithubTriggerSpec'
                }
              }
            }
          },
          {
            if: {
              properties: {
                type: {
                  const: 'GITLAB'
                }
              }
            },
            then: {
              properties: {
                spec: {
                  $ref: '#/definitions/GitlabTriggerSpec'
                }
              }
            }
          }
        ],
        $schema: 'http://json-schema.org/draft-07/schema#'
      },
      WebhookTriggerSpec: {
        type: 'object',
        discriminator: 'type',
        properties: {
          actions: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'created',
                'closed',
                'edited',
                'edited',
                'opened',
                'reopened',
                'labeled',
                'unlabeled',
                'deleted',
                'synchronized',
                'synced',
                'merged',
                'sync',
                'open',
                'close',
                'reopen',
                'merge',
                'update',
                'pull request created',
                'pull request updated',
                'pull request merged',
                'pull request declined',
                'created',
                'deleted'
              ]
            }
          },
          event: {
            type: 'string',
            enum: ['Pull Request', 'Push', 'Issue Comment', 'Delete', 'Merge Request', 'Repository', 'Branch', 'Tag']
          },
          headerConditions: {
            type: 'array',
            items: {
              $ref: '#/definitions/WebhookCondition'
            }
          },
          pathFilters: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          payloadConditions: {
            type: 'array',
            items: {
              $ref: '#/definitions/WebhookCondition'
            }
          },
          repoSpec: {
            $ref: '#/definitions/RepoSpec'
          },
          type: {
            type: 'string',
            enum: ['GITHUB', 'GITLAB', 'BITBUCKET', 'AWS_CODECOMMIT', 'CUSTOM']
          }
        },
        $schema: 'http://json-schema.org/draft-07/schema#'
      }
    }
  },
  metaData: null,
  correlationId: 'd317ef50-dda6-408b-94dc-c66da72e9bcf'
}
