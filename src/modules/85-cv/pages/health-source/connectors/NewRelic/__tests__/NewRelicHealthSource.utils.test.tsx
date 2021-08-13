import type { StringKeys } from 'framework/strings'
import { createNewRelicData } from '../NewRelicHealthSourceContainer.util'
import { validateNewRelic } from '../NewRelicHealthSource.utils'
import {
  sourceData,
  expectedNewRelicData,
  validationMissingApplication,
  validationMissingMetricData,
  validationValidPayload
} from './NewRelic.mock'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Test Newrelic Utils', () => {
  test('Verify createNewRelicData', () => {
    expect(createNewRelicData(sourceData)).toEqual(expectedNewRelicData)
  })

  test('Verify validate function', () => {
    expect(validateNewRelic(validationMissingApplication, getString)).toEqual({
      newRelicApplication: 'cv.healthSource.connectors.AppDynamics.validation.application'
    })
    expect(validateNewRelic(validationMissingMetricData, getString)).toEqual({
      metricData: 'cv.monitoringSources.appD.validations.selectMetricPack'
    })
    expect(validateNewRelic(validationValidPayload, getString)).toEqual({})
  })
})
