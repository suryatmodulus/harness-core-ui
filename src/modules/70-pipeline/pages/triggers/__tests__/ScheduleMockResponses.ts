export const GetTriggerScheduleResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'test-schedule',
      identifier: 'testschedule',
      description: 'desc',
      type: 'Scheduled',
      accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw',
      orgIdentifier: 'harness',
      projectIdentifier: 'mtran_test',
      targetIdentifier: 'pipeline1',
      yaml:
        'trigger:\n    name: test-schedule\n    identifier: testschedule\n    enabled: true\n    description: desc\n    tags:\n        tag1: ""\n    target:\n        targetIdentifier: pipeline1\n        type: Pipeline\n        spec:\n            runtimeInputYaml: |\n                pipeline:\n                    identifier: pipeline1\n                    stages:\n                        - stage:\n                              identifier: s1\n                              type: Deployment\n                              spec:\n                                  serviceConfig:\n                                      serviceDefinition:\n                                          type: Kubernetes\n                                          spec:\n                                              artifacts:\n                                                  primary:\n                                                      type: Ecr\n                                                      spec:\n                                                          tag: ""\n                                      serviceRef: ""\n                                  infrastructure:\n                                      environmentRef: ""\n    source:\n        type: Scheduled\n        spec:\n            type: Cron\n            spec:\n                expression: 0/5 * * * *\n',
      version: 0,
      enabled: true
    },
    metaData: null,
    correlationId: '09316b20-103c-424d-9412-61ca785a754a'
  }
}

export const updateTriggerScheduleResponseYaml =
  'trigger:\n    name: test-schedule\n    identifier: testschedule\n    enabled: true\n    description: desc\n    tags:\n        tag1: ""\n    target:\n        targetIdentifier: pipeline1\n        type: Pipeline\n        spec:\n            runtimeInputYaml: |\n                pipeline:\n                    identifier: pipeline1\n                    stages:\n                        - stage:\n                              identifier: s1\n                              type: Deployment\n                              spec:\n                                  serviceConfig:\n                                      serviceDefinition:\n                                          type: Kubernetes\n                                          spec:\n                                              artifacts:\n                                                  primary:\n                                                      type: Ecr\n                                                      spec:\n                                                          tag: ""\n                                      serviceRef: ""\n                                  infrastructure:\n                                      environmentRef: ""\n    source:\n        type: Scheduled\n        spec:\n            type: Cron\n            spec:\n                expression: 4 3 * * MON\n'
