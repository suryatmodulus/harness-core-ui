import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { Timeline } from '../Timeline'
import type { TimelineProps } from '../Timeline.types'
import type { TimelineSliderProps } from '../../TimelineSlider/TimelineSlider.types'

const TimelineRows: TimelineProps['timelineRows'] = [
  {
    labelName: 'Deployments',
    data: [
      { startTime: 1628750040001, endTime: 1628750040001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628750940001, endTime: 1628750940001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628751840001, endTime: 1628751840001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628752740001, endTime: 1628752740001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628753640001, endTime: 1628753640001, icon: { height: 0, width: 12, url: '' } }
    ]
  },
  {
    labelName: 'Infrastructure',
    data: [
      { startTime: 1628750040001, endTime: 1628750040001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628750940001, endTime: 1628750940001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628751840001, endTime: 1628751840001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628752740001, endTime: 1628752740001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628753640001, endTime: 1628753640001, icon: { height: 0, width: 12, url: '' } }
    ]
  },
  {
    labelName: 'Incidents',
    data: [
      { startTime: 1628750040001, endTime: 1628750040001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628750940001, endTime: 1628750940001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628751840001, endTime: 1628751840001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628752740001, endTime: 1628752740001, icon: { height: 0, width: 12, url: '' } },
      { startTime: 1628753640001, endTime: 1628753640001, icon: { height: 0, width: 12, url: '' } }
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
  })
})
