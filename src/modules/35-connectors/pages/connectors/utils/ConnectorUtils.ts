import { pick } from 'lodash-es'
import type { IconName, StepProps } from '@wings-software/uicore'
import { Connectors, EntityTypes } from '@connectors/constants'
import type {
  ConnectorInfoDTO,
  GetSecretV2QueryParams,
  ConnectorConfigDTO,
  AwsCredential,
  ErrorDetail,
  Connector,
  AppDynamicsConnectorDTO,
  AwsKmsConnectorDTO,
  ConnectorRequestBody
} from 'services/cd-ng'
import { CredTypeValues, FormData } from '@connectors/interfaces/ConnectorInterface'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import { ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { setSecretField } from '@secrets/utils/SecretField'
import { AuthTypes, GitAuthTypes, GitAPIAuthTypes } from './ConnectorHelper'

export interface DelegateCardInterface {
  type: string
  info: string
  disabled?: boolean
}
export interface CredentialType {
  [key: string]: AwsCredential['type']
}

export const GCP_AUTH_TYPE = {
  DELEGATE: 'delegate',
  ENCRYPTED_KEY: 'encryptedKey'
}

export const DelegateTypes: CredentialType = {
  DELEGATE_IN_CLUSTER: 'InheritFromDelegate',
  DELEGATE_OUT_CLUSTER: 'ManualConfig'
}

export const DelegateInClusterType = {
  useExistingDelegate: 'useExistingDelegate',
  addNewDelegate: 'addnewDelegate'
}

export const DockerProviderType = {
  DOCKERHUB: 'DockerHub',
  HARBOUR: 'Harbor',
  QUAY: 'Quay',
  OTHER: 'Other'
}

export const GitUrlType = {
  ACCOUNT: 'Account',
  REPO: 'Repo'
}

export const GitConnectionType = {
  HTTP: 'Http',
  SSH: 'Ssh'
}

export const AppDynamicsAuthType = {
  USERNAME_PASSWORD: 'UsernamePassword',
  API_CLIENT_TOKEN: 'ApiClientToken'
}

const buildAuthTypePayload = (formData: FormData) => {
  const { authType = '' } = formData

  switch (authType) {
    case AuthTypes.USER_PASSWORD:
      return {
        username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
        usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
        passwordRef: formData.password.referenceString
      }
    case AuthTypes.SERVICE_ACCOUNT:
      return {
        serviceAccountTokenRef: formData.serviceAccountToken.referenceString
      }
    case AuthTypes.OIDC:
      return {
        oidcIssuerUrl: formData.oidcIssuerUrl,
        oidcUsername: formData.oidcUsername.type === ValueType.TEXT ? formData.oidcUsername.value : undefined,
        oidcUsernameRef: formData.oidcUsername.type === ValueType.ENCRYPTED ? formData.oidcUsername.value : undefined,
        oidcPasswordRef: formData.oidcPassword?.referenceString,
        oidcClientIdRef: formData.oidcCleintId?.referenceString,
        oidcSecretRef: formData.oidcCleintSecret?.referenceString,
        oidcScopes: formData.oidcScopes
      }

    case AuthTypes.CLIENT_KEY_CERT:
      return {
        clientKeyRef: formData.clientKey.referenceString,
        clientCertRef: formData.clientKeyCertificate.referenceString,
        clientKeyPassphraseRef: formData.clientKeyPassphrase?.referenceString,
        caCertRef: formData.clientKeyCACertificate?.referenceString, // optional
        clientKeyAlgo: formData.clientKeyAlgo
      }
    default:
      return {}
  }
}

export const getSpecForDelegateType = (formData: FormData) => {
  if (formData?.delegateType === DelegateTypes.DELEGATE_OUT_CLUSTER) {
    return {
      masterUrl: formData?.masterUrl,
      auth: {
        type: formData?.authType,
        spec: buildAuthTypePayload(formData)
      }
    }
  }
  return null
}

export const buildKubPayload = (formData: FormData) => {
  const savedData = {
    name: formData?.name,
    description: formData?.description,
    projectIdentifier: formData?.projectIdentifier,
    orgIdentifier: formData?.orgIdentifier,
    identifier: formData?.identifier,
    tags: formData?.tags,
    type: Connectors.KUBERNETES_CLUSTER,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      credential: {
        type: formData?.delegateType,
        spec: getSpecForDelegateType(formData)
      }
    }
  }
  return { connector: savedData }
}

const getGitAuthSpec = (formData: FormData) => {
  const { authType = '' } = formData
  switch (authType) {
    case GitAuthTypes.USER_PASSWORD:
      return {
        username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
        usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
        passwordRef: formData.password.referenceString
      }
    case GitAuthTypes.USER_TOKEN:
      return {
        username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
        usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
        tokenRef: formData.accessToken.referenceString
      }
    case GitAuthTypes.KERBEROS:
      return {
        kerberosKeyRef: formData.kerberosKey.referenceString
      }
    default:
      return {}
  }
}

export const buildGithubPayload = (formData: FormData) => {
  const savedData: any = {
    name: formData.name,
    description: formData?.description,
    projectIdentifier: formData?.projectIdentifier,
    orgIdentifier: formData?.orgIdentifier,
    identifier: formData.identifier,
    tags: formData?.tags,
    type: Connectors.GITHUB,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      type: formData.urlType,
      url: formData.url,
      ...(formData.validationRepo ? { validationRepo: formData.validationRepo } : {}),
      authentication: {
        type: formData.connectionType,
        spec:
          formData.connectionType === GitConnectionType.SSH
            ? { sshKeyRef: formData.sshKey.referenceString }
            : {
                type: formData.authType,
                spec: getGitAuthSpec(formData)
              }
      },
      apiAccess: { type: formData.apiAuthType, spec: {} }
    }
  }

  if (formData.enableAPIAccess) {
    savedData.spec.apiAccess.spec =
      formData.apiAuthType === GitAPIAuthTypes.TOKEN
        ? {
            tokenRef: formData.apiAccessToken.referenceString
          }
        : {
            installationId: formData.installationId,
            applicationId: formData.applicationId,
            privateKeyRef: formData.privateKey
          }
  } else {
    delete savedData.spec.apiAccess
  }
  return { connector: savedData }
}

