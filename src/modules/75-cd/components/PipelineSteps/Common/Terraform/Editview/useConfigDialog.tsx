import React from 'react'
import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'

import ConfigForm from './ConfigForm'

interface ConfigDialogProps {
  onSubmit: any
  onClose: any
}
const useConfigDialog = (props: ConfigDialogProps) => {
  const modalProps = {
    isOpen: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true
  }
  const { getString } = useStrings()

  const onSubmit = (data: any) => {
    props.onSubmit(data)
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        onClose={hideModal}
        className={cx(Classes.DIALOG)}
        {...modalProps}
        title={getString('pipelineSteps.configFiles')}
        isCloseButtonShown
      >
        <ConfigForm onSubmit={data => onSubmit(data)} onHide={hideModal} />
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
