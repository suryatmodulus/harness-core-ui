import React from 'react'
import { Button, Card, Color, Container, Icon, Layout, SparkChart, Text } from '@wings-software/uicore'
import { useHistory } from 'react-router-dom'
import { getModuleIcon } from '@common/utils/utils'
import { getModulePurpose, getModuleTitle } from '@projects-orgs/utils/utils'
import { String, useStrings } from 'framework/strings'
import type { StringKeys } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import routes from '@common/RouteDefinitions'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import css from './ModuleListCard.module.scss'

interface ModuleListCardProps {
  module: ModuleName
  orgIdentifier: string
  projectIdentifier: string
  accountId: string
}

const ModuleListCard: React.FC<ModuleListCardProps> = ({ module, projectIdentifier, orgIdentifier, accountId }) => {
  const { getString } = useStrings()
  const history = useHistory()
  // currently initializing enableActivityChart to false to hide the chartView
  const enableActivityChart = false
  const getModuleLinks = (): React.ReactElement => {
    switch (module) {
      case ModuleName.CD:
        return (
          <Layout.Vertical spacing="medium">
            <RbacButton
              text={<String stringID="moduleRenderer.newPipeLine" />}
              minimal
              onClick={() => {
                history.push(
                  routes.toPipelineStudio({
                    accountId,
                    orgIdentifier,
                    projectIdentifier,
                    pipelineIdentifier: '-1',
                    module: 'cd'
                  })
                )
              }}
              permission={{
                permission: PermissionIdentifier.EDIT_PIPELINE,
                resource: {
                  resourceType: ResourceType.PIPELINE
                }
              }}
            />

            <RbacButton
              text={<String stringID="moduleRenderer.viewPipelines" />}
              minimal
              onClick={() => {
                history.push(routes.toPipelines({ accountId, orgIdentifier, projectIdentifier, module: 'cd' }))
              }}
              permission={{
                permission: PermissionIdentifier.VIEW_PIPELINE,
                resource: {
                  resourceType: ResourceType.PIPELINE
                }
              }}
            />
          </Layout.Vertical>
        )
      case ModuleName.CV:
        return (
          <Layout.Vertical spacing="medium">
            <Button
              minimal
              text={getString('moduleRenderer.monitoringSources')}
              onClick={() => {
                history.push(`${routes.toCVMonitoringServices({ accountId, orgIdentifier, projectIdentifier })}`)
              }}
            />
          </Layout.Vertical>
        )
      case ModuleName.CI:
        return (
          <Layout.Vertical spacing="medium">
            <RbacButton
              text={<String stringID="moduleRenderer.newPipeLine" />}
              minimal
              onClick={() => {
                history.push(
                  routes.toPipelineStudio({
                    accountId,
                    orgIdentifier,
                    projectIdentifier,
                    pipelineIdentifier: '-1',
                    module: 'ci'
                  })
                )
              }}
              permission={{
                permission: PermissionIdentifier.EDIT_PIPELINE,
                resource: {
                  resourceType: ResourceType.PIPELINE
                }
              }}
            />

            <RbacButton
              text={<String stringID="moduleRenderer.viewPipelines" />}
              onClick={() => {
                history.push(routes.toPipelines({ accountId, orgIdentifier, projectIdentifier, module: 'ci' }))
              }}
              minimal
              permission={{
                permission: PermissionIdentifier.VIEW_PIPELINE,
                resource: {
                  resourceType: ResourceType.PIPELINE
                }
              }}
            />
          </Layout.Vertical>
        )
      case ModuleName.CE:
        return (
          <Layout.Vertical spacing="medium">
            <Button minimal text={getString('moduleRenderer.newPipeLine')} />
            <Button minimal text={getString('moduleRenderer.viewPipelines')} />
          </Layout.Vertical>
        )
      case ModuleName.CF:
        return (
          <Layout.Vertical spacing="medium">
            <Button minimal text={getString('moduleRenderer.newPipeLine')} />
            <Button minimal text={getString('moduleRenderer.viewPipelines')} />
          </Layout.Vertical>
        )
      /* istanbul ignore next */
      default:
        return <></>
    }
  }

  return (
    <>
      <Card className={css.card}>
        <Layout.Horizontal>
          <Container
            width="50%"
            flex
            border={{ right: true, color: enableActivityChart ? Color.GREY_300 : Color.WHITE }}
          >
            <Layout.Horizontal flex spacing="large">
              <Icon name={getModuleIcon(module)} size={70}></Icon>
              <div>
                <Layout.Vertical padding={{ bottom: 'medium' }}>
                  <Text font={{ size: 'small' }}>{getString(getModuleTitle(module))}</Text>
                  <Text font={{ size: 'medium' }} color={Color.BLACK}>
                    {getModulePurpose(module)}
                  </Text>
                </Layout.Vertical>
                <Layout.Horizontal spacing="xsmall" className={css.enable}>
                  <Icon name="tick" color={Color.WHITE}></Icon>
                  <Text color={Color.WHITE}>{getString('enabledLabel')}</Text>
                </Layout.Horizontal>
              </div>
            </Layout.Horizontal>
          </Container>
          {enableActivityChart ? (
            <Container width="40%" border={{ right: true, color: enableActivityChart ? Color.GREY_300 : Color.WHITE }}>
              <Layout.Vertical flex={{ align: 'center-center' }}>
                <Layout.Horizontal flex={{ align: 'center-center' }} spacing="xxlarge">
                  <SparkChart data={[2, 3, 4, 5, 4, 3, 2]} className={css.activitychart} />
                  <Text color={Color.GREY_400} font={{ size: 'medium' }}>
                    {getString('projectsOrgs.placeholder')}
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
          ) : null}
          <Container width="50%" flex>
            {getModuleLinks()}
          </Container>
        </Layout.Horizontal>
      </Card>
    </>
  )
}

export default ModuleListCard
