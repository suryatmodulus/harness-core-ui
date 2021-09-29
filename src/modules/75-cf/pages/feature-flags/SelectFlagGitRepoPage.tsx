import React, { ReactElement, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Text, Container, Icon, Color, FontVariation } from '@wings-software/uicore'
import type { ProjectPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import SaveFlagRepoDialog from '@cf/components/SaveFlagRepoDialog/SaveFlagRepoDialog'
import CreateNewFlagRepoDialog from '@cf/components/CreateNewFlagRepoDialog/CreateNewFlagRepoDialog'
import css from './SelectFlagGitRepoPage.module.scss'

interface SelectFlagGitRepoPageProps {
  gitRepoRefetch: () => void
}

const SelectFlagGitRepoPage = ({ gitRepoRefetch }: SelectFlagGitRepoPageProps): ReactElement => {
  const { projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const [isExistingRepoModalOpen, setIsExistingRepoModalOpen] = useState(false)
  const [isCreateNewRepoModalOpen, setIsCreateNewRepoModalOpen] = useState(false)
  const { getString } = useStrings()

  return (
    <GitSyncStoreProvider>
      <Container className={css.pageContainer}>
        <Container className={css.pageContent}>
          <Icon size={120} name="git-landing-page" />
          <Text margin="medium" color={Color.GREY_600} font={{ variation: FontVariation.H2 }}>
            {getString('cf.selectFlagRepo.introText')}
          </Text>
          <RbacButton
            intent="primary"
            margin="large"
            font={{ size: 'medium' }}
            text={getString('cf.selectFlagRepo.useExistingRepo')}
            onClick={() => setIsExistingRepoModalOpen(true)}
            permission={{
              permission: PermissionIdentifier.UPDATE_PROJECT,
              resource: {
                resourceType: ResourceType.PROJECT,
                resourceIdentifier: projectIdentifier
              }
            }}
          />
          <RbacButton
            intent="none"
            margin="large"
            font={{ size: 'medium' }}
            text={getString('cf.selectFlagRepo.newRepo')}
            onClick={() => setIsCreateNewRepoModalOpen(true)}
            permission={{
              permission: PermissionIdentifier.UPDATE_PROJECT,
              resource: {
                resourceType: ResourceType.PROJECT,
                resourceIdentifier: projectIdentifier
              }
            }}
          />
          <CreateNewFlagRepoDialog
            isOpen={isCreateNewRepoModalOpen}
            closeModal={() => setIsCreateNewRepoModalOpen(false)}
            gitRepoRefetch={gitRepoRefetch}
          />

          <SaveFlagRepoDialog
            isOpen={isExistingRepoModalOpen}
            closeModal={() => setIsExistingRepoModalOpen(false)}
            gitRepoRefetch={gitRepoRefetch}
          />
        </Container>
      </Container>
    </GitSyncStoreProvider>
  )
}

export default SelectFlagGitRepoPage
