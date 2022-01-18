/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ErrorsStrip } from '../ErrorsStrip'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))

describe('ErrorsStrip', () => {
  test('ErrorsStrip', () => {
    const { container } = render(
      <TestWrapper>
        <ErrorsStrip formErrors={{ name: 'required' }} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
