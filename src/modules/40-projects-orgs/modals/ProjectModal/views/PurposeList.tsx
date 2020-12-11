import React, { useState } from 'react'

import { Text, Layout, Icon, IconName, Container, Button, Card, Color } from '@wings-software/uikit'

import { Link, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { Project } from 'services/cd-ng'
import { usePutProject } from 'services/cd-ng'
import i18n from '@projects-orgs/pages/projects/ProjectsPage.i18n'
import { useToaster } from '@common/exports'
import { ModuleName } from 'framework/exports'
import css from './Purpose.module.scss'

interface ProjectModalData {
  data: Project
}

interface PurposeType {
  title: string
  icon: IconName
  Description: string
  module: Required<Project>['modules'][number]
}

const options: PurposeType[] = [
  {
    title: i18n.newProjectWizard.purposeList.delivery,
    icon: 'cd-main',
    Description: i18n.newProjectWizard.purposeList.descriptionCD,
    module: ModuleName.CD
  },
  {
    title: i18n.newProjectWizard.purposeList.verification,
    icon: 'cv-main',
    Description: i18n.newProjectWizard.purposeList.descriptionCV,
    module: ModuleName.CV
  },
  {
    title: i18n.newProjectWizard.purposeList.integration,
    icon: 'ci-main',
    Description: i18n.newProjectWizard.purposeList.descriptionCI,
    module: ModuleName.CI
  },
  {
    title: i18n.newProjectWizard.purposeList.efficiency,
    icon: 'ce-main',
    Description: i18n.newProjectWizard.purposeList.descriptionCE,
    module: ModuleName.CE
  },
  {
    title: i18n.newProjectWizard.purposeList.features,
    icon: 'cf-main',
    Description: i18n.newProjectWizard.purposeList.descriptionCF,
    module: ModuleName.CF
  }
]

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
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{i18n.newProjectWizard.purposeList.cd}</Text>
          <Link
            to={routes.toCDPipelineStudio({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier: '-1',
              accountId
            })}
          >
            {i18n.newProjectWizard.purposeList.linkcd}
          </Link>
        </Layout.Vertical>
      )
    case ModuleName.CV:
      return (
        <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{i18n.newProjectWizard.purposeList.cv}</Text>
          <Link
            to={routes.toCDPipelineStudio({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier: '-1',
              accountId
            })}
          >
            {i18n.newProjectWizard.purposeList.linkcv}
          </Link>
        </Layout.Vertical>
      )
    case ModuleName.CI:
      return (
        <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{i18n.newProjectWizard.purposeList.ci}</Text>
          <Link
            to={routes.toCIPipelineStudio({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier: '-1',
              accountId
            })}
          >
            {i18n.newProjectWizard.purposeList.linkci}
          </Link>
        </Layout.Vertical>
      )
    case ModuleName.CE:
      return (
        <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{i18n.newProjectWizard.purposeList.ce}</Text>
          <Link
            to={routes.toCDPipelineStudio({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier: '-1',
              accountId
            })}
          >
            {i18n.newProjectWizard.purposeList.linkce}
          </Link>
        </Layout.Vertical>
      )
    case ModuleName.CF:
      return (
        <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{i18n.newProjectWizard.purposeList.cf}</Text>
          <Link
            to={routes.toCDPipelineStudio({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier: '-1',
              accountId
            })}
          >
            {i18n.newProjectWizard.purposeList.linkcf}
          </Link>
        </Layout.Vertical>
      )
    default:
      /* istanbul ignore next */
      return <></>
  }
}

const PurposeList: React.FC<ProjectModalData> = props => {
  const { data: projectData } = props
  const { accountId } = useParams()
  const [selected, setSelected] = useState<Required<Project>['modules']>([])
  const { showSuccess, showError } = useToaster()
  const { mutate: updateProject } = usePutProject({
    identifier: '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: ''
    }
  })
  const onSuccess = async (module: Required<Project>['modules'][number]): Promise<void> => {
    projectData.modules?.push(module)
    const dataToSubmit: Project = projectData
    try {
      await updateProject(dataToSubmit, {
        pathParams: {
          identifier: projectData.identifier
        },
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier: projectData.orgIdentifier
        }
      })
      showSuccess(i18n.moduleSuccess)
      const newSelected = [...selected, module]
      setSelected(newSelected)
    } catch (e) {
      /* istanbul ignore next */
      showError(e.data.message)
    }
  }
  return (
    <Layout.Vertical spacing="large" className={css.modalPage}>
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {i18n.newProjectWizard.purposeList.name}
      </Text>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Container width="65%">
          <div className={css.border}>
            {options.map(option => (
              <Card key={option.title} className={css.card}>
                <Layout.Horizontal spacing="small">
                  <Icon name={option.icon} size={30} />
                  <div>
                    <Text font="small">{i18n.newProjectWizard.purposeList.continuous}</Text>
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
                    {i18n.newProjectWizard.purposeList.time}
                  </Text>
                  {selected.includes(option.module) ? (
                    <Button
                      font={{ size: 'small', weight: 'semi-bold' }}
                      className={css.enabled}
                      icon="tick"
                      iconProps={{ size: 10, padding: 'xsmall' }}
                    >
                      {i18n.newProjectWizard.purposeList.enabled}
                    </Button>
                  ) : (
                    <Button
                      font={{ size: 'small', weight: 'semi-bold' }}
                      className={css.enable}
                      onClick={() => {
                        onSuccess(option.module)
                      }}
                    >
                      {i18n.newProjectWizard.purposeList.enable}
                    </Button>
                  )}
                </Layout.Horizontal>
              </Card>
            ))}
          </div>
        </Container>
        <Container width="35%" padding={{ left: 'huge', top: 'medium' }}>
          {selected.length === 0 ? (
            <Text font={{ size: 'medium', weight: 'semi-bold' }}>
              {i18n.newProjectWizard.purposeList.selectAModule}
            </Text>
          ) : (
            selected.map(module =>
              getModuleLinks(
                module,
                projectData.orgIdentifier || '',
                projectData.identifier,
                projectData.accountIdentifier || ''
              )
            )
          )}
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default PurposeList
