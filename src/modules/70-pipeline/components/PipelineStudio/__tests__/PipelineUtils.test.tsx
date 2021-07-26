import React from 'react'
import { render } from '@testing-library/react'
import { Tree } from '@blueprintjs/core'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { getPipelineTree } from '../PipelineUtils'

describe('Test Pipeline Utils', () => {
  test('should test getPipelineTree', () => {
    const response = getPipelineTree(
      {
        name: 'testsdfsdf',
        identifier: 'testqqq',
        description: '',
        stages: [
          {
            parallel: [
              {
                stage: {
                  name: 'asd',
                  identifier: 'asd',
                  description: '',
                  type: 'Deployment',
                  spec: {
                    service: {
                      identifier: 'asd',
                      name: 'asd',
                      description: '',
                      serviceDefinition: {
                        type: 'Kubernetes',
                        spec: {
                          artifacts: {
                            sidecars: [],
                            primary: { type: 'Dockerhub', spec: { connectorRef: 'org.docker', imagePath: 'asd' } }
                          },
                          manifests: [],
                          artifactOverrideSets: [],
                          manifestOverrideSets: []
                        }
                      }
                    },
                    execution: {
                      steps: [
                        {
                          step: {
                            name: 'Rollout Deployment',
                            identifier: 'rolloutDeployment',
                            type: 'K8sRollingDeploy',
                            spec: { timeout: '10m', skipDryRun: false }
                          }
                        }
                      ],
                      rollbackSteps: [
                        {
                          step: {
                            name: 'Rollback Rollout Deployment',
                            identifier: 'rollbackRolloutDeployment',
                            type: 'K8sRollingRollback',
                            spec: { timeout: '10m' }
                          }
                        }
                      ]
                    },
                    infrastructure: {
                      environment: { name: 'qa', identifier: 'qa', description: '', type: 'PreProduction' },
                      infrastructureDefinition: {
                        type: 'KubernetesDirect',
                        spec: {
                          connectorRef: RUNTIME_INPUT_VALUE,
                          namespace: RUNTIME_INPUT_VALUE,
                          releaseName: RUNTIME_INPUT_VALUE
                        }
                      }
                    }
                  }
                }
              },
              {
                stage: {
                  name: 'test1',
                  identifier: 'test1',
                  description: '',
                  type: 'Deployment',
                  spec: { execution: {} }
                }
              }
            ]
          },
          {
            stage: { name: 'test2', identifier: 'test2', description: '', type: 'Deployment', spec: { execution: {} } }
          }
        ]
      } as any,
      {},
      str => str
    )
    const { container } = render(<Tree contents={response} />)
    expect(container).toMatchSnapshot()
  })
})
