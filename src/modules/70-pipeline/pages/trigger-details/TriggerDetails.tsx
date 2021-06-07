import React from 'react'
import { Container, Layout, TabNavigation } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import {
  useGetPipelineSummary,
  useGetTrigger,
  ResponseNGTriggerResponse,
  ResponsePMSPipelineSummaryResponse
} from 'services/pipeline-ng'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

export const TriggerBreadcrumbs = ({
  triggerResponse,
  pipelineResponse
}: {
  triggerResponse: ResponseNGTriggerResponse | null
  pipelineResponse: ResponsePMSPipelineSummaryResponse | null
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
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const { selectedProject } = useAppStore()
  const project = selectedProject
  const { getString } = useStrings()
  const onEditTriggerName = triggerResponse?.data?.name
  useDocumentTitle([getString('pipelines'), getString('pipeline.triggers.triggersLabel')])

  return (
    <Breadcrumbs
      links={[
        {
          url: routes.toCDProjectOverview({
            orgIdentifier,
            projectIdentifier,
            accountId,
            module
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
            module,
            repoIdentifier,
            branch
          }),
          label: pipelineResponse?.data?.name || ''
        },
        { url: '#', label: onEditTriggerName || '' }
      ]}
    />
  )
}
const GetTriggerRightNav = (pipelineResponse: ResponsePMSPipelineSummaryResponse | null): JSX.Element => {
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
              branch: pipelineResponse?.data?.gitDetails?.branch,
              repoIdentifier: pipelineResponse?.data?.gitDetails?.repoIdentifier
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
              branch: pipelineResponse?.data?.gitDetails?.branch,
              repoIdentifier: pipelineResponse?.data?.gitDetails?.repoIdentifier
            })
          },
          {
            label: getString('pipeline.triggers.triggersLabel'),
            to: routes.toTriggersPage({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier,
              accountId,
              module,
              branch: pipelineResponse?.data?.gitDetails?.branch,
              repoIdentifier: pipelineResponse?.data?.gitDetails?.repoIdentifier
            })
          },
          {
            label: getString('executionHeaderText'),
            to: routes.toPipelineDeploymentList({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier,
              accountId,
              module,
              branch: pipelineResponse?.data?.gitDetails?.branch,
              repoIdentifier: pipelineResponse?.data?.gitDetails?.repoIdentifier
            })
          }
        ]}
      />
    </Container>
  )
}

export default function TriggerDetails({ children }: React.PropsWithChildren<unknown>): React.ReactElement {
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId, triggerIdentifier } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      triggerIdentifier: string
    }>
  >()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const { data: triggerResponse } = useGetTrigger({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    }
  })

  const { data: pipeline } = useGetPipelineSummary({
    pipelineIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })

  return (
    <>
      <Page.Header
        toolbar={GetTriggerRightNav(pipeline)}
        title={
          <Layout.Vertical spacing="xsmall">
            <TriggerBreadcrumbs triggerResponse={triggerResponse} pipelineResponse={pipeline} />
          </Layout.Vertical>
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}
