/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { ValueType } from '@secrets/components/TextReference/TextReference'
import type { SCMData } from '@user-profile/modals/SourceCodeManager/views/SourceCodeManagerForm'
import type { SourceCodeManagerAuthentication, SourceCodeManagerDTO } from 'services/cd-ng'
import { setSecretField } from '@secrets/utils/SecretField'

export enum ConnectionType {
  HTTPS = 'HTTPS',
  HTTP = 'Http',
  SSH = 'Ssh'
}

export enum AuthTypes {
  USERNAME_PASSWORD = 'UsernamePassword',
  USERNAME_TOKEN = 'UsernameToken',
  KERBEROS = 'Kerberos',
  SSH_KEY = 'SSH_KEY',
  AWSCredentials = 'AWSCredentials'
}

export enum SourceCodeTypes {
  BITBUCKET = 'BITBUCKET',
  GITHUB = 'GITHUB',
  GITLAB = 'GITLAB',
  AZURE_DEV_OPS = 'AZURE_DEV_OPS',
  AWS_CODE_COMMIT = 'AWS_CODE_COMMIT'
}

export const getIconBySCM = (item: SourceCodeTypes): IconName => {
  switch (item) {
    case SourceCodeTypes.BITBUCKET:
      return 'bitbucket-blue'
    case SourceCodeTypes.GITHUB:
      return 'github'
    case SourceCodeTypes.GITLAB:
      return 'service-gotlab'
    case SourceCodeTypes.AWS_CODE_COMMIT:
      return 'service-aws-code-deploy'
    case SourceCodeTypes.AZURE_DEV_OPS:
      return 'service-azure'
    default:
      return 'bitbucket'
  }
}

export const getAuthentication = (values: SCMData): SourceCodeManagerAuthentication | undefined => {
  switch (values.authType) {
    case AuthTypes.USERNAME_PASSWORD:
      return {
        type: ConnectionType.HTTP,
        spec: {
          type: AuthTypes.USERNAME_PASSWORD,
          spec: {
            ...(values.username?.type === ValueType.TEXT
              ? { username: values.username.value }
              : { usernameRef: values.username?.value }),
            passwordRef: values.password?.referenceString
          }
        }
      }
    case AuthTypes.USERNAME_TOKEN:
      return {
        type: ConnectionType.HTTP,
        spec: {
          type: AuthTypes.USERNAME_TOKEN,
          spec: {
            ...(values.username?.type === ValueType.TEXT
              ? { username: values.username.value }
              : { usernameRef: values.username?.value }),
            tokenRef: values.accessToken?.referenceString
          }
        }
      }
    case AuthTypes.SSH_KEY:
      return {
        type: ConnectionType.SSH,
        spec: {
          sshKeyRef: values.sshKey
        }
      }
    case AuthTypes.KERBEROS:
      return {
        type: ConnectionType.HTTP,
        spec: {
          type: AuthTypes.KERBEROS,
          spec: {
            kerberosKeyRef: values.kerberosKey?.referenceString
          }
        }
      }
    case AuthTypes.AWSCredentials:
      return {
        type: ConnectionType.HTTPS,
        spec: {
          type: AuthTypes.AWSCredentials,
          spec: {
            ...(values.accessKey?.type === ValueType.TEXT
              ? { accessKey: values.accessKey.value }
              : { accessKeyRef: values.accessKey?.value }),
            secretKeyRef: values.secretKey?.referenceString
          }
        }
      }
    default:
      return undefined
  }
}

const getGithubFormData = async (sourceCodeManagerData: SourceCodeManagerDTO, accountIdentifier: string) => {
  const { name, authentication } = sourceCodeManagerData
  return {
    name: name,
    authType: authentication?.spec?.type,
    accessToken: await setSecretField(
      authentication?.spec?.spec?.tokenRef || authentication?.spec?.apiAccess?.spec?.tokenRef,
      { accountIdentifier }
    ),
    username: {
      value: authentication?.spec?.spec?.username || authentication?.spec?.spec?.usernameRef,
      type: authentication?.spec?.spec?.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
    }
  }
}

export const getFormDataBasedOnSCMType = (sourceCodeManagerData: SourceCodeManagerDTO, accountIdentifier: string) => {
  switch (sourceCodeManagerData.type) {
    case SourceCodeTypes.GITHUB:
      return getGithubFormData(sourceCodeManagerData, accountIdentifier)
    default:
      return Promise.resolve({})
  }
}
