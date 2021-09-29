import React from 'react'
import { render } from '@testing-library/react'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import ChangeTimeline from '../ChangeTimeline'
import type { ChangeTimelineProps } from '../ChangeTimeline.types'

const onSliderMoved = jest.fn()
jest.mock('services/cv', () => ({
  useChangeEventTimeline: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

const defaultProps = {
  serviceIdentifier: '',
  environmentIdentifier: '',
  timestamps: [],
  timeFormat: '',
  startTime: 0,
  endTime: 0,
  onSliderMoved
}

function WrapperComponent(props: ChangeTimelineProps): JSX.Element {
  return (
    <TestWrapper>
      <ChangeTimeline {...props} />
    </TestWrapper>
  )
}

describe('Render ChangeTimeline', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should render with empty data', () => {
    const { container, getByText } = render(<WrapperComponent {...defaultProps} />)
    expect(getByText('cv.changeSource.noData')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should render with loading state', () => {
    jest.spyOn(cvServices, 'useChangeEventTimeline').mockImplementation(
      () =>
        ({
          data: {},
          refetch: jest.fn(),
          error: null,
          loading: true
        } as any)
    )
    const { container } = render(<WrapperComponent {...defaultProps} />)
    expect(container.querySelector('span[data-icon="steps-spinner"]')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
