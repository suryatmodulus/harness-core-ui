import type { PipelineInfoConfig } from 'services/cd-ng'
import { isVerifyStepPresent } from '../routeUtils'
import { mockedTemplate } from './routeUtils.mock'

describe('Test for Route Utils', () => {
  test('Test if verify step is present in the pipeline or not', () => {
    expect(isVerifyStepPresent(mockedTemplate as PipelineInfoConfig)).toEqual(true)
  })
})
