export const mockedTemplate = {
  name: 'Pipeline-demo',
  identifier: 'Pipelinedemo',
  projectIdentifier: 'Harshil',
  orgIdentifier: 'CV',
  tags: {},
  stages: [
    {
      stage: {
        name: 'Stage-demo',
        identifier: 'Stagedemo',
        description: '',
        type: 'Deployment',
        spec: {
          serviceConfig: {
            serviceRef: '<+input>',
            serviceDefinition: {
              type: 'Kubernetes',
              spec: {
                variables: []
              }
            }
          },
          infrastructure: {
            environmentRef: 'newenvharshil',
            infrastructureDefinition: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'Testkube',
                namespace: 'test',
                releaseName: 'release-<+INFRA_KEY>'
              }
            },
            allowSimultaneousDeployments: false
          },
          execution: {
            steps: [
              {
                step: {
                  type: 'Verify',
                  name: 'Verify-demo',
                  identifier: 'Verifydemo',
                  spec: {
                    type: 'Canary',
                    spec: {
                      sensitivity: 'HIGH',
                      duration: '5m',
                      deploymentTag: 'test'
                    }
                  },
                  timeout: '2h',
                  failureStrategies: [
                    {
                      onFailure: {
                        errors: ['Verification'],
                        action: {
                          type: 'ManualIntervention',
                          spec: {
                            timeout: '2h',
                            onTimeout: {
                              action: {
                                type: 'StageRollback'
                              }
                            }
                          }
                        }
                      }
                    },
                    {
                      onFailure: {
                        errors: ['Unknown'],
                        action: {
                          type: 'ManualIntervention',
                          spec: {
                            timeout: '2h',
                            onTimeout: {
                              action: {
                                type: 'Ignore'
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            ],
            rollbackSteps: []
          }
        },
        tags: {},
        failureStrategies: [
          {
            onFailure: {
              errors: ['AllErrors'],
              action: {
                type: 'StageRollback'
              }
            }
          }
        ]
      }
    }
  ]
}
