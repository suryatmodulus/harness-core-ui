import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { Timeline } from '../Timeline'
import type { TimelineProps } from '../Timeline.types'
import type { TimelineSliderProps } from '../../TimelineSlider/TimelineSlider.types'

const TimelineRows: TimelineProps['timelineRows'] = [
  {
    labelName: 'Deployments',
    timelineSeries: [
      {
        type: 'scatter',
        marker: {
          fillColor: 'var(--primary-4)',
          symbol: 'diamond'
        },
        data: [
          { x: 1628750040001, y: 0 },
          { x: 1628750940001, y: 0 },
          { x: 1628751840001, y: 0 },
          { x: 1628752740001, y: 0 },
          { x: 1628753640001, y: 0 }
        ]
      }
    ]
  },
  {
    labelName: 'Infrastructure',
    timelineSeries: [
      {
        type: 'scatter',
        marker: {
          fillColor: 'var(--purple-400)',
          symbol: 'diamond'
        },
        data: [
          { x: 1628750040001, y: 0 },
          { x: 1628750940001, y: 0 },
          { x: 1628751840001, y: 0 },
          { x: 1628752740001, y: 0 },
          { x: 1628753640001, y: 0 }
        ]
      }
    ]
  },
  {
    labelName: 'Incidents',
    timelineSeries: [
      {
        type: 'scatter',
        marker: {
          fillColor: 'var(--orange-500)',
          symbol: 'diamond'
        },
        data: [
          { x: 1628750040001, y: 0 },
          { x: 1628750940001, y: 0 },
          { x: 1628751840001, y: 0 },
          { x: 1628752740001, y: 0 },
          { x: 1628753640001, y: 0 }
        ]
      }
    ]
  }
]

jest.mock(
  '@cv/components/ChangeTimeline/components/TimelineSlider/TimelineSlider',
  () => (props: TimelineSliderProps) =>
    (
      <div>
        <button
          className="sliderButton"
          onClick={() =>
            props.onSliderDragEnd?.({ endX: 200, startX: 100, endXPercentage: 0.4, startXPercentage: 0.2 })
          }
        />
      </div>
    )
)

describe('Unit tests for Timeline', () => {
  test('Ensure component renders correctly', async () => {
    const { container } = render(
      <TestWrapper>
        <Timeline
          timestamps={[
            1628750040001, 1628750940001, 1628751840001, 1628752740001, 1628753640001, 1628754540001, 1628755440001
          ]}
          timelineRows={TimelineRows}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelectorAll('[class*="timelineRow"]').length).toBe(3))
    expect(container.querySelectorAll('[class*="highcharts-point"]').length).toBe(15)
  })
})
