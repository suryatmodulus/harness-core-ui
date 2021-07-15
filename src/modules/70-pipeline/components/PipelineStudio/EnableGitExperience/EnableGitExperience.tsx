import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import { Button, Container, Icon, Layout } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { canEnableGitExperience } from '@gitsync/common/gitSyncUtils'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import css from './EnableGitExperience.module.scss'

export const EnableGitExperience: React.FC = (): JSX.Element => {
  const { getString } = useStrings()
  const { updateAppStore } = useAppStore()
  const { refreshStore } = useGitSyncStore()
  const { isReadonly } = React.useContext(PipelineContext)
  const [canEnableGit, setCanEnableGit] = useState<boolean>(false)
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()

  useEffect(() => {
    canEnableGitExperience({ projectIdentifier, orgIdentifier, accountId, module }).then((canEnable: boolean) =>
      setCanEnableGit(canEnable)
    )
  }, [projectIdentifier, orgIdentifier, accountId, module])

  const { openGitSyncModal } = useCreateGitSyncModal({
    onSuccess: () => {
      refreshStore()
      updateAppStore({ isGitSyncEnabled: true })
    },
    onClose: noop
  })

  return (
    <Container className={css.enableGitExpContainer}>
      <div className={css.enableGitExpHeader}>
        <Icon size={32} name={'service-github'} />
        <span className={css.enableGitExpHeaderText}>{getString('enableGitExperience')}</span>
      </div>
      <div className={css.enableGitExpContent}>{getString('common.enableGitSyncPipeline')}</div>
      <Layout.Horizontal border={{ top: true }} padding={{ top: 'medium' }} margin={{ top: 'medium' }}>
        <RbacButton
          margin={{ right: 'medium' }}
          intent="primary"
          text={getString('enableGitExperience')}
          data-tooltip-id="enableGitExpBtn"
          data-test-id="enableGitExpBtn"
          onClick={() => openGitSyncModal(true, false, undefined)}
          disabled={isReadonly || !canEnableGit}
          tooltip={!canEnableGit ? getString('gitsync.gitEnabledBlockedTooltip') : undefined}
          permission={{
            permission: PermissionIdentifier.UPDATE_PROJECT,
            resource: {
              resourceType: ResourceType.PROJECT,
              resourceIdentifier: projectIdentifier
            }
          }}
        />
        <Button
          text={getString('pipeline.gitExperience.skipNow')}
          data-tooltip-id="skipNowBtn"
          data-test-id="skipNowBtn"
          className={Classes.POPOVER_DISMISS}
          disabled={isReadonly}
        />
      </Layout.Horizontal>
    </Container>
  )
}
