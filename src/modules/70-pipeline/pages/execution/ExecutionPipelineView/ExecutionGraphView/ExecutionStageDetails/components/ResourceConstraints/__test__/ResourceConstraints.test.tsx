/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ResourceConstraintTooltip, { ResourceConstraintTooltipProps } from '../ResourceConstraints'

const getProps = (): ResourceConstraintTooltipProps => ({
  loading: false,
  data: {
    executionList: [
      {
        pipelineIdentifier: 'Some Identifier',
        planExecutionId: 'Some Plan Execution Id',
        state: 'ACTIVE'
      }
    ],
    executionId: 'Some Execution Id'
  }
})

describe('ResourceConstraintTooltip', () => {
  test('matches snapshot', () => {
    const props = getProps()
    const { container } = render(
      <TestWrapper>
        <ResourceConstraintTooltip {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
