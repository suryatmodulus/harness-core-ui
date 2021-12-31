import { getCIPipelineStages } from '../CIPipelineStagesUtils'

describe('CIPipelineStagesUtils', () => {
  test('getCIPipelineStages works', () => {
    expect(
      getCIPipelineStages(
        {
          templateTypes: {},
          setTemplateTypes: jest.fn(),
          openTemplateSelector: jest.fn(),
          closeTemplateSelector: jest.fn()
        },
        () => ''
      )
    ).toMatchSnapshot()
  })
})
