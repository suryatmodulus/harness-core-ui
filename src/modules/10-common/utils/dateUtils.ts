/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'

export const formatDatetoLocale = (date: number | string): string => {
  return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`
}

export const getReadableDateTime = (timestamp?: number, formatString = 'MMM DD, YYYY'): string => {
  if (!timestamp) {
    return ''
  }
  return moment(timestamp).format(formatString)
}
