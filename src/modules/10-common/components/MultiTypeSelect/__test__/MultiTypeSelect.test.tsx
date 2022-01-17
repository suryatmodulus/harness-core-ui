/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MultiTypeSelectField } from '../MultiTypeSelect'

describe('<MultiTypeSelect /> tests', () => {
  test('Should render properly', () => {
    const { container } = render(
      <MultiTypeSelectField
        name="test"
        label=""
        multiTypeInputProps={{
          selectItems: []
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
