export const ConnectorResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'connectorRef',
        identifier: 'connectorRef',
        description: '',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'master',
              auth: { type: 'UsernamePassword', spec: { username: 'usr', passwordRef: 'account.test' } }
            }
          }
        }
      }
    }
  }
}
