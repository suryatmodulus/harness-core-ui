export const resourceTypes = {
  status: 'SUCCESS',
  data: {
    resourceTypes: [
      { name: 'ACCOUNT', validatorTypes: ['STATIC'] },
      { name: 'SECRET', validatorTypes: ['STATIC', 'DYNAMIC'] },
      { name: 'CONNECTOR', validatorTypes: ['STATIC', 'DYNAMIC'] },
      { name: 'ORGANIZATION', validatorTypes: ['STATIC', 'DYNAMIC'] },
      { name: 'PROJECT', validatorTypes: ['STATIC', 'DYNAMIC'] }
    ]
  },
  metaData: null,
  correlationId: '31eb8018-a8b5-4c6a-bf9f-2b378e020f5e'
}
export const resourceGroupDetails = {
  status: 'SUCCESS',
  data: {
    resourceGroup: {
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: null,
      projectIdentifier: null,
      identifier: 'ewrewew',
      name: 'nameewrewew',
      resourceSelectors: [{ type: 'DynamicResourceSelector', resourceType: 'ORGANIZATION' }],
      tags: {},
      description: '',
      color: '#0063f7'
    },
    createdAt: 1614689768311,
    lastModifiedAt: 1614689892647,
    harnessManaged: false
  },
  metaData: null,
  correlationId: '8e547da2-ed72-4327-a74d-874a825f8a20'
}
export const resourceGroupDetailsWithHarnessManaged = {
  status: 'SUCCESS',
  data: {
    resourceGroup: {
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: null,
      projectIdentifier: null,
      identifier: 'ewrewew',
      name: 'nameewrewew',
      resourceSelectors: [{ type: 'DynamicResourceSelector', resourceType: 'ORGANIZATION' }],
      tags: {},
      description: '',
      color: '#0063f7'
    },
    createdAt: 1614689768311,
    lastModifiedAt: 1614689892647,
    harnessManaged: true
  },
  metaData: null,
  correlationId: '8e547da2-ed72-4327-a74d-874a825f8a20'
}
