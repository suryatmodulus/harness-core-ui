import React from 'react'
import { Card, Color, Container, Icon, Layout, SparkChart, Text } from '@wings-software/uicore'
import { Link } from 'react-router-dom'
import { getModuleIcon, getModulePurpose } from '@projects-orgs/utils/utils'
import { ModuleName, String, useStrings, StringKeys } from 'framework/exports'
import routes from '@common/RouteDefinitions'
import i18n from './ModuleListCard.i18n'
import css from './ModuleListCard.module.scss'

interface ModuleListCardProps {
  module: ModuleName
  orgIdentifier: string
  projectIdentifier: string
  accountId: string
}

const getModuleLinks = (
  module: ModuleName,
  orgIdentifier: string,
  projectIdentifier: string,
  accountId: string
): React.ReactElement => {
  switch (module) {
    case ModuleName.CD:
      return (
        <Layout.Vertical spacing="medium">
          <Link
            to={routes.toPipelineStudio({
              accountId,
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier: '-1',
              module: 'cd'
            })}
          >
            <String stringID="moduleRenderer.newPipeLine" />
          </Link>
          <Link to={routes.toPipelines({ accountId, orgIdentifier, projectIdentifier, module: 'cd' })}>
            <String stringID="moduleRenderer.viewPipelines" />
          </Link>
        </Layout.Vertical>
      )
    case ModuleName.CV:
      return (
        <Layout.Vertical spacing="medium">
          <Link to={routes.toCVAdminSetup({ accountId, orgIdentifier, projectIdentifier })}>
            <String stringID="moduleRenderer.setupChanges" />
          </Link>
          <Link to={`${routes.toCVAdminSetup({ accountId, orgIdentifier, projectIdentifier })}?step=2`}>
            <String stringID="moduleRenderer.monitoringSources" />
          </Link>
        </Layout.Vertical>
      )
    case ModuleName.CI:
      return (
        <Layout.Vertical spacing="medium">
          <Link
            to={routes.toPipelineStudio({
              accountId,
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier: '-1',
              module: 'ci'
            })}
          >
            <String stringID="moduleRenderer.newPipeLine" />
          </Link>
          <Link to={routes.toPipelines({ accountId, orgIdentifier, projectIdentifier, module: 'ci' })}>
            <String stringID="moduleRenderer.viewPipelines" />
          </Link>
        </Layout.Vertical>
      )
    case ModuleName.CE:
      return (
        <Layout.Vertical spacing="medium">
          <Link to={''}> {i18n.newPipeLine}</Link>
          <Link to={''}> {i18n.viewPipeline}</Link>
        </Layout.Vertical>
      )
    case ModuleName.CF:
      return (
        <Layout.Vertical spacing="medium">
          <Link to={''}> {i18n.newPipeLine}</Link>
          <Link to={''}> {i18n.viewPipeline}</Link>
        </Layout.Vertical>
      )
    /* istanbul ignore next */
    default:
      return <></>
  }
}
const ModuleListCard: React.FC<ModuleListCardProps> = ({ module, projectIdentifier, orgIdentifier, accountId }) => {
  const { getString } = useStrings()
  return (
    <>
      <Card className={css.card}>
        <Layout.Horizontal>
          <Container width="30%" flex border={{ right: true, color: Color.GREY_300 }}>
            <Layout.Horizontal flex spacing="large">
              <Icon name={getModuleIcon(module)} size={70}></Icon>
              <div>
                <Layout.Vertical padding={{ bottom: 'medium' }}>
                  <Text font={{ size: 'small' }}>{i18n.continuous.toUpperCase()}</Text>
                  <Text font={{ size: 'medium' }} color={Color.BLACK}>
                    {getModulePurpose(module)}
                  </Text>
                </Layout.Vertical>
                <Layout.Horizontal spacing="xsmall" className={css.enable}>
                  <Icon name="tick" color={Color.WHITE}></Icon>
                  <Text color={Color.WHITE}>{i18n.enabled}</Text>
                </Layout.Horizontal>
              </div>
            </Layout.Horizontal>
          </Container>
          <Container width="40%" border={{ right: true, color: Color.GREY_300 }}>
            <Layout.Vertical flex={{ align: 'center-center' }}>
              <Layout.Horizontal flex={{ align: 'center-center' }} spacing="xxlarge">
                <SparkChart data={[2, 3, 4, 5, 4, 3, 2]} className={css.activitychart} />
                <Text color={Color.GREY_400} font={{ size: 'medium' }}>
                  {i18n.placeholder}
                </Text>
              </Layout.Horizontal>
              <Text color={Color.GREY_400} font={{ size: 'xsmall' }}>
                {getString(
                  `projectCard.${module
                    .toString()
                    .toLowerCase()}RendererText` as StringKeys /* TODO: fix this by using a map */
                ).toUpperCase()}
              </Text>
            </Layout.Vertical>
          </Container>
          <Container width="30%" flex={{ align: 'center-center' }}>
            {getModuleLinks(module, orgIdentifier, projectIdentifier, accountId)}
          </Container>
        </Layout.Horizontal>
      </Card>
    </>
  )
}

export default ModuleListCard
