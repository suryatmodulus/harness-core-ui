import React from 'react'
import { Layout, TabNavigation } from '@wings-software/uicore'
import { useParams, useRouteMatch } from 'react-router-dom'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGlobalEventListener, useQueryParams } from '@common/hooks'
import { useGetPipelineSummary } from 'services/pipeline-ng'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import { String } from 'framework/strings'
import GenericErrorHandler from '@common/pages/GenericErrorHandler/GenericErrorHandler'
import css from './PipelineDetails.module.scss'

// add custom event to the global scope
declare global {
  interface WindowEventMap {
    RENAME_PIPELINE: CustomEvent<string>
  }
}

export default function PipelineDetails({ children }: React.PropsWithChildren<unknown>): React.ReactElement {
  const { selectedProject } = useAppStore()
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } = useParams<
    PipelineType<PipelinePathProps>
  >()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const { data: pipeline, refetch, error } = useGetPipelineSummary({
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
    if (pipelineIdentifier !== DefaultNewPipelineId) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineIdentifier])
  const project = selectedProject
  const { getString } = useStrings()
  const getBreadCrumbs = React.useCallback(
    () => [
      {
        url: routes.toCDProjectOverview({ orgIdentifier, projectIdentifier, accountId, module }),
        label: project?.name as string
      },
      {
        url: routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module }),
        label: getString('pipelineBreadcrumb')
      },
      {
        url: '#',
        label: pipelineIdentifier !== DefaultNewPipelineId ? pipelineName || '' : getString('pipelineStudio')
      }
    ],
    [accountId, getString, module, orgIdentifier, pipelineName, pipelineIdentifier, project?.name, projectIdentifier]
  )

  React.useEffect(() => {
    setPipelineName(pipeline?.data?.name || '')
  }, [pipeline?.data?.name])

  useGlobalEventListener('RENAME_PIPELINE', event => {
    if (event.detail) {
      setPipelineName(event.detail)
    }
  })

  const { isExact: isPipelineStudioRoute } = useRouteMatch(
    routes.toPipelineStudio({
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId,
      module,
      repoIdentifier,
      branch
    })
  ) || { isExact: false }

  if (error?.data) {
    return <GenericErrorHandler errStatusCode={error?.status} errorMessage={(error?.data as Error)?.message} />
  }

  return (
    <>
      <Page.Header
        title={
          <>
            <Layout.Horizontal spacing="xsmall">
              <Breadcrumbs links={getBreadCrumbs()} />
              {repoIdentifier && !isPipelineStudioRoute && (
                <GitPopover data={{ repoIdentifier, branch }} iconMargin={{ left: 'small' }} />
              )}
            </Layout.Horizontal>
            {isPipelineStudioRoute && (
              <String tagName="div" className={css.pipelineStudioTitle} stringID="pipelineStudio" />
            )}
          </>
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
      <Page.Body>{children}</Page.Body>
    </>
  )
}
