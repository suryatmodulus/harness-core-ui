import React from 'react'
import { render } from '@testing-library/react'
import { Duration } from '../Duration'

describe('Show milliseconds results', () => {
  test('Shows ms with results', () => {
    const { getByText } = render(
      <Duration
        icon={undefined}
        durationText=" "
        startTime={1631139247012}
        endTime={1631139248964}
        showMilliSeconds={true}
      />
    )
    expect(getByText('1s 952ms')).not.toBeNull()
  })
})

describe('Show zero second results', () => {
  test('Less than one second shows 0s', () => {
    const { getByText } = render(
      <Duration
        icon={undefined}
        durationText=" "
        startTime={1631139247012}
        endTime={1631139247098}
        showZeroSecondsResult={true}
      />
    )
    expect(getByText('0s')).not.toBeNull()
  })

  test('No delta shows 0s text', () => {
    const { getByText } = render(
      <Duration
        icon={undefined}
        durationText=" "
        startTime={1631139247012}
        endTime={1631139247012}
        showZeroSecondsResult={true}
      />
    )
    expect(getByText('0s')).not.toBeNull()
  })
})

describe('Show milliseconds when less than second', () => {
  test('Greater than one second shows seconds', () => {
    const { getByText } = render(
      <Duration
        icon={undefined}
        durationText=" "
        startTime={1631139247012}
        endTime={1631139248964}
        showMsLessThanOneSecond={true}
      />
    )

    expect(getByText('2s')).not.toBeNull()
  })

  test('No delta does not show any text', () => {
    const { container } = render(
      <Duration
        icon={undefined}
        durationText=" "
        startTime={1631139247012}
        endTime={1631139247012}
        showMsLessThanOneSecond={true}
      />
    )

    const span = container.querySelector('[class*="inline"]')
    expect(span).toContainHTML(' ')
  })

  test('Less than one second shows ms', () => {
    const { getByText } = render(
      <Duration
        icon={undefined}
        durationText=" "
        startTime={1631139247012}
        endTime={1631139247098}
        showMsLessThanOneSecond={true}
      />
    )
    expect(getByText('86ms')).not.toBeNull()
  })
})
