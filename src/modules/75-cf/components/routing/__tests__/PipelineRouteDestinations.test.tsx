/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { createRenderer } from 'react-test-renderer/shallow'
import PipelineRouteDestinations from '@cf/components/routing/PipelineRouteDestinations'
import * as hooks from '@common/hooks/useFeatureFlag'

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/hooks/useFeatureFlag')

describe('PipelineRouteDestinations', () => {
  const useFeatureFlagMock = jest.spyOn(hooks, 'useFeatureFlag')

  beforeEach(() => jest.resetAllMocks())

  test('it should not return the pipeline routes when the FF_PIPELINE feature flag is false', () => {
    useFeatureFlagMock.mockReturnValue(false)

    const renderer = createRenderer()
    renderer.render(<PipelineRouteDestinations />)

    expect(renderer.getRenderOutput()).toBeNull()
  })

  test('it should return the pipeline routes when the FF_PIPELINE feature flag is true', () => {
    useFeatureFlagMock.mockReturnValue(true)

    const renderer = createRenderer()
    renderer.render(<PipelineRouteDestinations />)

    expect(renderer.getRenderOutput()).toMatchSnapshot()
  })
})
