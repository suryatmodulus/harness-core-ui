import React, { useEffect, useState } from 'react'
import { Container, Text } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import moment from 'moment'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetBuilds, useGetRepositoryBuild } from 'services/ci'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components/Toaster/useToaster'
import CIDashboardSummaryCards from './CIDashboardSummaryCards/CIDashboardSummaryCards'
import CardRailView from './CardRailView/CardRailView'
import FailedBuildCard from './BuildCards/FailedBuildCard'
import ActiveBuildCard, { ActiveBuildCardProps } from './BuildCards/ActiveBuildCard'
import BuildExecutionsChart from './BuildExecutionsChart/BuildExecutionsChart'
import RepositoryCard from './BuildCards/RepositoryCard'
import RangeSelector from './RangeSelector'
import styles from './CIDashboardPage.module.scss'
import './sharedStyles.module.scss'

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
      accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const { data: repositoriesData, loading: loadingRepositories, error: repoError } = useGetRepositoryBuild({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      startInterval: moment(repositoriesRange[0]).format('YYYY-MM-DD'),
      endInterval: moment(repositoriesRange[1]).format('YYYY-MM-DD')
    }
  })

  useEffect(() => {
    error?.message && showError(error?.message)
  }, [error?.message])

  useEffect(() => {
    repoError?.message && showError(repoError?.message)
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
                message={repo.lastCommit!}
                lastBuildStatus={(repo as any).lastStatus}
                startTime={moment(repo.time, 'YYYY-MM-DD HH:mm:ss').valueOf()}
                buildsNumber={repo.buildCount!}
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
                startTime={moment(build.startTs, 'YYYY-MM-DD HH:mm:ss').valueOf()}
                endTime={moment(build.endTs, 'YYYY-MM-DD HH:mm:ss').valueOf()}
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
