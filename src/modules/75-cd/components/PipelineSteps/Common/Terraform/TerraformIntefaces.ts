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
  spec: {
    provisionerIdentifier: string
    configuration: {
      type: string
      spec?: {
        workspace?: string
        store?: {
          spec?: {
            gitFetchType?: string
            branch?: string
            commitId?: string
            folderPath?: string
            connectorRef?: string
          }
        }
        varFiles?: VarFileArray[]
      }
    }
  }
}
