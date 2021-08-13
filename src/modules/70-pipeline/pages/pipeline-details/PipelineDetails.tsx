import React from 'react'
import { isEmpty } from 'lodash-es'
import { Color, Heading, Layout, TabNavigation, Text } from '@wings-software/uicore'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGlobalEventListener, useQueryParams } from '@common/hooks'
import { useGetPipelineSummary } from 'services/pipeline-ng'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import { String } from 'framework/strings'
import GenericErrorHandler from '@common/pages/GenericErrorHandler/GenericErrorHandler'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import noPipelineFoundImage from './images/no-pipeline-found.svg'
import css from './PipelineDetails.module.scss'
// add custom event to the global scope
declare global {
  interface WindowEventMap {
    RENAME_PIPELINE: CustomEvent<string>
  }
}
const NoPipelineFound: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }> &
      GitQueryParams
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const onGitBranchChange = React.useMemo(
    () => (selectedFilter: GitFilterScope) => {
      if (branch !== selectedFilter.branch) {
        history.push(
          routes.toPipelineStudio({
            projectIdentifier,
            orgIdentifier,
            pipelineIdentifier: pipelineIdentifier || '-1',
            accountId,
            module,
            branch: selectedFilter.branch,
            repoIdentifier: selectedFilter.repo
          })
        )
        location.reload()
      }
    },
    [repoIdentifier, branch, pipelineIdentifier]
  )

  return (
    <div className={css.noPipelineFoundContainer}>
      {/* @TODO: Have a working solution for this */}
      {/* <Button
        className={css.backButton}
        onClick={() => {
          history.goBack()
          location.reload()
        }}
        text={'< ' + getString('back')}
      /> */}
      <Layout.Vertical spacing="small" flex={{ justifyContent: 'center', alignItems: 'center' }}>
        <img src={noPipelineFoundImage} className={css.noPipelineFoundImage} />

        <Text className={css.noPipelineFound} margin={{ top: 'medium', bottom: 'small' }}>
          {getString('pipeline.gitExperience.noPipelineFound')}
        </Text>
        <Text className={css.selectDiffBranch} margin={{ top: 'xsmall', bottom: 'xlarge' }}>
          {getString('pipeline.gitExperience.selectDiffBranch')}
        </Text>
        <GitFilters
          onChange={onGitBranchChange}
          showRepoSelector={false}
          defaultValue={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          branchSelectClassName={css.branchSelector}
        />
      </Layout.Vertical>
    </div>
  )
}

export default function PipelineDetails({ children }: React.PropsWithChildren<unknown>): React.ReactElement {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } =
    useParams<PipelineType<PipelinePathProps>>()
  const { isGitSyncEnabled } = useAppStore()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const {
    data: pipeline,
    refetch,
    error
  } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      branch,
      repoIdentifier
    },
    lazy: true
  })
  const [pipelineName, setPipelineName] = React.useState('')

  React.useEffect(() => {
    setPipelineName(pipeline?.data?.name || '')
  }, [pipeline?.data?.name])

  useGlobalEventListener('RENAME_PIPELINE', event => {
    if (event.detail) {
      setPipelineName(event.detail)
    }
  })

  React.useEffect(() => {
    if (pipelineIdentifier !== DefaultNewPipelineId) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineIdentifier])
  const { getString } = useStrings()
  const getBreadCrumbs = React.useCallback(
    () => [
      {
        url: routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module }),
        label: getString('pipelineBreadcrumb')
      }
    ],
    [accountId, getString, module, orgIdentifier, projectIdentifier]
  )

  const { isExact: isPipelineStudioRoute } = useRouteMatch(
    routes.toPipelineStudio({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId,
      module
    })
  ) || { isExact: false }

  if (error?.data && !isGitSyncEnabled) {
    return <GenericErrorHandler errStatusCode={error?.status} errorMessage={(error?.data as Error)?.message} />
  }

  if (error?.data && isEmpty(pipeline) && isGitSyncEnabled) {
    return <NoPipelineFound />
  }

  return (
    <>
      <GitSyncStoreProvider>
        <Page.Header
          className={isPipelineStudioRoute ? css.rightMargin : ''}
          testId={isPipelineStudioRoute ? 'pipeline-studio' : 'not-pipeline-studio'}
          size={isPipelineStudioRoute ? 'small' : 'standard'}
          title={
            <Layout.Vertical>
              <Layout.Horizontal>
                <NGBreadcrumbs links={getBreadCrumbs()} />
              </Layout.Horizontal>
              {isPipelineStudioRoute && (
                <String tagName="div" className={css.pipelineStudioTitle} stringID="pipelineStudio" />
              )}
              {!isPipelineStudioRoute && (
                <Layout.Horizontal spacing="xsmall" flex={{ justifyContent: 'left', alignItems: 'center' }}>
                  <Heading level={2} color={Color.GREY_800} font={{ weight: 'bold' }}>
                    {pipelineName}
                  </Heading>
                  {repoIdentifier && (
                    <GitPopover data={{ repoIdentifier, branch }} iconProps={{ margin: { left: 'small' } }} />
                  )}
                </Layout.Horizontal>
              )}
            </Layout.Vertical>
          }
          toolbar={
            <TabNavigation
              size={'small'}
              links={[
                {
                  label: getString('pipelineStudio'),
                  to: routes.toPipelineStudio({
                    orgIdentifier,
                    projectIdentifier,
                    pipelineIdentifier,
                    accountId,
                    module,
                    repoIdentifier,
                    branch
                  })
                },
                {
                  label: getString('inputSetsText'),
                  to: routes.toInputSetList({
                    orgIdentifier,
                    projectIdentifier,
                    pipelineIdentifier,
                    accountId,
                    module,
                    repoIdentifier,
                    branch
                  }),
                  disabled: pipelineIdentifier === DefaultNewPipelineId
                },
                {
                  label: getString('pipeline.triggers.triggersLabel'),
                  to: routes.toTriggersPage({
                    orgIdentifier,
                    projectIdentifier,
                    pipelineIdentifier,
                    accountId,
                    module,
                    repoIdentifier,
                    branch
                  }),
                  disabled: pipelineIdentifier === DefaultNewPipelineId
                },
                {
                  label: getString('executionHeaderText'),
                  to: routes.toPipelineDeploymentList({
                    orgIdentifier,
                    projectIdentifier,
                    pipelineIdentifier,
                    accountId,
                    module,
                    repoIdentifier,
                    branch
                  }),
                  disabled: pipelineIdentifier === DefaultNewPipelineId
                }
              ]}
            />
          }
        />
      </GitSyncStoreProvider>
      <Page.Body className={isPipelineStudioRoute ? css.rightMargin : ''}>{children}</Page.Body>
    </>
  )
}
