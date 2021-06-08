import React from 'react'
import { Container, Layout, Icon } from '@wings-software/uicore'
import { NavLink, useParams, useRouteMatch } from 'react-router-dom'
import Joyride from 'react-joyride'
import cx from 'classnames'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGlobalEventListener, useQueryParams } from '@common/hooks'
import { useGetPipelineSummary } from 'services/pipeline-ng'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { String } from 'framework/strings'
import GenericErrorHandler from '@common/pages/GenericErrorHandler/GenericErrorHandler'
import NeutralCard from './images/Neutral Card (1).png'
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

  const coins30 = {}
  const steps = [
    {
      content: (
        <div style={{ display: 'flex' }}>
          <img src={NeutralCard}></img>
          <p style={{ marginTop: '35px' }}>
            This is your harness wallet where the coins you collected are stored. Your current balance:{' '}
          </p>
        </div>
      ),
      locale: { skip: <strong aria-label="skip">S-K-I-P</strong> },
      target: '.coins30',
      disableBeacon: true
    }
  ]

  return (
    <>
      <Page.Header
        title={
          <>
            <Layout.Vertical spacing="xsmall">
              <Joyride
                // callback={handleJoyrideCallback}
                continuous={true}
                // getHelpers={this.getHelpers}
                run={true}
                scrollToFirstStep={true}
                // showProgress={true}
                showSkipButton={true}
                steps={steps}
                styles={{
                  options: {
                    zIndex: 10000
                  }
                }}
              />
              <Breadcrumbs links={getBreadCrumbs()} />
              <div
                style={{
                  width: '70px',
                  padding: '10px',
                  background: '#B0C4DE',
                  color: 'gold',
                  margin: '0'
                }}
                className="coins30"
              >
                30 <Icon name="database" color="yellow-600" size={20} />{' '}
              </div>
            </Layout.Vertical>
            {isPipelineStudioRoute && (
              <String tagName="div" className={css.pipelineStudioTitle} stringID="pipelineStudio" />
            )}
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
                  module,
                  repoIdentifier,
                  branch
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
                  module,
                  repoIdentifier,
                  branch
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
                  module,
                  repoIdentifier,
                  branch
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
                  module,
                  repoIdentifier,
                  branch
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
