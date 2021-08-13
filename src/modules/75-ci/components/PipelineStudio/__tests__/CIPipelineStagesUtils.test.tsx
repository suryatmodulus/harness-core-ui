import { getCIPipelineStages } from '../CIPipelineStagesUtils'

describe('CIPipelineStagesUtils', () => {
  test('getCIPipelineStages works', () => {
    expect(getCIPipelineStages({}, () => '')).toMatchSnapshot()
  })
})
