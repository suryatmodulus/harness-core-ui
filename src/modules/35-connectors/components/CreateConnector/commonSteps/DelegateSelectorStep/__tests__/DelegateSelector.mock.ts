import type { ConnectorInfoDTO } from 'services/cd-ng'

export const defaultProps = {
  name: 'Setup Delegates',
  isEditMode: true,
  connectorInfo: undefined
}

export const connectorInfo = {
  name: 'safdsafasfasfasdf',
  identifier: 'safdsafasfasfasdf',
  description: '',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Aws' as ConnectorInfoDTO['type'],
  spec: {
    credential: { crossAccountAccess: null, type: 'InheritFromDelegate', spec: null },
    delegateSelectors: ['primary']
  },
  delegateType: 'InheritFromDelegate',
  crossAccountAccess: false
}

export const connectorInfoCredentials = {
  name: 'sdfgdfsgsdfg',
  identifier: 'sdfgdfsgsdfg',
  description: '',
  orgIdentifier: 'default',
  projectIdentifier: 'newProject',
  tags: {},
  type: 'Aws' as ConnectorInfoDTO['type'],
  spec: {
    credential: {
      crossAccountAccess: null,
      type: 'ManualConfig',
      spec: { accessKey: 'sdfgsfdg', accessKeyRef: null, secretKeyRef: 'HARNESS_IMAGE_PASSWORD' }
    },
    delegateSelectors: ['delegate-selector-sample']
  },
  delegateType: 'ManualConfig',
  accessKey: { value: 'sdfgsfdg', type: 'TEXT' },
  secretKeyRef: {
    identifier: 'HARNESS_IMAGE_PASSWORD',
    name: 'HARNESS_IMAGE_PASSWORD',
    referenceString: 'HARNESS_IMAGE_PASSWORD',
    accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
    projectIdentifier: 'newProject',
    orgIdentifier: 'default'
  },
  crossAccountAccess: false,
  accessKeyfieldType: 'TEXT',
  accessKeytextField: 'sdfgsfdg'
}

export const mockedDelegates = {
  metaData: {},
  resource: {
    publishedVersions: ['1.0.0-dev'],
    delegates: [
      {
        uuid: 'l0AoC725RNi4eKV-YZI46w',
        ip: '192.168.1.14',
        hostName: 'delegate-sample-name-1',
        delegateName: '',
        description: 'description here',
        status: 'ENABLED',
        lastHeartBeat: 1620085638848,
        activelyConnected: false,
        delegateProfileId: '7w2xc3NoRumD8C26WguugQ',
        polllingModeEnabled: false,
        proxy: false,
        ceEnabled: false,
        implicitSelectors: { 'delegate-sample-name-1': 'HOST_NAME', primary: 'PROFILE_NAME' },
        profileExecutedAt: 1619772118758,
        profileError: false,
        sampleDelegate: false,
        connections: []
      },
      {
        uuid: 'l0AoC725RNi4eKV-YZI46w',
        ip: '192.168.1.14',
        hostName: 'delegate-sample-name-2',
        delegateName: '',
        description: 'description here',
        status: 'ENABLED',
        lastHeartBeat: 1620085638848,
        activelyConnected: false,
        delegateProfileId: '7w2xc3NoRumD8C26WguugQ',
        polllingModeEnabled: false,
        proxy: false,
        ceEnabled: false,
        implicitSelectors: { 'delegate-sample-name-2': 'HOST_NAME', primary: 'PROFILE_NAME' },
        profileExecutedAt: 1619772118758,
        profileError: false,
        sampleDelegate: false,
        connections: []
      }
    ],
    scalingGroups: []
  },
  responseMessages: []
}
