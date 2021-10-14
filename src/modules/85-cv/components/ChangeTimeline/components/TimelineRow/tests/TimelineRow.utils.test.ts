import { getDataWithPositions } from '../TimelineRow.utils'
import { series } from './TimelineRow.mock'
describe('unit tests for TimelineRow utils', () => {
  test('Ensure getDataWithPositions returns correct values', async () => {
    expect(getDataWithPositions(1250, series[0].startTime, series[series.length - 1].startTime, series)).toEqual([
      {
        endTime: 1628750040001,
        icon: {
          fillColor: 'var(--red-500)',
          height: 12,
          url: 'diamond',
          width: 12
        },
        leftOffset: 0,
        startTime: 1628750040001,
        tooltip: undefined
      },
      {
        endTime: 1628750940001,
        icon: {
          fillColor: 'var(--green-500)',
          height: 12,
          url: 'diamond',
          width: 12
        },
        leftOffset: 124.99999999999997,
        startTime: 1628750940001,
        tooltip: undefined
      },
      {
        endTime: 1628751840001,
        icon: {
          fillColor: 'var(--yellow-500)',
          height: 12,
          url: 'diamond',
          width: 12
        },
        leftOffset: 249.99999999999994,
        startTime: 1628751840001,
        tooltip: undefined
      },
      {
        endTime: 1628752740001,
        icon: {
          fillColor: 'var(--orange-500)',
          height: 12,
          url: 'diamond',
          width: 12
        },
        leftOffset: 375.00000000000006,
        startTime: 1628752740001,
        tooltip: undefined
      },
      {
        endTime: 1628753640001,
        icon: {
          fillColor: 'var(--red-500)',
          height: 12,
          url: 'diamond',
          width: 12
        },
        leftOffset: 500,
        startTime: 1628753640001,
        tooltip: undefined
      },
      {
        endTime: 1628754540001,
        icon: {
          fillColor: 'var(--red-500)',
          height: 12,
          url: 'diamond',
          width: 12
        },
        leftOffset: 625,
        startTime: 1628754540001,
        tooltip: undefined
      },
      {
        endTime: 1628755440001,
        icon: {
          fillColor: 'var(--red-500)',
          height: 12,
          url: 'diamond',
          width: 12
        },
        leftOffset: 750,
        startTime: 1628755440001,
        tooltip: undefined
      },
      {
        endTime: 1628756340001,
        icon: {
          fillColor: 'var(--red-500)',
          height: 12,
          url: 'diamond',
          width: 12
        },
        leftOffset: 875,
        startTime: 1628756340001,
        tooltip: undefined
      },
      {
        endTime: 1628757240001,
        icon: {
          fillColor: 'var(--red-500)',
          height: 12,
          url: 'diamond',
          width: 12
        },
        leftOffset: 1000,
        startTime: 1628757240001,
        tooltip: undefined
      },
      {
        endTime: 1628758140001,
        icon: {
          fillColor: 'var(--red-500)',
          height: 12,
          url: 'diamond',
          width: 12
        },
        leftOffset: 1125,
        startTime: 1628758140001,
        tooltip: undefined
      },
      {
        endTime: 1628759040001,
        icon: {
          fillColor: 'var(--red-500)',
          height: 12,
          url: 'diamond',
          width: 12
        },
        leftOffset: 1250,
        startTime: 1628759040001,
        tooltip: undefined
      }
    ])
  })
})
