/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { sortStrings } from '@cf/utils/sortStrings'

describe('sortStrings', () => {
  test('it should sort all lowercase', () => {
    expect(sortStrings(['xyz', 'jkl', 'abc'])).toEqual(['abc', 'jkl', 'xyz'])
  })

  test('it should sort all uppercase', () => {
    expect(sortStrings(['XYZ', 'JKL', 'ABC'])).toEqual(['ABC', 'JKL', 'XYZ'])
  })

  test('it should sort mixed-case', () => {
    expect(sortStrings(['xyz', 'JKL', 'abc'])).toEqual(['abc', 'JKL', 'xyz'])
  })

  test('it should handle accented characters', () => {
    expect(sortStrings(['xyz', 'ÁBD', 'abc', 'âbä'])).toEqual(['âbä', 'abc', 'ÁBD', 'xyz'])
  })
})
