import React from 'react'
import { Container, Layout } from '@wings-software/uicore'
import { NavLink, useParams } from 'react-router-dom'
import cx from 'classnames'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGlobalEventListener } from '@common/hooks'
import { useGetPipelineSummary } from 'services/pipeline-ng'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
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
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } = useParams<
    PipelineType<PipelinePathProps>
  >()
  const { data: pipeline, refetch, error } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  const [pipelineName, setPipelineName] = React.useState('')

  React.useEffect(() => {
    if (pipelineIdentifier !== DefaultNewPipelineId) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineIdentifier])
  const { selectedProject } = useAppStore()
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

  if (error?.data) {
    return <GenericErrorHandler errStatusCode={error?.status} errorMessage={(error?.data as Error)?.message} />
  }

  return (
    <>
      <Page.Header
        title={
          <>
            <Layout.Vertical spacing="xsmall">
              <Breadcrumbs links={getBreadCrumbs()} />
            </Layout.Vertical>
            <String tagName="div" className={css.pipelineStudioTitle} stringID="pipelineStudio" />
          </>
        }
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toPipelineStudio({
                  orgIdentifier,
                  projectIdentifier,
                  pipelineIdentifier,
                  accountId,
                  module
                })}
              >
                {getString('pipelineStudio')}
              </NavLink>

              <NavLink
                className={cx(css.tags, {
                  [css.disabled]: pipelineIdentifier === DefaultNewPipelineId
                })}
                activeClassName={css.activeTag}
                onClick={e => pipelineIdentifier === DefaultNewPipelineId && e.preventDefault()}
                to={routes.toInputSetList({
                  orgIdentifier,
                  projectIdentifier,
                  pipelineIdentifier,
                  accountId,
                  module
                })}
              >
                {getString('inputSetsText')}
              </NavLink>
              <NavLink
                className={cx(css.tags, { [css.disabled]: pipelineIdentifier === DefaultNewPipelineId })}
                activeClassName={css.activeTag}
                onClick={e => pipelineIdentifier === DefaultNewPipelineId && e.preventDefault()}
                to={routes.toTriggersPage({
                  orgIdentifier,
                  projectIdentifier,
                  pipelineIdentifier,
                  accountId,
                  module
                })}
              >
                {getString('pipeline.triggers.triggersLabel')}
              </NavLink>
              <NavLink
                className={cx(css.tags, { [css.disabled]: pipelineIdentifier === DefaultNewPipelineId })}
                activeClassName={css.activeTag}
                onClick={e => pipelineIdentifier === DefaultNewPipelineId && e.preventDefault()}
                to={routes.toPipelineDeploymentList({
                  orgIdentifier,
                  projectIdentifier,
                  pipelineIdentifier,
                  accountId,
                  module
                })}
              >
                {getString('executionHeaderText')}
              </NavLink>
            </Layout.Horizontal>
          </Container>
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}
