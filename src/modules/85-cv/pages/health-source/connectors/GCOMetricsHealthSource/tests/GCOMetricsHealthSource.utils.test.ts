import { getPlaceholderForIdentifier } from '../GCOMetricsHealthSource.utils'

function getString(key: string): string {
  return key
}

describe('tests for GCOMetricsHealthSource utils', () => {
  describe('getPlaceholderForIdentifier', () => {
    test('should return last 63 characters from the given text', () => {
      const testString = Array.from({ length: 100 }).fill('a').join('')
      expect(getPlaceholderForIdentifier(testString).length).toBe(63)
    })
    test('should remove the special characters except underscore', () => {
      const testString = "/.,;'[]=-!@_#$%^&*()a1"
      expect(getPlaceholderForIdentifier(testString)).toBe('_a1')
    })
    test('should give default sting when no string is provided', () => {
      expect(getPlaceholderForIdentifier('', getString)).toBe('cv.identifierPlaceholder')
    })
  })
})
