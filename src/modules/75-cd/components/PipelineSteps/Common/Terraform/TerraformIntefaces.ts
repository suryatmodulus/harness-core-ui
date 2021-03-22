import type { StepElementConfig } from 'services/cd-ng'

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
      }
    }
  }
}
