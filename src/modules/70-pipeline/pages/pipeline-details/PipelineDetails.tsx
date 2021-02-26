import React from 'react'
import { Container, Layout } from '@wings-software/uicore'
import { NavLink, useParams } from 'react-router-dom'
import cx from 'classnames'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGetPipelineSummary } from 'services/pipeline-ng'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useAppStore, useStrings } from 'framework/exports'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import css from './PipelineDetails.module.scss'

export default function PipelineDetails({ children }: React.PropsWithChildren<{}>): React.ReactElement {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } = useParams<
    PipelineType<PipelinePathProps>
  >()
  const { data: pipeline, refetch } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  React.useEffect(() => {
    if (pipelineIdentifier !== DefaultNewPipelineId) {
      refetch()
    }
  }, [pipelineIdentifier])
  const { selectedProject } = useAppStore()
  const project = selectedProject
  const { getString } = useStrings()
  const getBreadCrumbs = React.useCallback(
    () => [
      {
        url: routes.toCDProjectOverview({ orgIdentifier, projectIdentifier, accountId }),
        label: project?.name as string
      },
      {
        url: routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module }),
        label: getString('pipelineBreadcrumb')
      },
      {
        url: '#',
        label: pipelineIdentifier !== DefaultNewPipelineId ? pipeline?.data?.name || '' : getString('pipelineStudio')
      }
    ],
    [
      accountId,
      getString,
      module,
      orgIdentifier,
      pipeline?.data?.name,
      pipelineIdentifier,
      project?.name,
      projectIdentifier
    ]
  )
  return (
    <>
      <Page.Header
        title={
          <Layout.Vertical spacing="xsmall">
            <Breadcrumbs links={getBreadCrumbs()} />
          </Layout.Vertical>
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
                className={cx(css.tags, { [css.disabled]: pipelineIdentifier === DefaultNewPipelineId })}
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
                {getString('pipeline-triggers.triggersLabel')}
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
