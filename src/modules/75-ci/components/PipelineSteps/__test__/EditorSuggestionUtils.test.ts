import type { ConnectorInfoDTO } from 'services/cd-ng'
import { getConnectorName, getConnectorValue, getConnectorSuggestions } from '../EditorSuggestionUtils'

const mockConnectorResponse = (project?: string, org?: string) => ({
  connector: {
    name: 'testConnectorName',
    identifier: 'testConnectorIdentifier',
    description: '',
    orgIdentifier: org,
    projectIdentifier: project,
    tags: {},
    type: 'Github' as ConnectorInfoDTO['type'],
    spec: {
      url: 'testurl',
      authentication: {
        type: 'Http',
        spec: {
          type: 'UsernamePassword',
          spec: {
            username: 'testUsername',
            usernameRef: null,
            passwordRef: 'secret1'
          }
        }
      },
      apiAccess: null,
      type: 'Repo'
    }
  }
})

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  getConnectorListV2Promise: () =>
    Promise.resolve({
      data: {
        content: [mockConnectorResponse('proj', 'CV')]
      }
    })
}))

describe('EditorSuggestionUtils', () => {
  test('getConnectorName works as expected', () => {
    expect(getConnectorName(mockConnectorResponse('Proj1', 'CV'))).toEqual('Github: testConnectorName')
    expect(getConnectorName(mockConnectorResponse(undefined, 'CV'))).toEqual('Github[Org]: testConnectorName')
    expect(getConnectorName(mockConnectorResponse(undefined, undefined))).toEqual('Github[Account]: testConnectorName')
    expect(getConnectorName()).toBeTruthy()
    expect(getConnectorName({})).toBeTruthy()
  })

  test('getConnectorValue works as expected', () => {
    expect(getConnectorValue(mockConnectorResponse('Proj1', 'CV'))).toEqual('testConnectorIdentifier')
    expect(getConnectorValue(mockConnectorResponse(undefined, 'CV'))).toEqual('org.testConnectorIdentifier')
    expect(getConnectorValue(mockConnectorResponse(undefined, undefined))).toEqual('account.testConnectorIdentifier')
    expect(getConnectorValue()).toBeTruthy()
    expect(getConnectorValue({})).toBeTruthy()
  })

  test('getConnectorSuggestions works as expected', async () => {
    const response = await getConnectorSuggestions({}, ['Github'])
    expect(response[0]).toMatchObject({
      label: 'Github: testConnectorName',
      insertText: 'testConnectorIdentifier',
      kind: 5
    })
  })
})
