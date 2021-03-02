export interface PreFlightCheckModalProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  pipelineIdentifier: string
  onCloseButtonClick: () => void
  onContinuePipelineClick: () => void
  inputSetPipelineYaml?: string
}

export const preFlightDummyResponseProgress = {
  pipelineInputWrapperResponse: {
    status: 'FAILURE',
    label: 'Verifying pipeline inputs',
    pipelineInputResponse: [
      {
        errorInfo: {
          summary: 'su',
          description: 'des',
          causes: [],
          resolution: []
        },
        status: 'FAILURE',
        fqn: 'somefqn',
        stageName: 'stageName 2',
        stepName: 'stepName 2'
      }
    ]
  },
  connectorWrapperResponse: {
    label: 'Verifying connectors',
    status: 'INPROGRESS',
    checkResponses: [
      {
        connectorIdentifier: 'connectorId1',
        connectorName: 'my connector 1',
        status: 'SUCCESS',
        errorInfo: null,
        fqn: null,
        stageName: 'stageName',
        stepName: 'stepName'
      },
      {
        connectorIdentifier: 'connectorId2',
        connectorName: 'my connector 2',
        status: 'FAILURE',
        errorInfo: {
          count: 2,
          message: 'Connector 2 failure'
        },
        fqn: 'fqn',
        stageName: 'stageName 2',
        stepName: 'stepName 2'
      }
    ]
  },
  status: 'INPROGRESS',
  errorInfo: null
}

export const preFlightDummyResponseSuccess = {
  pipelineInputWrapperResponse: {
    status: 'SUCCESS',
    label: 'Verifying pipeline inputs',
    pipelineInputResponse: []
  },
  connectorWrapperResponse: {
    label: 'Verifying connectors',
    status: 'SUCCESS',
    checkResponses: [
      {
        connectorIdentifier: 'connectorId1',
        connectorName: 'my connector 1',
        status: 'SUCCESS',
        errorInfo: null,
        fqn: null,
        stageName: 'stageName',
        stepName: 'stepName'
      },
      {
        connectorIdentifier: 'connectorId2',
        connectorName: 'my connector 2',
        status: 'SUCCESS',
        errorInfo: null,
        fqn: 'fqn',
        stageName: 'stageName 2',
        stepName: 'stepName 2'
      }
    ]
  },
  status: 'SUCCESS',
  errorInfo: null
}

export const preFlightDummyResponseFailure = {
  pipelineInputWrapperResponse: {
    status: 'FAILURE',
    label: 'Verifying pipeline inputs',
    pipelineInputResponse: [
      {
        errorInfo: {
          count: 1,
          message: 'Input set field level validation has some issue'
        },
        status: 'FAILURE',
        fqn: 'somefqn',
        stageName: 'stageName 2',
        stepName: 'stepName 2'
      }
    ]
  },
  connectorWrapperResponse: {
    label: 'Verifying connectors',
    status: 'FAILURE',
    checkResponses: [
      {
        connectorIdentifier: 'connectorId1',
        connectorName: 'my connector 1',
        status: 'SUCCESS',
        errorInfo: null,
        fqn: null,
        stageName: 'stageName',
        stepName: 'stepName'
      },
      {
        connectorIdentifier: 'connectorId2',
        connectorName: 'my connector 2',
        status: 'FAILURE',
        errorInfo: {
          count: 2,
          message: 'Connector 2 failure'
        },
        fqn: 'fqn',
        stageName: 'stageName 2',
        stepName: 'stepName 2'
      }
    ]
  },
  status: 'FAILURE',
  errorInfo: {
    count: 2,
    message: 'Overall a few things failed'
  }
}
