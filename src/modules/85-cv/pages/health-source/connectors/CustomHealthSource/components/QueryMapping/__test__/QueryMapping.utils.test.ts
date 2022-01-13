import { Scope } from '@common/interfaces/SecretsInterface'
import { connectorParams } from '../QueryMapping.utils'

const identifierInfo = {
  projectIdentifier: 'projIdentifier',
  orgIdentifier: 'orgIdentifier',
  accountId: 'accIdentifier'
}
const identifier = 'identifier'
const accountIdentifier = `${Scope.ACCOUNT}.${identifier}`
const orgIdentifier = `${Scope.ORG}.${identifier}`
describe('Test suite for connector params', () => {
  test('it should return account id info in query params if type is account', () => {
    expect(connectorParams(accountIdentifier, identifierInfo)).toMatchObject({
      identifier,
      queryParams: {
        accountIdentifier: identifierInfo.accountId
      }
    })
  })

  test('it should return account id, org id info in query params if type is org', () => {
    expect(connectorParams(orgIdentifier, identifierInfo)).toMatchObject({
      identifier,
      queryParams: {
        accountIdentifier: identifierInfo.accountId,
        orgIdentifier: identifierInfo.orgIdentifier
      }
    })
  })

  test('it should return account id, org id and project id info in query params if type is project', () => {
    expect(connectorParams(identifier, identifierInfo)).toMatchObject({
      identifier,
      queryParams: {
        accountIdentifier: identifierInfo.accountId,
        orgIdentifier: identifierInfo.orgIdentifier,
        projectIdentifier: identifierInfo.projectIdentifier
      }
    })
  })
})
