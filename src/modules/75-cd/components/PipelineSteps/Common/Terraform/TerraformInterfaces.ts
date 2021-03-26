import type { Scope } from '@common/interfaces/SecretsInterface'
import type { StepElementConfig } from 'services/cd-ng'

interface VarFileArray {
  type?: string
  store?: {
    spec?: {
      gitFetchType?: string
      branch?: string
      commitId?: string
      connectorRef?: string
      paths?: string[]
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