export const buildGitlabPayload = (formData: FormData) => {
  const savedData: any = {
    name: formData.name,
    description: formData?.description,
    projectIdentifier: formData?.projectIdentifier,
    orgIdentifier: formData?.orgIdentifier,
    identifier: formData.identifier,
    tags: formData?.tags,
    type: Connectors.GITLAB,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      type: formData.urlType,
      url: formData.url,
      ...(formData.validationRepo ? { validationRepo: formData.validationRepo } : {}),
      authentication: {
        type: formData.connectionType,
        spec:
          formData.connectionType === GitConnectionType.SSH
            ? { sshKeyRef: formData.sshKey?.referenceString }
            : {
                type: formData.authType,
                spec: getGitAuthSpec(formData)
              }
      },
      apiAccess: { type: formData.apiAuthType, spec: {} }
    }
  }

  if (formData.enableAPIAccess) {
    savedData.spec.apiAccess.spec =
      formData.apiAuthType === GitAPIAuthTypes.TOKEN
        ? {
            tokenRef: formData.apiAccessToken?.referenceString
          }
        : {
            installationId: formData.installationId,
            applicationId: formData.applicationId,
            privateKeyRef: formData.privateKey.referenceString
          }
  } else {
    delete savedData.spec.apiAccess
  }
  return { connector: savedData }
}

export const buildBitbucketPayload = (formData: FormData) => {
  const savedData: any = {
    name: formData.name,
    description: formData?.description,
    projectIdentifier: formData?.projectIdentifier,
    orgIdentifier: formData?.orgIdentifier,
    identifier: formData.identifier,
    tags: formData?.tags,
    type: Connectors.BITBUCKET,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      type: formData.urlType,
      url: formData.url,
      ...(formData.validationRepo ? { validationRepo: formData.validationRepo } : {}),
      authentication: {
        type: formData.connectionType,
        spec:
          formData.connectionType === GitConnectionType.SSH
            ? { sshKeyRef: formData.sshKey.referenceString }
            : {
                type: formData.authType,
                spec: getGitAuthSpec(formData)
              }
      },
      apiAccess: { type: formData.apiAuthType, spec: {} }
    }
  }

  if (formData.enableAPIAccess) {
    savedData.spec.apiAccess.spec = {
      username: formData.apiAccessUsername.type === ValueType.TEXT ? formData.apiAccessUsername.value : undefined,
      usernameRef:
        formData.apiAccessUsername.type === ValueType.ENCRYPTED ? formData.apiAccessUsername.value : undefined,
      tokenRef: formData.accessToken.referenceString
    }
  } else {
    delete savedData.spec.apiAccess
  }
  return { connector: savedData }
}

export const setupGitFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    sshKey: await setSecretField(
      connectorInfo?.spec?.sshKeyRef || connectorInfo?.spec?.spec?.sshKeyRef, // for git, sshKeyRef looks to be nested in spec twice
      scopeQueryParams
    ),
    username:
      connectorInfo?.spec?.spec?.username || connectorInfo?.spec?.spec?.usernameRef
        ? {
            value: connectorInfo?.spec?.spec?.username || connectorInfo?.spec?.spec?.usernameRef,
            type: connectorInfo?.spec?.spec?.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    password: await setSecretField(connectorInfo?.spec?.spec?.passwordRef, scopeQueryParams)
  }

  return formData
}

export const setupGithubFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const authData = connectorInfo?.spec?.authentication
  const formData = {
    sshKey: await setSecretField(authData?.spec?.sshKeyRef, scopeQueryParams),
    authType: authData?.spec?.type,
    username:
      authData?.spec?.spec?.username || authData?.spec?.spec?.usernameRef
        ? {
            value: authData?.spec?.spec?.username || authData?.spec?.spec?.usernameRef,
            type: authData?.spec?.spec?.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    password: await setSecretField(authData?.spec?.spec?.passwordRef, scopeQueryParams),
    accessToken: await setSecretField(
      authData?.spec?.spec?.tokenRef || connectorInfo?.spec?.apiAccess?.spec?.tokenRef,
      scopeQueryParams
    ),
    apiAccessToken: await setSecretField(connectorInfo?.spec?.apiAccess?.spec?.tokenRef, scopeQueryParams),
    kerberosKey: await setSecretField(authData?.spec?.spec?.kerberosKeyRef, scopeQueryParams),
    enableAPIAccess: !!connectorInfo?.spec?.apiAccess,
    apiAuthType: connectorInfo?.spec?.apiAccess?.type,
    installationId: connectorInfo?.spec?.apiAccess?.spec?.installationId,
    applicationId: connectorInfo?.spec?.apiAccess?.spec?.applicationId,
    privateKey: connectorInfo?.spec?.apiAccess?.spec?.privateKeyRef
  }

  return formData
}

