import { createSplunkHealthSourcePayload, buildSplunkHealthSourceInfo } from '../SplunkHealthSource.utils'
import { setupSource, splunkPayload, data, params } from './SplunkHealthSource.mock'

describe('Test Util functions', () => {
  test('Test CreateSplunkHealthSourcePayload', () => {
    expect(createSplunkHealthSourcePayload(setupSource)).toEqual(splunkPayload)
  })
  test('Test buildSplunkHealthSourceInfo', () => {
    expect(buildSplunkHealthSourceInfo(params, data)).toEqual(setupSource)
  })
})
