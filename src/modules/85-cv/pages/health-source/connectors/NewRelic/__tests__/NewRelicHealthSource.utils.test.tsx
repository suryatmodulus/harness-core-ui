import { createNewRelicData } from '../NewRelicHealthSourceContainer.util'
import { sourceData, expectedNewRelicData } from './NewRelic.mock'

describe('Test Newrelic Utils', () => {
  test('Verify createNewRelicData', () => {
    expect(createNewRelicData(sourceData)).toEqual(expectedNewRelicData)
  })
})
