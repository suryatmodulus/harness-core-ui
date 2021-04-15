import React from 'react'
import { useParams } from 'react-router-dom'
import { Service, ServiceLog, useLogsOfService } from 'services/lw'
import { SimpleLogViewer } from '@common/components/MultiLogsViewer/SimpleLogViewer'

interface COGatewayLogsProps {
  service: Service | undefined
}

const logColorMap = {
  errored: '\u001b[30m',
  active: '\u001b[32m'
}

function getLogs(logs: ServiceLog[] | undefined): string {
  if (!logs) {
    return ''
  }
  let logLine = ''

  logs.map(l => {
    if (l.error) {
      logLine += `${logColorMap.errored}${l.created_at}  Rule state changed to: ${l.state} ${l.error ? l.error : ''} ${
        l.message ? l.message : ''
      }\n`
    } else if (l.state == 'active') {
      logLine += `${logColorMap.active}${l.created_at}  Rule state changed to: ${l.state} ${
        l.message ? l.message : ''
      }\n`
    } else {
      logLine += `${l.created_at}  Rule state changed to: ${l.state} ${l.error ? l.error : ''} ${
        l.message ? l.message : ''
      }\n`
    }
  })

  return logLine
}

const COGatewayLogs: React.FC<COGatewayLogsProps> = props => {
  const { orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const { data, loading } = useLogsOfService({
    org_id: orgIdentifier, // eslint-disable-line @typescript-eslint/camelcase
    projectID: projectIdentifier,
    serviceID: props.service?.id as number
  })

  return <SimpleLogViewer data={getLogs(data?.response)} loading={loading} />
}

export default COGatewayLogs
