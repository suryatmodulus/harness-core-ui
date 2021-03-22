export interface TerraformData {
  delegateSelectors: string[]
  spec: {
    provisionerIdentifier: string
    configuration: {
      type: string
      spec: {
        workspace: string
        store: {
          spec: {
            gitFetchType: string
            branch?: string
            commitId?: string
            folderPath: string
            connectorRef: string
          }
        }
      }
    }
  }
}
