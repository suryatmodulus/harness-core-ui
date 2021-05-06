import React from 'react'
import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'

// interface ConfigDialogProps {
//   onSubmit: any
//   onClose: any
// }
const useConfigDialog = () => {
  const modalProps = {
    isOpen: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true
  }
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} className={cx(Classes.DIALOG)} {...modalProps}>
        test dialog
      </Dialog>
    ),
    []
  )
  return {
    showModal,
    hideModal
  }
}

export default useConfigDialog
