import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'

export const connectorInfo: ConnectorInfoDTO = {
  name: 'devConnector',
  identifier: 'devConnector',
  description: 'devConnector description',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'AwsSecretManager',
  spec: {
    credential: {
      type: 'ManualConfig',
      spec: {
        accessKey: 'account.s15656',
        secretKey: 'account.s15656'
      }
    },
    region: 'us-east-1',
    secretNamePrefix: 'secretNamePrefix',
    delegateSelectors: ['dummyDelegateSelector'],
    default: false
  }
}

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretFile',
      name: 's15656',
      identifier: 's15656',
      tags: {},
      description: '',
      spec: { secretManagerIdentifier: 'harnessSecretManager' }
    },
    createdAt: 1606373702954,
    updatedAt: 1606373702954,
    draft: false
  },
  metaData: null,
  correlationId: '0346aa2b-290e-4892-a7f0-4ad2128c9829'
}

export const mockRegions = {
  resource: [{ name: 'region1', value: 'region1' }]
}
