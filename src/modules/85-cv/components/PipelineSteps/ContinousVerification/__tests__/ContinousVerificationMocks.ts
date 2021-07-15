import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { UseGetReturnData } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ResponsePMSPipelineResponseDTO } from 'services/pipeline-ng'

export const PipelineResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      yamlPipeline:
        'pipeline:\n    name: Test\n    identifier: Test\n    projectIdentifier: Harshiltest\n    orgIdentifier: default\n    tags: {}\n    stages:\n        - stage:\n              name: Test\n              identifier: Test\n              description: ""\n              type: Deployment\n              spec:\n                  serviceConfig:\n                      serviceDefinition:\n                          type: Kubernetes\n                          spec:\n                              manifestOverrideSets: []\n                              manifests: []\n                              artifacts:\n                                  sidecars: []\n                              variables: []\n                      serviceRef: <+input>\n                  infrastructure:\n                      environmentRef: <+input>\n                      infrastructureDefinition:\n                          type: KubernetesDirect\n                          spec:\n                              connectorRef: testkubenew\n                              namespace: test\n                              releaseName: test\n                      allowSimultaneousDeployments: false\n                  execution:\n                      steps:\n                          - step:\n                                type: Verify\n                                name: Test\n                                identifier: Test\n                                spec:\n                                    monitoredServiceRef: <+input>\n                                    type: Rolling\n                                    healthSources:\n                                        - identifier: appd\n                                    spec:\n                                        sensitivity: High\n                                        duration: 5m\n                                        deploymentTag: <+serviceConfig.artifacts.primary.tag>\n                                timeout: 2h\n                                failureStrategies:\n                                    - onFailure:\n                                          errors:\n                                              - Verification\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: StageRollback\n                                    - onFailure:\n                                          errors:\n                                              - Unknown\n                                          action:\n                                              type: ManualIntervention\n                                              spec:\n                                                  timeout: 2h\n                                                  onTimeout:\n                                                      action:\n                                                          type: Ignore\n                      rollbackSteps: []\n              tags: {}\n              failureStrategies:\n                  - onFailure:\n                        errors:\n                            - AllErrors\n                        action:\n                            type: StageRollback\n',
      version: 20,
      gitDetails: {
        objectId: '',
        branch: '',
        repoIdentifier: '',
        rootFolder: '',
        filePath: ''
      }
    },
    correlationId: '49b3d700-6d42-4d7c-9a92-d72a416389b6'
  }
}

export const mockedMonitoredServiceAndHealthSources = {
  data: {
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'Harshiltest',
      identifier: 'testtest',
      name: 'testtest',
      type: 'Application',
      description: null,
      serviceRef: 'test',
      environmentRef: 'test',
      sources: {
        healthSources: [
          {
            name: 'appd-healthsource',
            identifier: 'appd',
            type: 'AppDynamics',
            spec: {
              connectorRef: 'Testappd',
              feature: null,
              appdApplicationName: 'prod',
              appdTierName: 'cv-nextgen',
              metricPacks: [{ identifier: 'Errors' }]
            }
          }
        ]
      }
    }
  }
}

export const mockedMonitoredService = {
  data: {
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'Harshiltest',
      identifier: 'testtest',
      name: 'testtest',
      type: 'Application',
      description: null,
      serviceRef: 'test',
      environmentRef: 'test',
      sources: {
        healthSources: []
      }
    }
  }
}

export const verifyStepInitialValues = {
  name: '',
  type: StepType.Verify,
  identifier: '',
  timeout: '2h',
  spec: {
    monitoredServiceRef: '',
    type: '',
    healthSources: [],
    spec: {
      sensitivity: '',
      duration: '',
      baseline: '',
      trafficsplit: '',
      deploymentTag: ''
    }
  }
}

export const verifyStepInitialValuesWithRunTimeFields = {
  name: 'CV Step',
  type: 'ContinousVerification',
  identifier: 'ContinousVerification',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    monitoredServiceRef: RUNTIME_INPUT_VALUE,
    type: 'Rolling',
    healthSources: [],
    spec: {
      sensitivity: RUNTIME_INPUT_VALUE,
      duration: RUNTIME_INPUT_VALUE,
      baseline: RUNTIME_INPUT_VALUE,
      trafficsplit: RUNTIME_INPUT_VALUE,
      deploymentTag: RUNTIME_INPUT_VALUE
    }
  }
}