export const setupBitbucketFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const authData = connectorInfo?.spec?.authentication
  const formData = {
    sshKey: await setSecretField(authData?.spec?.sshKeyRef, scopeQueryParams),
    authType: authData?.spec?.type,
    username:
      authData?.spec?.spec?.username || authData?.spec?.spec?.usernameRef
        ? {
            value: authData?.spec?.spec?.username || authData?.spec?.spec?.usernameRef,
            type: authData?.spec?.spec?.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,
    password: await setSecretField(authData?.spec?.spec?.passwordRef, scopeQueryParams),
    enableAPIAccess: !!connectorInfo?.spec?.apiAccess,
    apiAccessUsername:
      connectorInfo?.spec?.apiAccess?.spec?.username || connectorInfo?.spec?.apiAccess?.spec?.usernameRef
        ? {
            value: connectorInfo?.spec?.apiAccess?.spec?.username || connectorInfo?.spec?.apiAccess?.spec?.usernameRef,
            type: connectorInfo?.spec?.apiAccess?.spec?.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    apiAuthType: connectorInfo?.spec?.apiAccess?.type,
    accessToken: await setSecretField(connectorInfo?.spec?.apiAccess?.spec?.tokenRef, scopeQueryParams)
  }

  return formData
}

export const getK8AuthFormFields = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }
  const authdata = connectorInfo.spec.credential?.spec?.auth?.spec
  return {
    username:
      authdata?.username || authdata?.usernameRef
        ? {
            value: authdata.username || authdata.usernameRef,
            type: authdata.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,
    password: await setSecretField(authdata?.passwordRef, scopeQueryParams),
    serviceAccountToken: await setSecretField(authdata?.serviceAccountTokenRef, scopeQueryParams),
    oidcIssuerUrl: authdata?.oidcIssuerUrl,
    oidcUsername:
      authdata?.oidcUsername || authdata?.oidcUsernameRef
        ? {
            value: authdata.oidcUsername || authdata.oidcUsernameRef,
            type: authdata.oidcUsernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,
    oidcPassword: await setSecretField(authdata?.oidcPasswordRef, scopeQueryParams),
    oidcCleintId: await setSecretField(authdata?.oidcClientIdRef, scopeQueryParams),
    oidcCleintSecret: await setSecretField(authdata?.oidcSecretRef, scopeQueryParams),
    oidcScopes: authdata?.oidcScopes,
    clientKey: await setSecretField(authdata?.clientKeyRef, scopeQueryParams),
    clientKeyCertificate: await setSecretField(authdata?.clientCertRef, scopeQueryParams),
    clientKeyPassphrase: await setSecretField(authdata?.clientKeyPassphraseRef, scopeQueryParams),
    clientKeyCACertificate: await setSecretField(authdata?.caCertRef, scopeQueryParams),
    clientKeyAlgo: authdata?.clientKeyAlgo
  }
}

export const setupKubFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const authData = await getK8AuthFormFields(connectorInfo, accountId)
  const formData = {
    delegateType: connectorInfo.spec.credential.type,
    delegateName: connectorInfo.spec.credential?.spec?.delegateName || '',
    masterUrl: connectorInfo.spec.credential?.spec?.masterUrl || '',
    authType: connectorInfo.spec.credential?.spec?.auth?.type || '',
    skipDefaultValidation: false,

    ...authData
  }

  return formData
}

export const setupGCPFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    delegateType: connectorInfo.spec.credential.type,
    password: await setSecretField(connectorInfo.spec.credential?.spec?.secretKeyRef, scopeQueryParams)
  }

  return formData
}

export const setupAWSFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    delegateType: connectorInfo.spec.credential.type,
    accessKey:
      connectorInfo.spec.credential.spec?.accessKey || connectorInfo.spec.credential.spec?.accessKeyRef
        ? {
            value: connectorInfo.spec.credential.spec.accessKey || connectorInfo.spec.credential.spec.accessKeyRef,
            type: connectorInfo.spec.credential.spec.accessKeyRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    secretKeyRef: await setSecretField(connectorInfo.spec.credential.spec?.secretKeyRef, scopeQueryParams),
    crossAccountAccess: !!connectorInfo.spec.credential?.crossAccountAccess,
    crossAccountRoleArn: connectorInfo.spec.credential.crossAccountAccess?.crossAccountRoleArn,
    externalId: connectorInfo.spec.credential.crossAccountAccess?.externalId
  }

  return formData
}

export const setupDockerFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    dockerRegistryUrl: connectorInfo.spec.dockerRegistryUrl,
    authType: connectorInfo.spec.auth.type,
    dockerProviderType: connectorInfo.spec.providerType,
    username:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD &&
      (connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef)
        ? {
            value: connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef,
            type: connectorInfo.spec.auth.spec.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    password:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD
        ? await setSecretField(connectorInfo.spec.auth.spec.passwordRef, scopeQueryParams)
        : undefined
  }
  return formData
}

export const setupHelmFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    helmRepoUrl: connectorInfo.spec.helmRepoUrl,
    authType: connectorInfo.spec.auth.type,
    username:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD &&
      (connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef)
        ? {
            value: connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef,
            type: connectorInfo.spec.auth.spec.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    password:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD
        ? await setSecretField(connectorInfo.spec.auth.spec.passwordRef, scopeQueryParams)
        : undefined
  }
  return formData
}

export const setupNexusFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    nexusServerUrl: connectorInfo.spec.nexusServerUrl,
    nexusVersion: connectorInfo.spec.version,
    authType: connectorInfo.spec.auth.type,
    username:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD &&
      (connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef)
        ? {
            value: connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef,
            type: connectorInfo.spec.auth.spec.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    password:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD
        ? await setSecretField(connectorInfo.spec.auth.spec.passwordRef, scopeQueryParams)
        : undefined
  }

  return formData
}

