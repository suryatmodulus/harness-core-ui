import type { ResponseConnectorResponse } from 'services/cd-ng'
import type { ResponsePMSPipelineResponseDTO } from 'services/pipeline-ng'
import type { UseGetReturnData } from '@common/utils/testUtils'

export const mockConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'connectorRef',
        identifier: 'connectorRef',
        description: '',
        tags: {},
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

export const mockConnectorsListResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 100,
    content: [
      {
        connector: {
          name: 'dockerAleks',
          identifier: 'dockerAleks',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: [],
          type: 'DockerRegistry',
          spec: {
            dockerRegistryUrl: 'https://index.docker.io/v2/',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'aradisavljevic', passwordRef: 'account.dockerAlekspasswordRef' }
            }
          }
        },
        createdAt: 1604593248928,
        lastModifiedAt: 1604593253377,
        status: {
          status: 'SUCCESS',
          errorMessage: '',
          lastTestedAt: 1604593253375,
          lastConnectedAt: 1604593253375
        }
      },
      {
        connector: {
          name: 'harnessimage',
          identifier: 'harnessimage',
          description: 'harnessimage',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: [],
          type: 'DockerRegistry',
          spec: {
            dockerRegistryUrl: 'https://index.docker.io/v2/',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'harnessdev', passwordRef: 'account.harnessdevdockerpassword' }
            }
          }
        },
        createdAt: 1604415523887,
        lastModifiedAt: 1604415527763,
        status: {
          status: 'SUCCESS',
          errorMessage: '',
          lastTestedAt: 1604415527762,
          lastConnectedAt: 1604415527762
        }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'b4a0e6b7-30d7-4688-94ec-9130a3e1b229'
}

export const mockCreateConnectorResponse = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'artifact',
      identifier: 'artifact',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'dummy',
      tags: [],
      type: 'DockerRegistry',
      spec: {
        dockerRegistryUrl: 'https;//hub.docker.com',
        auth: {
          type: 'UsernamePassword',
          spec: { username: 'testpass', passwordRef: 'account.testpass' }
        }
      }
    },
    createdAt: 1607289652713,
    lastModifiedAt: 1607289652713,
    status: null
  },
  metaData: null,
  correlationId: '0d20f7b7-6f3f-41c2-bd10-4c896bfd76fd'
}

export const mockUpdateConnectorResponse = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'artifact',
      identifier: 'artifact',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'dummy',
      tags: [],
      type: 'DockerRegistry',
      spec: {
        dockerRegistryUrl: 'https;//hub.docker.com',
        auth: {
          type: 'UsernamePassword',
          spec: { username: 'testpass', passwordRef: 'account.testpass' }
        }
      }
    },
    createdAt: 1607289652713,
    lastModifiedAt: 1607289652713,
    status: null
  },
  metaData: null,
  correlationId: '0d20f7b7-6f3f-41c2-bd10-4c896bfd76fd'
}

export const mockSecretData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 28,
    pageItemCount: 28,
    pageSize: 100,
    content: [
      {
        secret: {
          type: 'SecretText',
          name: 'testpass',
          identifier: 'testpass',
          tags: {},
          description: '',
          spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
        },
        createdAt: 1606900988388,
        updatedAt: 1606900988388,
        draft: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '7f453609-2037-4539-8571-cd3f270e00e9'
}

export const mockPipelineResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      ngPipeline: {
        pipeline: {
          name: 'testsdfsdf',
          identifier: 'testqqq',
          description: '',
          tags: null,
          variables: null,
          metadata: null
        }
      },
      executionsPlaceHolder: [],
      yamlPipeline:
        'pipeline:\n  name: testsdfsdf\n  identifier: testqqq\n  description: ""\n  stages:\n    - stage:\n        name: asd\n        identifier: asd\n        description: ""\n        type: Deployment\n        spec:\n          service:\n            identifier: asd\n            name: asd\n            description: ""\n            serviceDefinition:\n              type: Kubernetes\n              spec:\n                artifacts:\n                  sidecars: []\n                  primary:\n                    type: Dockerhub\n                    spec:\n                      connectorRef: org.docker\n                      imagePath: asd\n                manifests: []\n                artifactOverrideSets: []\n                manifestOverrideSets: []\n          execution:\n            steps:\n              - step:\n                  name: Rollout Deployment\n                  identifier: rolloutDeployment\n                  type: K8sRollingDeploy\n                  spec:\n                    timeout: 10m\n                    skipDryRun: false\n            rollbackSteps:\n              - step:\n                  name: Rollback Rollout Deployment\n                  identifier: rollbackRolloutDeployment\n                  type: K8sRollingRollback\n                  spec:\n                    timeout: 10m\n          infrastructure:\n            environment:\n              name: qa\n              identifier: qa\n              description: ""\n              type: PreProduction\n            infrastructureDefinition:\n              type: KubernetesDirect\n              spec:\n                connectorRef: <+input>\n                namespace: <+input>\n                releaseName: <+input>\n'
    } as any,
    correlationId: '7a84d477-4549-4026-8113-a02730b4f7c5'
  }
}

export const mockAwsRegionsResponse = {
  data: {
    regionData: {
      resource: []
    }
  }
}

export const mockDockerTagsCallResponse = {
  data: { data: { buildDetailsList: [] } },
  refetch: jest.fn(),
  error: null,
  cancel: jest.fn()
}
