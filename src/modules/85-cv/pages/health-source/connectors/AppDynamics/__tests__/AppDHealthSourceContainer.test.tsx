import { createAppDynamicsData } from '../AppDHealthSource.utils'
import { sourceData, expectedAppDynamicData } from './AppDMonitoredSource.mock'

describe('Test Newrelic Utils', () => {
  test('Verify createNewRelicData', () => {
    expect(createAppDynamicsData(sourceData)).toEqual(expectedAppDynamicData)
  })
})
