import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import TimelineSlider from '../TimelineSlider'

jest.mock('react-draggable', () => (props: any) => (
  <div>
    <button
      className="onDragEnd"
      onClick={() => props.onStop({ movementX: 15 } as MouseEvent, { deltaX: 15, x: 10 } as any)}
    />
    <button
      className="onDrag"
      onClick={() => props.onDrag({ movementX: 15 } as MouseEvent, { deltaX: 15, x: 10 } as any)}
    />
    {props.children}
  </div>
))

describe('Unit tests for timeline slider', () => {
  test('Ensure slider responds to click event', async () => {
    const { container } = render(<TimelineSlider initialSliderWidth={50} minSliderWidth={25} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const ev = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      screenX: 450,
      screenY: 100
    })

    container.dispatchEvent(ev)
    await waitFor(() => expect(container.querySelector('[class*="sliderContainer"]')).not.toBeNull())
  })

  test('Ensure dragging handles causes width resize', async () => {
    const onDragEndMock = jest.fn()
    const { container } = render(
      <TimelineSlider initialSliderWidth={100} minSliderWidth={50} onSliderDragEnd={onDragEndMock} />
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    const dragEnds = container.querySelectorAll('[class*="onDragEnd"]')
    fireEvent.click(dragEnds[0])
    await waitFor(() =>
      expect(onDragEndMock).toHaveBeenLastCalledWith({
        endX: NaN,
        endXPercentage: NaN,
        startX: NaN,
        startXPercentage: NaN
      })
    )

    fireEvent.click(dragEnds[1])
    await waitFor(() =>
      expect(onDragEndMock).toHaveBeenLastCalledWith({
        endX: NaN,
        endXPercentage: NaN,
        startX: NaN,
        startXPercentage: NaN
      })
    )

    const drags = container.querySelectorAll('[class*="onDrag"]')
    fireEvent.click(drags[0])
    await waitFor(() =>
      expect(onDragEndMock).toHaveBeenLastCalledWith({
        endX: NaN,
        endXPercentage: NaN,
        startX: NaN,
        startXPercentage: NaN
      })
    )
  })
})
