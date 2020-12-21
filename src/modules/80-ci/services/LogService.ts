import { throttle } from 'lodash-es'
import React from 'react'

export interface LogResponse {
  args?: any
  level: string
  out: string
  pos: number
  time: string
}

export interface Logs {
  logLevel: string
  createdAt: string
  logLine: string
}

const apiEndpoint = '/log-service/blob'
const streamEndpoint = '/log-service/stream'

/**
 * Get Logs from blob
 */

export async function getLogsFromBlob(
  token: string,
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  buildIdentifier: string,
  stageIdentifier: string,
  stepIdentifier: string,
  setLogs: Function
): Promise<void> {
  try {
    fetch(
      `${apiEndpoint}?accountID=${accountIdentifier}&key=${accountIdentifier}/${orgIdentifier}/${projectIdentifier}/${buildIdentifier}/${stageIdentifier}/${stepIdentifier}`,
      {
        headers: { 'X-Harness-Token': token }
      }
    )
      .then(resp => resp.text())
      .then(resp => {
        const lines = resp.split('\n')
        let data: LogResponse[] = []
        try {
          data = lines.filter(line => line.length > 0).map(line => line && JSON.parse(line))
        } catch (ex) {
          // TBD: how to handle errors
          // response: {error_msg: "..."}
        }

        const parsedData = data.map((item: LogResponse) => {
          return {
            logLevel: item?.level?.toUpperCase(),
            createdAt: item?.time,
            logLine: item?.out?.replace(`\n`, '')
          }
        })
        setLogs(parsedData)
      })
  } catch (e) {
    // console.log(e);
  }
}

export const downloadLogs = (
  token: string,
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  buildIdentifier: string,
  stageIdentifier: string,
  stepIdentifier: string
) => {
  fetch(
    `${apiEndpoint}?accountID=${accountIdentifier}&key=${accountIdentifier}/${orgIdentifier}/${projectIdentifier}/${buildIdentifier}/${stageIdentifier}/${stepIdentifier}`,
    {
      headers: { 'X-Harness-Token': token }
    }
  ).then(response => {
    response.blob().then(blob => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${stageIdentifier}-${stepIdentifier}`
      a.click()
    })
  })
}

export const useLogs = (
  token: string,
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  buildIdentifier: string,
  stageIdentifier: string,
  stepIdentifier: string,
  shouldCall: boolean
) => {
  const [logs, setLogs] = React.useState<Logs[]>([])

  React.useEffect(() => {
    const cachedLogs: Logs[] = []

    const throttledLogs = throttle(() => {
      const slicedLogs = cachedLogs.slice(Math.max(cachedLogs.length - 500, 0))
      setLogs(slicedLogs)
    }, 1000)

    const pushLog = (element: LogResponse): void => {
      cachedLogs.push({
        logLevel: element?.level.toUpperCase(),
        createdAt: element.time,
        logLine: element?.out.replace(`\n`, '')
      })
    }
    const eventSource =
      shouldCall &&
      new EventSource(
        `${streamEndpoint}?accountID=${accountIdentifier}&key=${accountIdentifier}/${orgIdentifier}/${projectIdentifier}/${buildIdentifier}/${stageIdentifier}/${stepIdentifier}&X-Harness-Token=${token}`
      )
    if (shouldCall && eventSource) {
      eventSource.onmessage = e => {
        if (e.type === 'error') {
          eventSource.close()
        }

        pushLog(JSON.parse(e.data))
        throttledLogs()
      }
      eventSource.onerror = e => {
        e.type === 'error' && eventSource.close()
      }
    }
    return function cleanup() {
      eventSource && eventSource.close()
      setLogs([])
    }
  }, [stepIdentifier])

  return [logs]
}
