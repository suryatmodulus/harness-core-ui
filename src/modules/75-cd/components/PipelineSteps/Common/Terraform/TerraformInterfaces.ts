import type { Scope } from '@common/interfaces/SecretsInterface'
import type { StepElementConfig } from 'services/cd-ng'

export interface PathInterface {
  path: string
}

export interface EnvironmentVar {
  key: string
  value: string
}

export interface BackendConfig {
  content?: string
}
export interface VarFileArray {
  type?: string
  store?: {
    spec?: {
      gitFetchType?: string
      branch?: string
      commitId?: string
      connectorRef?: {
        label: string
        scope: Scope
        value: string
      }
      paths?: PathInterface[]
      content?: string
    }
  }
}
export interface TerraformData extends StepElementConfig {
  delegateSelectors: string[]
  spec?: {
    provisionerIdentifier?: string
    configuration?: {
      type?: string
      spec?: {
        workspace?: string
        configFiles?: {
          store?: {
            type: string
            spec?: {
              gitFetchType?: string
              branch?: string
              commitId?: string
              folderPath?: string
              connectorRef?: {
                label: string
                scope: Scope
                value: string
              }
            }
          }
        }
        varFiles?: VarFileArray[]
      }
    }
    backendConfig?: BackendConfig
    targets?: string[]
    environmentVariables?: EnvironmentVar[]
  }
}

export interface TfVar {
  type?: string
  connectorRef?: {
    label: string
    scope: Scope
    value: string
  }
  gitFetchType?: string
  branch?: string
  commitId?: string
  paths?: string[]
}
