import React from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { useStrings } from 'framework/strings'

import { TrialModalTemplate } from '@common/components/TrialModalTemplate/TrialModalTemplate'
import SetupCloudProviderModalChild from '@ce/components/SetupCloudProviderModalChild/SetupCloudProviderModalChild'
import { CreateOrSelectAProjectTemplate } from '@projects-orgs/components/CreateOrSelectAProjectTemplate/CreateOrSelectAProjectTemplate'
import type { Project } from 'services/cd-ng'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import ceImage from './images/Illustration.png'

import css from './useCETrialModal.module.scss'

interface CETrialModalData {
  openProjectModal?: () => void
  closeModal?: () => void
  isProjectSelected: boolean
  routeToCE: (provider: ConnectorInfoDTO['type'], project?: Project) => void
}

interface UseCETrialModalProps {
  openProjectModal?: () => void
  onClose?: () => void
  isProjectSelected: boolean
  routeToCE: (provider: ConnectorInfoDTO['type'], project?: Project) => void
}

interface UseCETrialModalReturn {
  showModal: () => void
  hideModal: () => void
}

const CETrial: React.FC<CETrialModalData> = ({ openProjectModal, closeModal, isProjectSelected, routeToCE }) => {
  const { getString } = useStrings()

  const description = getString('common.purpose.ce.descriptionOnly')

  function getChildComponent(): React.ReactElement {
    if (!isProjectSelected && openProjectModal) {
      const moduleDescription = getString('ce.continuous')

      return (
        <CreateOrSelectAProjectTemplate
          onCreateProject={openProjectModal}
          moduleDescription={moduleDescription}
          closeModal={closeModal}
        />
      )
    }

    return <SetupCloudProviderModalChild routeToCE={routeToCE} closeModal={closeModal} />
  }

  return (
    <TrialModalTemplate
      iconName="ci-main"
      title={getString('ce.continuous')}
      description={description}
      imgSrc={ceImage}
      rightWidth="40%"
    >
      {getChildComponent()}
    </TrialModalTemplate>
  )
}

const useCETrialModal = (props: UseCETrialModalProps): UseCETrialModalReturn => {
  const { openProjectModal, onClose, isProjectSelected, routeToCE } = props

  const [showModal, hideModal] = useModalHook(() => {
    function closeModal(): void {
      onClose?.()
      hideModal()
    }

    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={closeModal}
        className={cx(css.dialog, Classes.DIALOG, css.ceTrial)}
      >
        <CETrial
          openProjectModal={openProjectModal}
          isProjectSelected={isProjectSelected}
          closeModal={closeModal}
          routeToCE={routeToCE}
        />
        <Button
          aria-label="close modal"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={closeModal}
          className={css.crossIcon}
        />
      </Dialog>
    )
  }, [isProjectSelected, onClose])

  return {
    showModal,
    hideModal
  }
}

export default useCETrialModal
