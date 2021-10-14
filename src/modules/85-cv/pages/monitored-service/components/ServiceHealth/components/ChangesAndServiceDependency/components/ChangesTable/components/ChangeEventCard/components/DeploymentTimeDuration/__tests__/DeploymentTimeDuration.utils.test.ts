import { durationAsString } from '../DeploymentTimeDuration.utils'

describe('Validate utils', () => {
  const getHoursInMilliseconds = (hours: number) => hours * 60 * 60 * 1000
  const getMinutesInMilliseconds = (mins: number) => mins * 60 * 1000
  test('should validate durationAsString', () => {
    const endTime = 1634108599063
    const threeHoursAgo = endTime - getHoursInMilliseconds(3)
    const twelveHours30minAgo = endTime - getHoursInMilliseconds(12) - getMinutesInMilliseconds(30)
    const oneDay6hoursAgo = endTime - getHoursInMilliseconds(30)
    expect(durationAsString(threeHoursAgo, endTime)).toEqual('3h ')
    expect(durationAsString(twelveHours30minAgo, endTime)).toEqual('12h 30m ')
    expect(durationAsString(oneDay6hoursAgo, endTime)).toEqual('1d 6h ')
  })
})
