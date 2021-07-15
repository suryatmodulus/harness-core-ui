import { getMonthIncrements } from '../ActivityTimelineScrubberUtils'

describe('Unit tests for ActivityTimelineScrubber', () => {
  test('Ensure that for different inputs, getMonthIncrements returns correct value', async () => {
    // August - December
    expect(getMonthIncrements(1608883200000, 1598338800000)).toEqual([
      1606780800000, 1604188800000, 1601510400000, 1598918400000, 1598338800000
    ])
    // Mar - Sept
    expect(getMonthIncrements(1583996400000, 1568271600000)).toEqual([
      1583020800000, 1580515200000, 1577836800000, 1575158400000, 1572566400000, 1569888000000, 1568271600000
    ])
    expect(getMonthIncrements(1577865600000, 1568271600000)).toEqual([
      1577836800000, 1575158400000, 1572566400000, 1569888000000, 1568271600000
    ])
    expect(getMonthIncrements(1577865600000, 1578816000000)).toEqual([1577836800000])
    expect(getMonthIncrements(1582617600000, 1578816000000)).toEqual([1580515200000, 1578816000000])
  })
})
