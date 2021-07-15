import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { NgPipeline } from 'services/cd-ng'
import type { WebhookTriggerConfigPanelPropsInterface } from '../views/WebhookTriggerConfigPanel'

export const originalPipeline = {
  name: 'pipeline-1',
  identifier: 'pipeline1',
  description: 'test',
  tags: undefined,
  stages: [
    {
      stage: {
        name: 's1',
        identifier: 's1',
        description: '',
        type: 'Deployment',
        spec: {
          service: {
            identifier: 'service1',
            name: 'service-1',
            description: '',
            serviceDefinition: {
              type: 'Kubernetes',
              spec: {
                artifacts: {
                  sidecars: []
                },
                manifests: [],
                artifactOverrideSets: [],
                manifestOverrideSets: []
              }
            },
            tags: null
          },
          infrastructure: {
            environment: {
              name: 'env1',
              identifier: 'env1',
              description: null,
              type: 'PreProduction'
            },
            infrastructureDefinition: {}
          },
          execution: {
            steps: [
              {
                step: {
                  name: 'Rollout Deployment',
                  identifier: 'rolloutDeployment',
                  type: 'K8sRollingDeploy',
                  spec: {
                    timeout: '10m',
                    skipDryRun: false
                  }
                }
              }
            ],
            rollbackSteps: [
              {
                step: {
                  name: 'Rollback Rollout Deployment',
                  identifier: 'rollbackRolloutDeployment',
                  type: 'K8sRollingRollback',
                  spec: {
                    timeout: '10m'
                  }
                }
              }
            ]
          }
        }
      }
    }
  ]
}

export const getTriggerConfigInitialValues = ({
  sourceRepo,
  secureToken
}: {
  sourceRepo?: string
  secureToken?: string
}): {
  identifier: string
  sourceRepo: string
  triggerType: string
  originalPipeline: NgPipeline
  secureToken?: string
} => ({
  identifier: '',
  sourceRepo: sourceRepo || 'Github',
  triggerType: 'Webhook',
  originalPipeline,
  secureToken
})

export const pipelineInputInitialValues = {
  identifier: '',
  originalPipeline: {
    identifier: 'p1',
    stages: [
      {
        stage: {
          identifier: 'stage1',
          type: 'Deployment',
          spec: {
            infrastructure: {
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: {
                  namespace: RUNTIME_INPUT_VALUE,
                  releaseName: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }
      }
    ],
    variables: [{ name: 'newVar', type: 'String', value: '<+input>', default: 'defaultValue' }]
  },
  pipeline: {
    identifier: 'p1',
    stages: [
      {
        stage: {
          identifier: 'stage1',
          type: 'Deployment',
          spec: {
            infrastructure: {
              infrastructureDefinition: {
                type: 'KubernetesDirect',
                spec: {
                  namespace: RUNTIME_INPUT_VALUE,
                  releaseName: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }
      }
    ],
    variables: [{ name: 'newVar', type: 'String', value: '' }]
  },
  sourceRepo: 'GITHUB',
  triggerType: 'Webhook'
}
export const getTriggerConfigDefaultProps = ({
  isEdit = false
}: {
  isEdit?: boolean
}): WebhookTriggerConfigPanelPropsInterface => ({
  isEdit
})
