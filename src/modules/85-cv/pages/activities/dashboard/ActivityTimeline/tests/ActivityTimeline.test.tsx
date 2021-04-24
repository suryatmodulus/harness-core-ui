import React from 'react'
import moment from 'moment'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ActivityTimeline, ActivityTimelineViewProps } from '../ActivityTimeline'

jest.mock('../LineFromSelectedActivityCard/LineFromSelectedActivityCard', () => ({
  LineFromSelectedActivityCard() {
    return (
      <div className="mockedLineComponent">
        <p>Mocked Line Component</p>
      </div>
    )
  }
}))

jest.mock('../SelectedActivitySummaryCard/SelectedActivitySummaryCard', () => ({
  SelectedActivitySummaryCard() {
    return (
      <div className="mockedSelectedSummaryCard">
        <p>Mocked Selected Card</p>
      </div>
    )
  }
}))

jest.mock('../ActivityTrack/ActivityTrack', () => ({
  ActivityTrack(props: { onActivityClick: (o: any) => void }) {
    return (
      <div className="mockedActivityTrack">
        <p>Mocked Activity Track</p>
        <button className="activityCardButton" onClick={() => props.onActivityClick({})}></button>
      </div>
    )
  }
}))

jest.mock('../ActivityTimelineScrubber/ActivityTimelineScrubber', () => ({
  ActivityTimelineScrubber() {
    return <div />
  }
}))

jest.mock('../ActivityTimelineIntervalMarker/ActivityTimelineIntervalMarker', () => {
  const MockedTimelineMarker = () => (
    <div className="mockedTimelineMarker">
      <p>Mocked timeline marker</p>
    </div>
  )
  return MockedTimelineMarker
})

const timelineStartTime = Date.now()
const timelineEndTime = moment(timelineStartTime).subtract(15, 'weeks').valueOf()
const MockProps: ActivityTimelineViewProps = {
  timelineStartTime,
  timelineEndTime,
  activityTracks: [
    {
      trackName: 'MOCK_DEPLOYMENT',
      trackIcon: {
        name: 'nav-cd',
        size: 22
      },
      startTime: timelineStartTime,
      endTime: timelineEndTime,
      // eslint-disable-next-line react/display-name
      cardContent: () => <div />,
      onActivityClick: () => undefined,
      activities: []
    },
    {
      trackName: 'MOCK_CHANGES',
      trackIcon: {
        name: 'nav-cd',
        size: 22
      },
      startTime: timelineStartTime,
      endTime: timelineEndTime,
      // eslint-disable-next-line react/display-name
      cardContent: () => <div />,
      onActivityClick: () => undefined,
      activities: []
    }
  ],
  onLoadMore: jest.fn(),
  renderSummaryCardContent: jest.fn().mockImplementation(() => () => <div />)
}

describe('Unit tests for Activity timeline view', () => {
  test('Ensure that when an activity is selected, the summary card is rendered', async () => {
    const { container, getByText } = render(<ActivityTimeline {...MockProps} />)
    await waitFor(() => getByText('Mocked timeline marker'))
    const buttonToRenderSummaryCard = container.querySelector('.activityCardButton')
    expect(buttonToRenderSummaryCard).not.toBeNull()
    if (!buttonToRenderSummaryCard) {
      throw Error('Activity card was not rendered on the track.')
    }

    fireEvent.click(buttonToRenderSummaryCard)
    await waitFor(() => expect(container.querySelector('.mockedSelectedSummaryCard')).not.toBeNull())
  })
})
