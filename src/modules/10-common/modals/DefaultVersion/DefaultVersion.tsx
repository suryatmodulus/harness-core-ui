import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import { Versions } from '@common/constants/Utils'
import DefaultVersionForm from './views/DefaultVersionForm'
import css from './DefaultVersion.module.scss'

interface Props {
  onSuccess: () => void
}

interface ModalReturn {
  openDefaultVersionModal: (_currentVersion: Versions) => void
  closeDefaultVersionModal: () => void
}

export const useDefaultVersionModal = ({ onSuccess }: Props): ModalReturn => {
  const [currentVersion, setCurrentVersion] = React.useState<Versions>(Versions.CG)
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen title="" onClose={hideModal} className={cx(css.dialog, Classes.DIALOG)}>
        <DefaultVersionForm
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
          currentVersion={currentVersion}
          setCurrentVersion={setCurrentVersion}
        />
      </Dialog>
    ),
    [currentVersion]
  )

  const open = React.useCallback(
    (_currentVersion: Versions) => {
      setCurrentVersion(_currentVersion)
      showModal()
    },
    [showModal]
  )

  return {
    openDefaultVersionModal: open,
    closeDefaultVersionModal: hideModal
  }
}
