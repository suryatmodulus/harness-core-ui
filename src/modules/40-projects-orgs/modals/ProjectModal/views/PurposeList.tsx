import React, { useState } from 'react'

import { Text, Layout, Icon, IconName, Container, Button, Card, Color } from '@wings-software/uicore'

import { Link, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { Project } from 'services/cd-ng'
import { usePutProject } from 'services/cd-ng'
import i18n from '@projects-orgs/pages/projects/ProjectsPage.i18n'
import { useToaster } from '@common/exports'
import { ModuleName } from 'framework/exports'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import css from './Purpose.module.scss'

interface ProjectModalData {
  data: Project
  onSuccess?: () => void
}

interface PurposeType {
  title: string
  icon: IconName
  Description: string
  module: Required<Project>['modules'][number]
}
const CDNG_OPTIONS: PurposeType = {
  title: i18n.newProjectWizard.purposeList.delivery,
  icon: 'cd-main',
  Description: i18n.newProjectWizard.purposeList.descriptionCD,
  module: ModuleName.CD
}
const CVNG_OPTIONS: PurposeType = {
  title: i18n.newProjectWizard.purposeList.verification,
  icon: 'cv-main',
  Description: i18n.newProjectWizard.purposeList.descriptionCV,
  module: ModuleName.CV
}

const CING_OPTIONS: PurposeType = {
  title: i18n.newProjectWizard.purposeList.integration,
  icon: 'ci-main',
  Description: i18n.newProjectWizard.purposeList.descriptionCI,
  module: ModuleName.CI
}

const CENG_OPTIONS: PurposeType = {
  title: i18n.newProjectWizard.purposeList.efficiency,
  icon: 'ce-main',
  Description: i18n.newProjectWizard.purposeList.descriptionCE,
  module: ModuleName.CE
}

const CFNG_OPTIONS: PurposeType = {
  title: i18n.newProjectWizard.purposeList.features,
  icon: 'cf-main',
  Description: i18n.newProjectWizard.purposeList.descriptionCF,
  module: ModuleName.CF
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
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{i18n.newProjectWizard.purposeList.cd}</Text>
          <Link
            to={routes.toPipelineStudio({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier: '-1',
              accountId,
              module: 'cd'
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
          <Link to={routes.toCVAdminSetup({ accountId, orgIdentifier, projectIdentifier })}>
            {i18n.newProjectWizard.purposeList.linkcvChangeSources}
          </Link>
          <Link to={`${routes.toCVAdminSetup({ accountId, orgIdentifier, projectIdentifier })}?step=2`}>
            {i18n.newProjectWizard.purposeList.linkcv}
          </Link>
        </Layout.Vertical>
      )
    case ModuleName.CI:
      return (
        <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{i18n.newProjectWizard.purposeList.ci}</Text>
          <Link
            to={routes.toPipelineStudio({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier: '-1',
              accountId,
              module: 'ci'
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
          <Link to={''}>{i18n.newProjectWizard.purposeList.linkce}</Link>
        </Layout.Vertical>
      )
    case ModuleName.CF:
      return (
        <Layout.Vertical key={module} spacing="large" padding={{ bottom: 'xxxlarge' }}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{i18n.newProjectWizard.purposeList.cf}</Text>
          <Link to={''}>{i18n.newProjectWizard.purposeList.linkcf}</Link>
        </Layout.Vertical>
      )
    default:
      /* istanbul ignore next */
      return <></>
  }
}

const PurposeList: React.FC<ProjectModalData> = props => {
  const { data: projectData, onSuccess } = props
  const { accountId } = useParams()
  const [selected, setSelected] = useState<Required<Project>['modules']>([])
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()
  const { showSuccess, showError } = useToaster()
  const { mutate: updateProject } = usePutProject({
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
      showSuccess(i18n.moduleSuccess)
      onSuccess?.()
      const newSelected = [...selected, module]
      setSelected(newSelected)
    } catch (e) {
      /* istanbul ignore next */
      showError(e.data.message)
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
    <Layout.Vertical spacing="large" className={css.modalPage}>
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
        {i18n.newProjectWizard.purposeList.name}
      </Text>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Container width="65%">
          <div className={css.border}>
            {getOptions().map(option => (
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
                      data-testid={option.module}
                      onClick={() => {
                        addModule(option.module)
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
                projectData.orgIdentifier || /* istanbul ignore next */ '',
                projectData.identifier,
                accountId
              )
            )
          )}
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default PurposeList
