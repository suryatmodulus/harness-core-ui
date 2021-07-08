import moment from 'moment'
import { TimeRangeType } from '@ce/types'

export const todayInUTC = () => moment.utc()
export const yesterdayInUTC = () => moment().utc().subtract(1, 'days')

export const GET_DATE_RANGE = {
  [TimeRangeType.LAST_7]: [todayInUTC().subtract(6, 'days').startOf('day').format(), todayInUTC().format()],
  [TimeRangeType.LAST_30]: [
    todayInUTC().subtract(30, 'days').startOf('day').format(),
    todayInUTC().subtract(1, 'days').format()
  ]
}

export const CE_DATE_FORMAT_INTERNAL = 'YYYY-MM-DD'

export const DATE_RANGE_SHORTCUTS = {
  LAST_7_DAYS: [todayInUTC().subtract(6, 'days').startOf('day'), yesterdayInUTC().endOf('day')],
  LAST_30_DAYS: [todayInUTC().subtract(30, 'days').startOf('day'), todayInUTC().endOf('day')],
  CURRENT_MONTH: [todayInUTC().startOf('month').startOf('day'), todayInUTC().endOf('day')],
  THIS_YEAR: [todayInUTC().startOf('year'), todayInUTC().endOf('day')],
  LAST_MONTH: [todayInUTC().subtract(1, 'month').startOf('month'), todayInUTC().subtract(1, 'month').endOf('month')],
  LAST_YEAR: [todayInUTC().subtract(1, 'year').startOf('year'), todayInUTC().subtract(1, 'year').endOf('year')],
  LAST_3_MONTHS: [
    todayInUTC().subtract(4, 'months').startOf('month'),
    todayInUTC().subtract(1, 'month').endOf('month')
  ],
  LAST_6_MONTHS: [
    todayInUTC().subtract(7, 'months').startOf('month'),
    todayInUTC().subtract(1, 'month').endOf('month')
  ],
  LAST_12_MONTHS: [
    todayInUTC().subtract(13, 'months').startOf('month'),
    todayInUTC().subtract(1, 'month').endOf('month')
  ],
  THIS_QUARTER: [todayInUTC().startOf('quarter'), todayInUTC().endOf('day')],
  LAST_QUARTER: [
    todayInUTC().subtract(1, 'quarter').startOf('quarter'),
    todayInUTC().subtract(1, 'quarter').endOf('quarter')
  ]
}

export enum DATE_RANGE_SHORTCUTS_NAME {
  'LAST_7_DAYS',
  'LAST_30_DAYS',
  'CURRENT_MONTH',
  'THIS_YEAR',
  'LAST_MONTH',
  'LAST_YEAR',
  'LAST_3_MONTHS',
  'LAST_6_MONTHS',
  'LAST_12_MONTHS',
  'THIS_QUARTER',
  'LAST_QUARTER',
  'CUSTOM'
}
