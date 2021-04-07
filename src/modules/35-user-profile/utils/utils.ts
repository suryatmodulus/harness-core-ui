import type { IconName } from '@wings-software/uicore'
import { ValueType } from '@secrets/components/TextReference/TextReference'
import type { SCMData } from '@user-profile/modals/SourceCodeManager/views/SourceCodeManagerForm'
import type { SourceCodeManagerAuthentication } from 'services/cd-ng'

export enum ConnectionType {
  HTTP = 'Http',
  SSH = 'Ssh'
}

export enum AuthTypes {
  USERNAME_PASSWORD = 'UsernamePassword',
  USERNAME_TOKEN = 'UsernameToken',
  KERBEROS = 'Kerberos',
  SSH_KEY = 'SSH_KEY'
}

export enum SourceCodeTypes {
  BITBUCKET = 'BITBUCKET',
  GITHUB = 'GITHUB',
  GITLAB = 'GITLAB',
  AZURE_DEVOPS = 'AZURE_DEVOPS',
  AWS_CODECOMMIT = 'AWS_CODECOMMIT'
}

export const getIconBySCM = (item: SourceCodeTypes): IconName => {
  switch (item) {
    case SourceCodeTypes.BITBUCKET:
      return 'bitbucket-blue'
    case SourceCodeTypes.GITHUB:
      return 'github'
    case SourceCodeTypes.GITLAB:
      return 'service-gotlab'
    case SourceCodeTypes.AWS_CODECOMMIT:
      return 'service-aws-code-deploy'
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
        type: ConnectionType.SSH,
        spec: {
          type: AuthTypes.KERBEROS,
          spec: {
            kerberosKeyRef: values.kerberosKey?.referenceString
          }
        }
      }
    default:
      return undefined
  }
}