export const setupArtifactoryFormData = async (
  connectorInfo: ConnectorInfoDTO,
  accountId: string
): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    artifactoryServerUrl: connectorInfo.spec.artifactoryServerUrl,
    authType: connectorInfo.spec.auth.type,
    username:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD &&
      (connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef)
        ? {
            value: connectorInfo.spec.auth.spec.username || connectorInfo.spec.auth.spec.usernameRef,
            type: connectorInfo.spec.auth.spec.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    password:
      connectorInfo.spec.auth.type === AuthTypes.USER_PASSWORD
        ? await setSecretField(connectorInfo.spec.auth.spec.passwordRef, scopeQueryParams)
        : undefined
  }

  return formData
}

export const setupAwsKmsFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const connectorInfoSpec = connectorInfo?.spec
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }
  const accessKey = await setSecretField(connectorInfoSpec?.credential?.spec?.accessKey, scopeQueryParams)
  const secretKey = await setSecretField(connectorInfoSpec?.credential?.spec?.secretKey, scopeQueryParams)
  const awsArn = await setSecretField(connectorInfoSpec?.kmsArn, scopeQueryParams)
  return {
    accessKey: accessKey || undefined,
    secretKey: secretKey || undefined,
    awsArn: awsArn || undefined,
    region: connectorInfoSpec?.region || undefined,
    credType: connectorInfoSpec?.credential?.type,
    delegate: connectorInfoSpec?.credential?.spec?.delegateSelectors || undefined,
    roleArn: connectorInfoSpec?.credential?.spec?.roleArn || undefined,
    externalName: connectorInfoSpec?.credential?.spec?.externalName || undefined,
    assumeStsRoleDuration: connectorInfoSpec?.credential?.spec?.assumeStsRoleDuration || undefined,
    default: (connectorInfoSpec as AwsKmsConnectorDTO)?.default || false
  }
}

export const buildAWSPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData.description,
    projectIdentifier: formData.projectIdentifier,
    identifier: formData.identifier,
    orgIdentifier: formData.orgIdentifier,
    tags: formData.tags,
    type: Connectors.AWS,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      credential: {
        type: formData.delegateType,
        spec:
          formData.delegateType === DelegateTypes.DELEGATE_OUT_CLUSTER
            ? {
                accessKey: formData.accessKey.type === ValueType.TEXT ? formData.accessKey.value : undefined,
                accessKeyRef: formData.accessKey.type === ValueType.ENCRYPTED ? formData.accessKey.value : undefined,

                secretKeyRef: formData.secretKeyRef.referenceString
              }
            : null,
        crossAccountAccess: formData.crossAccountAccess
          ? {
              crossAccountRoleArn: formData.crossAccountRoleArn,
              externalId: formData.externalId.length ? formData.externalId : null
            }
          : null
      }
    }
  }
  return { connector: savedData }
}

export const buildAWSKmsSMPayload = (formData: FormData): ConnectorRequestBody => {
  let specData = {}

  switch (formData?.credType) {
    case CredTypeValues.ManualConfig:
      specData = {
        accessKey: formData?.accessKey?.referenceString,
        secretKey: formData?.secretKey?.referenceString
      }
      break
    case CredTypeValues.AssumeIAMRole:
      specData = { delegateSelectors: formData.delegateSelectors }
      break
    case CredTypeValues.AssumeRoleSTS:
      specData = {
        delegateSelectors: formData.delegateSelectors,
        roleArn: formData.roleArn?.trim(),
        externalName: formData.externalName?.trim() || undefined,
        assumeStsRoleDuration: formData.assumeStsRoleDuration
          ? typeof formData.assumeStsRoleDuration === 'string'
            ? parseInt(formData.assumeStsRoleDuration.trim())
            : formData.assumeStsRoleDuration
          : undefined
      }
  }

  const savedData = {
    name: formData.name,
    description: formData.description,
    projectIdentifier: formData.projectIdentifier,
    identifier: formData.identifier,
    orgIdentifier: formData.orgIdentifier,
    tags: formData.tags,
    type: Connectors.AWS_KMS,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      credential: {
        type: formData?.credType,
        spec: specData
      },
      kmsArn: formData?.awsArn?.referenceString,
      region: formData?.region,
      default: formData.default
    }
  }
  return { connector: savedData }
}

export const buildAWSCodeCommitPayload = (formData: FormData) => {
  const connector = {
    name: formData.name,
    identifier: formData.identifier,
    description: formData.description,
    tags: formData.tags,
    orgIdentifier: formData.orgIdentifier,
    projectIdentifier: formData.projectIdentifier,
    type: Connectors.AWS_CODECOMMIT,
    spec: {
      type: formData.urlType,
      url: formData.url,
      authentication: {
        type: 'HTTPS',
        spec: {
          type: 'AWSCredentials',
          spec: {
            ...(formData.accessKey.type === ValueType.ENCRYPTED
              ? {
                  accessKeyRef: formData.accessKey.value
                }
              : {
                  accessKey: formData.accessKey.value
                }),
            secretKeyRef: formData.secretKey?.referenceString
          }
        }
      }
    }
  }
  return { connector }
}

export const buildDockerPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData.description,
    projectIdentifier: formData.projectIdentifier,
    identifier: formData.identifier,
    orgIdentifier: formData.orgIdentifier,
    tags: formData.tags,
    type: Connectors.DOCKER,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      dockerRegistryUrl: formData.dockerRegistryUrl,
      providerType: formData.dockerProviderType,
      auth:
        formData.authType === AuthTypes.USER_PASSWORD
          ? {
              type: formData.authType,
              spec: {
                username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
                usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
                passwordRef: formData.password.referenceString
              }
            }
          : {
              type: formData.authType
            }
    }
  }
  return { connector: savedData }
}

export const buildJiraPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData.description,
    identifier: formData.identifier,
    projectIdentifier: formData.projectIdentifier,
    orgIdentifier: formData.orgIdentifier,
    type: Connectors.Jira,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      jiraUrl: formData.jiraUrl,

      username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
      usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
      passwordRef: formData.passwordRef.referenceString
    }
  }
  return { connector: savedData }
}

