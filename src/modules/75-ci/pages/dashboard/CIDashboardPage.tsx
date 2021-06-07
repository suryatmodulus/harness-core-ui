import React, { useEffect, useState } from 'react'
import { Container, Text } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetBuilds, useGetRepositoryBuild } from 'services/ci'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components/Toaster/useToaster'
import CIDashboardSummaryCards from '@pipeline/components/Dashboards/CIDashboardSummaryCards/CIDashboardSummaryCards'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import FailedBuildCard from '@pipeline/components/Dashboards/BuildCards/FailedBuildCard'
import ActiveBuildCard, { ActiveBuildCardProps } from '@pipeline/components/Dashboards/BuildCards/ActiveBuildCard'
import BuildExecutionsChart from '@pipeline/components/Dashboards/BuildExecutionsChart/BuildExecutionsChart'
import RepositoryCard from '@pipeline/components/Dashboards/BuildCards/RepositoryCard'
import RangeSelector from '@pipeline/components/Dashboards/RangeSelector'
import styles from './CIDashboardPage.module.scss'

export const CIDashboardPage: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const history = useHistory()
  const { showError } = useToaster()
  const { selectedProject } = useAppStore()
  const { getString } = useStrings()
  const project = selectedProject
  const [repositoriesRange, setRepositoriesRange] = useState([Date.now() - 30 * 24 * 60 * 60000, Date.now()])

  const { data, loading, error } = useGetBuilds({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const { data: repositoriesData, loading: loadingRepositories, error: repoError } = useGetRepositoryBuild({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      startTime: repositoriesRange[0],
      endTime: repositoriesRange[1]
    }
  })

  useEffect(() => {
    error?.message && showError(error?.message, undefined, 'ci.get.build.error')
  }, [error?.message])

  useEffect(() => {
    repoError?.message && showError(repoError?.message, undefined, 'ci.get.repo.error')
  }, [repoError?.message])

  return (
    <>
      <Page.Header
        title={
          <Container>
            <Breadcrumbs
              links={[
                {
                  label: project?.name || '',
                  url: routes.toProjectOverview({ orgIdentifier, projectIdentifier, accountId, module: 'ci' })
                },
                {
                  label: getString('overview'),
                  url: ''
                }
              ]}
            />
            <Text font={{ size: 'medium', weight: 'bold' }} margin={{ top: 'xsmall' }}>
              {getString('overview')}
            </Text>
          </Container>
        }
      />
      <Page.Body loading={loading && loadingRepositories}>
        <Container className={styles.page} padding="large">
          <CIDashboardSummaryCards />
          <Container className={styles.executionsWrapper}>
            <BuildExecutionsChart />
          </Container>
          <CardRailView
            contentType="REPOSITORY"
            isLoading={loadingRepositories}
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
                count={repo.buildCount!}
                successRate={repo.percentSuccess!}
                successRateDiff={repo.successRate!}
                countList={repo.countList}
              />
            ))}
          </CardRailView>
          <CardRailView
            contentType="FAILED_BUILD"
            isLoading={loading}
            titleSideContent={
              !!data?.data?.failed?.length && <Text font={{ size: 'small' }}>Top {data?.data?.failed?.length}</Text>
            }
            onShowAll={() =>
              history.push(
                routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'ci' }) +
                  `?filters=${JSON.stringify({ status: ['Aborted', 'Expired', 'Failed'] })}`
              )
            }
          >
            {data?.data?.failed?.map((build, index) => (
              <FailedBuildCard
                key={index}
                title={build.piplineName!}
                message={build.commit!}
                branchName={build.branch}
                commitId={build.commitID}
                startTime={build.startTs}
                endTime={build.endTs}
              />
            ))}
          </CardRailView>
          <CardRailView
            contentType="ACTIVE_BUILD"
            isLoading={loading}
            titleSideContent={
              !!data?.data?.active?.length && <Text font={{ size: 'small' }}>Top {data?.data?.active?.length}</Text>
            }
            onShowAll={() =>
              history.push(
                routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'ci' }) +
                  `?filters=${JSON.stringify({ status: ['Runnint', 'Waiting'] })}`
              )
            }
          >
            {data?.data?.active?.map((build, index) => (
              <ActiveBuildCard
                key={index}
                title={build.piplineName!}
                message={build.commit!}
                status={build.status as ActiveBuildCardProps['status']}
              />
            ))}
          </CardRailView>
        </Container>
      </Page.Body>
    </>
  )
}

export default CIDashboardPage
