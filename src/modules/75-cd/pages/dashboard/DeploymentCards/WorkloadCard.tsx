import React, { useMemo } from 'react'
import { Layout, Icon, Color } from '@wings-software/uicore'
import RepositoryCard from '@pipeline/components/Dashboards/BuildCards/RepositoryCard'
import type { WorkloadDateCountInfo, LastWorkloadInfo } from 'services/cd-ng'

export interface WorkloadCardProps {
  serviceName: string
  lastExecuted?: LastWorkloadInfo
  lastMessage?: string
  totalDeployments: number
  percentSuccess: number
  rateSuccess: number
  username?: string
  workload?: WorkloadDateCountInfo[]
}

export default function WorkloadCard({
  serviceName,
  lastExecuted,
  lastMessage,
  totalDeployments,
  percentSuccess,
  rateSuccess,
  username,
  workload
}: WorkloadCardProps) {
  const countList = useMemo(() => {
    if (workload) {
      return workload.map(val => ({
        time: val.date,
        builds: {
          count: val?.execution?.count
        }
      }))
    }
  }, [workload])

  return (
    <RepositoryCard
      title={
        <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center', marginLeft: -5 }}>
          <Icon size={30} name={'services' as any} color={Color.PRIMARY_5} />
          {serviceName}
        </Layout.Horizontal>
      }
      message={lastMessage!}
      username={username}
      startTime={lastExecuted?.startTime as number}
      endTime={lastExecuted?.endTime as number}
      count={totalDeployments}
      countLabel="Deployments"
      seriesName="Executions"
      successRate={percentSuccess}
      successRateDiff={rateSuccess}
      countList={countList}
    />
  )
}
