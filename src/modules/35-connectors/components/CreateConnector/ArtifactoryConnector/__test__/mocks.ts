/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'

export const mockConnector: ConnectorInfoDTO = {
  name: 'ArtifactoryTest',
  identifier: 'ArtifactoryTest',
  description: 'connectorDescription',
  orgIdentifier: undefined,
  projectIdentifier: undefined,
  tags: {},
  type: 'Artifactory',
  spec: {
    delegateSelectors: ['dummyDelegateSelector'],
    artifactoryServerUrl: 'dummyRespositoryUrl',
    auth: {
      type: 'UsernamePassword',
      spec: { username: 'dev', usernameRef: undefined, passwordRef: 'account.connectorPass' }
    }
  }
}

export const backButtonMock: ConnectorInfoDTO = {
  name: 'dummy artifactory name',
  identifier: 'dummyArtifactoryIdentifier',
  description: 'dummy artifactory description',
  orgIdentifier: '',
  projectIdentifier: '',
  tags: {},
  type: 'Artifactory',
  spec: {
    artifactoryServerUrl: 'dummyRespositoryUrl',
    auth: { type: 'UsernamePassword', spec: { username: 'dev', passwordRef: 'account.connectorPass' } }
  }
}

export const mockSecret = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'connectorPass',
      identifier: 'connectorPass',
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

export const mockResponse: ResponseBoolean = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}
