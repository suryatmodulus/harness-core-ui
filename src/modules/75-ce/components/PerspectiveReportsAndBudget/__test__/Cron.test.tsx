/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Cron from '../Cron'

describe('test cases for Cron component', () => {
  test('should be able to render the cron component with a given cron expression', async () => {
    const onChange = jest.fn().mockImplementationOnce(() => ({}))
    const { container, getByDisplayValue } = render(
      <TestWrapper>
        <Cron onChange={onChange} cron="30 10 11 5 ?" />
      </TestWrapper>
    )

    expect(getByDisplayValue('Yearly')).toBeDefined()
    expect(getByDisplayValue('10:30 AM')).toBeDefined()
    expect(getByDisplayValue('11th')).toBeDefined()
    expect(getByDisplayValue('May')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
