import type { IconName } from '@wings-software/uicore'
import { Connectors } from '@connectors/constants'
import { StringUtils } from '@common/exports'
import type { StringKeys } from 'framework/strings'

export const AuthTypes = {
  CLIENT_KEY_CERT: 'ClientKeyCert',
  USER_PASSWORD: 'UsernamePassword',
  SERVICE_ACCOUNT: 'ServiceAccount',
  OIDC: 'OpenIdConnect',
  ANNONYMOUS: 'Anonymous'
}

export const GitAuthTypes = {
  USER_PASSWORD: 'UsernamePassword',
  USER_TOKEN: 'UsernameToken',
  KERBEROS: 'Kerberos'
}

export const GitAPIAuthTypes = {
  GITHUB_APP: 'GithubApp',
  TOKEN: 'Token'
}

export const dockerProviderTypes = {
  CLIENT_KEY_CERT: 'ClientKeyCert',
  USER_PASSWORD: 'UsernamePassword',
  SERVICE_ACCOUNT: 'ServiceAccount',
  OIDC: 'OpenIdConnect',
  ANNONYMOUS: 'Anonymous'
}

export const getKubInitialValues = () => {
  return {
    type: 'KUBERNETES_CLUSTER',
    name: 'NAME',
    description: '',
    identifier: '',
    tags: {},
    delegateMode: '',
    credentialType: '',
    credential: {
      masterUrl: '',
      manualCredentialType: '',
      manualCredentials: {
        userName: '',
        encryptedPassword: ''
      }
    }
  }
}

export const getHeadingIdByType = (type: string): StringKeys => {
  switch (type) {
    case Connectors.VAULT:
      return 'connectors.hashicorpVaultDetails'
    case Connectors.GCP_KMS:
    case Connectors.LOCAL:
      return 'connectors.secretManagerDetails'
    case Connectors.APP_DYNAMICS:
      return 'connectors.appDynamicsDetails'
    case Connectors.SPLUNK:
      return 'connectors.splunkConnectorDetails'
    case 'Gcr':
      return 'connectors.gcrConnectorDetails'
    default:
      return 'overview'
  }
}

export const getConnectorTitleIdByType = (type: string): StringKeys => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
      return 'connectors.title.k8sCluster'
    case Connectors.HttpHelmRepo:
      return 'connectors.title.helmConnector'
    case Connectors.GIT:
      return 'connectors.title.gitConnector'
    case Connectors.GITHUB:
      return 'connectors.title.githubConnector'
    case Connectors.GITLAB:
      return 'connectors.title.gitlabConnector'
    case Connectors.BITBUCKET:
      return 'connectors.title.bitbucketConnector'
    case Connectors.VAULT:
      return 'connectors.title.hashicorpVault'
    case Connectors.GCP_KMS:
    case Connectors.LOCAL:
      return 'connectors.title.secretManager'
    case Connectors.APP_DYNAMICS:
      return 'connectors.title.appdynamics'
    case Connectors.SPLUNK:
      return 'connectors.title.splunk'
    case Connectors.DOCKER:
      return 'dockerRegistry'
    case Connectors.CEAWS:
      return 'connectors.title.ceAws'
    case Connectors.AWS:
      return 'connectors.title.aws'
    case Connectors.AWS_CODECOMMIT:
      return 'connectors.title.awsCodeCommit'
    case Connectors.NEXUS:
      return 'connectors.title.nexus'
    case Connectors.Jira:
      return 'connectors.title.jira'
    case Connectors.ARTIFACTORY:
      return 'connectors.title.artifactory'
    case Connectors.GCP:
      return 'connectors.title.gcpConnector'
    case 'Gcr':
      return 'connectors.GCR.fullName'
    case Connectors.AWS_KMS:
      return 'connectors.title.awsKms'
    case Connectors.CE_AZURE:
      return 'connectors.title.ceAzureConnector'
    case Connectors.DATADOG:
      return 'connectors.title.datadog'
    case Connectors.SUMOLOGIC:
      return 'connectors.title.sumologic'
    case Connectors.AZURE_KEY_VAULT:
      return 'connectors.title.azureKeyVault'
    default:
      return 'connector'
  }
}

export const getConnectorIconByType = (type: string): IconName => {
  switch (type) {
    case Connectors.KUBERNETES_CLUSTER:
    case Connectors.CE_KUBERNETES:
      return 'app-kubernetes'
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
    case Connectors.VAULT:
      return 'hashiCorpVault'
    case Connectors.GCP_KMS:
    case Connectors.LOCAL:
      return 'lock'
    case Connectors.APP_DYNAMICS:
      return 'service-appdynamics'
    case Connectors.SPLUNK:
      return 'service-splunk'
    case Connectors.NEW_RELIC:
      return 'service-newrelic'
    case Connectors.PROMETHEUS:
      return 'service-prometheus'
    case Connectors.DYNATRACE:
      return 'service-dynatrace'
    case Connectors.DOCKER:
    case 'Dockerhub':
      return 'service-dockerhub'
    case Connectors.AWS:
      return 'service-aws'
    case Connectors.AWS_CODECOMMIT:
      return 'service-aws-code-deploy'
    case Connectors.NEXUS:
      return 'service-nexus'
    case Connectors.ARTIFACTORY:
      return 'service-artifactory'
    case Connectors.Jira:
      return 'service-jira'
    case Connectors.GCP:
    case Connectors.CE_GCP:
    case 'Gcr':
      return 'service-gcp'
    case Connectors.AWS_KMS:
      return 'aws-kms'
    case Connectors.CE_AZURE:
      return 'service-azure'
    case Connectors.DATADOG:
      return 'service-datadog'
    case Connectors.AZURE_KEY_VAULT:
      return 'azure-key-vault'
    case Connectors.SUMOLOGIC:
      return 'service-sumologic'
    case Connectors.CEAWS:
      return 'service-aws'
    default:
      return 'placeholder'
  }
}

export const generateDefaultSecretConfig = (name: string, type: string) => {
  return StringUtils.getIdentifierFromName(name || '').concat(type)
}

export const getLabelForAuthType = (type: string) => {
  switch (type) {
    case AuthTypes.USER_PASSWORD:
      return 'Username and Password'
    case AuthTypes.SERVICE_ACCOUNT:
      return 'Service Account Token'
    case AuthTypes.OIDC:
      return 'OIDC Token'
    case AuthTypes.CLIENT_KEY_CERT:
      return 'Client Key Certificate'
    default:
      return ''
  }
}
