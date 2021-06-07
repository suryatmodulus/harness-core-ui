import React, { useState } from 'react'

import { Text, Layout, Icon, IconName, Container, Button, Card, Color } from '@wings-software/uicore'

import { Link, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { Project } from 'services/cd-ng'
import { usePutProject } from 'services/cd-ng'
import { String, useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { ModuleName } from 'framework/types/ModuleName'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner } from '@common/components'
import css from './Purpose.module.scss'

interface ProjectModalData {
  data: Project
}

interface PurposeType {
  title: React.ReactElement
  icon: IconName
  Description: React.ReactElement
  module: Required<Project>['modules'][number]
}
const getModuleLinks = (
  module: Required<Project>['modules'][number],
  orgIdentifier: string,
  projectIdentifier: string,
  accountId: string
): React.ReactElement => {
  switch (module) {
    case ModuleName.CD:
      return (
        <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>
            {<String stringID="projectsOrgs.purposeList.cd" />}
          </Text>
          <Link
            to={routes.toPipelineStudio({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier: '-1',
              accountId,
              module: 'cd'
            })}
          >
            {<String stringID="moduleRenderer.newPipeLine" />}
          </Link>
        </Layout.Vertical>
      )
    case ModuleName.CV:
      return (
        <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>
            {<String stringID="projectsOrgs.purposeList.cv" />}
          </Text>
          <Link to={routes.toCVAdminSetup({ accountId, orgIdentifier, projectIdentifier })}>
            {<String stringID="projectsOrgs.purposeList.linkcvChangeSources" />}
          </Link>
          <Link to={`${routes.toCVAdminSetup({ accountId, orgIdentifier, projectIdentifier })}?step=2`}>
            {<String stringID="projectsOrgs.purposeList.linkcv" />}
          </Link>
        </Layout.Vertical>
      )
    case ModuleName.CI:
      return (
        <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>
            {<String stringID="projectsOrgs.purposeList.ci" />}
          </Text>
          <Link
            to={routes.toPipelineStudio({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier: '-1',
              accountId,
              module: 'ci'
            })}
          >
            {<String stringID="moduleRenderer.newPipeLine" />}
          </Link>
        </Layout.Vertical>
      )
    case ModuleName.CE:
      return (
        <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>
            {<String stringID="projectsOrgs.purposeList.ce" />}
          </Text>
          <Link to={''}>{<String stringID="tbd" />}</Link>
        </Layout.Vertical>
      )
    case ModuleName.CF:
      return (
        <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>
            {<String stringID="projectsOrgs.purposeList.cf" />}
          </Text>
          <Link to={''}>{<String stringID="tbd" />}</Link>
        </Layout.Vertical>
      )
    default:
      /* istanbul ignore next */
      return <></>
  }
}

const CDNG_OPTIONS: PurposeType = {
  title: <String stringID="projectsOrgs.purposeList.delivery" />,
  icon: 'cd-main',
  Description: <String stringID="projectsOrgs.purposeList.descriptionCD" />,
  module: ModuleName.CD
}
const CVNG_OPTIONS: PurposeType = {
  title: <String stringID="projectsOrgs.purposeList.verification" />,
  icon: 'cv-main',
  Description: <String stringID="projectsOrgs.purposeList.descriptionCV" />,
  module: ModuleName.CV
}

const CING_OPTIONS: PurposeType = {
  title: <String stringID="projectsOrgs.purposeList.integration" />,
  icon: 'ci-main',
  Description: <String stringID="projectsOrgs.purposeList.descriptionCI" />,
  module: ModuleName.CI
}

const CENG_OPTIONS: PurposeType = {
  title: <String stringID="projectsOrgs.purposeList.efficiency" />,
  icon: 'ce-main',
  Description: <String stringID="projectsOrgs.purposeList.descriptionCE" />,
  module: ModuleName.CE
}

const CFNG_OPTIONS: PurposeType = {
  title: <String stringID="projectsOrgs.purposeList.features" />,
  icon: 'cf-main',
  Description: <String stringID="projectsOrgs.purposeList.descriptionCF" />,
  module: ModuleName.CF
}

const PurposeList: React.FC<ProjectModalData> = props => {
  const { data: projectData } = props
  const [selected, setSelected] = useState<Required<Project>['modules']>([])
  const { getString } = useStrings()
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()
  const { showSuccess, showError } = useToaster()

  const { accountId } = useParams<AccountPathProps>()
  const { mutate: updateProject, loading: updatingProject } = usePutProject({
    identifier: projectData.identifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: projectData.orgIdentifier
    }
  })

  const addModule = async (module: Required<Project>['modules'][number]): Promise<void> => {
    projectData.modules?.push(module)
    const dataToSubmit: Project = projectData
    try {
      await updateProject({ project: dataToSubmit })
      showSuccess(getString('projectsOrgs.purposeList.moduleSuccess'))
      const newSelected = [...selected, module]
      setSelected(newSelected)
    } catch (err) {
      /* istanbul ignore next */
      showError(err.data?.message || err.message)
    }
  }

  const getOptions = (): PurposeType[] => {
    const options: PurposeType[] = []
    if (CDNG_ENABLED) options.push(CDNG_OPTIONS)
    if (CVNG_ENABLED) options.push(CVNG_OPTIONS)
    if (CING_ENABLED) options.push(CING_OPTIONS)
    if (CENG_ENABLED) options.push(CENG_OPTIONS)
    if (CFNG_ENABLED) options.push(CFNG_OPTIONS)
    return options
  }

  return (
    <Layout.Vertical spacing="large" padding="huge">
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {getString('projectsOrgs.purposeList.name')}
      </Text>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Container width="60%" className={css.border}>
          {getOptions().map(option => (
            <Card key={option.module} className={css.card}>
              <Layout.Horizontal spacing="small">
                <Icon name={option.icon} size={30} />
                <div>
                  <Text font="small">{getString('projectsOrgs.purposeList.continuous')}</Text>
                  <Text font={{ size: 'medium' }} padding={{ bottom: 'xxlarge' }} color={Color.BLACK}>
                    {option.title}
                  </Text>
                </div>
              </Layout.Horizontal>

              <Text font="small" padding={{ bottom: 'xxlarge' }} className={css.description}>
                {option.Description}
              </Text>
              <Layout.Horizontal spacing="large">
                <Text font="small" className={css.time}>
                  {getString('projectsOrgs.purposeList.time')}
                </Text>
                {selected.includes(option.module) ? (
                  <Button
                    font={{ size: 'small', weight: 'semi-bold' }}
                    className={css.enabled}
                    icon="tick"
                    iconProps={{ size: 10, padding: 'xsmall' }}
                  >
                    {getString('enabledLabel')}
                  </Button>
                ) : (
                  <Button
                    font={{ size: 'small', weight: 'semi-bold' }}
                    className={css.enable}
                    data-testid={option.module}
                    onClick={() => {
                      addModule(option.module)
                    }}
                  >
                    {getString('enable')}
                  </Button>
                )}
              </Layout.Horizontal>
            </Card>
          ))}
        </Container>
        <Container width="40%" padding={{ left: 'huge', top: 'medium' }}>
          {selected.length === 0 ? (
            <Text font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('projectsOrgs.purposeList.selectAModule')}
            </Text>
          ) : (
            selected.map(module =>
              getModuleLinks(
                module,
                projectData.orgIdentifier || /* istanbul ignore next */ '',
                projectData.identifier,
                accountId
              )
            )
          )}
        </Container>
      </Layout.Horizontal>
      {updatingProject && <PageSpinner />}
    </Layout.Vertical>
  )
}

export default PurposeList