export const setupJiraFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }

  const formData = {
    jiraUrl: connectorInfo.spec.jiraUrl,

    username:
      connectorInfo.spec.username || connectorInfo.spec.usernameRef
        ? {
            value: connectorInfo.spec.username || connectorInfo.spec.usernameRef,
            type: connectorInfo.spec.usernameRef ? ValueType.ENCRYPTED : ValueType.TEXT
          }
        : undefined,

    passwordRef: await setSecretField(connectorInfo.spec.passwordRef, scopeQueryParams)
  }
  return formData
}

export const buildHelmPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData.description,
    identifier: formData.identifier,
    projectIdentifier: formData.projectIdentifier,
    orgIdentifier: formData.orgIdentifier,
    tags: formData.tags,
    type: Connectors.HttpHelmRepo,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      helmRepoUrl: formData.helmRepoUrl,
      auth:
        formData.authType === AuthTypes.USER_PASSWORD
          ? {
              type: formData.authType,
              spec: {
                username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
                usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
                passwordRef: formData.password.referenceString
              }
            }
          : {
              type: formData.authType
            }
    }
  }
  return { connector: savedData }
}

export const buildGcpPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData.description,
    projectIdentifier: formData.projectIdentifier,
    identifier: formData.identifier,
    orgIdentifier: formData.orgIdentifier,
    tags: formData.tags,
    type: Connectors.GCP,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      credential: {
        type: formData?.delegateType,
        spec:
          formData?.delegateType === DelegateTypes.DELEGATE_OUT_CLUSTER
            ? {
                secretKeyRef: formData.password.referenceString
              }
            : null
      }
    }
  }

  return { connector: savedData }
}

export const buildGitPayload = (formData: FormData) => {
  const savedData = {
    name: formData.name,
    description: formData.description,
    projectIdentifier: formData.projectIdentifier,
    identifier: formData.identifier,
    orgIdentifier: formData.orgIdentifier,
    tags: formData.tags,
    type: Connectors.GIT,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      connectionType: formData.urlType,
      url: formData.url,
      type: formData.connectionType,
      ...(formData.validationRepo ? { validationRepo: formData.validationRepo } : {}),
      spec:
        formData.connectionType === GitConnectionType.SSH
          ? { sshKeyRef: formData.sshKey.referenceString }
          : {
              username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
              usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
              passwordRef: formData.password.referenceString
            }

      // mocked data untill UX is not provided
      // gitSync: {
      //   enabled: true,
      //   customCommitAttributes: {
      //     authorName: 'deepak',
      //     authorEmail: 'deepak.patankar@harness.io',
      //     commitMessage: '[GITSYNC-0]: Pushing Changes'
      //   }
      // }
    }
  }
  return { connector: savedData }
}

export const buildKubFormData = (connector: ConnectorInfoDTO) => {
  return {
    name: connector?.name,
    description: connector?.description,
    identifier: connector?.identifier,
    tags: connector?.tags,
    delegateType: connector?.spec?.credential?.type,
    delegateName: connector?.spec?.credential?.spec?.delegateName,
    masterUrl: connector?.spec?.credential?.spec?.masterUrl,
    authType: connector?.spec?.credential?.spec?.auth?.type,
    ...connector?.spec?.credential?.spec?.auth?.spec
  }
}

export const buildNexusPayload = (formData: FormData) => {
  const savedData = {
    type: Connectors.NEXUS,

    ...pick(formData, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'description', 'tags']),
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      nexusServerUrl: formData?.nexusServerUrl,
      version: formData?.nexusVersion,
      auth: {
        type: formData.authType,
        spec:
          formData.authType === AuthTypes.USER_PASSWORD
            ? {
                username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
                usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
                passwordRef: formData.password.referenceString
              }
            : null
      }
    }
  }

  return { connector: savedData }
}

export const buildArtifactoryPayload = (formData: FormData) => {
  const savedData = {
    type: Connectors.ARTIFACTORY,
    ...pick(formData, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'description', 'tags']),
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      artifactoryServerUrl: formData?.artifactoryServerUrl,
      auth: {
        type: formData.authType,
        spec:
          formData.authType === AuthTypes.USER_PASSWORD
            ? {
                username: formData.username.type === ValueType.TEXT ? formData.username.value : undefined,
                usernameRef: formData.username.type === ValueType.ENCRYPTED ? formData.username.value : undefined,
                passwordRef: formData.password.referenceString
              }
            : null
      }
    }
  }

  return { connector: savedData }
}

export const buildAppDynamicsPayload = (formData: FormData): Connector => {
  const payload: Connector = {
    connector: {
      ...pick(formData, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'description', 'tags']),
      type: Connectors.APP_DYNAMICS,
      spec: {
        delegateSelectors: formData.delegateSelectors ?? {},
        authType: formData.authType,
        accountname: formData.accountName,
        controllerUrl: formData.url,
        accountId: formData.accountId
      } as AppDynamicsConnectorDTO
    }
  }

  if (formData.authType === AppDynamicsAuthType.USERNAME_PASSWORD) {
    payload.connector!.spec.username = formData.username
    payload.connector!.spec.passwordRef = formData.password.referenceString
  } else if (formData.authType === AppDynamicsAuthType.API_CLIENT_TOKEN) {
    payload.connector!.spec.clientId = formData.clientId
    payload.connector!.spec.clientSecretRef = formData.clientSecretRef.referenceString
  }

  return payload
}

