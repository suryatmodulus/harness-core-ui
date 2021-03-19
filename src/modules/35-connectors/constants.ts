import type {
  ConnectorInfoDTO,
  ConnectorConnectivityDetails,
  Activity,
  EntityDetail,
  ConnectorRequestBody,
  ResponseBoolean
} from 'services/cd-ng'

interface ConnectorType {
  [key: string]: ConnectorInfoDTO['type']
}
interface ConnectorStatusType {
  [key: string]: ConnectorConnectivityDetails['status']
}

interface ReferenceEntityType {
  [key: string]: EntityDetail['type']
}

interface ActivityStatusType {
  [key: string]: Activity['activityStatus']
}

export interface CreateConnectorModalProps {
  onClose: () => void
  onSuccess: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  mock?: ResponseBoolean
}

export const Connectors: ConnectorType = {
  KUBERNETES_CLUSTER: 'K8sCluster',
  GIT: 'Git',
  GITHUB: 'Github',
  GITLAB: 'Gitlab',
  BITBUCKET: 'Bitbucket',
  VAULT: 'Vault',
  APP_DYNAMICS: 'AppDynamics',
  SPLUNK: 'Splunk',
  DOCKER: 'DockerRegistry',
  GCP: 'Gcp',
  GCP_KMS: 'GcpKms',
  LOCAL: 'Local',
  AWS: 'Aws',
  AWS_CODE_COMMIT: 'Codecommit',
  NEXUS: 'Nexus',
  ARTIFACTORY: 'Artifactory',
  CEAWS: 'CEAws',
  HttpHelmRepo: 'HttpHelmRepo',
  Jira: 'Jira',
  NEW_RELIC: 'NewRelic'
}

export const ConnectorInfoText = {
  KUBERNETES_CLUSTER: 'Kubernetes',
  GIT: 'GIT',
  VAULT: 'Secret Manager',
  APP_DYNAMICS: 'AppDynamics',
  SPLUNK: 'Splunk',
  DOCKER: 'Docker',
  YAML: 'Create via YAML Builder',
  GCP: 'GCP',
  GCR: 'GCR',
  GCP_KMS: 'Secret Manager',
  LOCAL: 'Secret Manager',
  AWS: 'AWS',
  NEXUS: 'Nexus',
  ARTIFACTORY: 'Artifactory'
}
export const ConnectorStatus: ConnectorStatusType = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export const EntityTypes: ReferenceEntityType = {
  PIPELINE: 'Pipelines',
  PROJECT: 'Projects',
  CONNECTOR: 'Connectors',
  SECRET: 'Secrets',
  SERVICE: 'Service',
  ENVIRONMENT: 'Environment',
  CV_CONFIG: 'CvConfig',
  INPUT_SETS: 'InputSets'
}

export const ActivityStatus: ActivityStatusType = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
}

export const connectorUrlType = {
  ACCOUNT: 'Account',
  REPO: 'Repo'
}
