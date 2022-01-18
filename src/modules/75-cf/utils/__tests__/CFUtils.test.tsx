/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Feature } from 'services/cf'
import * as CFUtils from '../CFUtils'

describe('CFUtils', () => {
  test('CFUtils utilities', async () => {
    expect(CFUtils.formatTime(1619411395654)).toEqual('4:29 AM')
    expect(CFUtils.formatDate(1619411395654)).toEqual('Apr 26, 2021')
    expect(CFUtils.isFeatureFlagOn({ envProperties: { state: 'on' } } as Feature)).toEqual(true)
    expect(CFUtils.isFeatureFlagOn({ envProperties: { state: 'off' } } as Feature)).toEqual(false)
    expect(
      CFUtils.featureFlagHasCustomRules({ envProperties: { rules: [{ ruleId: '1', priority: 1 }] } } as Feature)
    ).toEqual(true)
    expect(
      CFUtils.featureFlagHasCustomRules({ envProperties: { variationMap: [{ variation: 'true' }] } } as Feature)
    ).toEqual(true)
    expect(CFUtils.featureFlagHasCustomRules({ envProperties: { rules: [] } } as unknown as Feature)).toEqual(false)
    expect(CFUtils.featureFlagHasCustomRules({ envProperties: {} } as Feature)).toEqual(false)
    expect(CFUtils.featureFlagHasCustomRules({ envProperties: { variationMap: [] } } as unknown as Feature)).toEqual(
      false
    )
  })

  describe('formatToCompactNumber', () => {
    test('it should format numbers correctly', async () => {
      expect(CFUtils.formatToCompactNumber(10)).toEqual('10')
      expect(CFUtils.formatToCompactNumber(100)).toEqual('100')
      expect(CFUtils.formatToCompactNumber(1000)).toEqual('1K')
      expect(CFUtils.formatToCompactNumber(10000)).toEqual('10K')
      expect(CFUtils.formatToCompactNumber(100000)).toEqual('100K')
      expect(CFUtils.formatToCompactNumber(1000000)).toEqual('1M')
      expect(CFUtils.formatToCompactNumber(10000000)).toEqual('10M')
      expect(CFUtils.formatToCompactNumber(100000000)).toEqual('100M')
    })
  })
})
