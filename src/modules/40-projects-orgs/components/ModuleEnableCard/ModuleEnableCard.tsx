import React from 'react'
import { Button, Card, Color, Icon, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import i18n from '@projects-orgs/pages/projects/ProjectsPage.i18n'
import { getModuleDescription, getModuleIcon, getModulePurpose } from '@projects-orgs/utils/utils'
import type { ModuleName } from 'framework/exports'
import { usePutProject, Project } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import css from './ModuleEnableCard.module.scss'

interface ModuleEnableCardProps {
  data: Project
  module: ModuleName
  refetchProject: () => void
}

const ModuleEnableCard: React.FC<ModuleEnableCardProps> = ({ data, module, refetchProject }) => {
  const { accountId }: any = useParams()
  const { showSuccess, showError } = useToaster()

  const { mutate: updateProject } = usePutProject({
    identifier: '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: ''
    }
  })
  const onSelect = async (): Promise<void> => {
    data.modules?.push(module as Required<Project>['modules'][number])
    try {
      await updateProject(
        { project: data },
        {
          pathParams: {
            identifier: data.identifier
          },
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier: data.orgIdentifier
          }
        }
      )
      showSuccess(i18n.moduleSuccess)
      refetchProject()
    } catch (e) {
      /* istanbul ignore next */
      showError(e.data.message)
    }
  }

  return (
    <Card elevation={0} className={css.card}>
      <Layout.Horizontal spacing="small">
        <Icon name={getModuleIcon(module)} size={30} />
        <div>
          <Text font="small">{i18n.newProjectWizard.purposeList.continuous}</Text>
          <Text font={{ size: 'medium' }} padding={{ bottom: 'xxlarge' }} color={Color.BLACK}>
            {getModulePurpose(module)}
          </Text>
        </div>
      </Layout.Horizontal>

      <Text font="small" padding={{ bottom: 'xxlarge' }} className={css.description}>
        {getModuleDescription(module)}
      </Text>
      <Layout.Horizontal spacing="xxlarge">
        <Text font="small" className={css.time}>
          {i18n.newProjectWizard.purposeList.time}
        </Text>
        <Button font={{ size: 'small', weight: 'semi-bold' }} className={css.enable} onClick={onSelect}>
          {i18n.newProjectWizard.purposeList.enable}
        </Button>
      </Layout.Horizontal>
    </Card>
  )
}

export default ModuleEnableCard
