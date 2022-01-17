/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// DD = Double Digits Label
export const zeroFiftyNineDDOptions = Array.from({ length: 60 }, (_, i) => ({
  label: i.toString().padStart(2, '0'),
  value: `${i}`
}))
export const oneFiftyNineDDOptions = zeroFiftyNineDDOptions.slice(1)
export const oneTwelveDDOptions = Array.from({ length: 12 }, (_, i) => ({
  label: (i + 1).toString().padStart(2, '0'),
  value: `${i + 1}`
}))
export const amPmOptions = [
  { label: 'AM', value: 'AM' },
  { label: 'PM', value: 'PM' }
]
