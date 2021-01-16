import React from 'react'
import { throttle } from 'lodash-es'
// NOTE: we are using EventSourcePolyfill as EventSource API does not support custom headers
import { EventSourcePolyfill } from 'event-source-polyfill'
import type { Line, LogStreamQueryParams } from 'services/logs'
import SessionToken from 'framework/utils/SessionToken'

// NOTE: We are using custom implementation for loading stream logs
// if we gets this info in DTO we can use it from there
const streamEndpoint = '/log-service/stream'

/**
 * Load logs using server events.
 *
 * To start/stop loading use setEnableStreaming(true|false),
 */
export const useLogsStream = (
  queryVars?: LogStreamQueryParams | undefined,
  config: {
    maxNumberOfLogs: number
    throttleTime: number
  } = {
    maxNumberOfLogs: -1,
    throttleTime: 1000
  }
): { logs: Line[]; setEnableStreaming: (enable: boolean) => void; isStreamingActive: boolean } => {
  const [logs, setLogs] = React.useState<Line[]>([])
  const [enableStreaming, setEnableStreaming] = React.useState(false)

  React.useEffect(() => {
    const cachedLogs: Line[] = []

    const throttledLogs = throttle(() => {
      if (config.maxNumberOfLogs !== -1) {
        const slicedLogs = cachedLogs.slice(Math.max(cachedLogs.length, config.maxNumberOfLogs), 0)
        setLogs(slicedLogs)
      } else {
        setLogs([...cachedLogs])
      }
    }, config.throttleTime)

    const pushLog = (element: Line): void => {
      cachedLogs.push({
        ...element,
        out: element?.out?.replace(`\n`, '')
      })
    }

    const token = SessionToken.getToken()

    if (enableStreaming) {
      const eventSource = new EventSourcePolyfill(
        `${streamEndpoint}?accountID=${queryVars?.accountID}&key=${queryVars?.key}`,
        {
          headers: {
            'X-Harness-Token': queryVars?.['X-Harness-Token'],
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      )

      if (eventSource) {
        eventSource.onmessage = (e: MessageEvent) => {
          if (e.type === 'error') {
            eventSource.close()
          }

          pushLog(JSON.parse(e.data))
          throttledLogs()
        }

        eventSource.onerror = (e: Event) => {
          if (e.type === 'error') {
            eventSource.close()
          }
        }
      }

      // cleanup
      return function cleanup() {
        eventSource.close()
        setLogs([])
      }
    }
  }, [queryVars?.key, enableStreaming])

  return { logs, setEnableStreaming, isStreamingActive: enableStreaming }
}
