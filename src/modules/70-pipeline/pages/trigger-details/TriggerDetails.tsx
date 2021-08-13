import React from 'react'
import { Container, Layout, TabNavigation } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGetPipelineSummary, ResponsePMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'

export const TriggerBreadcrumbs = ({
  pipelineResponse
}: {
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

  const { getString } = useStrings()
  useDocumentTitle([getString('pipelines'), getString('pipeline.triggers.triggersLabel')])

  return (
    <NGBreadcrumbs
      links={[
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
        }
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
  const { orgIdentifier, projectIdentifier, pipelineIdentifier, accountId } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      triggerIdentifier: string
    }>
  >()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

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
            <TriggerBreadcrumbs pipelineResponse={pipeline} />
          </Layout.Vertical>
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}
