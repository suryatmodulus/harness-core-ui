/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { onBasePathChange } from '../BasePath.utils'

describe('Validate utils', () => {
  test('onBasePathChange', () => {
    expect(
      onBasePathChange('manager', 1, {
        basePathDropdown_0: { path: '', value: 'Application Infrastructure Performance' },
        basePathDropdown_1: { path: 'Application Infrastructure Performance', value: '' }
      })
    ).toEqual({
      basePathDropdown_0: {
        path: '',
        value: 'Application Infrastructure Performance'
      },
      basePathDropdown_1: {
        path: 'Application Infrastructure Performance',
        value: 'manager'
      },
      basePathDropdown_2: {
        path: 'Application Infrastructure Performance|manager',
        value: ''
      }
    })
  })
})
