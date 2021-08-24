import { renderHook, act } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/react'

import { useLogsStream } from '../useLogsStream'

const close = jest.fn()

jest.mock('event-source-polyfill', () => ({
  EventSourcePolyfill: class EventSourcePolyfillMock {
    onmessage(_e: any): void {
      // empty fn
    }
    onerror(_e: any): void {
      // empty fn
    }
    close(): void {
      close()
    }
  }
}))

describe('useLogsStream tests', () => {
  beforeEach(() => {
    close.mockReset()
  })
  const key = 'myKey'
  const accountId = 'ACOOUNT_ID'
  test('startStream', async () => {
    const { result } = renderHook(useLogsStream)

    act(() => {
      result.current.startStream({ queryParams: { key, accountId }, headers: {}, key, throttleTime: 0 })
      const es = result.current.getEventSource()

      if (es) {
        es.onmessage!({ data: 'Message 1' } as any)
      }
    })

    await waitFor(() => expect(result.current.log).toBe('Message 1'))
  })

  test('closeStream', async () => {
    const { result } = renderHook(useLogsStream)

    act(() => {
      result.current.startStream({ queryParams: { key, accountId }, headers: {}, key, throttleTime: 0 })
    })

    expect(result.current.getEventSource()).toBeTruthy()

    act(() => {
      result.current.closeStream()
    })

    expect(result.current.getEventSource()).toBeNull()
    expect(close).toHaveBeenCalledTimes(1)
  })

  test('handle error data', () => {
    const { result } = renderHook(useLogsStream)

    act(() => {
      result.current.startStream({ queryParams: { key, accountId }, headers: {}, key, throttleTime: 0 })
      const es = result.current.getEventSource()

      if (es) {
        es.onmessage!({ type: 'error' } as any)
      }
    })

    expect(close).toHaveBeenCalledTimes(1)
  })

  test('handle error', () => {
    const { result } = renderHook(useLogsStream)

    act(() => {
      result.current.startStream({ queryParams: { key, accountId }, headers: {}, key, throttleTime: 0 })
      const es = result.current.getEventSource()

      if (es) {
        es.onerror!({ type: 'error' } as any)
      }
    })

    expect(close).toHaveBeenCalledTimes(1)
  })
})
