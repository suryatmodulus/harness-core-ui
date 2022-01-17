/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import { TrialInProgressTemplate } from '../TrialInProgressTemplate'

const props = {
  title: 'Continuous Integration',
  bgImageUrl: '',
  trialInProgressProps: {
    description: 'trial in progress description',
    startBtn: {
      description: 'Create a project',
      onClick: () => true
    }
  },
  trialBannerProps: {
    module: ModuleName.CI
  }
}
describe('TrialInProgressTemplate snapshot test', () => {
  test('should render trial in progress', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <TrialInProgressTemplate {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
