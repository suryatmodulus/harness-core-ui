import type { Intent, SelectOption } from '@wings-software/uicore'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ConnectorRequestBody,
  VaultMetadataRequestSpecDTO
} from 'services/cd-ng'

export interface KubFormData {
  name?: string
  description?: string
  identifier?: string
  tags?: string[]
  delegateType?: string
  delegateName?: string
  masterUrl?: string
  authType?: string | number | symbol
  username?: string
  passwordRef?: string
}
export interface GITFormData {
  name?: string
  description?: string
  identifier?: string
  tags?: string[]
  authType?: string | number | symbol
  branchName?: string
  connectType?: string | number | symbol
  connectionType?: string
  password?: string
  username?: string
  url?: string
}
export interface FormData {
  [key: string]: any
}
export interface StepDetails {
  step: number
  intent: Intent
  status: string
}
export enum CredTypeValues {
  ManualConfig = 'ManualConfig',
  AssumeIAMRole = 'AssumeIAMRole',
  AssumeRoleSTS = 'AssumeSTSRole'
}

export enum HashiCorpVaultAccessTypes {
  APP_ROLE = 'APP_ROLE',
  TOKEN = 'TOKEN',
  VAULT_AGENT = 'VAULT_AGENT'
}

export interface AwsKmsConfigFormData {
  accessKey?: SecretReference
  secretKey?: SecretReference
  awsArn?: SecretReference
  region?: string | SelectOption
  credType?: string | SelectOption
  delegate?: string[]
  roleArn?: string
  externalName?: string
  assumeStsRoleDuration?: string
  default: boolean
}

export interface StepDetailsProps extends ConnectorInfoDTO {
  name: string
}

export interface ConnectorDetailsProps {
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

export interface AwsSecretManagerConfigFormData {
  accessKey?: SecretReference
  secretKey?: SecretReference
  secretNamePrefix?: string
  region?: string | SelectOption
  credType?: string | SelectOption
  delegate?: string[]
  roleArn?: string
  externalId?: string
  assumeStsRoleDuration?: string
  default: boolean
}
export interface VaultConfigFormData {
  vaultUrl: string
  basePath: string
  namespace?: string
  readOnly: boolean
  default: boolean
  accessType: VaultMetadataRequestSpecDTO['accessType']
  appRoleId?: string
  secretId?: SecretReference
  authToken?: SecretReference
  sinkPath?: string
  renewalIntervalMinutes: number
}

export interface SetupEngineFormData {
  engineType?: 'fetch' | 'manual'
  secretEngine?: string
  secretEngineName?: string
  secretEngineVersion?: number
}
