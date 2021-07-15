import React from 'react'
import { Button, Card, Color, Icon, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { getModuleIcon } from '@common/utils/utils'
import { getModuleDescription, getModulePurpose } from '@projects-orgs/utils/utils'
import type { ModuleName } from 'framework/types/ModuleName'
import { usePutProject, Project } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './ModuleEnableCard.module.scss'

interface ModuleEnableCardProps {
  data: Project
  module: ModuleName
  refetchProject: () => void
}

const ModuleEnableCard: React.FC<ModuleEnableCardProps> = ({ data, module, refetchProject }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
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
      showSuccess(getString('projectsOrgs.moduleSuccess'))
      refetchProject()
    } catch (err) {
      /* istanbul ignore next */
      showError(err.data?.message || err.message)
    }
  }

  return (
    <Card elevation={0} className={css.card}>
      <Layout.Horizontal spacing="small">
        <Icon name={getModuleIcon(module)} size={30} />
        <div>
          <Text font="small">{getString('projectsOrgs.purposeList.continuous')}</Text>
          <Text font={{ size: 'medium' }} padding={{ bottom: 'xxlarge' }} color={Color.BLACK}>
            {getModulePurpose(module)}
          </Text>
        </div>
      </Layout.Horizontal>

      <Text font="small" padding={{ bottom: 'xxlarge' }} className={css.description}>
        {getString(getModuleDescription(module))}
      </Text>
      <Layout.Horizontal spacing="xxlarge">
        <Text font="small" className={css.time}>
          {getString('projectsOrgs.purposeList.time')}
        </Text>
        <Button font={{ size: 'small', weight: 'semi-bold' }} className={css.enable} onClick={onSelect}>
          {getString('enable')}
        </Button>
      </Layout.Horizontal>
    </Card>
  )
}

export default ModuleEnableCard
