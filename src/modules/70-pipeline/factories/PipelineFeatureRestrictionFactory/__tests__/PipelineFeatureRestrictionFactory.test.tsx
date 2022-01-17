/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { render } from '@testing-library/react'
import * as useFeaturesLib from '@common/hooks/useFeatures'
import { TestWrapper } from '@common/utils/testUtils'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { PipelineFeatureLimitBreachedBanner } from '../PipelineFeatureRestrictionFactory'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useParams: jest.fn()
}))

describe('CD MODULE', () => {
  beforeAll(() => {
    const moduleName = 'cd'
    ;(useParams as jest.Mock).mockReturnValue({ module: moduleName, accountId: 'accountId' })
  })

  test('banner if service limit exceeds', () => {
    jest.spyOn(useFeaturesLib, 'useFeature').mockReturnValue({
      enabled: true,
      featureDetail: { featureName: FeatureIdentifier.SERVICES, enabled: true, moduleType: 'CD', count: 5, limit: 4 }
    })
    const { container } = render(
      <TestWrapper>
        <PipelineFeatureLimitBreachedBanner module="cd" featureIdentifier={FeatureIdentifier.SERVICES} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('service limit exceeded')
  })

  test('basic if service limit is in warning', () => {
    jest.spyOn(useFeaturesLib, 'useFeature').mockReturnValue({
      enabled: true,
      featureDetail: { featureName: FeatureIdentifier.SERVICES, enabled: true, moduleType: 'CD', count: 9, limit: 10 }
    })
    const { container } = render(
      <TestWrapper>
        <PipelineFeatureLimitBreachedBanner module="cd" featureIdentifier={FeatureIdentifier.SERVICES} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('service warning')
  })

  test('no banner', () => {
    jest.spyOn(useFeaturesLib, 'useFeature').mockReturnValue({
      enabled: true,
      featureDetail: { featureName: FeatureIdentifier.SERVICES, enabled: true, moduleType: 'CD', count: 5, limit: 10 }
    })
    const { container } = render(
      <TestWrapper>
        <PipelineFeatureLimitBreachedBanner module="cd" featureIdentifier={FeatureIdentifier.SERVICES} />
      </TestWrapper>
    )
    expect(container).toMatchInlineSnapshot('<div />')
  })

  test('no banner for unsupportd features', () => {
    jest.spyOn(useFeaturesLib, 'useFeature').mockReturnValue({
      enabled: true,
      featureDetail: { featureName: FeatureIdentifier.SERVICES, enabled: true, moduleType: 'CD', count: 5, limit: 10 }
    })
    const { container } = render(
      <TestWrapper>
        <PipelineFeatureLimitBreachedBanner module="cd" featureIdentifier={FeatureIdentifier.TERRAFORM_APPLY} />
      </TestWrapper>
    )
    expect(container).toMatchInlineSnapshot('<div />')
  })
})

describe('CI MODULE', () => {
  beforeAll(() => {
    const moduleName = 'ci'
    ;(useParams as jest.Mock).mockReturnValue({ module: moduleName, accountId: 'accountId' })
  })

  test('no banner because service enforcement is disabled in CI', () => {
    jest.spyOn(useFeaturesLib, 'useFeature').mockReturnValue({
      enabled: true,
      featureDetail: { featureName: FeatureIdentifier.SERVICES, enabled: true, moduleType: 'CD', count: 5, limit: 10 }
    })
    const { container } = render(
      <TestWrapper>
        <PipelineFeatureLimitBreachedBanner module="cd" featureIdentifier={FeatureIdentifier.SERVICES} />
      </TestWrapper>
    )
    expect(container).toMatchInlineSnapshot('<div />')
  })
})
