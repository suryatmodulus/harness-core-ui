/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, PageHeader } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { camelCase } from 'lodash-es'
import type { GetDataError } from 'restful-react'
import moment from 'moment'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { Failure } from 'services/cd-ng'
import { BuildActiveInfo, BuildFailureInfo, CIWebhookInfoDTO, useGetBuilds, useGetRepositoryBuild } from 'services/ci'
import { useStrings } from 'framework/strings'
import {
  startOfDay,
  TimeRangeSelector,
  TimeRangeSelectorProps
} from '@common/components/TimeRangeSelector/TimeRangeSelector'
import CIDashboardSummaryCards from '@pipeline/components/Dashboards/CIDashboardSummaryCards/CIDashboardSummaryCards'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import BuildExecutionsChart from '@pipeline/components/Dashboards/BuildExecutionsChart/BuildExecutionsChart'
import RepositoryCard from '@pipeline/components/Dashboards/BuildCards/RepositoryCard'
import { ActiveStatus, FailedStatus, useErrorHandler, useRefetchCall } from '@pipeline/components/Dashboards/shared'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import ExecutionCard from '@pipeline/components/ExecutionCard/ExecutionCard'
import { CardVariant } from '@pipeline/utils/constants'
import type { ExecutionTriggerInfo, PipelineExecutionSummary } from 'services/pipeline-ng'
import styles from './CIDashboardPage.module.scss'

function buildInfoToExecutionSummary(buildInfo: BuildActiveInfo | BuildFailureInfo): PipelineExecutionSummary {
  const ciExecutionInfoDTO: CIWebhookInfoDTO = {
    author: buildInfo.author,
    branch: { name: buildInfo.branch, commits: [{ message: buildInfo.commit, id: buildInfo.commitID }] }
  }

  return {
    startTs: buildInfo.startTs,
    endTs: typeof buildInfo.endTs === 'number' && buildInfo.endTs > 0 ? buildInfo.endTs : undefined,
    name: buildInfo.piplineName,
    status: (buildInfo.status
      ? buildInfo.status.charAt(0).toUpperCase() + camelCase(buildInfo.status).slice(1)
      : '') as any,
    planExecutionId: (buildInfo as any).planExecutionId, // TODO: fix once BE changes are merged
    pipelineIdentifier: buildInfo.pipelineIdentifier,
    moduleInfo: {
      ci: {
        ciExecutionInfoDTO,
        branch: buildInfo.branch as any
      }
    },
    executionTriggerInfo: {
      triggerType: buildInfo.triggerType as ExecutionTriggerInfo['triggerType']
    }
  }
}

export const CIDashboardPage: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const history = useHistory()
  const { getString } = useStrings()
  const [timeRange, setTimeRange] = useState<TimeRangeSelectorProps>({
    range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
    label: getString('common.duration.month')
  })

  const { data, loading, error, refetch } = useGetBuilds({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const {
    data: repositoriesData,
    loading: loadingRepositories,
    error: repoError,
    refetch: refetchRepos
  } = useGetRepositoryBuild({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      startTime: timeRange?.range[0]?.getTime() || 0,
      endTime: timeRange?.range[1]?.getTime() || 0
    }
  })

  const refetchingBuilds = useRefetchCall(refetch, loading)
  const refetchingRepos = useRefetchCall(refetchRepos, loadingRepositories)

  useErrorHandler(error as GetDataError<Failure | Error> | null, undefined, 'ci.get.build.error')
  useErrorHandler(repoError as GetDataError<Failure | Error> | null, undefined, 'ci.get.repo.error')

  return (
    <>
      <PageHeader
        title={getString('overview')}
        breadcrumbs={<NGBreadcrumbs links={[]} />}
        toolbar={
          <>
            <TimeRangeSelector timeRange={timeRange?.range} setTimeRange={setTimeRange} minimal />
          </>
        }
      />
      <Page.Body
        className={styles.content}
        loading={loading && !refetchingBuilds && loadingRepositories && !refetchingRepos}
      >
        <Container className={styles.page} padding="large">
          <CIDashboardSummaryCards timeRange={timeRange} />
          <Container className={styles.executionsWrapper}>
            <BuildExecutionsChart isCIPage={true} timeRange={timeRange} />
          </Container>
          <CardRailView contentType="REPOSITORY" isCIPage={true} isLoading={loadingRepositories && !refetchingRepos}>
            {repositoriesData?.data?.repositoryInfo?.map((repo, index) => (
              <RepositoryCard
                key={index}
                title={repo.name!}
                message={repo?.lastRepository?.commit}
                lastBuildStatus={repo?.lastRepository?.status}
                startTime={repo?.lastRepository?.startTime}
                endTime={repo?.lastRepository?.endTime}
                username={(repo?.lastRepository as any)?.author?.name}
                avatarUrl={(repo?.lastRepository as any)?.author?.url}
                count={repo.buildCount!}
                successRate={repo.percentSuccess!}
                successRateDiff={repo.successRate!}
                countList={repo.countList}
              />
            ))}
          </CardRailView>
          <CardRailView
            contentType="FAILED_BUILD"
            isLoading={loading && !refetchingBuilds}
            onShowAll={() =>
              history.push(
                routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'ci' }) +
                  `?filters=${JSON.stringify({ status: Object.keys(FailedStatus) })}`
              )
            }
          >
            {data?.data?.failed?.map((build, index) => (
              <ExecutionCard
                key={index}
                variant={CardVariant.Minimal}
                pipelineExecution={buildInfoToExecutionSummary(build)}
                staticCard={true}
                // staticCard={!build?.planExecutionId} // Enable when Backend supports re-routing
              />
            ))}
          </CardRailView>
          <CardRailView
            contentType="ACTIVE_BUILD"
            isLoading={loading && !refetchingBuilds}
            onShowAll={() =>
              history.push(
                routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'ci' }) +
                  `?filters=${JSON.stringify({ status: Object.keys(ActiveStatus) })}`
              )
            }
          >
            {data?.data?.active?.map((build, index) => (
              <ExecutionCard
                key={index}
                variant={CardVariant.Minimal}
                pipelineExecution={buildInfoToExecutionSummary(build)}
                staticCard={true}
                // staticCard={!build?.planExecutionId} // Enable when Backend supports re-routing
              />
            ))}
          </CardRailView>
        </Container>
      </Page.Body>
    </>
  )
}

export default CIDashboardPage
