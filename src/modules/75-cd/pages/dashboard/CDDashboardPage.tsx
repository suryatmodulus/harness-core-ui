import React, { useState } from 'react'
import { Container } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { camelCase, defaultTo, get } from 'lodash-es'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import { useGetWorkloads, useGetDeployments, CDPipelineModuleInfo, ExecutionStatusInfo } from 'services/cd-ng'
import type { CIBuildCommit, CIWebhookInfoDTO } from 'services/ci'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { ActiveStatus, FailedStatus, useErrorHandler, useRefetchCall } from '@pipeline/components/Dashboards/shared'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { PageHeader } from '@common/components/Page/PageHeader'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import ExecutionCard from '@pipeline/components/ExecutionCard/ExecutionCard'
import { CardVariant } from '@pipeline/utils/constants'
import DeploymentsHealthCards from './DeploymentsHealthCards'
import DeploymentExecutionsChart from './DeploymentExecutionsChart'
import WorkloadCard from './DeploymentCards/WorkloadCard'
import styles from './CDDashboardPage.module.scss'

/** TODO: fix types after BE merge */
export function executionStatusInfoToExecutionSummary(info: ExecutionStatusInfo): PipelineExecutionSummary {
  const cd: CDPipelineModuleInfo = {
    serviceIdentifiers: info.serviceInfoList?.map(({ serviceName }) => defaultTo(serviceName, '')).filter(svc => !!svc)
  }

  const branch = get(info, 'gitInfo.targetBranch')
  const commits: CIBuildCommit[] = [{ message: get(info, 'gitInfo.commit'), id: get(info, 'gitInfo.commitID') }]

  const ciExecutionInfoDTO: CIWebhookInfoDTO = {
    author: info.author,
    event: get(info, 'gitInfo.eventType'),
    branch: {
      name: get(info, 'gitInfo.sourceBranch'),
      commits
    },
    pullRequest: {
      sourceBranch: get(info, 'gitInfo.sourceBranch'),
      targetBranch: branch,
      commits
    }
  }

  return {
    startTs: info.startTs,
    endTs: typeof info.endTs === 'number' && info.endTs > 0 ? info.endTs : undefined,
    name: info.pipelineName,
    status: (info.status ? info.status.charAt(0).toUpperCase() + camelCase(info.status).slice(1) : '') as any,
    planExecutionId: info.planExecutionId,
    pipelineIdentifier: info.pipelineIdentifier,
    moduleInfo: {
      cd: cd as any,
      ci: (branch ? { ciExecutionInfoDTO, branch } : undefined) as any
    },
    executionTriggerInfo: {
      triggeredBy: {
        identifier: info.author?.name
      },
      triggerType: info.triggerType as Required<PipelineExecutionSummary>['executionTriggerInfo']['triggerType']
    }
  }
}

export const CDDashboardPage: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [range] = useState({
    startTime: Date.now() - 30 * 24 * 60 * 60000,
    endTime: Date.now()
  })
  const history = useHistory()
  const { getString } = useStrings()

  useDocumentTitle([getString('deploymentsText'), getString('overview')])

  const { data, loading, error, refetch } = useGetDeployments({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const {
    data: workloadsData,
    loading: loadingWorkloads,
    error: workloadsError
  } = useGetWorkloads({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      ...range
    }
  })

  useErrorHandler(error)
  useErrorHandler(workloadsError)

  const refetchingDeployments = useRefetchCall(refetch, loading)
  const activeDeployments = [...(data?.data?.active ?? []), ...(data?.data?.pending ?? [])]

  return (
    <>
      <PageHeader title={getString('overview')} breadcrumbs={<NGBreadcrumbs links={[]} />} />
      <Page.Body className={styles.content} loading={(loading && !refetchingDeployments) || loadingWorkloads}>
        <Container className={styles.page} padding="large">
          <DeploymentsHealthCards />
          <Container className={styles.executionsWrapper}>
            <DeploymentExecutionsChart />
          </Container>
          <CardRailView contentType="WORKLOAD" isLoading={loadingWorkloads} titleSideContent={<></>}>
            {workloadsData?.data?.workloadDeploymentInfoList?.map((workload, i) => (
              <WorkloadCard
                key={i}
                serviceName={workload.serviceName!}
                lastExecuted={workload?.lastExecuted}
                totalDeployments={workload.totalDeployments!}
                percentSuccess={workload.percentSuccess!}
                rateSuccess={workload.rateSuccess!}
                workload={workload.workload}
                serviceId={workload.serviceId}
              />
            ))}
          </CardRailView>
          <CardRailView
            contentType="FAILED_DEPLOYMENT"
            isLoading={loading && !refetchingDeployments}
            titleSideContent={false}
            onShowAll={() =>
              history.push(
                routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'cd' }) +
                  `?filters=${JSON.stringify({ status: Object.keys(FailedStatus) })}`
              )
            }
          >
            {data?.data?.failure?.map((d, i) => (
              <ExecutionCard
                variant={CardVariant.Minimal}
                key={i}
                pipelineExecution={executionStatusInfoToExecutionSummary(d)}
              />
            ))}
          </CardRailView>
          <CardRailView
            contentType="ACTIVE_DEPLOYMENT"
            isLoading={loading && !refetchingDeployments}
            titleSideContent={false}
            onShowAll={() =>
              history.push(
                routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'cd' }) +
                  `?filters=${JSON.stringify({ status: Object.keys(ActiveStatus) })}`
              )
            }
          >
            {activeDeployments.map((d, i) => (
              <ExecutionCard
                variant={CardVariant.Minimal}
                key={i}
                pipelineExecution={executionStatusInfoToExecutionSummary(d)}
              />
            ))}
          </CardRailView>
        </Container>
      </Page.Body>
    </>
  )
}

export default CDDashboardPage
