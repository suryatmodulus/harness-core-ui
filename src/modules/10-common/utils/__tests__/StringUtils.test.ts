import { getEntityNameFromType } from '../StringUtils'

describe('Test StringUtils', () => {
  test('Test getEntityNameFromType method', () => {
    expect(getEntityNameFromType('Connectors')).toBe('connector')
    expect(getEntityNameFromType('Pipelines')).toBe('pipeline')
    expect(getEntityNameFromType(undefined)).toBe('')
  })
})
