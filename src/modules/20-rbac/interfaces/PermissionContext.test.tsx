import { getStringKeyFromObjectValues, keysToCompare } from './PermissionsContext'

describe('PermissionContext', () => {
  test('getStringKeyFromObjectValues', () => {
    expect(
      getStringKeyFromObjectValues(
        {
          resourceScope: {
            accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
            orgIdentifier: 'org2'
          },
          resourceType: 'PROJECT',
          resourceIdentifier: 'asdas',
          permission: 'core_project_edit'
        },
        keysToCompare
      )
    ).toEqual('kmpySmUISimoRrJL6NL73w/org2/PROJECT/asdas/core_project_edit')
  })
})
