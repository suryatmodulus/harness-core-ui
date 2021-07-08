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
})
