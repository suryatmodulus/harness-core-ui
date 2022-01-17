/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import { Color, Heading, Layout, TabNavigation } from '@wings-software/uicore'
import { matchPath, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGlobalEventListener, useQueryParams } from '@common/hooks'
import { useGetPipelineSummary } from 'services/pipeline-ng'
import { NavigatedToPage } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useStrings, String } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import GitPopover from '@pipeline/components/GitPopover/GitPopover'
import GenericErrorHandler from '@common/pages/GenericErrorHandler/GenericErrorHandler'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import NoEntityFound from '../utils/NoEntityFound/NoEntityFound'
import css from './PipelineDetails.module.scss'
// add custom event to the global scope
declare global {
  interface WindowEventMap {
    RENAME_PIPELINE: CustomEvent<string>
  }
}

export default function PipelineDetails({ children }: React.PropsWithChildren<unknown>): React.ReactElement {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } =
    useParams<PipelineType<PipelinePathProps>>()
  const { isGitSyncEnabled } = useAppStore()
  const location = useLocation()
  const { trackEvent } = useTelemetry()
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
    const routeParams = {
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      accountId,
      module,
      repoIdentifier,
      branch
    }
    // Pipeline View
    const isPipeLineStudioView = !!matchPath(location.pathname, {
      path: routes.toPipelineStudio(routeParams)
    })
    if (isPipeLineStudioView) {
      return trackEvent(NavigatedToPage.PipelineStudio, {})
    }

    // Inout View
    const isInputSetsView = !!matchPath(location.pathname, {
      path: routes.toInputSetList(routeParams)
    })
    if (isInputSetsView) {
      return trackEvent(NavigatedToPage.PipelineInputSet, {})
    }

    // Triggers View
    const isTriggersView = !!matchPath(location.pathname, {
      path: routes.toTriggersPage(routeParams)
    })
    if (isTriggersView) {
      return trackEvent(NavigatedToPage.PipelineTriggers, {})
    }

    // Execution History View
    const isExecutionHistoryView = !!matchPath(location.pathname, {
      path: routes.toPipelineDeploymentList(routeParams)
    })
    if (isExecutionHistoryView) {
      return trackEvent(NavigatedToPage.PipelineExecutionHistory, {})
    }
  }, [location.pathname])

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
    return <NoEntityFound identifier={pipelineIdentifier} entityType={'pipeline'} />
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
