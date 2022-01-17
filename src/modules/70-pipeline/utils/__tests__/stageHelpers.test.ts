/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { changeEmptyValuesToRunTimeInput } from '../stageHelpers'
import inputSetPipeline from './inputset-pipeline.json'
test('if empty values are being replaced with <+input> except for tags', () => {
  const outputCriteria = changeEmptyValuesToRunTimeInput(inputSetPipeline, '')

  expect(
    (outputCriteria as any).pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec
      .tag
  ).toBe('<+input>')
  expect(
    (outputCriteria as any).pipeline.stages[1].stage.spec.serviceConfig.serviceDefinition.spec.manifests[0].manifest
      .spec.store.spec.branch
  ).toBe('<+input>')
  expect((outputCriteria as any).tags.Test1).toBe('')
})
