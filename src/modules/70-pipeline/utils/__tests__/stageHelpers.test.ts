import { changeEmptyValuesToRunTimeInput } from '../stageHelpers'
import inputSetPipeline from './inputset-pipeline.json'
test('if empty values are being replaced with <+input>', () => {
  const outputCriteria = changeEmptyValuesToRunTimeInput(inputSetPipeline)

  expect(
    (outputCriteria as any).pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec
      .tag
  ).toBe('<+input>')
  expect(
    (outputCriteria as any).pipeline.stages[1].stage.spec.serviceConfig.serviceDefinition.spec.manifests[0].manifest
      .spec.store.spec.branch
  ).toBe('<+input>')
})
