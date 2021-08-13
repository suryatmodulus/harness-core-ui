import { ModuleName } from 'framework/types/ModuleName'
import { getModuleTitle } from '../utils'

describe('Testcase for utils', () => {
  test('Validate getModuleTitle', () => {
    expect(getModuleTitle(ModuleName.CV)).toEqual('projectsOrgs.purposeList.change')
    expect(getModuleTitle(ModuleName.CD)).toEqual('projectsOrgs.purposeList.continuous')
  })
})
