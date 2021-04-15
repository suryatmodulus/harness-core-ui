import React from 'react'
import { Container, Layout } from '@wings-software/uicore'
import { NavLink, useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGetPipelineSummary, useGetTrigger, ResponseNGTriggerResponse } from 'services/pipeline-ng'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useAppStore, useStrings } from 'framework/exports'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import css from './TriggerDetails.module.scss'

export const TriggerBreadcrumbs = ({
  triggerResponse
}: {
  triggerResponse: ResponseNGTriggerResponse | null
}): JSX.Element => {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      triggerIdentifier: string
    }>
  >()

  const { data: pipeline } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })
  const { selectedProject } = useAppStore()
  const project = selectedProject
  const { getString } = useStrings()
  const onEditTriggerName = triggerResponse?.data?.name
  useDocumentTitle([getString('pipelines'), getString('pipeline-triggers.triggersLabel')])

  return (
    <Breadcrumbs
      links={[
        {
          url: routes.toCDProjectOverview({
            orgIdentifier,
            projectIdentifier,
            accountId
          }),
          label: project?.name as string
        },
        {
          url: routes.toPipelines({
            orgIdentifier,
            projectIdentifier,
            accountId,
            module
          }),
          label: getString('pipelines')
        },
        {
          url: routes.toTriggersPage({
            orgIdentifier,
            projectIdentifier,
            accountId,
            pipelineIdentifier,
            module
          }),
          label: pipeline?.data?.name || ''
        },
        { url: '#', label: onEditTriggerName || '' }
      ]}
    />
  )
}
const GetTriggerRightNav = (): JSX.Element => {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      triggerIdentifier: string
    }>
  >()

  const { getString } = useStrings()
  return (
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
          className={css.tags}
          activeClassName={css.activeTag}
          to={routes.toInputSetList({ orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module })}
        >
          {getString('inputSetsText')}
        </NavLink>
        <NavLink
          className={css.tags}
          activeClassName={css.activeTag}
          to={routes.toTriggersPage({ orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, module })}
        >
          {getString('pipeline-triggers.triggersLabel')}
        </NavLink>
        <NavLink
          className={css.tags}
          activeClassName={css.activeTag}
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
  )
}

export default function TriggerDetails({ children }: React.PropsWithChildren<{}>): React.ReactElement {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, triggerIdentifier } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      triggerIdentifier: string
    }>
  >()

  const { data: triggerResponse } = useGetTrigger({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    }
  })
  return (
    <>
      <Page.Header
        toolbar={GetTriggerRightNav()}
        title={
          <Layout.Vertical spacing="xsmall">
            <TriggerBreadcrumbs triggerResponse={triggerResponse} />
          </Layout.Vertical>
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}
