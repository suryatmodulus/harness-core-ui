/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
