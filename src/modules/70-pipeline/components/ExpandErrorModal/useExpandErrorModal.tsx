import React, { useState } from 'react'
import { useModalHook, Button, Container } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import css from './useExpandErrorModal.module.scss'

export interface UseExpandErrorModalProps {
  onClose?: () => void
}

export interface UseExpandErrorModalReturn {
  openErrorModal: (error: JSX.Element) => void
  hideErrorModal: () => void
}
const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 750,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}

const useExpandErrorModal = (props: UseExpandErrorModalProps): UseExpandErrorModalReturn => {
  const [error, setError] = useState<JSX.Element>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <Container height={'100%'} padding="xxlarge">
          {error}
        </Container>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            props.onClose?.()
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [error]
  )

  return {
    openErrorModal: (_error: JSX.Element) => {
      setError(_error)
      showModal()
    },
    hideErrorModal: hideModal
  }
}

export default useExpandErrorModal
