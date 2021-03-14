import type { ResponsePreFlightDTO } from 'services/pipeline-ng'

export const preFlightDummyResponseFailure: ResponsePreFlightDTO = {
  status: 'SUCCESS',
  data: {
    pipelineInputWrapperResponse: {
      status: 'FAILURE',
      label: 'Verifying pipeline inputs',
      pipelineInputResponse: [
        {
          errorInfo: undefined,
          success: true,
          fqn: 'test.steps.step1.url',
          stageName: 's1',
          stepName: 'step1'
        },
        {
          errorInfo: {
            summary: undefined,
            description: undefined,
            causes: [
              {
                cause: 'No value provided for runtime input'
              }
            ],
            resolution: undefined
          },
          success: false,
          fqn: 'pipeline.stages.s2.execution.steps.step2.url',
          stageName: 's2',
          stepName: 'step2'
        },
        {
          errorInfo: undefined,
          success: true,
          fqn: 'pipeline.stages.s3.execution.steps.step3.url',
          stageName: 's3',
          stepName: 'step3'
        }
      ]
    },
    connectorWrapperResponse: {
      checkResponses: [
        {
          connectorIdentifier: 'Connector1',
          errorInfo: undefined,
          fqn: 'pipeline.stages.s1.infrastructure.connectorRef',
          stageName: 'Stage 1',
          stepName: 'Step 1',
          status: 'SUCCESS'
        },
        {
          connectorIdentifier: 'Connector2',
          errorInfo: {
            summary: undefined,
            description: undefined,
            causes: [
              {
                cause: 'Connector not reachable'
              }
            ],
            resolution: undefined
          },
          fqn: 'pipeline.stages.s2.infrastructure.connectorRef',
          stageName: 'Stage 1',
          stepName: 'Step 1',
          status: 'FAILURE'
        },
        {
          connectorIdentifier: 'Connector3',
          errorInfo: {
            summary: undefined,
            description: undefined,
            causes: [
              {
                cause: 'Connector not reachable'
              },
              {
                cause: 'Connector not reachable 2'
              }
            ],
            resolution: [{ resolution: 'resolution 1' }, { resolution: 'resolution 2' }]
          },
          fqn: 'pipeline.stages.s3.infrastructure.connectorRef',
          stageName: 'Stage 1',
          stepName: 'Step 1',
          status: 'FAILURE'
        },
        {
          connectorIdentifier: 'Connector1',
          errorInfo: undefined,
          fqn: 'pipeline.stages.s4.infrastructure.connectorRef',
          stageName: 'Stage 4',
          stepName: 'Step 4',
          status: 'SUCCESS'
        }
      ],
      status: 'FAILURE',
      label: 'Verifying connectors'
    },
    status: 'FAILURE',
    errorInfo: undefined
  },
  metaData: undefined,
  correlationId: '07c3ae33-e8c6-4c00-84ca-8833ab90e4fa'
}

export const preFlightDummyResponseSuccess: ResponsePreFlightDTO = {
  status: 'SUCCESS',
  data: {
    pipelineInputWrapperResponse: {
      status: 'SUCCESS',
      label: 'Verifying pipeline inputs',
      pipelineInputResponse: [
        {
          errorInfo: undefined,
          success: true,
          fqn: 'test.steps.step1.url',
          stageName: 's1',
          stepName: 'step1'
        },
        {
          errorInfo: undefined,
          success: true,
          fqn: 'pipeline.stages.s2.execution.steps.step2.url',
          stageName: 's2',
          stepName: 'step2'
        },
        {
          errorInfo: undefined,
          success: true,
          fqn: 'pipeline.stages.s3.execution.steps.step3.url',
          stageName: 's3',
          stepName: 'step3'
        }
      ]
    },
    connectorWrapperResponse: {
      checkResponses: [
        {
          connectorIdentifier: 'Connector1',
          errorInfo: {
            summary: undefined,
            description: undefined,
            causes: [
              {
                cause: 'Connector not reachable'
              }
            ],
            resolution: undefined
          },
          fqn: 'pipeline.stages.s1.infrastructure.connectorRef',
          stageName: 'Stage 1',
          stepName: 'Step 1',
          status: 'SUCCESS'
        }
      ],
      status: 'SUCCESS',
      label: 'Verifying connectors'
    },
    status: 'SUCCESS',
    errorInfo: undefined
  },
  metaData: undefined,
  correlationId: '07c3ae33-e8c6-4c00-84ca-8833ab90e4fa'
}

export const preFlightDummyResponseProgress: ResponsePreFlightDTO = {
  status: 'SUCCESS',
  data: {
    pipelineInputWrapperResponse: {
      status: 'SUCCESS',
      label: 'Verifying pipeline inputs',
      pipelineInputResponse: [
        {
          errorInfo: undefined,
          success: true,
          fqn: 'test.steps.step1.url',
          stageName: 's1',
          stepName: 'step1'
        },
        {
          errorInfo: undefined,
          success: true,
          fqn: 'pipeline.stages.s2.execution.steps.step2.url',
          stageName: 's2',
          stepName: 'step2'
        },
        {
          errorInfo: undefined,
          success: true,
          fqn: 'pipeline.stages.s3.execution.steps.step3.url',
          stageName: 's3',
          stepName: 'step3'
        }
      ]
    },
    connectorWrapperResponse: {
      checkResponses: [
        {
          connectorIdentifier: 'Connector1',
          errorInfo: {
            summary: undefined,
            description: undefined,
            causes: [
              {
                cause: 'Connector not reachable'
              }
            ],
            resolution: undefined
          },
          fqn: 'pipeline.stages.s1.infrastructure.connectorRef',
          stageName: 'Stage 1',
          stepName: 'Step 1',
          status: 'IN_PROGRESS'
        }
      ],
      status: 'IN_PROGRESS',
      label: 'Verifying connectors'
    },
    status: 'IN_PROGRESS',
    errorInfo: undefined
  },
  metaData: undefined,
  correlationId: '07c3ae33-e8c6-4c00-84ca-8833ab90e4fa'
}
