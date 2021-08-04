import React, { useState } from 'react'
import { Container, Text } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { camelCase } from 'lodash-es'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { BuildActiveInfo, BuildFailureInfo, CIWebhookInfoDTO, useGetBuilds, useGetRepositoryBuild } from 'services/ci'
import { useStrings } from 'framework/strings'
import CIDashboardSummaryCards from '@pipeline/components/Dashboards/CIDashboardSummaryCards/CIDashboardSummaryCards'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import BuildExecutionsChart from '@pipeline/components/Dashboards/BuildExecutionsChart/BuildExecutionsChart'
import RepositoryCard from '@pipeline/components/Dashboards/BuildCards/RepositoryCard'
import RangeSelector from '@pipeline/components/Dashboards/RangeSelector'
import { ActiveStatus, FailedStatus, useErrorHandler, useRefetchCall } from '@pipeline/components/Dashboards/shared'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { PageHeader } from '@common/components/Page/PageHeader'
import ExecutionCard from '@pipeline/components/ExecutionCard/ExecutionCard'
import { CardVariant } from '@pipeline/utils/constants'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
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
    }
  }
}

export const CIDashboardPage: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const history = useHistory()
  const { getString } = useStrings()
  const [repositoriesRange, setRepositoriesRange] = useState([Date.now() - 30 * 24 * 60 * 60000, Date.now()])

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
      startTime: repositoriesRange[0],
      endTime: repositoriesRange[1]
    }
  })

  const refetchingBuilds = useRefetchCall(refetch, loading)
  const refetchingRepos = useRefetchCall(refetchRepos, loadingRepositories)

  useErrorHandler(error, undefined, 'ci.get.build.error')
  useErrorHandler(repoError, undefined, 'ci.get.repo.error')

  return (
    <>
      <PageHeader title={getString('overview')} breadcrumbs={<NGBreadcrumbs links={[]} />} />
      <Page.Body
        className={styles.content}
        loading={loading && !refetchingBuilds && loadingRepositories && !refetchingRepos}
      >
        <Container className={styles.page} padding="large">
          <CIDashboardSummaryCards />
          <Container className={styles.executionsWrapper}>
            <BuildExecutionsChart />
          </Container>
          <CardRailView
            contentType="REPOSITORY"
            isLoading={loadingRepositories && !refetchingRepos}
            titleSideContent={<RangeSelector onRangeSelected={setRepositoriesRange} />}
          >
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
            titleSideContent={
              !!data?.data?.failed?.length && <Text font={{ size: 'small' }}>Top {data?.data?.failed?.length}</Text>
            }
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
              />
            ))}
          </CardRailView>
          <CardRailView
            contentType="ACTIVE_BUILD"
            isLoading={loading && !refetchingBuilds}
            titleSideContent={
              !!data?.data?.active?.length && <Text font={{ size: 'small' }}>Top {data?.data?.active?.length}</Text>
            }
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
              />
            ))}
          </CardRailView>
        </Container>
      </Page.Body>
    </>
  )
}

export default CIDashboardPage