export const buildNewRelicPayload = (formData: FormData) => ({
  connector: {
    name: formData.name,
    identifier: formData.identifier,
    type: Connectors.NEW_RELIC,
    projectIdentifier: formData.projectIdentifier,
    orgIdentifier: formData.orgIdentifier,
    spec: {
      delegateSelectors: formData.delegateSelectors || {},
      newRelicAccountId: formData.newRelicAccountId,
      apiKeyRef: formData.apiKeyRef.referenceString,
      url: formData.url?.value,
      accountId: formData.accountId
    }
  }
})

export const buildPrometheusPayload = (formData: FormData) => {
  return {
    connector: {
      name: formData.name,
      identifier: formData.identifier,
      type: Connectors.PROMETHEUS,
      projectIdentifier: formData.projectIdentifier,
      orgIdentifier: formData.orgIdentifier,
      spec: {
        delegateSelectors: formData.delegateSelectors || {},
        url: formData.url,
        accountId: formData.accountId
      }
    }
  }
}

export interface DatadogInitialValue {
  apiKeyRef?: SecretReferenceInterface | void
  applicationKeyRef?: SecretReferenceInterface | void
  accountId?: string | undefined
  projectIdentifier?: string
  orgIdentifier?: string
  loading?: boolean
}

export const buildDatadogPayload = (formData: FormData) => {
  const {
    name,
    identifier,
    projectIdentifier,
    orgIdentifier,
    delegateSelectors,
    url,
    description,
    tags,
    apiKeyRef: { referenceString: apiReferenceKey },
    applicationKeyRef: { referenceString: appReferenceKey }
  } = formData
  return {
    connector: {
      name,
      identifier,
      type: Connectors.DATADOG,
      projectIdentifier,
      orgIdentifier,
      description,
      tags,
      spec: {
        url,
        apiKeyRef: apiReferenceKey,
        applicationKeyRef: appReferenceKey,
        delegateSelectors: delegateSelectors || {}
      }
    }
  }
}

export interface SumoLogicInitialValue {
  accessIdRef?: SecretReferenceInterface | void
  accessKeyRef?: SecretReferenceInterface | void
  accountId?: string | undefined
  projectIdentifier?: string
  orgIdentifier?: string
  loading?: boolean
}

export const buildSumoLogicPayload = (formData: FormData) => {
  const {
    name,
    identifier,
    projectIdentifier,
    orgIdentifier,
    delegateSelectors,
    url,
    description,
    tags,
    accessIdRef: { referenceString: accessIdRef },
    accessKeyRef: { referenceString: accesskeyRef }
  } = formData
  return {
    connector: {
      name,
      identifier,
      type: Connectors.SUMOLOGIC,
      projectIdentifier,
      orgIdentifier,
      description,
      tags,
      spec: {
        url,
        accessIdRef: accessIdRef,
        accessKeyRef: accesskeyRef,
        delegateSelectors: delegateSelectors || {}
      }
    }
  }
}

export const buildSplunkPayload = (formData: FormData) => ({
  connector: {
    ...pick(formData, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'description', 'tags']),
    type: Connectors.SPLUNK,
    spec: {
      ...(formData?.delegateSelectors ? { delegateSelectors: formData.delegateSelectors } : {}),
      username: formData.username,
      accountname: formData.accountName,
      passwordRef: formData.passwordRef.referenceString,
      splunkUrl: formData.url,
      accountId: formData.accountId
    }
  }
})

export const buildDynatracePayload = (formData: FormData) => {
  return {
    connector: {
      name: formData.name,
      identifier: formData.identifier,
      type: Connectors.DYNATRACE,
      projectIdentifier: formData.projectIdentifier,
      orgIdentifier: formData.orgIdentifier,
      spec: {
        delegateSelectors: formData.delegateSelectors || {},
        url: formData.url,
        apiTokenRef: formData.apiTokenRef?.referenceString,
        accountId: formData.accountId
      }
    }
  }
}

export const setupAzureKeyVaultFormData = async (
  connectorInfo: ConnectorInfoDTO,
  accountId: string
): Promise<FormData> => {
  const connectorInfoSpec = connectorInfo?.spec
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }
  const secretKey = await setSecretField(connectorInfoSpec?.secretKey, scopeQueryParams)
  return {
    clientId: connectorInfoSpec?.clientId || undefined,
    secretKey: secretKey || undefined,
    tenantId: connectorInfoSpec?.tenantId || undefined,
    vaultName: connectorInfoSpec?.vaultName || undefined,
    subscription: connectorInfoSpec?.subscription || undefined,
    default: connectorInfoSpec?.default || false
  }
}

export const setupVaultFormData = async (connectorInfo: ConnectorInfoDTO, accountId: string): Promise<FormData> => {
  const connectorInfoSpec = connectorInfo?.spec
  const scopeQueryParams: GetSecretV2QueryParams = {
    accountIdentifier: accountId,
    projectIdentifier: connectorInfo.projectIdentifier,
    orgIdentifier: connectorInfo.orgIdentifier
  }
  const secretId = await setSecretField(connectorInfoSpec?.secretId, scopeQueryParams)
  const authToken = await setSecretField(connectorInfoSpec?.authToken, scopeQueryParams)
  return {
    vaultUrl: connectorInfoSpec?.vaultUrl || '',
    basePath: connectorInfoSpec?.basePath || '',
    readOnly: connectorInfoSpec?.readOnly || false,
    default: connectorInfoSpec?.default || false,
    accessType: connectorInfoSpec?.accessType || 'APP_ROLE',
    appRoleId: connectorInfoSpec?.appRoleId || '',
    secretId: secretId || undefined,
    authToken: authToken || undefined,
    secretEngine: `${connectorInfoSpec?.secretEngineName || ''}@@@${connectorInfoSpec?.secretEngineVersion}` || '',
    engineType: connectorInfoSpec?.secretEngineManuallyConfigured ? 'manual' : 'fetch',
    secretEngineName: connectorInfoSpec?.secretEngineName || '',
    secretEngineVersion: connectorInfoSpec?.secretEngineVersion || 2,
    renewalIntervalMinutes: connectorInfoSpec?.renewalIntervalMinutes || 10
  }
}

