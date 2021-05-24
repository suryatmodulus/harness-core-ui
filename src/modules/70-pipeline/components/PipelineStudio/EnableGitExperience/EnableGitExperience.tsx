import React, { SyntheticEvent } from 'react'
import { noop } from 'lodash-es'
import { Button, Container, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'

import { PipelineContext } from '../PipelineContext/PipelineContext'
import css from './EnableGitExperience.module.scss'

interface EnableGitExperienceProps {
  closeDrawer: (e?: SyntheticEvent<HTMLElement, Event> | undefined) => void
}
export const EnableGitExperience: React.FC<EnableGitExperienceProps> = (props): JSX.Element => {
  const { getString } = useStrings()
  const { updateAppStore } = useAppStore()
  const { refreshStore } = useGitSyncStore()
  const { isReadonly } = React.useContext(PipelineContext)

  const { openGitSyncModal } = useCreateGitSyncModal({
    onSuccess: () => {
      refreshStore()
      updateAppStore({ isGitSyncEnabled: true })
    },
    onClose: noop
  })

  return (
    <Container className={css.enableGitExpContainer}>
      <div className={css.enableGitExpContent}>
        Git Experience allows you to store the pipeline and other harness configurations in the git alongside with your
        code. With this, Git will act as the single source of truth for all your code and configurations.
      </div>
      <Layout.Horizontal border={{ top: true }} padding={{ top: 'medium' }} margin={{ top: 'medium' }}>
        <Button
          margin={{ right: 'medium' }}
          intent="primary"
          text={getString('enableGitExperience')}
          data-tooltip-id="enableGitExpBtn"
          data-test-id="enableGitExpBtn"
          onClick={() => openGitSyncModal(true, false, undefined)}
          disabled={isReadonly}
        />
        <Button
          text={getString('pipeline.gitExperience.skipNow')}
          data-tooltip-id="skipNowBtn"
          data-test-id="skipNowBtn"
          onClick={() => props.closeDrawer()}
          disabled={isReadonly}
        />
      </Layout.Horizontal>
    </Container>
  )
}
