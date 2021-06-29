import React from 'react'
import { useParams } from 'react-router-dom'

import { Text, Container, Icon, Color } from '@wings-software/uicore'

import { noop } from 'lodash-es'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import css from './NewUserView.module.scss'

const NewUserView: React.FC = () => {
  const { updateAppStore } = useAppStore()
  const { refreshStore } = useGitSyncStore()
  const { projectIdentifier } = useParams<ProjectPathProps>()

  const { openGitSyncModal } = useCreateGitSyncModal({
    onSuccess: () => {
      refreshStore()
      updateAppStore({ isGitSyncEnabled: true })
    },
    onClose: noop
  })
  const { getString } = useStrings()
  return (
    <Container className={css.pageContainer}>
      <Container padding={{ bottom: 'large' }}>
        <Icon size={120} name="git-landing-page" />
      </Container>

      <Text margin="medium" color={Color.GREY_600} font={{ size: 'large', weight: 'semi-bold' }}>
        {getString('enableGitExperience')}
      </Text>
      <Text>{getString('gitExperienceNewUserText')}</Text>
      <RbacButton
        intent="primary"
        margin="large"
        font={{ size: 'medium' }}
        className={css.gitEnableBtn}
        text={getString('enableGitExperience')}
        onClick={() => openGitSyncModal(true, false, undefined)}
        permission={{
          permission: PermissionIdentifier.UPDATE_PROJECT,
          resource: {
            resourceType: ResourceType.PROJECT,
            resourceIdentifier: projectIdentifier
          }
        }}
      />
    </Container>
  )
}

export default NewUserView
