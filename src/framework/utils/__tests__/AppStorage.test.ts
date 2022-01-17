/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import AppStorage from '../AppStorage'

describe('AppStorage tests', () => {
  test('init', () => {
    AppStorage.set('sample', 'value')
    expect(AppStorage.has('sample')).toBeTruthy()
    expect(AppStorage.getAll()).toBeDefined()
    expect(AppStorage.get('sample')).toBeDefined()
    AppStorage.remove('sample')
    expect(AppStorage.has('sample')).toBeFalsy()
  })
})