export const getIconByType = (type: ConnectorInfoDTO['type'] | undefined): IconName => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return 'service-kubernetes'
    case Connectors.GIT:
      return 'service-github'
    case Connectors.HttpHelmRepo:
      return 'service-helm'
    case Connectors.GITHUB:
      return 'github'
    case Connectors.GITLAB:
      return 'service-gotlab'
    case Connectors.BITBUCKET:
      return 'bitbucket-selected'
    case Connectors.VAULT: // TODO: use enum when backend fixes it
      return 'hashiCorpVault'
    case Connectors.LOCAL: // TODO: use enum when backend fixes it
      return 'secret-manager'
    case Connectors.APP_DYNAMICS:
      return 'service-appdynamics'
    case Connectors.SPLUNK:
      return 'service-splunk'
    case Connectors.NEW_RELIC:
      return 'service-newrelic'
    case Connectors.PROMETHEUS:
      return 'service-prometheus'
    case Connectors.DOCKER:
      return 'service-dockerhub'
    case Connectors.AWS:
    case Connectors.CEAWS:
      return 'service-aws'
    case Connectors.AWS_CODECOMMIT:
      return 'service-aws-code-deploy'
    case Connectors.NEXUS:
      return 'service-nexus'
    case Connectors.ARTIFACTORY:
      return 'service-artifactory'
    case Connectors.GCP:
      return 'service-gcp'
    case Connectors.Jira:
      return 'service-jira'
    case Connectors.AWS_KMS:
      return 'aws-kms'
    case Connectors.CE_AZURE:
      return 'service-azure'
    case Connectors.DATADOG:
      return 'service-datadog'
    case Connectors.SUMOLOGIC:
      return 'service-sumologic'
    case Connectors.AZURE_KEY_VAULT:
      return 'azure-key-vault'
    case Connectors.DYNATRACE:
      return 'service-dynatrace'
    case Connectors.CE_KUBERNETES:
      return 'service-kubernetes'
    case Connectors.CE_GCP:
      return 'service-gcp'
    default:
      return 'cog'
  }
}

export const getConnectorDisplayName = (type: string) => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return 'Kubernetes cluster'
    case Connectors.GIT:
      return 'Git'
    case Connectors.GITHUB:
      return 'GitHub'
    case Connectors.GITLAB:
      return 'GitLab'
    case Connectors.BITBUCKET:
      return 'Bitbucket'
    case Connectors.DOCKER:
      return 'Docker Registry'
    case Connectors.GCP:
      return 'GCP'
    case Connectors.APP_DYNAMICS:
      return 'AppDynamics'
    case Connectors.SPLUNK:
      return 'Splunk'
    case Connectors.NEW_RELIC:
      return 'New Relic'
    case Connectors.PROMETHEUS:
      return 'Prometheus'
    case Connectors.AWS:
      return 'AWS'
    case Connectors.AWS_CODECOMMIT:
      return 'AWS CodeCommit'
    case Connectors.NEXUS:
      return 'Nexus'
    case Connectors.LOCAL:
      return 'Local Secret Manager'
    case Connectors.VAULT:
      return 'HashiCorp Vault'
    case Connectors.GCP_KMS:
      return 'GCP KMS'
    case Connectors.SECRET_MANAGER:
      return 'Custom Secret Manager'
    case Connectors.AZUREVAULT:
      return 'Azure Vault'
    case Connectors.HttpHelmRepo:
      return 'HTTP Helm Repo'
    case Connectors.AWSSM:
      return 'AWS Secret Manager'
    case Connectors.AWS_KMS:
      return 'AWS KMS'
    case Connectors.AZURE_KEY_VAULT:
      return 'Azure Key Vault'
    case Connectors.DYNATRACE:
      return 'Dynatrace'
    case Connectors.CEAWS:
      return 'AWS'
    case Connectors.CE_AZURE:
      return 'Azure'
    case Connectors.CE_KUBERNETES:
      return 'Kubernetes'
    case Connectors.CE_GCP:
      return 'GCP'
    default:
      return ''
  }
}

export const getIconByEntityType = (type: string) => {
  switch (type) {
    case EntityTypes.PROJECT:
      return 'nav-project'
    case EntityTypes.PIPELINE:
      return 'pipeline'
    case EntityTypes.SECRET:
      return 'key-main'
    case EntityTypes.CV_CONFIG:
      return 'desktop'
    case EntityTypes.CV_K8_ACTIVITY_SOURCE:
      return 'square'
    case EntityTypes.CV_VERIFICATION_JOB:
      return 'confirm'

    default:
      return ''
  }
}

export const getReferredEntityLabelByType = (type: string) => {
  switch (type) {
    case EntityTypes.PROJECT:
      return 'Project'
    case EntityTypes.PIPELINE:
      return 'Pipeline'
    case EntityTypes.SECRET:
      return 'Secret'
    case EntityTypes.CV_CONFIG:
      return 'Monitoring Source'
    case EntityTypes.CV_K8_ACTIVITY_SOURCE:
      return 'Change Source'
    case EntityTypes.CV_VERIFICATION_JOB:
      return 'Verification Job'
    case EntityTypes.default:
      return ''
  }
}

export function GetTestConnectionValidationTextByType(type: ConnectorConfigDTO['type']) {
  const { getString } = useStrings()
  switch (type) {
    case Connectors.DOCKER:
      return getString('connectors.testConnectionStep.validationText.docker')
    case Connectors.AWS:
      return getString('connectors.testConnectionStep.validationText.aws')
    case Connectors.Jira:
      return getString('connectors.testConnectionStep.validationText.jira')
    case Connectors.NEXUS:
      return getString('connectors.testConnectionStep.validationText.nexus')
    case Connectors.ARTIFACTORY:
      return getString('connectors.testConnectionStep.validationText.artifactory')
    case Connectors.GCP:
      return getString('connectors.testConnectionStep.validationText.gcp')
    case 'Gcr':
      return getString('connectors.testConnectionStep.validationText.gcr')
    case Connectors.APP_DYNAMICS:
      return getString('connectors.testConnectionStep.validationText.appD')
    case Connectors.SPLUNK:
      return getString('connectors.testConnectionStep.validationText.splunk')
    case Connectors.VAULT:
      return getString('connectors.testConnectionStep.validationText.vault')
    case Connectors.BITBUCKET:
      return getString('connectors.testConnectionStep.validationText.bitbucket')
    case Connectors.GITLAB:
      return getString('connectors.testConnectionStep.validationText.gitlab')
    case Connectors.GITHUB:
      return getString('connectors.testConnectionStep.validationText.github')
    case Connectors.GIT:
      return getString('connectors.testConnectionStep.validationText.git')
    case Connectors.CE_AZURE:
      return getString('connectors.testConnectionStep.validationText.azure')
    case Connectors.DATADOG:
      return getString('connectors.testConnectionStep.validationText.datadog')
    case Connectors.SUMOLOGIC:
      return getString('connectors.testConnectionStep.validationText.sumologic')
    case Connectors.CE_AZURE_KEY_VAULT:
      return getString('connectors.testConnectionStep.validationText.azureKeyVault')
    default:
      return ''
  }
}
export const getUrlValueByType = (type: ConnectorInfoDTO['type'], connector: ConnectorInfoDTO): string => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return connector.spec.credential.spec?.masterUrl
    case Connectors.DOCKER:
      return connector.spec.dockerRegistryUrl
    case Connectors.NEXUS:
      return connector.spec.nexusServerUrl

    case Connectors.ARTIFACTORY:
      return connector.spec.artifactoryServerUrl

    case Connectors.APP_DYNAMICS:
      return connector.spec.controllerUrl
    case Connectors.NEW_RELIC:
      return connector.spec.url?.value
    case Connectors.PROMETHUS:
      return connector.spec.url
    case Connectors.SPLUNK:
      return connector.spec.splunkUrl
    case Connectors.DYNATRACE:
      return connector.spec.url
    case Connectors.VAULT:
      return connector.spec.vaultUrl
    case Connectors.BITBUCKET:
    case Connectors.GITLAB:
    case Connectors.GITHUB:
    case Connectors.GIT:
      return connector.spec.url

    default:
      return ''
  }
}

// No usages: enable when used
/* istanbul ignore next */
export const getInvocationPathsForSecrets = (type: ConnectorInfoDTO['type'] | 'Unknown'): Set<RegExp> => {
  switch (type) {
    case 'K8sCluster':
      return new Set([
        /^.+\.passwordRef$/,
        /^.+\.usernameRef$/,
        /^.+\.serviceAccountTokenRef$/,
        /^.+\.oidcUsernameRef$/,
        /^.+\.oidcClientIdRef$/,
        /^.+\.oidcPasswordRef$/,
        /^.+\.oidcSecretRef$/,
        /^.+\.caCertRef$/,
        /^.+\.clientCertRef$/,
        /^.+\.clientKeyRef$/,
        /^.+\.clientKeyPassphraseRef$/
      ])
    case 'DockerRegistry':
      return new Set([/^.+\.passwordRef$/, /^.+\.usernameRef$/])
    case 'Nexus':
      return new Set([/^.+\.passwordRef$/, /^.+\.usernameRef$/])
    case 'Git':
      return new Set([/^.+\.passwordRef$/, /^.+\.usernameRef$/, /^.+\.encryptedSshKey$/])
    case 'Splunk':
      return new Set([/^.+\.passwordRef$/])
    case 'AppDynamics':
      return new Set([/^.+\.passwordRef$/])
    case 'Gcp':
      return new Set([/^.+\.secretKeyRef$/])
    case 'Aws':
      return new Set([/^.+\.accessKeyRef$/, /^.+\.secretKeyRef$/])
    case 'Github':
      return new Set([
        /^.+\.usernameRef$/,
        /^.+\.passwordRef$/,
        /^.+\.tokenRef$/,
        /^.+\.sshKeyRef$/,
        /^.+\.privateKeyRef$/
      ])
    case 'Gitlab':
      return new Set([
        /^.+\.usernameRef$/,
        /^.+\.passwordRef$/,
        /^.+\.tokenRef$/,
        /^.+\.sshKeyRef$/,
        /^.+\.kerberosKeyRef$/
      ])
    case 'Bitbucket':
      return new Set([/^.+\.usernameRef$/, /^.+\.passwordRef$/, /^.+\.tokenRef$/, /^.+\.sshKeyRef$/])
    case 'Unknown':
      return new Set([/^.+\.Ref$/])
    default:
      return new Set([])
  }
}

export const removeErrorCode = (errors: ErrorDetail[] = []) => {
  errors.forEach(item => delete item.code)
  return errors
}

export const saveCurrentStepData = <T>(getCurrentStepData: StepProps<T>['getCurrentStepData'], values: T): void => {
  if (getCurrentStepData) {
    getCurrentStepData.current = () => {
      return values
    }
  }
}

export const isSMConnector = (type?: ConnectorInfoDTO['type']): boolean | undefined => {
  if (!type) return
  return (['AwsKms', 'AzureKeyVault', 'Vault'] as ConnectorInfoDTO['type'][]).includes(type)
}
